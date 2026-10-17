import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { asynchronousCompose, heldTransaction } from '../../fixtures/core/concurrency.ts';
import { rows, sql } from '../../fixtures/core/runtime.ts';

const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const literal = (value: string) => `'${value.replaceAll("'", "''")}'`;
const json = (value: unknown) => `${literal(JSON.stringify(value))}::jsonb`;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const challenge = '(SELECT (result->>\'challenge_id\')::uuid FROM broker_reservation)';
const dispatchLease = '(SELECT (result->>\'lease\')::uuid FROM broker_reservation)';
const verifyLease = '(SELECT (result->>\'lease\')::uuid FROM broker_verification)';
const verification = "(SELECT context-'invitation_ref' || jsonb_build_object('consents',consents) FROM broker_context)";

// These are explicitly synthetic Auth/OTP/token facts for SQL integration tests.
// Production OTP and sessions are created only by official Auth endpoints.
function fixture(purpose: 'register' | 'login' = 'register') {
  const actor = randomUUID(), publisher = randomUUID(), session = randomUUID(), bootstrapSession = randomUUID(), command = randomUUID(), operation = randomUUID();
  const document = randomUUID(), revision = randomUUID(), release = randomUUID(), invitation = randomUUID(), invitationRef = randomUUID();
  const phone = `+1555${String(randomInt(0, 10000000)).padStart(7, '0')}`, otp = '713902', config = `public-otp-fixture-${randomUUID()}`;
  const body = 'SYNTHETIC PUBLIC OTP BROKER TERMS — NOT A PRODUCTION POLICY', bodyDigest = digest(body);
  const scope = json({ environment, surfaces: ['app'], purposes: ['register'] });
  const event = { user: { id: actor, phone: phone.slice(1) }, sms: { otp } };
  const reserve = (patch: { phone?: string; ip?: string; purpose?: string; context?: string; environment?: string; command?: string } = {}) =>
    `core.reserve_public_otp(${literal(patch.phone ?? phone)},${literal(patch.ip ?? '192.0.2.71')},${literal(patch.purpose ?? purpose)},
      '${patch.command ?? command}',${patch.context ?? (purpose === 'register' ? '(SELECT context FROM broker_context)' : "'{}'::jsonb")},
      ${patch.environment ?? literal(environment || '')})`;
  const hook = (patch?: unknown) => `core.auth_send_sms_hook(${json(patch ?? event)})`;
  const claim = (lease = dispatchLease) => `core.claim_public_sms(${challenge},${lease},'${environment}')`;
  const finishSms = (outcome: string, lease = dispatchLease) => `core.finish_public_sms(${challenge},${lease},'${outcome}','${environment}')`;
  const prepare = (patch: { otp?: string; operation?: string; verification?: string; readOnly?: boolean; environment?: string } = {}) =>
    `core.prepare_public_verify(${challenge},${literal(patch.otp ?? otp)},'${patch.operation ?? operation}',
      ${patch.verification ?? (purpose === 'register' ? verification : "'{}'::jsonb")},
      ${patch.environment ?? literal(environment || '')},${patch.readOnly ?? false})`;
  const tokens = `jsonb_build_object('access_token','synthetic-access-${operation}','refresh_token','synthetic-refresh-${operation}',
    'expires_at',floor(extract(epoch FROM clock_timestamp()+interval '1 hour'))::bigint)`;
  const finish = (patch: { lease?: string; actor?: string; session?: string; tokens?: string } = {}) =>
    `core.finish_public_verify(${challenge},${patch.lease ?? verifyLease},'${patch.actor ?? actor}',
      '${patch.session ?? session}',${patch.tokens ?? '(SELECT tokens FROM broker_tokens)'},'${environment}')`;
  const ready = `SELECT ${hook()}='{}'::jsonb;
    CREATE TEMP TABLE broker_claim ON COMMIT DROP AS SELECT ${claim()} AS result;
    SELECT result->>'code' FROM broker_claim;
    SELECT ${finishSms('sent')}->>'code';`;
  const beginVerify = `CREATE TEMP TABLE broker_verification ON COMMIT DROP AS SELECT ${prepare()} AS result;
    SELECT result->>'code' FROM broker_verification;`;
  const authProof = `UPDATE auth.users SET phone_confirmed_at=clock_timestamp() WHERE id='${actor}';
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
      VALUES ('${session}','${actor}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      VALUES (gen_random_uuid(),'${session}','otp',clock_timestamp(),clock_timestamp());
    CREATE TEMP TABLE broker_tokens ON COMMIT DROP AS SELECT ${tokens} AS tokens;`;
  const setup = `
    INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at)
      VALUES ('${publisher}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${publisher}@example.invalid',NULL,NULL,clock_timestamp(),clock_timestamp()),
      ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid','${phone.slice(1)}',clock_timestamp(),clock_timestamp(),clock_timestamp());
    INSERT INTO core.account(id) VALUES ('${publisher}');
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${document}','synthetic.public-otp.${document}','terms','zh-CN','${publisher}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${revision}','${document}',1,'Synthetic public OTP terms','${body}','${bodyDigest}','ready','${publisher}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${release}','${document}','${revision}','${bodyDigest}',${scope},'published','${publisher}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
      VALUES ('${invitation}','${digest(invitationRef)}','${publisher}',clock_timestamp()+interval '1 hour');
    CREATE TEMP TABLE broker_context ON COMMIT DROP AS SELECT
      jsonb_build_object('invitation_ref','${invitationRef}','document_set_digest',docs->>'document_set_digest',
        'age_declaration','{"version":"adult-18-v1","declared":true}'::jsonb) AS context,
      (SELECT jsonb_agg(jsonb_build_object('release_id',d->'release_id','digest',d->'digest','decision','consented'))
        FROM jsonb_array_elements(docs->'documents') d) AS consents
      FROM (SELECT core.registration_documents_result('${environment}') AS docs) current_documents;
    INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
      SELECT '${config}',jsonb_build_array(jsonb_build_object('scope','global','values',jsonb_object_agg(key,default_value))),1,
        '{"api":["0.0.0","fixture-v1"],"mobile":["0.0.0","fixture-v1"],"admin":["0.0.0","fixture-v1"],"share":["0.0.0","fixture-v1"],"sql":["0.0.0","fixture-v1"],"media":["0.0.0","fixture-v1"],"worker":["0.0.0","fixture-v1"],"ai":["0.0.0","fixture-v1"],"mcp":["0.0.0","fixture-v1"],"plugins":["0.0.0","fixture-v1"]}',
        'active',clock_timestamp(),repeat('f',64),ARRAY['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins'] FROM core.config_definition;
    INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${environment}','${config}')
      ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;
    ${purpose === 'login' ? `INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
        VALUES ('${bootstrapSession}','${actor}',clock_timestamp(),clock_timestamp(),'aal1');
      CREATE TEMP TABLE broker_bootstrap ON COMMIT DROP AS SELECT core.complete_registration_result('${actor}','${bootstrapSession}',
        '${digest(invitationRef)}','adult-18-v1',true,(SELECT context->>'document_set_digest' FROM broker_context),
        (SELECT consents FROM broker_context),gen_random_uuid(),gen_random_uuid(),'Synthetic admitted broker fixture','${environment}') AS result;` : ''}
    CREATE TEMP TABLE broker_reservation ON COMMIT DROP AS SELECT ${reserve()} AS result;
    SELECT result->>'code' FROM broker_reservation;`;
  const run = (statement: string) => {
    const output = sql(`BEGIN; ${setup} ${statement} ROLLBACK;`).trim().split(/\r?\n/);
    assert.equal(output.shift(), 'OK', 'Synthetic broker reservation must succeed');
    return output;
  };
  return { actor, publisher, session, command, operation, document, revision, release, invitation, invitationRef, phone, otp,
    config, event, reserve, hook, claim, finishSms, prepare, finish, ready, beginVerify, authProof, run };
}

test('PB01: broker storage and cryptographic helpers are private; hook and worker privileges have distinct owners', () => {
  for (const role of ['anon', 'authenticated', 'service_role', 'core_runtime', 'core_worker', 'supabase_auth_admin']) {
    const access = rows(`SELECT
      has_table_privilege('${role}','core.public_otp_secret','SELECT,INSERT,UPDATE,DELETE') AS secrets,
      has_table_privilege('${role}','core.public_otp_flow','SELECT,INSERT,UPDATE,DELETE') AS flows,
      has_function_privilege('${role}','core.public_otp_digest(text,text,text)','EXECUTE') AS digest,
      has_function_privilege('${role}','core.public_otp_decrypt(text,bytea)','EXECUTE') AS decrypt,
      has_function_privilege('${role}','core.auth_send_sms_hook(jsonb)','EXECUTE') AS hook,
      has_function_privilege('${role}','core.expire_public_otp(text)','EXECUTE') AS cleanup,
      has_function_privilege('${role}','core.reserve_public_otp(text,text,text,uuid,jsonb,text)','EXECUTE') AS reserve`)[0];
    assert.deepEqual(access, { secrets: false, flows: false, digest: false, decrypt: false,
      hook: role === 'supabase_auth_admin', cleanup: role === 'core_worker', reserve: role === 'core_runtime' }, role);
  }
});

test('PB02: ingress accepts canonical E164 and IP only, rejects unknown environment or purpose, and keeps digests domain-separated', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.reserve({ phone: f.phone.slice(1) })}->>'code';
    SELECT ${f.reserve({ ip: '192.0.2.71/24' })}->>'code'; SELECT ${f.reserve({ ip: '999.0.0.1' })}->>'code';
    SELECT ${f.reserve({ purpose: 'change_phone' })}->>'code'; SELECT ${f.reserve({ environment: "'invalid'" })}->>'code';
    SELECT ${f.reserve({ environment: 'NULL' })}->>'code';
    SELECT count(DISTINCT core.public_otp_digest(e,'phone','${f.phone}')) FROM unnest(ARRAY['dev','test','production']) e;
    SELECT core.public_otp_digest('${environment}','phone','${f.phone}')<>core.public_otp_digest('${environment}','ip','${f.phone}');
    SELECT c.binding->>'invitation_hash'='${digest(f.invitationRef)}' AND NOT c.binding ? 'invitation_ref'
      FROM core.otp_challenge c WHERE c.id=${challenge};
    SELECT phone_cipher IS NOT NULL AND otp_cipher IS NULL AND secret_expiry<=metadata_expiry
      FROM core.public_otp_flow WHERE challenge_id=${challenge};`),
  ['INVALID_INPUT', 'INVALID_INPUT', 'INVALID_INPUT', 'INVALID_INPUT', 'INVALID_INPUT', 'INVALID_INPUT', '3', 't', 't', 't']);
});

test('PB03: exact command replay preserves the one challenge and lease before and after Auth replaces its placeholder digest', () => {
  const f = fixture();
  assert.deepEqual(f.run(`CREATE TEMP TABLE broker_replay ON COMMIT DROP AS SELECT ${f.reserve()} AS result;
    SELECT result->>'reused'='true' AND result->>'lease'=(SELECT result->>'lease' FROM broker_reservation)
      AND result->>'dispatch_state'='waiting' FROM broker_replay;
    SELECT ${f.hook()}='{}'::jsonb;
    SELECT ${f.reserve()}->>'dispatch_state';
    SELECT ${f.reserve()}->>'reused';
    SELECT ${f.reserve({ ip: '192.0.2.72' })}->>'code';
    SELECT count(*) FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT c.otp_hash=core.public_otp_digest('${environment}','code',c.id::text || ':${f.otp}')
      FROM core.otp_challenge c WHERE id=${challenge};`), ['t', 't', 'hooked', 'true', 'CONFLICT', '1', 't']);
});

test('PB04: hook rejects unmatched, malformed, ambiguous and repeated requests without returning an OTP', () => {
  const f = fixture(), sibling = randomUUID(), otherEnvironment = environment === 'dev' ? 'test' : 'dev';
  assert.deepEqual(f.run(`SELECT ${f.hook({ user: { id: f.actor, phone: '+19999999999' }, sms: { otp: f.otp } })}->'error'->>'http_code';
    SELECT ${f.hook({ ...f.event, sms: { otp: 'x13902' } })}->'error'->>'http_code';
    SELECT ${f.hook({ ...f.event, sms: { otp: f.otp, phone: '+19999999999' } })}->'error'->>'http_code';
    INSERT INTO core.otp_challenge(id,phone_hash,ip_hash,purpose,otp_hash,command,binding,environment)
      VALUES ('${sibling}',core.public_otp_digest('${otherEnvironment}','phone','${f.phone}'),repeat('1',64),
        'login',repeat('2',64),gen_random_uuid(),'{}','${otherEnvironment}');
    INSERT INTO core.public_otp_flow(challenge_id,environment,secret_expiry)
      VALUES ('${sibling}','${otherEnvironment}',clock_timestamp()+interval '5 minutes');
    SELECT ${f.hook()}->'error'->>'http_code';
    SELECT dispatch_state FROM core.public_otp_flow WHERE challenge_id=${challenge};
    UPDATE core.otp_challenge SET state='superseded' WHERE id='${sibling}';
    SELECT ${f.hook()}='{}'::jsonb; SELECT ${f.hook()}->'error'->>'http_code';`),
  ['403', '403', '403', '403', 'waiting', 't', '403']);
});

test('PB05: one SMS lease reveals short-lived secrets once and only accepted sending can become sent', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.finishSms('sent')}->>'code'; SELECT ${f.hook()}='{}'::jsonb;
    SELECT ${f.claim(`'${randomUUID()}'`)}->>'code';
    CREATE TEMP TABLE broker_claim ON COMMIT DROP AS SELECT ${f.claim()} AS result;
    SELECT result->>'code' FROM broker_claim;
    SELECT result->>'phone'='${f.phone}' AND result->>'otp'='${f.otp}'
      AND (result->>'request_id')::uuid=${challenge} FROM broker_claim;
    SELECT ${f.claim()}->>'code'; SELECT ${f.finishSms('sent')}->>'code'; SELECT ${f.finishSms('sent')}->>'code';
    SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT ${f.reserve()}->>'dispatch_state';`), ['CONFLICT', 't', 'OTP_INVALID', 'OK', 't', 'CONFLICT', 'OK', 'OK', 'sent:true', 'sent']);
});

test('PB06: Auth failure and SMS uncertainty never become a sent challenge or restart the send', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SAVEPOINT auth_failure;
    SELECT ${f.finishSms('failed')}->>'code'; SELECT ${f.reserve()}->>'dispatch_state';
    SELECT ${f.prepare()}->>'code'; SELECT ${f.hook()}->'error'->>'http_code';
    ROLLBACK TO SAVEPOINT auth_failure;
    SAVEPOINT hooked_uncertainty; SELECT ${f.hook()}='{}'::jsonb;
    SELECT ${f.finishSms('unknown')}->>'code';
    SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT ${f.finishSms('sent')}->>'code'; ROLLBACK TO SAVEPOINT hooked_uncertainty;
    SELECT ${f.hook()}='{}'::jsonb; CREATE TEMP TABLE broker_claim ON COMMIT DROP AS SELECT ${f.claim()} AS result;
    SELECT ${f.finishSms('unknown')}->>'code'; SELECT ${f.reserve()}->>'dispatch_state';
    SELECT ${f.finishSms('sent')}->>'code'; SELECT ${f.prepare()}->>'code';
    SELECT otp_cipher IS NULL FROM core.public_otp_flow WHERE challenge_id=${challenge};`),
  ['OK', 'failed', 'OTP_INVALID', '403', 't', 'OK', 'unknown:true', 'CONFLICT', 't', 'OK', 'unknown', 'CONFLICT', 'OTP_INVALID', 't']);
});

test('PB07: wrong OTP persists attempts without binding an operation; consent and read-only checks precede the one Auth lease', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready}
    SELECT ${f.prepare({ otp: '000000' })}->>'code';
    SELECT attempts FROM core.otp_challenge WHERE id=${challenge};
    SELECT verify_state='idle' AND verify_operation IS NULL FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT ${f.prepare({ verification: `jsonb_set(${verification},'{consents}','[]'::jsonb)` })}->>'code';
    SELECT ${f.prepare({ readOnly: true })}->>'state';
    SELECT verify_operation IS NULL FROM core.public_otp_flow WHERE challenge_id=${challenge};
    ${f.beginVerify}
    SELECT result->>'action'='verify' AND result->>'phone'='${f.phone}' AND result ? 'lease' FROM broker_verification;
    CREATE TEMP TABLE broker_pending ON COMMIT DROP AS SELECT ${f.prepare()} AS result;
    SELECT result->>'code'='AUTH_UNCONFIRMED' AND result->>'state'='pending' AND NOT result ?| ARRAY['phone','lease'] FROM broker_pending;
    SELECT ${f.prepare({ operation: randomUUID() })}->>'code';
    SELECT ${f.prepare({ verification: `jsonb_set(${verification},'{consents}','[]'::jsonb)` })}->>'code';
    SELECT state || ':' || attempts FROM core.otp_challenge WHERE id=${challenge};`),
  ['t', 'OK', 'OK', 'OTP_INVALID', '1', 't', 'CONSENT_REQUIRED', 'idle', 't', 'OK', 't', 't', 'CONFLICT', 'CONFLICT', 'pending:1']);
});

test('PB08: an in-flight Auth attempt becomes unknown after fifteen seconds and neither another operation nor a late result can restart it', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify} ${f.authProof}
    UPDATE core.public_otp_flow SET verify_started_at=clock_timestamp()-interval '16 seconds' WHERE challenge_id=${challenge};
    SELECT ${f.prepare()}->>'state'; SELECT ${f.finish()}->>'code';
    SELECT ${f.prepare({ operation: randomUUID() })}->>'code';
    SELECT count(*) FROM core.admission WHERE account_id='${f.actor}';
    SELECT state FROM core.otp_challenge WHERE id=${challenge};
    SELECT core.fail_public_verify(${challenge},${verifyLease},true,'${environment}')->>'code';`),
  ['t', 'OK', 'OK', 'OK', 'unknown', 'AUTH_UNCONFIRMED', 'CONFLICT', '0', 'pending', 'AUTH_UNCONFIRMED']);
});

test('PB09: real Auth row/session/OTP proof completes one admission and encrypted short-lived exact receipt, then current phone or revocation rejects replay', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify} ${f.authProof}
    CREATE TEMP TABLE broker_success ON COMMIT DROP AS SELECT ${f.finish()} AS result;
    SELECT result->>'code' FROM broker_success;
    SELECT result->'data'->'session'=(SELECT tokens FROM broker_tokens)
      AND result->'data'->'account'=jsonb_build_object('id','${f.actor}','admitted',true) FROM broker_success;
    SELECT ${f.prepare()}->'data'=(SELECT result->'data' FROM broker_success);
    SELECT ${f.finish()}->'data'=(SELECT result->'data' FROM broker_success);
    SELECT receipt_cipher IS NOT NULL AND phone_cipher IS NULL AND otp_cipher IS NULL
      AND receipt_expiry<=clock_timestamp()+interval '5 minutes'
      AND receipt_expiry<=to_timestamp(((SELECT tokens->>'expires_at' FROM broker_tokens))::double precision)
      FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT count(*) FROM core.operation WHERE actor='${f.actor}' AND operation_id='${f.operation}';
    SAVEPOINT changed_phone; UPDATE auth.users SET phone='19999999999' WHERE id='${f.actor}';
    SELECT ${f.prepare()}->>'code'; ROLLBACK TO SAVEPOINT changed_phone;
    UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${f.session}';
    SELECT ${f.prepare()}->>'code';`),
  ['t', 'OK', 'OK', 'OK', 'OK', 't', 't', 't', 't', '1', 'SESSION_INVALID', 'SESSION_INVALID']);
});

test('PB10: completed-proof guessing has a separate five-failure budget and cannot mutate the consumed challenge', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify} ${f.authProof} SELECT ${f.finish()}->>'code';
    ${Array.from({ length: 6 }, () => `SELECT ${f.prepare({ otp: '000000' })}->>'code';`).join('\n')}
    SELECT receipt_failures FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT state || ':' || attempts FROM core.otp_challenge WHERE id=${challenge};
    SELECT ${f.prepare()}->>'code';`),
  ['t', 'OK', 'OK', 'OK', 'OK', ...Array.from({ length: 6 }, () => 'OTP_INVALID'), '5', 'consumed:0', 'OTP_INVALID']);
});

test('PB11: wrong completion lease or hook subject is refused, and a non-OTP Auth session leaves registration unconsumed', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify} ${f.authProof}
    SELECT ${f.finish({ lease: `'${randomUUID()}'` })}->>'code';
    SELECT ${f.finish({ actor: randomUUID() })}->>'code';
    SAVEPOINT password_session;
    UPDATE auth.mfa_amr_claims SET authentication_method='password' WHERE session_id='${f.session}';
    SELECT ${f.finish()}->>'code';
    SELECT state || ':' || attempts FROM core.otp_challenge WHERE id=${challenge};
    SELECT count(*) FROM core.admission WHERE account_id='${f.actor}';
    SELECT verify_state FROM core.public_otp_flow WHERE challenge_id=${challenge};
    ROLLBACK TO SAVEPOINT password_session;
    SELECT ${f.finish()}->>'code';`),
  ['t', 'OK', 'OK', 'OK', 'CONFLICT', 'CONFLICT', 'SESSION_INVALID', 'pending:0', '0', 'failed', 'OK']);
});

test('PB12: registration facts are rechecked before Auth, and correct OTP does not bypass revoked invitations or changed terms', () => {
  const f = fixture(), nextRelease = randomUUID();
  assert.deepEqual(f.run(`${f.ready}
    SAVEPOINT revoked_invitation;
    UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic revocation' WHERE id='${f.invitation}';
    SELECT ${f.prepare()}->>'code'; ROLLBACK TO SAVEPOINT revoked_invitation;
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      SELECT '${nextRelease}',document_id,revision_ref,content_digest,scope,'published',publisher,clock_timestamp()
        FROM core.document_release WHERE id='${f.release}';
    UPDATE core.managed_document SET active_release_id='${nextRelease}' WHERE id='${f.document}';
    SELECT ${f.prepare()}->>'code';
    SELECT verify_state='idle' AND verify_operation IS NULL FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT state FROM core.otp_challenge WHERE id=${challenge};`),
  ['t', 'OK', 'OK', 'INVITATION_INVALID', 'TERMS_CHANGED', 't', 'pending']);
});

test('PB13: explicit Auth failure is terminal, expiry denies reads before cleanup, and worker clears no more than fifty secret records', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify}
    SELECT core.fail_public_verify(${challenge},${verifyLease},false,'${environment}')->>'code';
    SELECT ${f.prepare()}->>'code';
    CREATE TEMP TABLE broker_expired_ids ON COMMIT DROP AS SELECT gen_random_uuid() AS id FROM generate_series(1,51);
    INSERT INTO core.otp_challenge(id,phone_hash,ip_hash,purpose,otp_hash,command,binding,environment)
      SELECT id,repeat('d',64),repeat('e',64),'login',repeat('f',64),gen_random_uuid(),'{}','${environment}' FROM broker_expired_ids;
    INSERT INTO core.public_otp_flow(challenge_id,environment,phone_cipher,otp_cipher,secret_expiry)
      SELECT id,'${environment}',core.public_otp_encrypt('${environment}','${f.phone}'),
        core.public_otp_encrypt('${environment}','${f.otp}'),clock_timestamp()-interval '100 years' FROM broker_expired_ids;
    SELECT core.claim_public_sms(f.challenge_id,f.dispatch_lease,'${environment}')->>'code'
      FROM core.public_otp_flow f WHERE f.challenge_id=(SELECT id FROM broker_expired_ids LIMIT 1);
    DO $$ BEGIN PERFORM core.expire_public_otp('${environment}'); END $$;
    SELECT count(*) FROM core.public_otp_flow f JOIN broker_expired_ids e ON e.id=f.challenge_id WHERE phone_cipher IS NOT NULL OR otp_cipher IS NOT NULL;
    DO $$ BEGIN PERFORM core.expire_public_otp('${environment}'); END $$;
    SELECT count(*) FROM core.public_otp_flow f JOIN broker_expired_ids e ON e.id=f.challenge_id WHERE phone_cipher IS NOT NULL OR otp_cipher IS NOT NULL;`),
  ['t', 'OK', 'OK', 'OK', 'AUTH_FAILED', 'AUTH_FAILED', 'OTP_EXPIRED', '1', '0']);
});

test('PB14: expired receipt returns no tokens even before worker cleanup; worker clears only the expired ciphertext', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify} ${f.authProof} SELECT ${f.finish()}->>'code';
    UPDATE core.public_otp_flow SET receipt_expiry=clock_timestamp()-interval '1 second' WHERE challenge_id=${challenge};
    SELECT ${f.prepare()}->>'code';
    DO $$ BEGIN PERFORM core.expire_public_otp('${environment}'); END $$;
    SELECT receipt_cipher IS NULL AND verify_state='completed' FROM core.public_otp_flow WHERE challenge_id=${challenge};
    SELECT state FROM core.otp_challenge WHERE id=${challenge};`),
  ['t', 'OK', 'OK', 'OK', 'OK', 'SESSION_INVALID', 't', 'consumed']);
});

test('PB15: existing admitted login remains independent of newly required registration consents', () => {
  const f = fixture('login');
  assert.deepEqual(f.run(`SELECT result->>'code' FROM broker_bootstrap;
    UPDATE core.document_release SET state='withdrawn' WHERE id='${f.release}';
    ${f.ready} ${f.beginVerify} ${f.authProof} SELECT ${f.finish()}->>'code';
    SELECT count(*) FROM core.document_receipt WHERE subject='${f.actor}' AND request_id='${f.operation}';
    SELECT count(*) FROM core.admin_grant WHERE account_id='${f.actor}';`),
  ['OK', 't', 'OK', 'OK', 'OK', 'OK', '0', '0']);
});

test('PB16: Auth hook returns an immediate generic unavailable error while another connection owns the policy writer', async () => {
  const held = await heldTransaction('SELECT pg_advisory_xact_lock(17013,1)');
  try {
    const output = await asynchronousCompose(['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres',
      '-v', 'ON_ERROR_STOP=1'], "SET statement_timeout='1s'; SELECT core.auth_send_sms_hook('{}')->'error'->>'http_code';");
    assert.equal(output.trim(), '503');
  } finally { await held.commit(); }
});

test('PB17: final output readers return only an accepted exact challenge or current exact receipt and reject revoked identity', () => {
  const f = fixture();
  const readChallenge = `core.read_public_challenge('${f.phone}','192.0.2.71','register','${f.command}',
    (SELECT context FROM broker_context),'${environment}')`;
  const readVerify = `core.read_public_verify(${challenge},'${f.otp}','${f.operation}',${verification},'${environment}')`;
  assert.deepEqual(f.run(`SELECT ${readChallenge}->>'code'; ${f.ready}
    SELECT ${readChallenge}->>'code'; ${f.beginVerify} ${f.authProof} SELECT ${f.finish()}->>'code';
    SELECT ${readVerify}->>'code';
    UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${f.session}';
    SELECT ${readVerify}->>'code';`),
  ['AUTH_UNCONFIRMED', 't', 'OK', 'OK', 'OK', 'OK', 'OK', 'OK', 'SESSION_INVALID']);
});

test('PB18: provider acceptance is recorded and secrets cleared even if expiry or changed registration facts prevent public success', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.hook()}='{}'::jsonb;
    CREATE TEMP TABLE broker_claim ON COMMIT DROP AS SELECT ${f.claim()} AS result;
    SELECT result->>'code' FROM broker_claim;
    SELECT (result->>'expires_at')::timestamptz=c.expires_at AND (result->>'auth_issued_at')::timestamptz=f.hooked_at
      FROM broker_claim CROSS JOIN core.otp_challenge c JOIN core.public_otp_flow f ON f.challenge_id=c.id WHERE c.id=${challenge};
    SAVEPOINT expired_send; UPDATE core.otp_challenge SET expires_at=clock_timestamp()-interval '1 second' WHERE id=${challenge};
    SELECT ${f.finishSms('sent')}->>'code';
    SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
    ROLLBACK TO SAVEPOINT expired_send;
    UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic in-flight revocation' WHERE id='${f.invitation}';
    SELECT ${f.finishSms('sent')}->>'code';
    SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};`),
  ['t', 'OK', 't', 'OTP_EXPIRED', 'sent:true', 'INVITATION_INVALID', 'sent:true']);
});

test('PB19: SMS results remain durable and erase OTP ciphertext when restore closes or active configuration becomes invalid in flight', () => {
  const f = fixture();
  const vectors = [
    { change: `UPDATE core.restore_gate SET state='closed' WHERE environment='${environment}';`, code: 'SERVICE_UNAVAILABLE' },
    { change: `DELETE FROM core.config_activation WHERE environment='${environment}' AND active_ptr='${f.config}';`, code: 'CONFIG_UNAVAILABLE' },
  ];
  assert.deepEqual(f.run(`SELECT ${f.hook()}='{}'::jsonb;
    CREATE TEMP TABLE broker_claim ON COMMIT DROP AS SELECT ${f.claim()} AS result;
    SELECT result->>'code' FROM broker_claim;
    ${vectors.map(vector => `SAVEPOINT closed_send;
      ${vector.change}
      SELECT ${f.finishSms('sent', `'${randomUUID()}'`)}->>'code';
      SELECT dispatch_state || ':' || (otp_cipher IS NOT NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      SELECT ${f.finishSms('sent')}->>'code';
      SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      ROLLBACK TO SAVEPOINT closed_send;
      SAVEPOINT closed_send_failure; ${vector.change}
      SELECT ${f.finishSms('unknown')}->>'code';
      SELECT dispatch_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      ROLLBACK TO SAVEPOINT closed_send_failure;`).join('\n')}`),
  ['t', 'OK', ...vectors.flatMap(vector => ['OTP_INVALID', 'sending:true', vector.code, 'sent:true', 'OK', 'unknown:true'])]);
});

test('PB20: existing verify leases record Auth unknown or failure while restore or configuration gates are closed, without granting admission', () => {
  const f = fixture();
  const vectors = [
    `UPDATE core.restore_gate SET state='closed' WHERE environment='${environment}';`,
    `DELETE FROM core.config_activation WHERE environment='${environment}' AND active_ptr='${f.config}';`,
  ];
  assert.deepEqual(f.run(`${f.ready} ${f.beginVerify}
    UPDATE core.public_otp_flow SET otp_cipher=core.public_otp_encrypt('${environment}','${f.otp}') WHERE challenge_id=${challenge};
    ${vectors.map(change => `SAVEPOINT closed_verify;
      ${change}
      SELECT core.fail_public_verify(${challenge},'${randomUUID()}',true,'${environment}')->>'code';
      SELECT verify_state || ':' || (otp_cipher IS NOT NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      SELECT core.fail_public_verify(${challenge},${verifyLease},true,'${environment}')->>'code';
      SELECT verify_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      ROLLBACK TO SAVEPOINT closed_verify;
      SAVEPOINT closed_verify_failure; ${change}
      SELECT core.fail_public_verify(${challenge},${verifyLease},false,'${environment}')->>'code';
      SELECT verify_state || ':' || (otp_cipher IS NULL)::text FROM core.public_otp_flow WHERE challenge_id=${challenge};
      ROLLBACK TO SAVEPOINT closed_verify_failure;`).join('\n')}
    SELECT count(*) FROM core.admission WHERE account_id='${f.actor}';
    SELECT state FROM core.otp_challenge WHERE id=${challenge};`),
  ['t', 'OK', 'OK', 'OK', ...vectors.flatMap(() => ['CONFLICT', 'pending:true', 'AUTH_UNCONFIRMED', 'unknown:true', 'AUTH_FAILED', 'failed:true']), '0', 'pending']);
});
