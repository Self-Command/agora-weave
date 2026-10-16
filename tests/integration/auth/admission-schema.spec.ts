import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { before, test } from 'node:test';
import { account, request, rows, session, sql, token } from '../../fixtures/core/runtime.ts';

const id = (n: number) => `a1000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
before(() => {
  assert.equal(sql('SELECT 1;').trim(), '1');
  assert.equal(request('/user', { auth: true, token: token() }).status, 200, 'Real Auth must be healthy before admission assertions');
  assert.ok(['dev', 'test'].includes(environment || ''));
});
function available(table: string) {
  assert.equal(rows(`SELECT to_regclass('core.${table}') IS NOT NULL AS present`)[0].present, true,
    `The authoritative ${table} behavior must be installed`);
}
function transaction(statement: string) {
  return sql(`BEGIN;
    CREATE FUNCTION pg_temp.accepts(command text) RETURNS boolean LANGUAGE plpgsql AS $$
    BEGIN EXECUTE command; RETURN true;
    EXCEPTION WHEN check_violation OR unique_violation OR foreign_key_violation OR not_null_violation THEN RETURN false;
    END $$;
    ${statement}
    ROLLBACK;`).trim().split(/\r?\n/);
}

test('AM01: invitation, admission and recovery facts have their authoritative fields and deny ordinary direct table access', () => {
  // Break caught: registration is represented only by an Auth subject or client flags.
  const expected: Record<string, string[]> = {
    invitation: ['id', 'token_hash', 'creator_id', 'expires_at', 'state', 'used_account_id', 'used_at', 'revoke_reason'],
    admission: ['account_id', 'invitation_id', 'phone_verified_at', 'age_declaration', 'terms_version', 'terms_receipt_id', 'admitted_at'],
    recovery_case: ['id', 'account_ref', 'mode', 'state', 'minimal_evidence_ref', 'reviewer', 'result', 'audit_ref', 'executed_at'],
  };
  for (const [table, fields] of Object.entries(expected)) {
    available(table);
    const actual = rows(`SELECT column_name FROM information_schema.columns WHERE table_schema='core' AND table_name='${table}'`);
    for (const field of fields) assert.ok(actual.some(row => row.column_name === field), `${table}.${field}`);
    const access = rows(`SELECT has_table_privilege(role,'core.${table}','SELECT,INSERT,UPDATE,DELETE') AS allowed
      FROM unnest(ARRAY['anon','authenticated','service_role','core_runtime']) role`);
    assert.equal(access.every(row => row.allowed === false), true, 'Only narrow server functions may access admission facts');
  }
});

test('AM02: an invitation is consumed once, terminal states do not reopen, and an expired token cannot be consumed', () => {
  // Break caught: a used token is reassigned, revived or consumed after the authoritative expiry.
  available('invitation');
  const result = transaction(`
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at,state)
      VALUES ('${id(1)}','${'a'.repeat(64)}','${account(1)}',clock_timestamp()+interval '1 hour','unused'),
        ('${id(2)}','${'b'.repeat(64)}','${account(1)}',clock_timestamp()-interval '1 second','unused');
    UPDATE core.invitation SET state='used',used_account_id='${account(2)}',used_at=clock_timestamp() WHERE id='${id(1)}';
    SELECT state FROM core.invitation WHERE id='${id(1)}';
    SELECT pg_temp.accepts($q$UPDATE core.invitation SET used_account_id='${account(3)}' WHERE id='${id(1)}'$q$);
    SELECT pg_temp.accepts($q$UPDATE core.invitation SET state='unused',used_account_id=NULL,used_at=NULL WHERE id='${id(1)}'$q$);
    SELECT pg_temp.accepts($q$UPDATE core.invitation SET state='used',used_account_id='${account(2)}',used_at=clock_timestamp() WHERE id='${id(2)}'$q$);
    SELECT pg_temp.accepts($q$INSERT INTO core.invitation(token_hash,creator_id,expires_at,state)
      VALUES ('${'a'.repeat(64)}','${account(1)}',clock_timestamp()+interval '1 hour','unused')$q$);
    SELECT pg_temp.accepts($q$INSERT INTO core.invitation(token_hash,creator_id,expires_at,state,used_account_id,used_at)
      VALUES ('${'f'.repeat(64)}','${account(1)}',clock_timestamp()+interval '1 hour','used','${account(2)}',clock_timestamp())$q$);`);
  assert.deepEqual(result, ['used', 'f', 'f', 'f', 'f', 'f']);
});

test('AM03: admission requires verified phone, explicit versioned age declaration and the matching current published terms consent', () => {
  // Break caught: presented text, mismatched digests or missing age/phone facts create a community admission.
  available('admission'); available('invitation');
  const body = 'SYNTHETIC TEST TERMS — NOT A PRODUCTION POLICY';
  const digest = createHash('sha256').update(body).digest('hex');
  const insert = (receipt: number, age = true, phone = "clock_timestamp()-interval '1 minute'") => `INSERT INTO core.admission
    (account_id,invitation_id,phone_verified_at,age_declaration,terms_version,terms_receipt_id)
    VALUES ('${account(2)}','${id(10)}',${phone},'{"version":"synthetic-age-v1","declared":${age}}','${id(13)}','${id(receipt)}')`;
  const result = transaction(`
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${id(11)}','synthetic.admission.terms','terms','zh-CN','${account(1)}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${id(12)}','${id(11)}',1,'Synthetic test terms','${body}','${digest}','ready','${account(1)}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${id(13)}','${id(11)}','${id(12)}','${digest}',
        '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account(1)}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${id(13)}' WHERE id='${id(11)}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at,state)
      VALUES ('${id(10)}','${'c'.repeat(64)}','${account(1)}',clock_timestamp()+interval '1 hour','unused');
    UPDATE core.invitation SET state='used',used_account_id='${account(2)}',used_at=clock_timestamp() WHERE id='${id(10)}';
    INSERT INTO core.document_receipt(id,subject,release_id,revision_digest,presentation_ref,purpose,decision,request_id) VALUES
      ('${id(14)}','${account(2)}','${id(13)}','${digest}','${id(18)}','register','presented','${id(19)}'),
      ('${id(15)}','${account(2)}','${id(13)}','${digest}','${id(18)}','register','consented','${id(19)}'),
      ('${id(16)}','${account(2)}','${id(13)}','${'d'.repeat(64)}','${id(18)}','register','consented','${id(19)}');
    SELECT pg_temp.accepts($q$${insert(14)}$q$);
    SELECT pg_temp.accepts($q$${insert(16)}$q$);
    SELECT pg_temp.accepts($q$${insert(15, false)}$q$);
    SELECT pg_temp.accepts($q$${insert(15, true, 'NULL')}$q$);
    SELECT pg_temp.accepts($q$${insert(15, true, "clock_timestamp()+interval '1 hour'")}$q$);
    SELECT pg_temp.accepts($q$${insert(15)}$q$);
    SELECT count(*) FROM core.admission WHERE account_id='${account(2)}';`);
  assert.deepEqual(result, ['f', 'f', 'f', 'f', 'f', 't', '1']);
  assert.equal(rows(`SELECT count(*) AS count FROM core.admission WHERE invitation_id='${id(10)}'`)[0].count, 0,
    'A rolled-back transaction cannot leave an admission or consumed invitation fact');
});

test('AM04: recovery requires review evidence for a terminal decision and records at most one execution', () => {
  // Break caught: a public recovery request skips review or a completed case is reopened or executed twice.
  available('recovery_case');
  const result = transaction(`
    INSERT INTO core.recovery_case(id,account_ref,mode,state,minimal_evidence_ref)
      VALUES ('${id(30)}','${account(2)}','manual','received','${id(31)}');
    SELECT pg_temp.accepts($q$UPDATE core.recovery_case SET state='approved' WHERE id='${id(30)}'$q$);
    UPDATE core.recovery_case SET state='reviewing' WHERE id='${id(30)}';
    INSERT INTO core.audit_event(id,actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
      VALUES ('${id(32)}','${account(1)}','${session(1)}','recovery.review','${id(30)}','${environment}','core',
        'Synthetic schema state probe','approved','${id(33)}');
    UPDATE core.recovery_case SET state='approved',reviewer='${account(1)}',result='approved',audit_ref='${id(32)}' WHERE id='${id(30)}';
    UPDATE core.recovery_case SET executed_at=clock_timestamp() WHERE id='${id(30)}';
    SELECT pg_temp.accepts($q$UPDATE core.recovery_case SET executed_at=clock_timestamp()+interval '1 second' WHERE id='${id(30)}'$q$);
    SELECT pg_temp.accepts($q$UPDATE core.recovery_case SET state='reviewing' WHERE id='${id(30)}'$q$);
    SELECT state FROM core.recovery_case WHERE id='${id(30)}';`);
  assert.deepEqual(result, ['f', 'f', 'f', 'approved']);
});
