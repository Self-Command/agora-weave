import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { readFileSync } from 'node:fs';
import { compose } from '../../../tools/ci/core-database.ts';
import { account,request,rows,sql,token } from '../../fixtures/core/runtime.ts';
before(()=>sql(readFileSync('tests/fixtures/core/policy.sql','utf8')));
test('IB01: raw database, Auth, object storage, PostgREST, realtime and Studio have no published host entry',()=>{
  const config=JSON.parse(compose(['config','--format','json']));assert.equal(config.networks.default.internal,true);
  for(const service of Object.values(config.services) as {ports?:unknown[]}[])assert.ok(!service.ports?.length);
  const raw=request('/rest/v1/resource',{token:token()});assert.equal(raw.status,404);
  const storage=request('/storage/v1/object/private/source-key',{token:token()});assert.equal(storage.status,404);
});
test('IB02: normal Auth principals cannot read authority tables even through a direct internal PostgREST call',()=>{
  assert.throws(()=>sql('BEGIN;SET LOCAL ROLE authenticated;SELECT * FROM core.resource;ROLLBACK;'),/permission denied/);
  assert.equal(sql("SELECT has_table_privilege('authenticated','core.resource','SELECT');").trim(),'f');
  for(const role of ['authenticated','anon','core_runtime','core_worker'])assert.equal(sql(`SELECT has_table_privilege('${role}','core.security_checkpoint','UPDATE');`).trim(),'f');
  assert.equal(sql("SELECT has_function_privilege('authenticated','core.configuration_snapshot(uuid,uuid,text,text,text)','EXECUTE');").trim(),'f');
});
test('IB03: blocking in either direction removes both effective relationships and unblocking never restores them',()=>{
  sql(`DELETE FROM core.block WHERE blocker_id IN ('${account(5)}','${account(6)}');
    INSERT INTO core.follow(follower_id,followed_id,state) VALUES('${account(5)}','${account(6)}','effective'),('${account(6)}','${account(5)}','effective');
    INSERT INTO core.block(blocker_id,blocked_id) VALUES('${account(5)}','${account(6)}');`);
  assert.equal(Number(rows(`SELECT count(*) AS n FROM core.follow WHERE follower_id IN ('${account(5)}','${account(6)}') AND followed_id IN ('${account(5)}','${account(6)}') AND state='effective'`)[0].n),0);
  sql(`DELETE FROM core.block WHERE blocker_id='${account(5)}';`);
  assert.equal(Number(rows(`SELECT count(*) AS n FROM core.follow WHERE follower_id='${account(5)}' AND followed_id='${account(6)}' AND state='effective'`)[0].n),0);
});
