import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sql, rows } from '../../fixtures/core/runtime.ts';

const phone = '1'.repeat(64), ip = '2'.repeat(64), correct = '3'.repeat(64), wrong = '4'.repeat(64);
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const reserve = (command = 'a4000000-0000-4000-8000-000000000001') => `core.reserve_otp_challenge('${phone}','${ip}','login','${correct}','${command}','{}','${environment}')`;
function transaction(body: string) { return sql(`BEGIN; ${body} ROLLBACK;`).trim().split(/\r?\n/); }

test('OT01: authoritative OTP state stores only digests and ordinary roles cannot read or write it', () => {
  const access = rows(`SELECT has_table_privilege(role,'core.otp_challenge','SELECT,INSERT,UPDATE,DELETE') AS allowed FROM unnest(ARRAY['anon','authenticated','service_role','core_runtime']) role`);
  assert.equal(access.every(row => row.allowed === false),true);
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
