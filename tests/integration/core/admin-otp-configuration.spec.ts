import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { rows, sql } from '../../fixtures/core/runtime.ts';
import { asynchronousCompose, heldTransaction } from '../../fixtures/core/concurrency.ts';
import { setTimeout as delay } from 'node:timers/promises';

const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
const literal = (value: unknown) => "'" + JSON.stringify(value).replaceAll("'", "''") + "'::jsonb";

// Explicit synthetic Auth MFA facts; the root integration separately verifies
// official Auth enrollment/challenge/verify and signature-verified aal2 tokens.
function identityFixture() {
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
  return { actor, publisher, session, factor, foreignFactor, grant, phone, args, run, setup };
}

function fixture() {
  const f = identityFixture(), base = `admin-otp-base-${randomUUID()}`, previewCommand = randomUUID(), commitCommand = randomUUID();
  const authChallenge = randomUUID();
  const configuration = `INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
    SELECT '${base}',jsonb_build_array(jsonb_build_object('scope','global','values',jsonb_object_agg(key,default_value)),
      '{"scope":"module","environment":"${env}","owner":"untouched-plugin","values":{"ui.supported_themes":["dark"]}}'::jsonb),1,
      '{"api":["0.0.0","fixture-v1"],"mobile":["0.0.0","fixture-v1"],"admin":["0.0.0","fixture-v1"],"share":["0.0.0","fixture-v1"],"sql":["0.0.0","fixture-v1"],"media":["0.0.0","fixture-v1"],"worker":["0.0.0","fixture-v1"],"ai":["0.0.0","fixture-v1"],"mcp":["0.0.0","fixture-v1"],"plugins":["0.0.0","fixture-v1"]}',
      'active',clock_timestamp(),repeat('f',64),ARRAY['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins'] FROM core.config_definition;
    INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${env}','${base}')
      ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;
    CREATE TEMP TABLE admin_current ON COMMIT DROP AS SELECT core.otp_configuration_result('${env}') AS result;`;
  const values = `(SELECT (result->'values') || '{"auth.otp_resend_seconds":90}'::jsonb FROM admin_current)`;
  const preview = (patch: { values?: string; base?: string; rollback?: string; reason?: string; command?: string; max?: number } = {}) =>
    `core.admin_config_preview_result(${f.args()},${patch.base ?? `'${base}'`},${patch.values ?? values},
      ${patch.rollback ?? 'NULL'},'${patch.reason ?? 'Synthetic OTP policy adjustment'}','${patch.command ?? previewCommand}',${patch.max ?? 3600})`;
  const previewId = '(SELECT (result->\'data\'->>\'preview_id\')::uuid FROM admin_preview)';
  const action = '(SELECT result->\'data\'->>\'action_digest\' FROM admin_preview)';
  const previewDigest = '(SELECT result->\'data\'->>\'preview_digest\' FROM admin_preview)';
  const stepupId = '(SELECT (result->\'data\'->>\'stepup_id\')::uuid FROM admin_stepup)';
  const commit = (patch: { preview?: string; digest?: string; stepup?: string; command?: string; kind?: string; aal?: string; max?: number; session?: string } = {}) =>
    `core.admin_config_commit_result('${f.actor}','${patch.session ?? f.session}','${env}','${patch.aal ?? 'aal2'}',
      ${patch.preview ?? previewId},${patch.digest ?? previewDigest},${patch.stepup ?? stepupId},'${patch.command ?? commitCommand}',
      '${patch.kind ?? 'release'}',${patch.max ?? 3600})`;
  const stepup = (challengeRef = authChallenge, actionRef = action) =>
    `core.admin_stepup_result(${f.args()},'${f.factor}','${challengeRef}',${actionRef})`;
  const makePreview = `CREATE TEMP TABLE admin_preview ON COMMIT DROP AS SELECT ${preview()} AS result;
    SELECT result->>'code' FROM admin_preview;`;
  const proof = `INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address)
    VALUES ('${authChallenge}','${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
    UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${f.session}' AND authentication_method='totp';`;
  const makeStepup = `${proof} CREATE TEMP TABLE admin_stepup ON COMMIT DROP AS SELECT ${stepup()} AS result;
    SELECT result->>'code' FROM admin_stepup;`;
  const run = (statement: string) => f.run(`${configuration} ${statement}`);
  return { ...f, base, previewCommand, commitCommand, authChallenge, configuration, values, preview, previewId, previewDigest, action, stepupId,
    commit, stepup, makePreview, makeStepup, proof, run };
}

test('AC01: definitions expose exactly six current OTP values with deployment cap and no private configuration registry or MFA secrets', () => {
  const f = fixture();
  assert.deepEqual(f.run(`CREATE TEMP TABLE definitions ON COMMIT DROP AS SELECT core.admin_config_definitions_result(${f.args()},3600) AS result;
    SELECT result->>'code' FROM definitions;
    SELECT result->'data'->>'base_version'='${f.base}' AND jsonb_array_length(result->'data'->'definitions')=6
      AND result->'data'->>'deployment_max_lifetime_seconds'='3600' FROM definitions;
    SELECT bool_and(d ?& ARRAY['key','description','default_value','value','range','read_permission','write_permission','effect_mode','existing_policy'])
      FROM definitions,jsonb_array_elements(result->'data'->'definitions') d;
    UPDATE core.admin_grant SET role='auditor' WHERE id='${f.grant}';
    SELECT core.admin_config_definitions_result(${f.args()},3600)->>'code';
    SELECT ${f.preview()}->>'code';`), ['OK', 't', 't', 'OK', 'FORBIDDEN']);
});

test('AC02: preview validates the exact six-key schema, ranges, current base, Auth lifetime and mutually exclusive rollback input', () => {
  const f = fixture();
  assert.deepEqual(f.run(`SELECT ${f.preview({ values: `${f.values}-'auth.otp_max_failures'` })}->>'code';
    SELECT ${f.preview({ values: `${f.values} || '{"unknown.key":1}'::jsonb` })}->>'code';
    SELECT ${f.preview({ values: `jsonb_set(${f.values},'{auth.otp_max_failures}','0'::jsonb)` })}->>'code';
    SELECT ${f.preview({ values: `jsonb_set(${f.values},'{auth.otp_lifetime_seconds}','3601'::jsonb)` })}->>'code';
    SELECT ${f.preview({ base: "'missing-version'" })}->>'code';
    SELECT ${f.preview({ rollback: `'${f.base}'` })}->>'code';
    SELECT ${f.preview({ values: 'NULL', rollback: `'${f.base}'` })}->>'code';
    SELECT count(*) FROM core.admin_config_preview WHERE actor='${f.actor}';`),
  ['INVALID_INPUT', 'INVALID_INPUT', 'INVALID_INPUT', 'AUTH_LIFETIME_EXCEEDED', 'CONFLICT', 'INVALID_INPUT', 'NOT_FOUND', '0']);
});

test('AC03: immutable exact preview retry preserves full scopes, compatibility and readiness; payload changes conflict and preview alone never activates', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview}
    SELECT ${f.preview()}->'data'=(SELECT result->'data' FROM admin_preview);
    SELECT ${f.preview({ reason: 'Different reason' })}->>'code';
    SELECT p.scoped_values->0=b.scoped_values->0 AND p.scoped_values->1=b.scoped_values->1
      AND p.compat=b.compat AND p.consumers_ready=b.consumers_ready AND jsonb_array_length(p.scoped_values)=3
      FROM core.admin_config_preview p CROSS JOIN core.config_bundle b WHERE p.id=${f.previewId} AND b.version='${f.base}';
    SELECT active_ptr FROM core.config_activation WHERE environment='${env}';
    SELECT count(*) FROM core.admin_config_preview WHERE actor='${f.actor}';
    SELECT count(*) FROM core.admin_config_publication WHERE actor='${f.actor}';`), ['OK', 't', 'CONFLICT', 't', f.base, '1', '0']);
});

test('AC04: step-up accepts only current official Auth challenge evidence after this preview and binds each proof to one exact action/session', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview}
    SELECT ${f.stepup()}->>'code';
    ${f.proof}
    SAVEPOINT old_proof; UPDATE auth.mfa_challenges SET created_at=clock_timestamp()-interval '6 minutes',verified_at=clock_timestamp()-interval '6 minutes'
      WHERE id='${f.authChallenge}'; SELECT ${f.stepup()}->>'code'; ROLLBACK TO SAVEPOINT old_proof;
    CREATE TEMP TABLE admin_stepup ON COMMIT DROP AS SELECT ${f.stepup()} AS result;
    SELECT result->>'code' FROM admin_stepup;
    SELECT ${f.stepup()}->'data'=(SELECT result->'data' FROM admin_stepup);
    SELECT expires_at<=verified_at+interval '5 minutes' FROM core.stepup_challenge WHERE id=${f.stepupId};
    CREATE TEMP TABLE second_preview ON COMMIT DROP AS SELECT ${f.preview({ command: randomUUID() })} AS result;
    SELECT ${f.stepup(f.authChallenge, "(SELECT result->'data'->>'action_digest' FROM second_preview)")}->>'code';
    SELECT core.admin_stepup_target_result(${f.args()},repeat('0',64))->>'code';`),
  ['OK', 'STEPUP_REQUIRED', 'STEPUP_REQUIRED', 'OK', 't', 't', 'CONFLICT', 'NOT_FOUND']);
});

test('AC05: atomic release preserves the whole bundle, consumes one proof and produces one operation/audit receipt with current-qualified retry', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    CREATE TEMP TABLE release_receipt ON COMMIT DROP AS SELECT ${f.commit()} AS result;
    SELECT result->>'code' FROM release_receipt;
    SELECT result->'data'->>'kind'='release' AND result->'data'->>'state'='active' AND result->'data'->>'previous_version'='${f.base}' FROM release_receipt;
    SELECT ${f.commit()}->'data'=(SELECT result->'data' FROM release_receipt);
    SELECT ${f.commit({ command: randomUUID() })}->>'code';
    SELECT ${f.commit({ aal: 'aal1' })}->>'code';
    SELECT core.otp_configuration_result('${env}')->'values'->>'auth.otp_resend_seconds';
    SELECT count(*) FROM core.operation WHERE actor='${f.actor}' AND operation_id='${f.commitCommand}';
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND request_id='${f.commitCommand}';
    SELECT consumed_at IS NOT NULL FROM core.stepup_challenge WHERE id=${f.stepupId};
    SELECT core.account_operation_result('${f.actor}','${f.session}','${f.commitCommand}','${env}','aal2')->'data'->'result'=(SELECT result->'data' FROM release_receipt);
    UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE id='${f.grant}';
    SELECT ${f.commit()}->>'code';`), ['OK', 'OK', 'OK', 't', 't', 'CONFLICT', 'MFA_REQUIRED', '90', '1', '1', 't', 't', 'FORBIDDEN']);
});

test('AC06: current registry changes, base CAS changes, mismatched step-up and DEC-001 cooldown reject without consuming proof or partial activation', () => {
  const f = fixture();
  const mismatch = randomUUID();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    SAVEPOINT registry_changed; UPDATE core.config_definition SET description=description || ' synthetic changed' WHERE key='auth.otp_max_failures';
    SELECT ${f.commit()}->>'code'; ROLLBACK TO SAVEPOINT registry_changed;
    SAVEPOINT base_changed; DELETE FROM core.config_activation WHERE environment='${env}';
    SELECT ${f.commit()}->>'code'; ROLLBACK TO SAVEPOINT base_changed;
    SELECT ${f.commit({ stepup: `'${mismatch}'` })}->>'code';
    UPDATE core.account SET sensitive_until=clock_timestamp()+interval '1 hour' WHERE id='${f.actor}';
    SELECT ${f.commit()}->>'code';
    SELECT active_ptr='${f.base}' FROM core.config_activation WHERE environment='${env}';
    SELECT consumed_at IS NULL FROM core.stepup_challenge WHERE id=${f.stepupId};
    SELECT count(*) FROM core.admin_config_publication WHERE actor='${f.actor}';
    UPDATE core.account SET sensitive_until=clock_timestamp() WHERE id='${f.actor}';
    SELECT ${f.commit()}->>'code';`), ['OK', 'OK', 'CONFLICT', 'CONFLICT', 'STEPUP_REQUIRED', 'SENSITIVE_COOLDOWN', 't', 't', '0', 'OK']);
});

test('AC07: commit enforces its deployment bound, exact digest, session and production confirmation independently of a valid preview', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    SELECT ${f.commit({ max: 299 })}->>'code';
    SELECT ${f.commit({ digest: "repeat('0',64)" })}->>'code';
    SELECT ${f.commit({ session: randomUUID() })}->>'code';
    SAVEPOINT production_confirmation;
    UPDATE core.restore_gate SET state='open' WHERE environment='production';
    INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment)
      SELECT account_id,role,operation_scopes,'production' FROM core.admin_grant WHERE id='${f.grant}';
    SELECT core.admin_config_commit_result('${f.actor}','${f.session}','production','aal2',${f.previewId},${f.previewDigest},${f.stepupId},
      gen_random_uuid(),'release',3600)->>'code';
    ROLLBACK TO SAVEPOINT production_confirmation;
    SELECT consumed_at IS NULL FROM core.stepup_challenge WHERE id=${f.stepupId};
    SELECT count(*) FROM core.admin_config_publication WHERE actor='${f.actor}';`),
  ['OK', 'OK', 'AUTH_LIFETIME_EXCEEDED', 'CONFLICT', 'SESSION_INVALID', 'PRODUCTION_CONFIRMATION_REQUIRED', 't', '0']);
});

test('AC08: a late SQL conflict rolls back bundle, activation, step-up and audit together', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state)
      VALUES ('${f.actor}','${f.session}','${env}','config.release','${f.commitCommand}',repeat('a',64),'unknown');
    DO $$ BEGIN BEGIN PERFORM ${f.commit()}; RAISE EXCEPTION 'Unexpected admission';
      EXCEPTION WHEN unique_violation THEN NULL; END; END $$;
    SELECT active_ptr='${f.base}' FROM core.config_activation WHERE environment='${env}';
    SELECT consumed_at IS NULL FROM core.stepup_challenge WHERE id=${f.stepupId};
    SELECT count(*) FROM core.config_bundle WHERE version='otp-' || ${f.previewId}::text;
    SELECT count(*) FROM core.audit_event WHERE actor='${f.actor}' AND request_id='${f.commitCommand}';`), ['OK', 'OK', 't', 't', '0', '0']);
});

test('AC09: rollback reconstructs an environment-owned historical six-value set in a new version and cannot resurrect old OTP deadlines or quota', () => {
  const f = fixture(), nextPreview = randomUUID(), nextCommit = randomUUID(), nextAuthChallenge = randomUUID(), rollbackCommand = randomUUID(), rollbackCommit = randomUUID();
  const phoneDigest = digest(randomUUID()), ipDigest = digest(randomUUID());
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    CREATE TEMP TABLE first_release ON COMMIT DROP AS SELECT ${f.commit()} AS result;
    SELECT result->>'code' FROM first_release;
    CREATE TEMP TABLE old_otp ON COMMIT DROP AS SELECT core.reserve_otp_challenge('${phoneDigest}','${ipDigest}','login',repeat('c',64),
      gen_random_uuid(),'{}','${env}') AS result;
    CREATE TEMP TABLE old_otp_facts ON COMMIT DROP AS SELECT c.* FROM core.otp_challenge c WHERE c.id=(SELECT (result->>'challenge_id')::uuid FROM old_otp);
    CREATE TEMP TABLE second_preview ON COMMIT DROP AS SELECT ${f.preview({ base: "(SELECT result->'data'->>'version' FROM first_release)",
    values: `${f.values} || '{"auth.otp_resend_seconds":120}'::jsonb`, command: nextPreview })} AS result;
    INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address) VALUES ('${nextAuthChallenge}','${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
    UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${f.session}' AND authentication_method='totp';
    CREATE TEMP TABLE second_stepup ON COMMIT DROP AS SELECT ${f.stepup(nextAuthChallenge, "(SELECT result->'data'->>'action_digest' FROM second_preview)")} AS result;
    CREATE TEMP TABLE second_release ON COMMIT DROP AS SELECT ${f.commit({ preview: "(SELECT (result->'data'->>'preview_id')::uuid FROM second_preview)",
    digest: "(SELECT result->'data'->>'preview_digest' FROM second_preview)", stepup: "(SELECT (result->'data'->>'stepup_id')::uuid FROM second_stepup)", command: nextCommit })} AS result;
    SELECT result->>'code' FROM second_release;
    CREATE TEMP TABLE rollback_preview ON COMMIT DROP AS SELECT ${f.preview({ base: "(SELECT result->'data'->>'version' FROM second_release)",
    values: 'NULL', rollback: "(SELECT result->'data'->>'version' FROM first_release)", command: rollbackCommand })} AS result;
    SELECT result->>'code' FROM rollback_preview;
    INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address) VALUES (gen_random_uuid(),'${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
    UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${f.session}' AND authentication_method='totp';
    CREATE TEMP TABLE rollback_stepup ON COMMIT DROP AS SELECT core.admin_stepup_result(${f.args()},'${f.factor}',
      (SELECT id FROM auth.mfa_challenges WHERE factor_id='${f.factor}' ORDER BY created_at DESC LIMIT 1),
      (SELECT result->'data'->>'action_digest' FROM rollback_preview)) AS result;
    CREATE TEMP TABLE rollback_release ON COMMIT DROP AS SELECT ${f.commit({ preview: "(SELECT (result->'data'->>'preview_id')::uuid FROM rollback_preview)",
    digest: "(SELECT result->'data'->>'preview_digest' FROM rollback_preview)", stepup: "(SELECT (result->'data'->>'stepup_id')::uuid FROM rollback_stepup)",
    command: rollbackCommit, kind: 'rollback' })} AS result;
    SELECT result->>'code' FROM rollback_release;
    SELECT result->'data'->>'version'<>(SELECT result->'data'->>'version' FROM first_release) AND result->'data'->>'kind'='rollback' FROM rollback_release;
    SELECT core.otp_configuration_result('${env}')->'values'->>'auth.otp_resend_seconds';
    SELECT c.expires_at=o.expires_at AND c.resend_seconds=o.resend_seconds AND c.max_failures=o.max_failures AND c.attempts=o.attempts
      FROM core.otp_challenge c JOIN old_otp_facts o ON o.id=c.id;
    SELECT core.reserve_otp_challenge('${phoneDigest}','${ipDigest}','login',repeat('c',64),gen_random_uuid(),'{}','${env}')->>'code';`),
  ['OK', 'OK', 'OK', 'OK', 'OK', 'OK', 't', '90', 't', 'RATE_LIMITED']);
});

test('AC10: expired step-up, another session and a no-longer-verified factor cannot release a valid preview', () => {
  const f = fixture(), expiredStepup = randomUUID(), expiredAuth = randomUUID(), otherSession = randomUUID();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    INSERT INTO core.stepup_challenge(id,account_id,session_id,action_digest,aal,verified_at,expires_at)
      VALUES ('${expiredStepup}','${f.actor}','${f.session}',${f.action},'aal2',clock_timestamp()-interval '6 minutes',clock_timestamp()-interval '2 minutes');
    INSERT INTO core.admin_stepup_binding(auth_challenge_id,stepup_id,actor,session_id,factor_id,preview_id,environment)
      VALUES ('${expiredAuth}','${expiredStepup}','${f.actor}','${f.session}','${f.factor}',${f.previewId},'${env}');
    SELECT ${f.commit({ stepup: `'${expiredStepup}'` })}->>'code';
    INSERT INTO auth.sessions(id,user_id,aal,factor_id,created_at,updated_at)
      VALUES ('${otherSession}','${f.actor}','aal2','${f.factor}',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      SELECT gen_random_uuid(),'${otherSession}',method,clock_timestamp(),clock_timestamp() FROM unnest(ARRAY['otp','totp']) method;
    INSERT INTO core.session_registry(session_id,account_id,device_label) VALUES ('${otherSession}','${f.actor}','Synthetic other admin device');
    SELECT ${f.commit({ session: otherSession })}->>'code';
    UPDATE auth.mfa_factors SET status='unverified' WHERE id='${f.factor}';
    SELECT ${f.commit()}->>'code';
    SELECT active_ptr='${f.base}' FROM core.config_activation WHERE environment='${env}';
    SELECT consumed_at IS NULL FROM core.stepup_challenge WHERE id=${f.stepupId};`),
  ['OK', 'OK', 'STEPUP_REQUIRED', 'CONFLICT', 'MFA_REQUIRED', 't', 't']);
});

test('AC11: two independent connections racing previews for the same base activate one version and retain the losing unconsumed proof', async () => {
  const f = fixture(), secondOperation = randomUUID(), secondCommit = randomUUID(), secondAuth = randomUUID();
  const previous = rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${env}'`)[0]?.active_ptr;
  const concurrentSql = (statement: string) => asynchronousCompose(
    ['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], statement);
  try {
    const setupResult = sql(`BEGIN; ${f.setup} ${f.configuration} COMMIT;`).trim();
    assert.equal(setupResult, 'OK');
    const values = rows(`SELECT core.otp_configuration_result('${env}')->'values' AS values`)[0].values;
    const first = rows(`SELECT core.admin_config_preview_result(${f.args()},'${f.base}',${literal({ ...(values as Record<string, number>), 'auth.otp_resend_seconds': 91 })},
      NULL,'Synthetic race first','${f.previewCommand}',3600) AS result`)[0].result as { code: string; data: { preview_id: string; preview_digest: string; action_digest: string } };
    const second = rows(`SELECT core.admin_config_preview_result(${f.args()},'${f.base}',${literal({ ...(values as Record<string, number>), 'auth.otp_resend_seconds': 92 })},
      NULL,'Synthetic race second','${secondOperation}',3600) AS result`)[0].result as typeof first;
    assert.equal(first.code, 'OK'); assert.equal(second.code, 'OK');
    sql(`INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address)
      VALUES ('${f.authChallenge}','${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81'),
        ('${secondAuth}','${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
      UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${f.session}' AND authentication_method='totp';`);
    const proofs = [first, second].map((preview, index) => rows(`SELECT core.admin_stepup_result(${f.args()},'${f.factor}',
      '${index === 0 ? f.authChallenge : secondAuth}','${preview.data.action_digest}') AS result`)[0].result as { code: string; data: { stepup_id: string } });
    proofs.forEach(proof => assert.equal(proof.code, 'OK'));
    const commands = [f.commitCommand, secondCommit];
    const calls = [first, second].map((preview, index) => `SELECT core.admin_config_commit_result(${f.args()},'${preview.data.preview_id}',
      '${preview.data.preview_digest}','${proofs[index].data.stepup_id}','${commands[index]}','release',3600)->>'code';`);
    const settled = await Promise.allSettled(calls.map(call => concurrentSql(call)));
    const outcomes = settled.map(outcome => { if (outcome.status === 'rejected') throw outcome.reason; return outcome.value.trim(); });
    assert.deepEqual([...outcomes].sort(), ['CONFLICT', 'OK']);
    const winner = outcomes.indexOf('OK'), loser = winner === 0 ? 1 : 0;
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.admin_config_publication WHERE actor='${f.actor}'`)[0].n, 1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.audit_event WHERE actor='${f.actor}' AND operation='config.release'`)[0].n, 1);
    assert.equal(rows(`SELECT consumed_at IS NULL AS available FROM core.stepup_challenge WHERE id='${proofs[loser].data.stepup_id}'`)[0].available, true);
    assert.equal((await concurrentSql(calls[winner])).trim(), 'OK');
  } finally {
    // Immutable synthetic admission/configuration/audit facts remain; disable all live identities and restore activation.
    sql(`BEGIN;
      UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE account_id='${f.actor}';
      UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE account_id='${f.actor}';
      UPDATE core.account SET status='cancelled' WHERE id IN ('${f.actor}','${f.publisher}');
      UPDATE auth.users SET phone=NULL,phone_confirmed_at=NULL WHERE id IN ('${f.actor}','${f.publisher}');
      UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE user_id='${f.actor}';
      UPDATE core.managed_document SET active_release_id=NULL WHERE owner='${f.publisher}';
      UPDATE core.document_release SET state='withdrawn' WHERE publisher='${f.publisher}';
      ${typeof previous === 'string'
        ? `UPDATE core.config_activation SET active_ptr='${previous.replaceAll("'", "''")}' WHERE environment='${env}';`
        : `DELETE FROM core.config_activation WHERE environment='${env}';`}
      COMMIT;`);
  }
});

test('AC12: the first release preserves its exact before-values evidence and can roll back the original baseline through a new validated version', () => {
  const f = fixture(), rollbackPreviewCommand = randomUUID(), rollbackCommitCommand = randomUUID(), rollbackAuth = randomUUID();
  assert.deepEqual(f.run(`${f.makePreview} ${f.makeStepup}
    CREATE TEMP TABLE baseline_first_release ON COMMIT DROP AS SELECT ${f.commit()} AS result;
    SELECT result->>'code' FROM baseline_first_release;
    SELECT before_values=(SELECT result->'values' FROM admin_current) AND previous_version='${f.base}'
      FROM core.admin_config_publication WHERE actor='${f.actor}' AND operation_id='${f.commitCommand}';
    SELECT core.admin_config_definitions_result(${f.args()},3600)->'data'->'history' @>
      jsonb_build_array(jsonb_build_object('version','${f.base}','kind','baseline'));
    CREATE TEMP TABLE baseline_rollback_preview ON COMMIT DROP AS SELECT ${f.preview({
    base: "(SELECT result->'data'->>'version' FROM baseline_first_release)", values: 'NULL', rollback: `'${f.base}'`, command: rollbackPreviewCommand,
  })} AS result;
    SELECT result->>'code' FROM baseline_rollback_preview;
    SELECT result->'data'->'values'=(SELECT result->'values' FROM admin_current) FROM baseline_rollback_preview;
    INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address)
      VALUES ('${rollbackAuth}','${f.factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
    UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${f.session}' AND authentication_method='totp';
    CREATE TEMP TABLE baseline_rollback_stepup ON COMMIT DROP AS SELECT ${f.stepup(rollbackAuth, "(SELECT result->'data'->>'action_digest' FROM baseline_rollback_preview)")} AS result;
    CREATE TEMP TABLE baseline_rollback_release ON COMMIT DROP AS SELECT ${f.commit({
    preview: "(SELECT (result->'data'->>'preview_id')::uuid FROM baseline_rollback_preview)",
    digest: "(SELECT result->'data'->>'preview_digest' FROM baseline_rollback_preview)",
    stepup: "(SELECT (result->'data'->>'stepup_id')::uuid FROM baseline_rollback_stepup)", command: rollbackCommitCommand, kind: 'rollback',
  })} AS result;
    SELECT result->>'code' FROM baseline_rollback_release;
    SELECT result->'data'->>'kind'='rollback' AND result->'data'->>'version'<>'${f.base}'
      AND result->'data'->>'version'<>(SELECT result->'data'->>'version' FROM baseline_first_release) FROM baseline_rollback_release;
    SELECT core.otp_configuration_result('${env}')->'values'=(SELECT result->'values' FROM admin_current);
    SELECT count(*) FROM core.admin_config_publication WHERE actor='${f.actor}';`),
  ['OK', 'OK', 'OK', 't', 't', 'OK', 't', 'OK', 't', 't', '2']);
});

test('AC13: preview output and step-up recheck config.read plus each current definition permission after the preview was stored', () => {
  const f = fixture();
  assert.deepEqual(f.run(`${f.makePreview} ${f.proof}
    SAVEPOINT removed_read;
    UPDATE core.admin_grant SET operation_scopes=array_remove(operation_scopes,'config.read') WHERE id='${f.grant}';
    SELECT core.admin_stepup_target_result(${f.args()},${f.action})->>'code';
    SELECT ${f.stepup()}->>'code';
    SELECT count(*) FROM core.admin_stepup_binding WHERE actor='${f.actor}';
    ROLLBACK TO SAVEPOINT removed_read;
    DO $$ BEGIN IF core.reconcile_security_journal()->>'code'<>'OK' THEN RAISE EXCEPTION 'Synthetic journal reconciliation failed'; END IF; END $$;
    SELECT core.archive_ready();
    UPDATE core.config_definition SET read_permission='admin.required.read' WHERE key='auth.otp_max_failures';
    SELECT core.admin_stepup_target_result(${f.args()},${f.action})->>'code';
    SELECT ${f.stepup()}->>'code';`), ['OK', 'FORBIDDEN', 'FORBIDDEN', '0', 't', 'FORBIDDEN', 'FORBIDDEN']);
});

test('AC14: an Auth ban, deletion or session expiry committed while identity proof waits on row locks rejects the waiting read', async () => {
  const f = fixture();
  const mutations = [
    { change: `UPDATE auth.users SET banned_until=clock_timestamp()+interval '1 hour' WHERE id='${f.actor}'`,
      restore: `UPDATE auth.users SET banned_until=NULL WHERE id='${f.actor}';` },
    { change: `UPDATE auth.users SET deleted_at=clock_timestamp() WHERE id='${f.actor}'`,
      restore: `UPDATE auth.users SET deleted_at=NULL WHERE id='${f.actor}';` },
    { change: `UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE id='${f.session}'`,
      restore: `UPDATE auth.sessions SET not_after=NULL WHERE id='${f.session}';` },
  ];
  try {
    assert.equal(sql(`BEGIN; ${f.setup} COMMIT;`).trim(), 'OK');
    for (const mutation of mutations) {
      const held = await heldTransaction(mutation.change);
      const application = `synthetic-admin-current-${randomUUID()}`;
      const pending = asynchronousCompose(['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
        `SET application_name='${application}'; SELECT core.admin_session_result(${f.args()})->>'code';`);
      // Attach handling immediately while a separate observer verifies the waiter.
      void pending.catch(() => {});
      let heldClosed = false;
      try {
        let observed = false;
        for (let attempt = 0; attempt < 30; attempt++) {
          if (rows(`SELECT EXISTS(SELECT 1 FROM pg_stat_activity WHERE application_name='${application}' AND wait_event_type='Lock') AS waiting`)[0].waiting === true) {
            observed = true; break;
          }
          await delay(25);
        }
        assert.equal(observed, true, 'The identity reader must actually wait on the in-flight Auth mutation');
        await held.commit(); heldClosed = true;
        assert.equal((await pending).trim(), 'SESSION_INVALID');
      } finally {
        if (!heldClosed) await held.commit();
        await pending.catch(() => {});
        sql(mutation.restore);
      }
    }
  } finally {
    sql(`BEGIN;
      UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE account_id='${f.actor}';
      UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE account_id='${f.actor}';
      UPDATE core.account SET status='cancelled' WHERE id IN ('${f.actor}','${f.publisher}');
      UPDATE auth.users SET phone=NULL,phone_confirmed_at=NULL,deleted_at=clock_timestamp() WHERE id IN ('${f.actor}','${f.publisher}');
      UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE user_id='${f.actor}';
      UPDATE core.managed_document SET active_release_id=NULL WHERE owner='${f.publisher}';
      UPDATE core.document_release SET state='withdrawn' WHERE publisher='${f.publisher}';
      COMMIT;`);
  }
});

