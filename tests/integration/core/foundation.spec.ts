import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { readFileSync } from 'node:fs';
import { sql,account,session,rows,environment,request,token } from '../../fixtures/core/runtime.ts';

before(() => sql(readFileSync('tests/fixtures/core/policy.sql','utf8')));
const reject = (statement: string) => `DO $q$ BEGIN BEGIN ${statement}; RAISE EXCEPTION 'Unexpected acceptance'; EXCEPTION WHEN check_violation THEN NULL; END; END $q$;`;
test('FD01: only registered roles, environments and bound short-lived step-up records enter the shared model',() => {
  const out=sql(`BEGIN;
    ${reject(`INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment) VALUES ('${account()}','arbitrary',ARRAY['*'],'test')`)}
    ${reject(`INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment) VALUES ('${account()}','auditor',ARRAY['audit.read'],'other')`)}
    ${reject(`INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at) VALUES ('${account(2)}','${session()}',repeat('a',64),'aal2',clock_timestamp(),clock_timestamp()+interval '4 minutes')`)}
    ${reject(`INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at) VALUES ('${account()}','${session()}',repeat('a',64),'aal2',clock_timestamp(),clock_timestamp()+interval '6 minutes')`)}
    SELECT 'verified'; ROLLBACK;`);
  assert.match(out,/verified/);
});
test('FD02: the authorization context resolves current grants in the server environment rather than caller role labels',() => {
  const result=JSON.parse(sql(`SELECT core.policy_context_result('${account(4)}','${session(4)}','test');`).trim());
  assert.equal(result.code,'OK'); assert.ok(result.grants.some((grant: {role: string})=>grant.role==='super_admin'));
  assert.deepEqual(JSON.parse(sql(`SELECT core.policy_context_result('${account(4)}','${session(4)}','dev');`).trim()).grants,[]);
  sql(`UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE account_id='${account(4)}';`);
  try { assert.deepEqual(JSON.parse(sql(`SELECT core.policy_context_result('${account(4)}','${session(4)}','test');`).trim()).grants,[]); }
  finally { sql(`UPDATE core.admin_grant SET revoked_at=NULL WHERE account_id='${account(4)}';`); }
});
test('FD03: plugin epoch and restore gate changes reject the same formerly valid context',() => {
  const env=environment().CORE_ENVIRONMENT || process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
  sql(`INSERT INTO core.plugin_installation(plugin,environment,state,lifecycle_epoch) VALUES ('fixture','${env}','enabled',1)
    ON CONFLICT(environment,plugin) DO UPDATE SET state='enabled',lifecycle_epoch=1;`);
  const context=()=>JSON.parse(sql(`SELECT core.policy_context_result('${account()}','${session()}','${env}','fixture',1);`).trim());
  assert.equal(context().code,'OK');
  sql(`UPDATE core.plugin_installation SET state='disabled',lifecycle_epoch=2 WHERE plugin='fixture' AND environment='${env}';`);
  assert.equal(context().code,'FORBIDDEN');
  sql(`UPDATE core.restore_gate SET state='closed' WHERE environment='${env}';`);
  try { assert.equal(context().code,'SERVICE_UNAVAILABLE'); }
  finally { sql(`UPDATE core.restore_gate SET state='open' WHERE environment='${env}';`); }
});
test('FD04: sanctions and purpose-specific actions do not become account cancellation or private read permission',() => {
  const target='40000000-0000-4000-8000-000000000002';
  const call=(purpose='read')=>JSON.parse(sql(`SELECT core.resource_action_result('${account(2)}','${session(2)}','${target}','resource.read','${purpose}');`).trim());
  assert.equal(call().code,'OK'); assert.equal(call('evidence').code,'FORBIDDEN');
  sql(`INSERT INTO core.sanction(id,subject,type,functions,starts_at,reason,state) VALUES
    ('70000000-0000-4000-8000-000000000001','${account(2)}','function',ARRAY['read'],clock_timestamp(),'Synthetic scope test','active')
    ON CONFLICT(id) DO UPDATE SET state='active';`);
  try { assert.equal(call().code,'NOT_FOUND'); assert.equal(rows(`SELECT status FROM core.account WHERE id='${account(2)}'`)[0].status,'active'); }
  finally { sql(`UPDATE core.sanction SET state='revoked' WHERE id='70000000-0000-4000-8000-000000000001';`); }
});

test('FD05: all five real isolated role principals remain unable to read another account private resource',()=>{
  const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
  const roles=['super_admin','content_moderator','community_operator','ai_operator','auditor'];
  for(const [offset,role] of roles.entries()){
    const subject=21+offset;
    const context=JSON.parse(sql(`SELECT core.policy_context_result('${account(subject)}','${session(subject)}','${env}');`).trim());
    assert.equal(context.code,'OK');assert.ok(context.grants.some((grant:{role:string})=>grant.role===role));
    assert.equal(request('/posts/40000000-0000-4000-8000-000000000003',{token:token(subject)}).status,404);
  }
});
