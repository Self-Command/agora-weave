import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { activateConfiguration } from '../../fixtures/core/configuration.ts';
import { asynchronousCompose } from '../../fixtures/core/concurrency.ts';
import { rows, sql } from '../../fixtures/core/runtime.ts';

const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const digest = (value: string = randomUUID()) => createHash('sha256').update(value).digest('hex');
const concurrentSql = (statement: string) => asynchronousCompose(
  ['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], statement);

test('OC13: two real OTP sessions racing the same challenge commit exactly one admission, operation and session binding', async () => {
  assert.ok(environment === 'dev' || environment === 'test', 'OTP race requires an isolated development or test environment');
  const actor = randomUUID(), publisher = randomUUID(), sessions = [randomUUID(), randomUUID()], commands = [randomUUID(), randomUUID()];
  const document = randomUUID(), revision = randomUUID(), release = randomUUID(), invitation = randomUUID();
  const phone = `1555${String(randomInt(0, 10000000)).padStart(7, '0')}`, phoneDigest = digest(), candidate = digest();
  const invitationHash = digest(), body = 'SYNTHETIC CONCURRENT OTP COMPLETION TERMS', bodyDigest = digest(body);
  const previousActivation = rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr;
  let challenge = '';
  try {
    activateConfiguration(environment, `otp-completion-race-${randomUUID()}`);
    sql(`BEGIN;
      INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at)
        VALUES ('${publisher}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${publisher}@example.invalid',NULL,NULL,clock_timestamp(),clock_timestamp()),
        ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid','${phone}',clock_timestamp(),clock_timestamp(),clock_timestamp());
      INSERT INTO core.account(id) VALUES ('${publisher}');
      INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
        VALUES ('${document}','synthetic.otp-race.${document}','terms','zh-CN','${publisher}',ARRAY['app']);
      INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
        VALUES ('${revision}','${document}',1,'Synthetic concurrent OTP terms','${body}','${bodyDigest}','ready','${publisher}');
      INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
        VALUES ('${release}','${document}','${revision}','${bodyDigest}',
          '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${publisher}',clock_timestamp());
      UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
      INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
        VALUES ('${invitation}','${invitationHash}','${publisher}',clock_timestamp()+interval '1 hour');
      COMMIT;`);
    const documents = rows(`SELECT core.registration_documents_result('${environment}') AS result`)[0].result as {
      code: string; document_set_digest: string; documents: { release_id: string; digest: string }[];
    };
    assert.equal(documents.code, 'OK');
    const binding = { document_set_digest: documents.document_set_digest,
      age_declaration: { version: 'adult-18-v1', declared: true }, invitation_hash: invitationHash };
    const verification = { document_set_digest: documents.document_set_digest, age_declaration: binding.age_declaration,
      consents: documents.documents.map(doc => ({ release_id: doc.release_id, digest: doc.digest, decision: 'consented' })) };
    const reservation = rows(`SELECT core.reserve_otp_challenge('${phoneDigest}','${digest()}','register','${candidate}',
      '${randomUUID()}','${JSON.stringify(binding)}','${environment}') AS result`)[0].result as { code: string; challenge_id: string };
    assert.equal(reservation.code, 'OK');
    challenge = reservation.challenge_id;
    sql(`BEGIN; ${sessions.map(session => `INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
      VALUES ('${session}','${actor}',clock_timestamp(),clock_timestamp(),'aal1');
      INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
        VALUES (gen_random_uuid(),'${session}','otp',clock_timestamp(),clock_timestamp());`).join('\n')} COMMIT;`);
    const complete = (index: number) => `SELECT core.complete_otp_authentication_result('${challenge}','${candidate}',
      '${phoneDigest}','+${phone}','${actor}','${sessions[index]}','${commands[index]}','Synthetic OTP race device',
      '${JSON.stringify(verification)}','${environment}')->>'code';`;
    // Each promise owns a separate psql connection; the completion function must serialize the contenders.
    const settled = await Promise.allSettled([concurrentSql(complete(0)), concurrentSql(complete(1))]);
    const outcomes = settled.map(outcome => {
      if (outcome.status === 'rejected') throw outcome.reason;
      return outcome.value;
    });
    assert.deepEqual(outcomes.map(value => value.trim()).sort(), ['CONFLICT', 'OK']);
    const winner = outcomes.findIndex(value => value.trim() === 'OK');
    assert.deepEqual(rows(`SELECT state,completion_actor,completion_session,completion_operation FROM core.otp_challenge WHERE id='${challenge}'`),
      [{ state: 'consumed', completion_actor: actor, completion_session: sessions[winner], completion_operation: commands[winner] }]);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.admission WHERE invitation_id='${invitation}' AND account_id='${actor}'`)[0].n, 1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.session_registry WHERE account_id='${actor}'`)[0].n, 1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE actor='${actor}' AND action='auth.register'`)[0].n, 1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.audit_event WHERE actor='${actor}' AND operation='auth.register'`)[0].n, 1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.document_receipt WHERE subject='${actor}' AND presentation_ref='${challenge}'`)[0].n,
      documents.documents.length);
    assert.equal((await concurrentSql(complete(winner))).trim(), 'OK');
  } finally {
    // Immutable synthetic admission/audit/consent facts are retained; disable every live fixture entry point.
    sql(`BEGIN;
      UPDATE core.managed_document SET active_release_id=NULL WHERE id='${document}';
      UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
      UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic OTP race cleanup' WHERE id='${invitation}' AND state='unused';
      UPDATE core.account SET status='cancelled' WHERE id IN ('${actor}','${publisher}');
      UPDATE auth.users SET phone=NULL,phone_confirmed_at=NULL WHERE id IN ('${actor}','${publisher}');
      UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id IN ('${sessions[0]}','${sessions[1]}');
      UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE id IN ('${sessions[0]}','${sessions[1]}');
      ${challenge ? `UPDATE core.otp_challenge SET state='superseded' WHERE id='${challenge}' AND state='pending';` : ''}
      ${typeof previousActivation === 'string'
        ? `UPDATE core.config_activation SET active_ptr='${previousActivation}' WHERE environment='${environment}';`
        : `DELETE FROM core.config_activation WHERE environment='${environment}';`}
      COMMIT;`);
  }
});
