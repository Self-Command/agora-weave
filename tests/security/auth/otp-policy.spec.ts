import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash,randomUUID } from 'node:crypto';
import { account,sql, rows } from '../../fixtures/core/runtime.ts';

const phone = '1'.repeat(64), ip = '2'.repeat(64), correct = '3'.repeat(64), wrong = '4'.repeat(64);
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const reserve = (command = 'a4000000-0000-4000-8000-000000000001') => `core.reserve_otp_challenge('${phone}','${ip}','login','${correct}','${command}','{}','${environment}')`;
function transaction(body: string) { return sql(`BEGIN; ${body} ROLLBACK;`).trim().split(/\r?\n/); }

test('OT01: authoritative OTP state stores only digests and ordinary roles cannot read or write it', () => {
  const access = rows(`SELECT has_table_privilege(role,'core.otp_challenge','SELECT,INSERT,UPDATE,DELETE') AS allowed FROM unnest(ARRAY['anon','authenticated','service_role','core_runtime']) role`);
  assert.equal(access.every(row => row.allowed === false),true);
  const helperAccess = rows(`SELECT has_function_privilege(role,'core.otp_registration_context_result(jsonb,text)','EXECUTE') AS allowed
    FROM unnest(ARRAY['anon','authenticated','service_role','core_runtime']) role`);
  assert.equal(helperAccess.every(row => row.allowed === false),true);
  assert.equal(rows(`SELECT count(*)::int AS n FROM information_schema.columns WHERE table_schema='core' AND table_name='otp_challenge' AND column_name IN ('phone','otp','ip_address')`)[0].n,0);
});
test('OT02: five wrong attempts lock a challenge and a valid code cannot be reused or applied to a different purpose', () => {
  assert.deepEqual(transaction(`
    SELECT ${reserve()}->>'code';
    SELECT core.consume_otp_challenge(id,'${correct}','register','{}')->>'code' FROM core.otp_challenge WHERE phone_hash='${phone}';
    SELECT core.consume_otp_challenge(id,'${wrong}','login','{}')->>'code' FROM core.otp_challenge,generate_series(1,5) WHERE phone_hash='${phone}';
    SELECT core.consume_otp_challenge(id,'${correct}','login','{}')->>'code' FROM core.otp_challenge WHERE phone_hash='${phone}';
    SELECT state || ':' || attempts FROM core.otp_challenge WHERE phone_hash='${phone}';`),
  ['OK','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','locked:5']);
  assert.deepEqual(transaction(`SELECT ${reserve()}->>'code';
    SELECT core.consume_otp_challenge(id,'${correct}','login','{}')->>'code' FROM core.otp_challenge WHERE phone_hash='${phone}';
    SELECT core.consume_otp_challenge(id,'${correct}','login','{}')->>'code' FROM core.otp_challenge WHERE phone_hash='${phone}';`),['OK','OK','OTP_INVALID']);
});
test('OT03: resend cooldown and phone/IP quotas apply across new commands while an identical retry does not reserve twice', () => {
  assert.deepEqual(transaction(`SELECT ${reserve()}->>'code'; SELECT ${reserve()}->>'reused';
    SELECT ${reserve('a4000000-0000-4000-8000-000000000002')}->>'code';
    SELECT count(*) FROM core.otp_challenge WHERE phone_hash='${phone}';`),['OK','true','RATE_LIMITED','1']);
  assert.deepEqual(transaction(`
    INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,created_at)
      SELECT '${phone}','${ip}','login','${correct}',gen_random_uuid(),'{}',clock_timestamp()-interval '3 minutes' FROM generate_series(1,5);
    SELECT ${reserve('a4000000-0000-4000-8000-000000000003')}->>'retry_after';`),['3600']);
  assert.deepEqual(transaction(`INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding)
      SELECT lpad(n::text,64,'0'),'${ip}','login','${correct}',gen_random_uuid(),'{}' FROM generate_series(1,30) n;
    SELECT ${reserve()}->>'code';`),['RATE_LIMITED']);
});
test('OT04: expiry uses server time and ten sends per day still refuse after the hourly window clears', () => {
  assert.deepEqual(transaction(`SELECT ${reserve()}->>'code';
    UPDATE core.otp_challenge SET expires_at=clock_timestamp()-interval '1 second';
    SELECT core.consume_otp_challenge(id,'${correct}','login','{}')->>'code' FROM core.otp_challenge WHERE phone_hash='${phone}';`),['OK','OTP_EXPIRED']);
  assert.deepEqual(transaction(`INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,created_at)
      SELECT '${phone}','${ip}','login','${correct}',gen_random_uuid(),'{}',clock_timestamp()-interval '2 hours' FROM generate_series(1,10);
    SELECT ${reserve()}->>'code';`),['RATE_LIMITED']);
});

const digest=()=>createHash('sha256').update(randomUUID()).digest('hex');
function challengeVector() {
  const phone=digest(),ip=digest(),code=digest(),command=randomUUID();
  const call=(patch:{phone?:string;ip?:string;purpose?:string;code?:string;command?:string;context?:string;environment?:string}={})=>
    `core.reserve_otp_challenge('${patch.phone||phone}','${patch.ip||ip}','${patch.purpose||'login'}','${patch.code||code}',
      '${patch.command||command}',${patch.context||"'{}'::jsonb"},'${patch.environment||environment}')`;
  const row=`SELECT * FROM core.otp_challenge WHERE phone_hash='${phone}' AND command='${command}'`;
  return {phone,ip,code,command,call,row};
}

test('OT05: pending reservation retries reuse one stored challenge and report its exact expiry with the current remaining resend interval',()=>{
  const vector=challengeVector(),aged=challengeVector();
  assert.deepEqual(transaction(`
    CREATE TEMP TABLE otp_initial ON COMMIT DROP AS SELECT ${vector.call()} AS result;
    SELECT result->>'code' FROM otp_initial;
    SELECT (result->>'expires_at')::timestamptz=c.expires_at AND (result->>'challenge_id')::uuid=c.id
      AND result->>'reused'='false' FROM otp_initial CROSS JOIN (${vector.row}) c;
    CREATE TEMP TABLE otp_replayed ON COMMIT DROP AS SELECT ${vector.call()} AS result;
    SELECT result->>'code' FROM otp_replayed;
    SELECT result->>'reused'='true' AND (result->>'challenge_id')::uuid=c.id AND (result->>'expires_at')::timestamptz=c.expires_at
      AND (result->>'retry_after')::int BETWEEN 1 AND 60 FROM otp_replayed CROSS JOIN (${vector.row}) c;
    INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,created_at,environment)
      VALUES('${aged.phone}','${aged.ip}','login','${aged.code}','${aged.command}','{}',clock_timestamp()-interval '2 minutes','${environment}');
    SELECT ${aged.call()}->>'retry_after';
    SELECT count(*) FROM core.otp_challenge WHERE phone_hash='${vector.phone}';`),['OK','t','OK','t','0','1']);
});

test('OT06: a reused command rejects purpose context IP or code-digest changes and validates environment before considering replay',()=>{
  const vector=challengeVector();
  assert.deepEqual(transaction(`SELECT ${vector.call()}->>'code';
    SELECT ${vector.call({purpose:'register'})}->>'code';
    SELECT ${vector.call({context:"'{\"unexpected\":true}'::jsonb"})}->>'code';
    SELECT ${vector.call({ip:digest()})}->>'code';
    SELECT ${vector.call({code:digest()})}->>'code';
    SELECT ${vector.call({environment:'unsupported'})}->>'code';
    SELECT ${vector.call({environment:environment==='dev'?'test':'dev'})}->>'code';
    SELECT state || ':' || attempts FROM (${vector.row}) c;
    SELECT count(*) FROM core.otp_challenge WHERE phone_hash='${vector.phone}';`),
  ['OK','CONFLICT','CONFLICT','CONFLICT','CONFLICT','INVALID_INPUT','CONFLICT','pending:0','1']);
});

test('OT07: expired retries durably expire a pending challenge and consumed locked superseded or expired challenges never return reusable success',()=>{
  const expired=challengeVector();
  assert.deepEqual(transaction(`SELECT ${expired.call()}->>'code';
    UPDATE core.otp_challenge SET expires_at=clock_timestamp()-interval '1 second' WHERE phone_hash='${expired.phone}';
    SELECT ${expired.call()}->>'code';
    SELECT state FROM (${expired.row}) c;
    SELECT ${expired.call()}->>'code';`),['OK','OTP_EXPIRED','expired','OTP_EXPIRED']);
  for(const terminal of ['consumed','locked','superseded','expired']) {
    const vector=challengeVector();
    assert.deepEqual(transaction(`SELECT ${vector.call()}->>'code';
      UPDATE core.otp_challenge SET state='${terminal}',attempts=${terminal==='locked'?5:0},
        consumed_at=${terminal==='consumed'?'clock_timestamp()':'NULL'} WHERE phone_hash='${vector.phone}';
      SELECT ${vector.call()}->>'code';
      SELECT state || ':' || attempts FROM (${vector.row}) c;
      SELECT count(*) FROM core.otp_challenge WHERE phone_hash='${vector.phone}';`),
    ['OK',terminal==='expired'?'OTP_EXPIRED':'OTP_INVALID',`${terminal}:${terminal==='locked'?5:0}`,'1'],terminal);
  }
});

test('OT08: registration retries recheck the current document set age declaration and invitation without replacing the reserved challenge',()=>{
  const vector=challengeVector(),document=randomUUID(),revision=randomUUID(),release=randomUUID(),invitation=randomUUID(),invitationHash=digest();
  const baselineDocument=randomUUID(),baselineRevision=randomUUID(),baselineRelease=randomUUID(),expiredInvitation=randomUUID(),expiredInvitationHash=digest();
  const body='SYNTHETIC OTP REGISTRATION TERMS — NOT A PRODUCTION POLICY',bodyDigest=createHash('sha256').update(body).digest('hex');
  const context=`(SELECT binding FROM otp_registration_context)`;
  const call=vector.call({purpose:'register',context});
  assert.deepEqual(transaction(`
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES('${document}','synthetic.otp.${document}','terms','zh-CN','${account()}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES('${revision}','${document}',1,'Synthetic OTP terms','${body}','${bodyDigest}','ready','${account()}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES('${release}','${document}','${revision}','${bodyDigest}',
      '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account()}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES('${baselineDocument}','synthetic.otp.${baselineDocument}','terms','zh-CN','${account()}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES('${baselineRevision}','${baselineDocument}',1,'Synthetic baseline terms','${body}','${bodyDigest}','ready','${account()}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES('${baselineRelease}','${baselineDocument}','${baselineRevision}','${bodyDigest}',
      '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account()}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${baselineRelease}' WHERE id='${baselineDocument}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
      VALUES('${invitation}','${invitationHash}','${account()}',clock_timestamp()+interval '1 hour');
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
      VALUES('${expiredInvitation}','${expiredInvitationHash}','${account()}',clock_timestamp()-interval '1 second');
    CREATE TEMP TABLE otp_registration_context ON COMMIT DROP AS SELECT jsonb_build_object(
      'document_set_digest',core.registration_documents_result('${environment}')->>'document_set_digest',
      'age_declaration','{"version":"adult-18-v1","declared":true}'::jsonb,'invitation_hash','${invitationHash}') AS binding;
    SELECT ${call}->>'code';
    SELECT ${call}->>'reused';
    SAVEPOINT revoked_invitation;
    UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic revocation' WHERE id='${invitation}';
    SELECT ${call}->>'code';
    SELECT core.consume_otp_challenge(id,'${vector.code}','register',${context})->>'code' FROM (${vector.row}) c;
    ROLLBACK TO SAVEPOINT revoked_invitation;
    SAVEPOINT expired_invitation;
    UPDATE core.otp_challenge SET binding=jsonb_set(binding,'{invitation_hash}','"${expiredInvitationHash}"'::jsonb) WHERE phone_hash='${vector.phone}';
    UPDATE otp_registration_context SET binding=jsonb_set(binding,'{invitation_hash}','"${expiredInvitationHash}"'::jsonb);
    SELECT ${call}->>'code';
    ROLLBACK TO SAVEPOINT expired_invitation;
    SAVEPOINT withdrawn_terms;
    UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
    SELECT ${call}->>'code';
    SELECT core.consume_otp_challenge(id,'${vector.code}','register',${context})->>'code' FROM (${vector.row}) c;
    ROLLBACK TO SAVEPOINT withdrawn_terms;
    UPDATE core.otp_challenge SET binding=jsonb_set(binding,'{age_declaration}','{"version":"adult-18-v1","declared":false}'::jsonb)
      WHERE phone_hash='${vector.phone}';
    UPDATE otp_registration_context SET binding=jsonb_set(binding,'{age_declaration}','{"version":"adult-18-v1","declared":false}'::jsonb);
    SELECT ${call}->>'code';
    SELECT count(*) || ':' || min(state) FROM core.otp_challenge WHERE phone_hash='${vector.phone}';`),
  ['OK','true','INVITATION_INVALID','INVITATION_INVALID','INVITATION_INVALID','TERMS_CHANGED','TERMS_CHANGED','INVALID_INPUT','1:pending']);
});

test('OT09: null purpose or context cannot consume an OTP or change attempts before the exact purpose and context are supplied',()=>{
  const vector=challengeVector(),legacy=challengeVector();
  assert.deepEqual(transaction(`SELECT ${vector.call()}->>'code';
    SELECT core.consume_otp_challenge(id,'${vector.code}',NULL,'{}')->>'code' FROM (${vector.row}) c;
    SELECT core.consume_otp_challenge(id,'${vector.code}','login',NULL)->>'code' FROM (${vector.row}) c;
    SELECT core.consume_otp_challenge(id,'${vector.code}',NULL,NULL)->>'code' FROM (${vector.row}) c;
    SELECT core.consume_otp_challenge(id,'${vector.code}','register','{}')->>'code' FROM (${vector.row}) c;
    SELECT core.consume_otp_challenge(id,'${vector.code}','login','{"different":true}')->>'code' FROM (${vector.row}) c;
    SELECT state || ':' || attempts FROM (${vector.row}) c;
    SELECT core.consume_otp_challenge(id,'${vector.code}','login','{}')->>'code' FROM (${vector.row}) c;
    SELECT state FROM (${vector.row}) c;
    INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,environment)
      VALUES('${legacy.phone}','${legacy.ip}','login','${legacy.code}','${legacy.command}','{}',NULL);
    SELECT core.consume_otp_challenge(id,'${legacy.code}','login','{}')->>'code' FROM (${legacy.row}) c;
    SELECT state || ':' || attempts FROM (${legacy.row}) c;`),
  ['OK','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','OTP_INVALID','pending:0','OK','consumed','OTP_INVALID','pending:0']);
});
