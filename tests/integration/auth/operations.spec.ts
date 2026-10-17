import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { before,after,test } from 'node:test';
import { account,session,request,sql,token } from '../../fixtures/core/runtime.ts';

const command = randomUUID();
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const get = (id: string,user = 1,patch = {}) => request(`/operations/${id}`,{ token: token(user,patch) });
before(() => {
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}'),('${account(2)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(1)}','${account(1)}'),('${session(2)}','${account(2)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state)
      VALUES ('${account(1)}','${session(1)}','${environment}','session.revoke','${command}','${'a'.repeat(64)}','succeeded');`);
});
after(() => sql(`DELETE FROM core.operation WHERE operation_id='${command}';`));
test('OP01: account operation queries expose only the current owner outcome and no payload or credentials', () => {
  const result = get(command);
  assert.equal(result.status,200,result.body);
  assert.deepEqual(result.data.data,{ operation_id: command,action: 'session.revoke',state: 'succeeded' });
  assert.equal(get(command,2).status,404);
  assert.equal(get(randomUUID()).status,404);
  assert.equal(get(command,1,{ aud: 'share-read' }).status,403);
  assert.doesNotMatch(result.body,/payload_hash|session_id|token|actor|environment/);
});
test('OP02: operation queries reject expired or revoked sessions and foreign environment commands', () => {
  assert.equal(get(command,1,{ exp: Math.floor(Date.now()/1000)-1 }).status,401);
  sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session(1)}';`);
  try { assert.equal(get(command).status,401); }
  finally { sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(1)}';`); }
  sql(`UPDATE core.operation SET environment='production' WHERE operation_id='${command}';`);
  try { assert.equal(get(command).status,404); }
  finally { sql(`UPDATE core.operation SET environment='${environment}' WHERE operation_id='${command}';`); }
  assert.equal(request(`/operations/${command}?actor=${account(2)}`,{ token: token() }).status,422);
  assert.equal(request(`/operations/${command}`,{ method: 'POST',token: token() }).status,405);
});
test('OP03: one command identifier reused for different actions cannot report an arbitrary success', () => {
  sql(`INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state)
    VALUES ('${account(1)}','${session(1)}','${environment}','auth.logout','${command}','${'b'.repeat(64)}','unknown');`);
  try {
    const response = get(command);
    assert.equal(response.status,409,response.body);
    assert.doesNotMatch(response.body,/succeeded|unknown/);
  } finally { sql(`DELETE FROM core.operation WHERE operation_id='${command}' AND action='auth.logout';`); }
});

test('OP04: an actual recovery request has a current-owner operation lookup with an explicit unknown state and no private case details',()=>{
  const recoveryCommand=randomUUID();
  try {
    const submitted=request('/recovery-cases',{method:'POST',token:token(),body:{mode:'manual',operation_id:recoveryCommand}});
    assert.equal(submitted.status,202,submitted.body);
    const result=get(recoveryCommand);assert.equal(result.status,200,result.body);
    assert.deepEqual(result.data.data,{operation_id:recoveryCommand,action:'recovery.request',state:'succeeded'});
    assert.doesNotMatch(result.body,/payload_hash|result_ref|session_id|account_ref|evidence|reviewer|created_at|updated_at/);
    assert.equal(get(recoveryCommand,2).status,404);
    assert.equal(get(recoveryCommand,1,{aud:'share-read'}).status,403);
    sql(`UPDATE core.operation SET state='unknown' WHERE operation_id='${recoveryCommand}' AND action='recovery.request';`);
    const unknown=get(recoveryCommand);assert.equal(unknown.status,200,unknown.body);
    assert.deepEqual(unknown.data.data,{operation_id:recoveryCommand,action:'recovery.request',state:'unknown'});
    sql(`UPDATE core.operation SET environment='production' WHERE operation_id='${recoveryCommand}' AND action='recovery.request';`);
    assert.equal(get(recoveryCommand).status,404);
    sql(`UPDATE core.operation SET environment='${environment}' WHERE operation_id='${recoveryCommand}' AND action='recovery.request';
      INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state)
        VALUES('${account()}','${session()}','${environment}','session.revoke','${recoveryCommand}','${'c'.repeat(64)}','succeeded');`);
    const ambiguous=get(recoveryCommand);assert.equal(ambiguous.status,409,ambiguous.body);
    assert.equal(ambiguous.data.data,undefined);assert.doesNotMatch(ambiguous.body,/recovery.request|session.revoke|succeeded|unknown/);
  } finally {sql(`DELETE FROM core.operation WHERE operation_id='${recoveryCommand}';`);}
});
