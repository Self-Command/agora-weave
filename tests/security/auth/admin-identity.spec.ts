import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { rows, sql } from '../../fixtures/core/runtime.ts';

const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');

function fixture() {
  const actor = randomUUID(), publisher = randomUUID(), session = randomUUID(), factor = randomUUID(), foreignFactor = randomUUID();
  const document = randomUUID(), revision = randomUUID(), release = randomUUID(), invitation = randomUUID(), grant = randomUUID();
  const phone = `1555${String(randomInt(0, 10000000)).padStart(7, '0')}`, invitationHash = digest(randomUUID());
  const body = 'SYNTHETIC ADMIN IDENTITY TERMS', bodyDigest = digest(body);
  const args = (aal = 'aal2', environment = env) => `'${actor}','${session}','${environment}','${aal}'`;
  const setup = `INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at)
    VALUES ('${publisher}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${publisher}@example.invalid',NULL,NULL,clock_timestamp(),clock_timestamp()),
    ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid','${phone}',clock_timestamp(),clock_timestamp(),clock_timestamp());
    INSERT INTO core.account(id) VALUES ('${publisher}');
    INSERT INTO auth.mfa_factors(id,user_id,factor_type,status,friendly_name,secret,created_at,updated_at) VALUES
      ('${factor}','${actor}','totp','verified','Synthetic TOTP','SYNTHETIC-SECRET-NOT-REAL',clock_timestamp(),clock_timestamp()),
      ('${foreignFactor}','${publisher}','totp','verified','Synthetic foreign TOTP','SYNTHETIC-FOREIGN-SECRET',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.sessions(id,user_id,aal,factor_id,created_at,updated_at)
      VALUES ('${session}','${actor}','aal2','${factor}',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      SELECT gen_random_uuid(),'${session}',method,clock_timestamp(),clock_timestamp() FROM unnest(ARRAY['otp','totp']) method;
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${document}','synthetic.admin-identity.${document}','terms','zh-CN','${publisher}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${revision}','${document}',1,'Synthetic admin terms','${body}','${bodyDigest}','ready','${publisher}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${release}','${document}','${revision}','${bodyDigest}',
        '{"environment":"${env}","surfaces":["app"],"purposes":["register"]}','published','${publisher}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at) VALUES ('${invitation}','${invitationHash}','${publisher}',clock_timestamp()+interval '1 hour');
    CREATE TEMP TABLE admin_documents ON COMMIT DROP AS SELECT core.registration_documents_result('${env}') AS result;
    SELECT core.complete_registration_result('${actor}','${session}','${invitationHash}','adult-18-v1',true,
      (SELECT result->>'document_set_digest' FROM admin_documents),
      (SELECT jsonb_agg(jsonb_build_object('release_id',d->'release_id','digest',d->'digest','decision','consented'))
        FROM admin_documents,jsonb_array_elements(result->'documents') d),gen_random_uuid(),gen_random_uuid(),'Synthetic admin device','${env}')->>'code';
    INSERT INTO core.admin_grant(id,account_id,role,operation_scopes,environment) VALUES ('${grant}','${actor}','super_admin',
      ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback'],'${env}');`;
  const run = (statement: string) => {
    const output = sql(`BEGIN; ${setup} ${statement} ROLLBACK;`).trim().split(/\r?\n/);
    assert.equal(output.shift(), 'OK', 'Synthetic ordinary admission must succeed');
    return output;
  };
  return { actor, publisher, session, factor, foreignFactor, grant, phone, args, run };
}

test('AI01: only runtime can use admin APIs; bootstrap, private identity helpers and durable records are owner-only', () => {
  for (const role of ['anon', 'authenticated', 'service_role', 'core_runtime', 'core_worker', 'supabase_auth_admin']) {
    const access = rows(`SELECT has_function_privilege('${role}','core.admin_session_result(uuid,uuid,text,text)','EXECUTE') AS session,
      has_function_privilege('${role}','core.admin_config_commit_result(uuid,uuid,text,text,uuid,text,uuid,uuid,text,bigint)','EXECUTE') AS commit,
      has_function_privilege('${role}','core.admin_prepare_totp_result(uuid,uuid,text,text)','EXECUTE') AS prepare,
      has_function_privilege('${role}','core.bootstrap_admin_identity(uuid,text)','EXECUTE') AS bootstrap,
      has_function_privilege('${role}','core.admin_identity_context(uuid,uuid,text,text,boolean)','EXECUTE') AS helper,
      has_function_privilege('${role}','core.otp_bundle_values_result(text,core.config_bundle)','EXECUTE') AS validator,
      has_table_privilege('${role}','core.admin_config_preview','SELECT,INSERT,UPDATE,DELETE') AS previews,
      has_table_privilege('${role}','core.admin_stepup_binding','SELECT,INSERT,UPDATE,DELETE') AS proofs`)[0];
    assert.deepEqual(access, { session: role === 'core_runtime', commit: role === 'core_runtime', prepare: role === 'core_runtime', bootstrap: false,
      helper: false, validator: false, previews: false, proofs: false }, role);
  }
});

test('AI02: only matching signed aal2 and current OTP plus TOTP Auth evidence grant business permissions; old aal1 JWT remains a guide', () => {
  const f = fixture();
  assert.deepEqual(f.run(`CREATE TEMP TABLE admin_identity ON COMMIT DROP AS SELECT core.admin_session_result(${f.args()}) AS result;
    SELECT result->>'code' FROM admin_identity;
    SELECT result->'data'->'permissions' ?& ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback']
      AND result->'data'->'mfa'='{"aal":"aal2","enrolled":true,"verified":true}'::jsonb FROM admin_identity;
    SELECT core.admin_session_result(${f.args('aal1')})->'data'->'permissions';
    SELECT core.admin_accounts_result(${f.args('aal1')},20,NULL)->>'code';
    UPDATE auth.sessions SET aal='aal1' WHERE id='${f.session}';
    SELECT core.admin_accounts_result(${f.args()},20,NULL)->>'code';
    UPDATE auth.sessions SET aal='aal2' WHERE id='${f.session}';
    DELETE FROM auth.mfa_amr_claims WHERE session_id='${f.session}' AND authentication_method='otp';
    SELECT core.admin_session_result(${f.args()})->>'code';`), ['OK', 't', '[]', 'MFA_REQUIRED', 'MFA_REQUIRED', 'SESSION_INVALID']);
});

test('AI03: current grant revocation, expiry, wrong environment and invalid Auth identity deny the same formerly valid session', () => {
  const f = fixture();
  const mutations = [
    { change: `UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE id='${f.grant}';`, code: 'FORBIDDEN' },
    { change: `UPDATE core.admin_grant SET expires_at=clock_timestamp()-interval '1 second' WHERE id='${f.grant}';`, code: 'FORBIDDEN' },
    { change: `UPDATE core.admin_grant SET environment='${env === 'dev' ? 'test' : 'dev'}' WHERE id='${f.grant}';`, code: 'FORBIDDEN' },
    { change: `UPDATE auth.users SET phone_confirmed_at=NULL WHERE id='${f.actor}';`, code: 'SESSION_INVALID' },
    { change: `UPDATE auth.users SET banned_until=clock_timestamp()+interval '1 hour' WHERE id='${f.actor}';`, code: 'SESSION_INVALID' },
    { change: `UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE id='${f.session}';`, code: 'SESSION_INVALID' },
    { change: `UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${f.session}';`, code: 'SESSION_INVALID' },
  ];
  // Restriction savepoints roll back the local checkpoint but not the independent
  // journal. Reconcile via its existing owner API between vectors so each tests
  // current identity/permission rejection instead of incidental archive closure.
  assert.deepEqual(f.run(mutations.map(vector => `SAVEPOINT deny_admin; ${vector.change}
    SELECT core.admin_session_result(${f.args()})->>'code'; ROLLBACK TO SAVEPOINT deny_admin;
    DO $$ BEGIN IF core.reconcile_security_journal()->>'code'<>'OK' THEN RAISE EXCEPTION 'Synthetic journal reconciliation failed'; END IF; END $$;
    SELECT core.archive_ready();`).join('\n')),
  mutations.flatMap(vector => [vector.code, 't']));
});

test('AI04: all five roles expose only their explicit permitted scopes; role names and wildcard scopes cannot self-authorize', () => {
  const f = fixture();
  const roles = ['super_admin', 'content_moderator', 'community_operator', 'ai_operator', 'auditor'];
  assert.deepEqual(f.run(roles.map(role => `UPDATE core.admin_grant SET role='${role}' WHERE id='${f.grant}';
    SELECT core.admin_session_result(${f.args()})->'data'->'permissions';
    SELECT core.admin_accounts_result(${f.args()},20,NULL)->>'code';`).join('\n') + `
    UPDATE core.admin_grant SET role='super_admin',operation_scopes=ARRAY['*'] WHERE id='${f.grant}';
    SELECT core.admin_session_result(${f.args()})->'data'->'permissions';
    SELECT core.admin_accounts_result(${f.args()},20,NULL)->>'code';`),
  ['["admin.accounts.read", "auth.config.write", "config.read", "config.release", "config.rollback"]', 'OK',
    '[]', 'FORBIDDEN', '[]', 'FORBIDDEN', '[]', 'FORBIDDEN', '["config.read"]', 'FORBIDDEN', '[]', 'FORBIDDEN']);
});

test('AI05: factor projection contains no secrets and foreign, deleted or unverified factors do not provide current MFA qualification', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT core.admin_factors_result(${f.args('aal1')})->'data'->'items'->0 ?& ARRAY['id','factor_type','friendly_name','status','created_at'];
    SELECT NOT core.admin_factors_result(${f.args()})->'data'->'items'->0 ?| ARRAY['secret','user_id','phone'];
    SELECT core.admin_factor_result(${f.args()},'${f.foreignFactor}',true)->>'code';
    UPDATE auth.mfa_factors SET status='unverified' WHERE id='${f.factor}';
    SELECT core.admin_session_result(${f.args()})->'data'->'mfa'->>'enrolled';
    SELECT core.admin_accounts_result(${f.args()},20,NULL)->>'code';
    SELECT core.admin_factor_result(${f.args('aal1')},'${f.factor}',false)->>'code';
    SELECT core.admin_factor_result(${f.args('aal1')},'${f.factor}',true)->>'code';`),
  ['t', 't', 'NOT_FOUND', 'false', 'MFA_REQUIRED', 'OK', 'NOT_FOUND']);
});

test('AI06: account listing respects resource scope, pagination bounds and masked minimal projection', () => {
  const f = fixture();
  assert.deepEqual(f.run(`UPDATE core.admin_grant SET resource_scope=ARRAY['${f.actor}'::uuid] WHERE id='${f.grant}';
    CREATE TEMP TABLE admin_page ON COMMIT DROP AS SELECT core.admin_accounts_result(${f.args()},20,NULL) AS result;
    SELECT result->>'code' FROM admin_page;
    SELECT jsonb_array_length(result->'data'->'items')=1 AND result->'data'->'items'->0->>'id'='${f.actor}'
      AND result->'data'->'items'->0->>'phone_masked'<>'${f.phone}'
      AND NOT result->'data'->'items'->0 ?| ARRAY['email','phone','secret','admission','consents'] FROM admin_page;
    SELECT core.admin_accounts_result(${f.args()},51,NULL)->>'code';
    SELECT core.admin_accounts_result(${f.args()},0,NULL)->>'code';
    SELECT core.admin_config_definitions_result(${f.args()},3600)->>'code';`), ['OK', 't', 'INVALID_INPUT', 'INVALID_INPUT', 'FORBIDDEN']);
});

test('AI07: protected bootstrap is once per environment, rejects existing super administrators and never reopens after grant revocation', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT core.bootstrap_admin_identity('${f.actor}','${env}')->>'code';
    SAVEPOINT no_other_admin;
    UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE environment='${env}' AND role='super_admin';
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM core.admin_bootstrap WHERE environment='${env}') THEN
        IF core.bootstrap_admin_identity('${f.actor}','${env}')->>'code'<>'OK' THEN RAISE EXCEPTION 'First protected bootstrap was rejected'; END IF;
      END IF;
      UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE account_id='${f.actor}' AND environment='${env}';
      IF core.bootstrap_admin_identity('${f.actor}','${env}')->>'code'<>'BOOTSTRAP_CLOSED' THEN RAISE EXCEPTION 'Closed bootstrap reopened'; END IF;
    END $$;
    SELECT count(*)=1 FROM core.admin_bootstrap WHERE environment='${env}';
    ROLLBACK TO SAVEPOINT no_other_admin;`), ['BOOTSTRAP_CLOSED', 't']);
});

test('AI08: configuration operation receipts require current signed assurance while legacy actions retain the existing result shape', () => {
  const f = fixture(), operation = randomUUID(), legacy = randomUUID();
  assert.deepEqual(f.run(`INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state) VALUES
      ('${f.actor}','${f.session}','${env}','config.release','${operation}',repeat('a',64),'unknown'),
      ('${f.actor}','${f.session}','${env}','recovery.request','${legacy}',repeat('b',64),'succeeded');
    SELECT core.account_operation_result('${f.actor}','${f.session}','${operation}','${env}')->>'code';
    SELECT core.account_operation_result('${f.actor}','${f.session}','${operation}','${env}','aal1')->>'code';
    SELECT core.account_operation_result('${f.actor}','${f.session}','${operation}','${env}','aal2')->'data'->>'state';
    SELECT core.account_operation_result('${f.actor}','${f.session}','${legacy}','${env}')->'data'->>'action';
    UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE id='${f.grant}';
    SELECT core.account_operation_result('${f.actor}','${f.session}','${operation}','${env}','aal2')->>'code';`),
  ['MFA_REQUIRED', 'MFA_REQUIRED', 'unknown', 'recovery.request', 'FORBIDDEN']);
});

test('AI09: phone-only admin TOTP compatibility is private, idempotent and changes only a missing internal Auth account label', () => {
  const f = fixture();
  assert.deepEqual(f.run(`UPDATE auth.users SET email=NULL,email_confirmed_at=NULL WHERE id='${f.actor}';
    UPDATE auth.sessions SET aal='aal1',factor_id=NULL WHERE id='${f.session}';
    CREATE TEMP TABLE original_auth ON COMMIT DROP AS SELECT to_jsonb(u)-ARRAY['email','updated_at'] AS facts,
      (SELECT count(*) FROM auth.identities i WHERE i.user_id=u.id) AS identities FROM auth.users u WHERE u.id='${f.actor}';
    SELECT core.admin_prepare_totp_result('${f.actor}','${randomUUID()}','${env}','aal1')->>'code';
    SAVEPOINT no_grant; UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE id='${f.grant}';
    SELECT core.admin_prepare_totp_result(${f.args('aal1')})->>'code'; ROLLBACK TO SAVEPOINT no_grant;
    DO $$ BEGIN IF core.reconcile_security_journal()->>'code'<>'OK' THEN RAISE EXCEPTION 'Synthetic journal reconciliation failed'; END IF; END $$;
    SELECT core.admin_prepare_totp_result(${f.args('aal1')})->>'code';
    SELECT core.admin_prepare_totp_result(${f.args('aal1')})->>'code';
    SELECT u.email='${f.actor}@totp-label.invalid' AND u.email_confirmed_at IS NULL
      AND to_jsonb(u)-ARRAY['email','updated_at']=(SELECT facts FROM original_auth)
      AND (SELECT count(*) FROM auth.identities i WHERE i.user_id=u.id)=(SELECT identities FROM original_auth) FROM auth.users u WHERE u.id='${f.actor}';
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND operation='admin.mfa.prepare';
    SELECT NOT core.admin_prepare_totp_result(${f.args('aal1')})->'data' ?| ARRAY['email','label','secret','tokens'];
    SELECT core.admin_session_result(${f.args('aal1')})->'data'->'permissions';`),
  ['SESSION_INVALID', 'FORBIDDEN', 'OK', 'OK', 't', '1', 't', '[]']);
});

test('AI10: preparing official TOTP enrollment preserves a pre-existing real email and never creates confirmation or MFA facts', () => {
  const f = fixture();
  assert.deepEqual(f.run(`CREATE TEMP TABLE original_identity ON COMMIT DROP AS SELECT to_jsonb(u) AS facts FROM auth.users u WHERE u.id='${f.actor}';
    CREATE TEMP TABLE original_factors ON COMMIT DROP AS SELECT count(*) AS n FROM auth.mfa_factors WHERE user_id='${f.actor}';
    SELECT core.admin_prepare_totp_result(${f.args('aal1')})->>'code';
    SELECT to_jsonb(u)=(SELECT facts FROM original_identity) FROM auth.users u WHERE u.id='${f.actor}';
    SELECT count(*)=(SELECT n FROM original_factors) FROM auth.mfa_factors WHERE user_id='${f.actor}';
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND operation='admin.mfa.prepare';`), ['OK', 't', 't', '0']);
});
