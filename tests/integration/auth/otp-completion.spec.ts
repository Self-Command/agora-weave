import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { rows, sql } from '../../fixtures/core/runtime.ts';

const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const digest = (value: string = randomUUID()) => createHash('sha256').update(value).digest('hex');
const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;
const context = '(SELECT binding FROM completion_context)';
const verification = `(SELECT binding - 'invitation_hash' || jsonb_build_object('consents',consents) FROM completion_context)`;

function fixture(purpose: 'register' | 'login' = 'register') {
  const actor = randomUUID(), publisher = randomUUID(), session = randomUUID(), bootstrapSession = randomUUID();
  const invitation = randomUUID(), invitationHash = digest(), document = randomUUID(), revision = randomUUID(), release = randomUUID();
  const phone = `1555${String(randomInt(0, 10000000)).padStart(7, '0')}`, phoneDigest = digest(), candidate = digest();
  const reservation = randomUUID(), command = randomUUID(), sibling = randomUUID(), configVersion = `otp-completion-${randomUUID()}`;
  const body = 'SYNTHETIC OTP COMPLETION TERMS — NOT A PRODUCTION POLICY', bodyDigest = digest(body);
  const authSession = (id = session) => `INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
    VALUES ('${id}','${actor}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      VALUES (gen_random_uuid(),'${id}','otp',clock_timestamp(),clock_timestamp());`;
  const call = (patch: { candidate?: string; phoneDigest?: string; phone?: string; actor?: string; session?: string;
    command?: string; device?: string; verification?: string; environment?: string; challenge?: string } = {}) =>
    `core.complete_otp_authentication_result(${patch.challenge || '(SELECT (result->>\'challenge_id\')::uuid FROM completion_reservation)'},
      ${literal(patch.candidate ?? candidate)},${literal(patch.phoneDigest ?? phoneDigest)},${literal(patch.phone ?? `+${phone}`)},
      '${patch.actor ?? actor}','${patch.session ?? session}','${patch.command ?? command}',${literal(patch.device ?? 'Synthetic OTP device')},
      ${patch.verification ?? (purpose === 'register' ? verification : "'{}'::jsonb")},${patch.environment ?? literal(environment || '')})`;
  const challenge = '(SELECT (result->>\'challenge_id\')::uuid FROM completion_reservation)';
  const challengeState = `SELECT state || ':' || attempts FROM core.otp_challenge WHERE id=${challenge};`;
  const setup = `
    INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at)
      VALUES ('${publisher}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${publisher}@example.invalid',NULL,NULL,clock_timestamp(),clock_timestamp()),
      ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid','${phone}',clock_timestamp(),clock_timestamp(),clock_timestamp());
    INSERT INTO core.account(id) VALUES ('${publisher}');
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${document}','synthetic.otp-completion.${document}','terms','zh-CN','${publisher}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${revision}','${document}',1,'Synthetic OTP completion terms','${body}','${bodyDigest}','ready','${publisher}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${release}','${document}','${revision}','${bodyDigest}',
        '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${publisher}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
      VALUES ('${invitation}','${invitationHash}','${publisher}',clock_timestamp()+interval '1 hour');
    CREATE TEMP TABLE completion_context ON COMMIT DROP AS SELECT
      jsonb_build_object('document_set_digest',docs->>'document_set_digest','age_declaration','{"version":"adult-18-v1","declared":true}'::jsonb,
        'invitation_hash','${invitationHash}') AS binding,
      (SELECT jsonb_agg(jsonb_build_object('release_id',d->'release_id','digest',d->'digest','decision','consented'))
        FROM jsonb_array_elements(docs->'documents') d) AS consents
      FROM (SELECT core.registration_documents_result('${environment}') AS docs) current_documents;
    INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
      SELECT '${configVersion}',jsonb_build_array(jsonb_build_object('scope','global','values',jsonb_object_agg(key,default_value))),1,
        '{"api":["0.0.0","fixture-v1"],"mobile":["0.0.0","fixture-v1"],"admin":["0.0.0","fixture-v1"],"share":["0.0.0","fixture-v1"],"sql":["0.0.0","fixture-v1"],"media":["0.0.0","fixture-v1"],"worker":["0.0.0","fixture-v1"],"ai":["0.0.0","fixture-v1"],"mcp":["0.0.0","fixture-v1"],"plugins":["0.0.0","fixture-v1"]}',
        'active',clock_timestamp(),repeat('f',64),ARRAY['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins'] FROM core.config_definition;
    INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${environment}','${configVersion}')
      ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;
    ${purpose === 'login' ? `${authSession(bootstrapSession)}
      CREATE TEMP TABLE completion_bootstrap ON COMMIT DROP AS SELECT core.complete_registration_result('${actor}','${bootstrapSession}','${invitationHash}',
        'adult-18-v1',true,${context}->>'document_set_digest',(SELECT consents FROM completion_context),gen_random_uuid(),gen_random_uuid(),'Synthetic admitted fixture','${environment}') AS result;` : ''}
    CREATE TEMP TABLE completion_reservation ON COMMIT DROP AS SELECT core.reserve_otp_challenge('${phoneDigest}','${digest()}',
      '${purpose}','${candidate}','${reservation}',${purpose === 'register' ? context : "'{}'::jsonb"},'${environment}') AS result;
    SELECT result->>'code' FROM completion_reservation;
    ${authSession()}`;
  const run = (statement: string) => {
    const output = sql(`BEGIN; ${setup} ${statement} ROLLBACK;`).trim().split(/\r?\n/);
    assert.equal(output.shift(), 'OK', 'Synthetic challenge reservation must succeed');
    return output;
  };
  return { actor, session, invitation, invitationHash, document, revision, release, publisher, bodyDigest, phone, candidate,
    command, sibling, challenge, challengeState, call, run, authSession };
}

test('OC01: OTP completion is a private runtime capability rather than an anonymous or service-role shortcut', () => {
  const access = rows(`SELECT role,has_function_privilege(role,
    'core.complete_otp_authentication_result(uuid,text,text,text,uuid,uuid,uuid,text,jsonb,text)','EXECUTE') AS allowed
    FROM unnest(ARRAY['anon','authenticated','service_role','core_worker','core_runtime']) role`);
  assert.deepEqual(access.map(entry => [entry.role, entry.allowed]), [
    ['anon', false], ['authenticated', false], ['service_role', false], ['core_worker', false], ['core_runtime', true],
  ]);
});

test('OC02: registration atomically binds challenge, invitation, current consent and one ordinary account, and exact retries have one effect', () => {
  const f = fixture();
  assert.deepEqual(f.run(`CREATE TEMP TABLE completion_success ON COMMIT DROP AS SELECT ${f.call()} AS result;
    SELECT result->>'code' FROM completion_success;
    SELECT result->>'account_id'='${f.actor}' AND result->'admitted'='true'::jsonb FROM completion_success;
    SELECT ${f.call()}->>'code'; ${f.challengeState}
    SELECT completion_actor='${f.actor}' AND completion_session='${f.session}' AND completion_operation='${f.command}'
      FROM core.otp_challenge WHERE id=${f.challenge};
    SELECT state || ':' || (used_account_id='${f.actor}')::text FROM core.invitation WHERE id='${f.invitation}';
    SELECT count(*) FROM core.admission WHERE account_id='${f.actor}';
    SELECT count(*)=(SELECT jsonb_array_length(consents) FROM completion_context) AND bool_and(presentation_ref=${f.challenge})
      FROM core.document_receipt WHERE subject='${f.actor}' AND request_id='${f.command}';
    SELECT count(*) FROM core.operation WHERE actor='${f.actor}' AND operation_id='${f.command}';
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND request_id='${f.command}';
    SELECT count(*) FROM core.admin_grant WHERE account_id='${f.actor}';
    SELECT core.current_identity('${f.actor}','${f.session}');`),
  ['OK', 't', 'OK', 'consumed:0', 't', 'used:true', '1', 't', '1', '1', '0', 't']);
});

test('OC03: admitted login uses current OTP proof without requiring fresh registration terms or issuing new consent receipts', () => {
  const f = fixture('login');
  assert.deepEqual(f.run(`SELECT result->>'code' FROM completion_bootstrap;
    UPDATE core.document_release SET state='withdrawn' WHERE id='${f.release}';
    SELECT ${f.call()}->>'code'; SELECT ${f.call()}->>'code';
    SELECT count(*) FROM core.session_registry WHERE session_id='${f.session}';
    SELECT count(*) FROM core.document_receipt WHERE subject='${f.actor}' AND request_id='${f.command}';
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND request_id='${f.command}';`),
  ['OK', 'OK', 'OK', '1', '0', '1']);
});

test('OC04: unknown or null environment and cross-environment or wrong phone digest reject without consuming a challenge', () => {
  const f = fixture();
  const otherEnvironment = environment === 'dev' ? 'test' : 'dev';
  assert.deepEqual(f.run(`SELECT ${f.call({ environment: "'unsupported'" })}->>'code';
    SELECT ${f.call({ environment: 'NULL' })}->>'code';
    SELECT ${f.call({ environment: literal(otherEnvironment) })}->>'code';
    SELECT ${f.call({ phoneDigest: digest() })}->>'code'; ${f.challengeState}
    SELECT count(*) FROM core.account WHERE id='${f.actor}';`),
  ['INVALID_INPUT', 'INVALID_INPUT', 'OTP_INVALID', 'OTP_INVALID', 'pending:0', '0']);
});

test('OC05: canonical Auth phone must equal the trusted verified phone and remain currently verified', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.call({ phone: `+${f.phone.slice(0, -1)}${f.phone.endsWith('0') ? '1' : '0'}` })}->>'code';
    UPDATE auth.users SET phone_confirmed_at=NULL WHERE id='${f.actor}'; SELECT ${f.call()}->>'code';
    UPDATE auth.users SET phone_confirmed_at=clock_timestamp(),phone='+${f.phone}' WHERE id='${f.actor}';
    SELECT ${f.call()}->>'code';`), ['SESSION_INVALID', 'SESSION_INVALID', 'OK']);
});

test('OC06: missing, password, historical or future AMR and a session predating the challenge cannot establish OTP proof', () => {
  const f = fixture();
  const mutations = [
    `DELETE FROM auth.mfa_amr_claims WHERE session_id='${f.session}';`,
    `UPDATE auth.mfa_amr_claims SET authentication_method='password' WHERE session_id='${f.session}';`,
    `UPDATE auth.mfa_amr_claims SET created_at=clock_timestamp()-interval '1 hour' WHERE session_id='${f.session}';`,
    `UPDATE auth.mfa_amr_claims SET created_at=clock_timestamp()+interval '1 hour' WHERE session_id='${f.session}';`,
    `UPDATE auth.sessions SET created_at=clock_timestamp()-interval '1 hour' WHERE id='${f.session}';`,
  ];
  assert.deepEqual(f.run(mutations.map(change => `SAVEPOINT invalid_proof; ${change}
    SELECT ${f.call()}->>'code'; ${f.challengeState} ROLLBACK TO SAVEPOINT invalid_proof;`).join('\n')),
  mutations.flatMap(() => ['SESSION_INVALID', 'pending:0']));
});

test('OC07: banned, deleted, expired or revoked current Auth identity cannot complete a pending login', () => {
  const f = fixture('login');
  const mutations = [
    `UPDATE auth.users SET banned_until=clock_timestamp()+interval '1 hour' WHERE id='${f.actor}';`,
    `UPDATE auth.users SET deleted_at=clock_timestamp() WHERE id='${f.actor}';`,
    `UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE id='${f.session}';`,
    `INSERT INTO core.session_registry(session_id,account_id,device_label,revoked_at)
      VALUES ('${f.session}','${f.actor}','Synthetic revoked device',clock_timestamp());`,
  ];
  assert.deepEqual(f.run(mutations.map(change => `SAVEPOINT invalid_identity; ${change}
    SELECT ${f.call()}->>'code'; ${f.challengeState} ROLLBACK TO SAVEPOINT invalid_identity;`).join('\n')),
  mutations.flatMap(() => ['SESSION_INVALID', 'pending:0']));
});

test('OC08: wrong OTP attempts survive returned failures and lock at the configured default limit', () => {
  const f = fixture();
  const wrong = f.call({ candidate: digest() });
  assert.deepEqual(f.run(`${Array.from({ length: 5 }, () => `SELECT ${wrong}->>'code';`).join('\n')}
    ${f.challengeState} SELECT ${f.call()}->>'code';
    SELECT count(*) FROM core.account WHERE id='${f.actor}';
    SELECT state FROM core.invitation WHERE id='${f.invitation}';`),
  ['OTP_INVALID', 'OTP_INVALID', 'OTP_INVALID', 'OTP_INVALID', 'OTP_INVALID', 'locked:5', 'OTP_INVALID', '0', 'unused']);
});

test('OC09: valid OTP with missing explicit consent leaves invitation, challenge and account untouched and can be corrected', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.call({ verification: `jsonb_set(${verification},'{consents}','[]'::jsonb)` })}->>'code';
    ${f.challengeState}
    SELECT consumed_at IS NULL AND completion_operation IS NULL FROM core.otp_challenge WHERE id=${f.challenge};
    SELECT state FROM core.invitation WHERE id='${f.invitation}';
    SELECT count(*) FROM core.account WHERE id='${f.actor}';
    SELECT count(*) FROM core.document_receipt WHERE subject='${f.actor}';
    SELECT ${f.call()}->>'code';`), ['CONSENT_REQUIRED', 'pending:0', 't', 'unused', '0', '0', 'OK']);
});

test('OC10: a newer published document set invalidates registration while request-side age or document rebinding is refused', () => {
  const f = fixture(), nextRelease = randomUUID();
  assert.deepEqual(f.run(`SELECT ${f.call({ verification: `jsonb_set(${verification},'{document_set_digest}','"${digest()}"'::jsonb)` })}->>'code';
    SELECT ${f.call({ verification: `jsonb_set(${verification},'{age_declaration,declared}','false'::jsonb)` })}->>'code';
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      SELECT '${nextRelease}',document_id,revision_ref,content_digest,scope,'published',publisher,clock_timestamp()
        FROM core.document_release WHERE id='${f.release}';
    UPDATE core.managed_document SET active_release_id='${nextRelease}' WHERE id='${f.document}';
    SELECT ${f.call()}->>'code'; ${f.challengeState}
    SELECT state FROM core.invitation WHERE id='${f.invitation}';
    SELECT count(*) FROM core.account WHERE id='${f.actor}';`),
  ['INVALID_INPUT', 'INVALID_INPUT', 'TERMS_CHANGED', 'pending:0', 'unused', '0']);
});

test('OC11: consumed success is tied to the exact candidate, command, session and payload and still rechecks current identity', () => {
  const f = fixture(), alternateSession = randomUUID();
  assert.deepEqual(f.run(`${f.authSession(alternateSession)} SELECT ${f.call()}->>'code';
    SELECT ${f.call({ command: randomUUID() })}->>'code';
    SELECT ${f.call({ candidate: digest() })}->>'code';
    SELECT ${f.call({ session: alternateSession })}->>'code';
    SELECT ${f.call({ device: 'Changed synthetic device' })}->>'code';
    SELECT ${f.call({ verification: `jsonb_set(${verification},'{consents}','[]'::jsonb)` })}->>'code';
    UPDATE core.otp_challenge SET expires_at=clock_timestamp()-interval '1 second' WHERE id=${f.challenge};
    SELECT ${f.call()}->>'code';
    UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${f.session}';
    SELECT ${f.call()}->>'code';
    SELECT count(*) FROM core.operation WHERE actor='${f.actor}' AND operation_id='${f.command}';
    SELECT count(*) FROM core.admission WHERE account_id='${f.actor}';`),
  ['OK', 'CONFLICT', 'CONFLICT', 'CONFLICT', 'CONFLICT', 'CONFLICT', 'OK', 'SESSION_INVALID', '1', '1']);
});

test('OC12: a second pending challenge cannot adopt an operation or Auth session already bound to a successful challenge', () => {
  const f = fixture('login');
  assert.deepEqual(f.run(`INSERT INTO core.otp_challenge(id,phone_hash,ip_hash,purpose,otp_hash,command,binding,environment,created_at)
      SELECT '${f.sibling}',phone_hash,ip_hash,purpose,otp_hash,gen_random_uuid(),binding,environment,created_at
        FROM core.otp_challenge WHERE id=${f.challenge};
    SELECT ${f.call()}->>'code';
    SELECT ${f.call({ challenge: `'${f.sibling}'::uuid` })}->>'code';
    SELECT ${f.call({ challenge: `'${f.sibling}'::uuid`, command: randomUUID() })}->>'code';
    SELECT state || ':' || attempts FROM core.otp_challenge WHERE id='${f.sibling}';
    SELECT completion_operation IS NULL FROM core.otp_challenge WHERE id='${f.sibling}';
    SELECT count(*) FROM core.operation WHERE actor='${f.actor}' AND action='auth.login';`),
  ['OK', 'CONFLICT', 'CONFLICT', 'pending:0', 't', '1']);
});
