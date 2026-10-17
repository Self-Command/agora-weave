import assert from 'node:assert/strict';
import { createHash,randomUUID } from 'node:crypto';
import { before, after, test } from 'node:test';
import { account, session, rows, sql, request } from '../../fixtures/core/runtime.ts';

const id = (n: number) => `a3000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const body = 'SYNTHETIC ADMISSION TEST TERMS — NOT A PRODUCTION POLICY';
const digest = createHash('sha256').update(body).digest('hex');
let release='';
function publishFixture(){
  release=randomUUID();
  sql(`INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
    VALUES ('${release}','${id(1)}','${id(2)}','${digest}',
      '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account(1)}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${id(1)}';`);
}
const documents = () => rows(`SELECT core.registration_documents_result('${environment}') AS result`)[0].result as {
  code: string; document_set_digest: string; documents: { release_id: string; digest: string; kind: string }[];
};
const command = (n: number, extra: { age?: boolean; consent?: boolean; set?: string; user?: number } = {}) => {
  const current = documents();
  const consents = current.documents.map(doc => ({ release_id: doc.release_id,digest: doc.digest,decision: extra.consent === false ? 'presented' : 'consented' }));
  const user = extra.user || 10;
  return `core.complete_registration_result('${account(user)}','${session(user)}','${'e'.repeat(64)}','adult-18-v1',${extra.age ?? true},
    '${extra.set ?? current.document_set_digest}','${JSON.stringify(consents)}','${id(8)}','${id(n + 100)}','Synthetic Android','${environment}')`;
};
const invitation = `INSERT INTO core.invitation(id,token_hash,creator_id,expires_at) VALUES ('${id(4)}','${'e'.repeat(64)}','${account(1)}',clock_timestamp()+interval '1 hour');`;
before(() => {
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${id(1)}','synthetic.account.terms','terms','zh-CN','${account(1)}',ARRAY['app']) ON CONFLICT DO NOTHING;
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${id(2)}','${id(1)}',1,'Synthetic admission terms','${body}','${digest}','ready','${account(1)}') ON CONFLICT DO NOTHING;`);
  publishFixture();
});
after(() => sql(`UPDATE core.managed_document SET active_release_id=NULL WHERE id='${id(1)}'; UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';`));

test('RA01: registration displays actual current published documents and refuses withdrawn or inapplicable sources', () => {
  const response = request('/documents/current?kind=terms&surface=app&locale=zh-CN');
  assert.equal(response.status,200,response.body);
  assert.match(response.body,/SYNTHETIC ADMISSION TEST TERMS/);
  assert.equal((response.data.data as { document_set_digest: string }).document_set_digest,documents().document_set_digest);
  assert.equal(request('/documents/current?surface=admin').status,403);
  assert.equal(request('/documents/current?kind=terms&kind=terms').status,422);
  sql(`UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';`);
  try {
    const unavailable = request('/documents/current');
    assert.equal(unavailable.status,503);
    assert.doesNotMatch(unavailable.body,/SYNTHETIC ADMISSION TEST TERMS/);
  } finally { publishFixture(); }
});

test('RA02: missing phone verification, age declaration, explicit consent or current set leaves invitation and account untouched', () => {
  const commands = [command(1),command(2,{ age: false }),command(3,{ consent: false }),command(4,{ set: '0'.repeat(64) })];
  const output = sql(`BEGIN; ${invitation}
    UPDATE auth.users SET phone='15555550110',phone_confirmed_at=NULL WHERE id='${account(10)}';
    SELECT ${commands[0]}->>'code';
    UPDATE auth.users SET phone_confirmed_at=clock_timestamp() WHERE id='${account(10)}';
    SELECT ${commands[1]}->>'code'; SELECT ${commands[2]}->>'code'; SELECT ${commands[3]}->>'code';
    SELECT count(*) FROM core.account WHERE id='${account(10)}';
    SELECT state FROM core.invitation WHERE id='${id(4)}'; ROLLBACK;`).trim().split(/\r?\n/);
  assert.deepEqual(output,['PHONE_UNVERIFIED','INVALID_INPUT','CONSENT_REQUIRED','TERMS_CHANGED','0','unused']);
});

test('RA03: one transaction binds verified phone, invitation, age and consent and identical retry creates no duplicate receipt', () => {
  const execute = command(5);
  const second = command(6,{ user: 11 });
  const output = sql(`BEGIN; ${invitation}
    UPDATE auth.users SET phone='15555550110',phone_confirmed_at=clock_timestamp() WHERE id='${account(10)}';
    UPDATE auth.users SET phone='15555550111',phone_confirmed_at=clock_timestamp() WHERE id='${account(11)}';
    SELECT ${execute}->>'code'; SELECT ${execute}->>'code'; SELECT ${second}->>'code';
    SELECT count(*) FROM core.admission WHERE invitation_id='${id(4)}';
    SELECT count(*) FROM core.document_receipt WHERE subject='${account(10)}' AND request_id='${id(105)}';
    SELECT core.current_identity('${account(10)}','${session(10)}'); ROLLBACK;`).trim().split(/\r?\n/);
  assert.deepEqual(output,['OK','OK','INVITATION_INVALID','1',String(documents().documents.length),'t']);
});
test('RA04: existing admitted phone accounts bind verified OTP sessions without new terms consent or duplicate effects', () => {
  const register = command(7);
  const loginSession = session(90),loginCommand=id(190);
  const login = `core.complete_login_result('${account(10)}','${loginSession}','${loginCommand}','Synthetic login device','${environment}')`;
  const output = sql(`BEGIN; ${invitation}
    UPDATE auth.users SET phone='15555550110',phone_confirmed_at=clock_timestamp() WHERE id='${account(10)}';
    SELECT ${register}->>'code';
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${loginSession}','${account(10)}',clock_timestamp(),clock_timestamp(),'aal1');
    SELECT ${login}->>'code';
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      VALUES ('${id(191)}','${loginSession}','otp',clock_timestamp(),clock_timestamp());
    UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
    SELECT ${login}->>'code'; SELECT ${login}->>'code';
    SELECT core.complete_login_result('${account(10)}','${loginSession}','${loginCommand}','Changed device','${environment}')->>'code';
    SELECT count(*) FROM core.session_registry WHERE session_id='${loginSession}';
    SELECT count(*) FROM core.document_receipt WHERE request_id='${loginCommand}';
    SELECT count(*) FROM core.audit_event WHERE request_id='${loginCommand}';
    SELECT core.current_identity('${account(10)}','${loginSession}'); ROLLBACK;`).trim().split(/\r?\n/);
  assert.deepEqual(output,['OK','SESSION_INVALID','OK','OK','CONFLICT','1','0','1','t']);
});
test('RA05: unadmitted, cancelled or revoked identities cannot bind or reopen a login session', () => {
  const register = command(8),loginSession=session(91);
  const login = `core.complete_login_result('${account(10)}','${loginSession}','${id(192)}','Synthetic login device','${environment}')`;
  const output = sql(`BEGIN; ${invitation}
    UPDATE auth.users SET phone='15555550110',phone_confirmed_at=clock_timestamp() WHERE id='${account(10)}';
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${loginSession}','${account(10)}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      VALUES ('${id(193)}','${loginSession}','otp',clock_timestamp(),clock_timestamp());
    SELECT ${login}->>'code'; SELECT ${register}->>'code';
    UPDATE core.account SET status='cancelled' WHERE id='${account(10)}'; SELECT ${login}->>'code';
    UPDATE core.account SET status='active' WHERE id='${account(10)}'; SELECT ${login}->>'code';
    UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${loginSession}';
    SELECT ${login}->>'code';
    SELECT revoked_at IS NOT NULL FROM core.session_registry WHERE session_id='${loginSession}'; ROLLBACK;`).trim().split(/\r?\n/);
  assert.deepEqual(output,['SESSION_INVALID','OK','SESSION_INVALID','OK','SESSION_INVALID','t']);
});
