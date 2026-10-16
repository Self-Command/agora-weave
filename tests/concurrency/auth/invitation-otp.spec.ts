import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { account, rows, sql } from '../../fixtures/core/runtime.ts';
import { asynchronousCompose } from '../../fixtures/core/concurrency.ts';

const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const concurrentSql = (statement: string) => asynchronousCompose(['exec','-T','db','psql','-X','-qAt','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],statement);

test('AO01: competing challenge reservations and code consumption each produce at most one successful effect', async () => {
  const phone = digest(randomUUID()),ip = digest(randomUUID()),otp = digest(randomUUID());
  const reserve = () => `SELECT core.reserve_otp_challenge('${phone}','${ip}','login','${otp}','${randomUUID()}','{}','${environment}')->>'code';`;
  try {
    const reserved = await Promise.all([concurrentSql(reserve()),concurrentSql(reserve())]);
    assert.deepEqual(reserved.map(value => value.trim()).sort(),['OK','RATE_LIMITED']);
    const id = rows(`SELECT id FROM core.otp_challenge WHERE phone_hash='${phone}'`)[0].id;
    const verify = `SELECT core.consume_otp_challenge('${id}','${otp}','login','{}')->>'code';`;
    const consumed = await Promise.all([concurrentSql(verify),concurrentSql(verify)]);
    assert.deepEqual(consumed.map(value => value.trim()).sort(),['OK','OTP_INVALID']);
  } finally { sql(`DELETE FROM core.otp_challenge WHERE phone_hash='${phone}';`); }
});

test('AO02: two verified Auth subjects racing one invitation commit exactly one admission and one consent receipt', async () => {
  const users = [randomUUID(),randomUUID()],sessions = [randomUUID(),randomUUID()];
  const document = randomUUID(),revision = randomUUID(),release = randomUUID(),invitation = randomUUID();
  const invitationHash = digest(randomUUID()),body = 'SYNTHETIC CONCURRENT ADMISSION TERMS';
  const bodyDigest = digest(body);
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${document}','synthetic.race.${document}','terms','zh-CN','${account(1)}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${revision}','${document}',1,'Synthetic concurrent terms','${body}','${bodyDigest}','ready','${account(1)}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${release}','${document}','${revision}','${bodyDigest}',
        '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account(1)}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at) VALUES ('${invitation}','${invitationHash}','${account(1)}',clock_timestamp()+interval '1 hour');`);
  try {
    for (let n = 0; n < users.length; n++) sql(`INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at)
      VALUES ('${users[n]}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${users[n]}@example.invalid',
        '1555555010${n+1}',clock_timestamp(),clock_timestamp(),clock_timestamp());
      INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${sessions[n]}','${users[n]}',clock_timestamp(),clock_timestamp(),'aal1');`);
    const current = rows(`SELECT core.registration_documents_result('${environment}') AS result`)[0].result as {
      document_set_digest: string; documents: { release_id: string; digest: string }[];
    };
    const consents = JSON.stringify(current.documents.map(doc => ({ release_id: doc.release_id,digest: doc.digest,decision: 'consented' })));
    const register = (n: number) => `SELECT core.complete_registration_result('${users[n]}','${sessions[n]}','${invitationHash}','adult-18-v1',true,
      '${current.document_set_digest}','${consents}','${randomUUID()}','${randomUUID()}','Synthetic race device','${environment}')->>'code';`;
    const result = await Promise.all([concurrentSql(register(0)),concurrentSql(register(1))]);
    assert.deepEqual(result.map(value => value.trim()).sort(),['INVITATION_INVALID','OK']);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.admission WHERE invitation_id='${invitation}'`)[0].n,1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.document_receipt WHERE subject IN ('${users[0]}','${users[1]}') AND release_id='${release}'`)[0].n,1);
  } finally {
    // Immutable synthetic admission/audit facts remain as real test facts; disable their sessions and document.
    sql(`UPDATE core.managed_document SET active_release_id=NULL WHERE id='${document}'; UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
      UPDATE auth.users SET phone=NULL,phone_confirmed_at=NULL WHERE id IN ('${users[0]}','${users[1]}');
      DELETE FROM core.session_registry WHERE session_id IN ('${sessions[0]}','${sessions[1]}');
      DELETE FROM auth.sessions WHERE id IN ('${sessions[0]}','${sessions[1]}');`);
  }
});
