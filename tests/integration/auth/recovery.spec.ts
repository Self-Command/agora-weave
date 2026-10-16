import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after,before,test } from 'node:test';
import { rows,request,sql,token as fixtureToken } from '../../fixtures/core/runtime.ts';
import { asynchronousCompose } from '../../fixtures/core/concurrency.ts';

const actors = [randomUUID(),randomUUID(),randomUUID()],sessions = [randomUUID(),randomUUID(),randomUUID()];
const account = (n = 1) => actors[n-1],session = (n = 1) => sessions[n-1];
const token = (n = 1,patch = {}) => fixtureToken(n,{ sub: account(n),session_id: session(n),...patch });
before(() => {
  for (const n of [1,2,3]) sql(`INSERT INTO auth.users(id,instance_id,aud,role,email,created_at,updated_at)
    VALUES ('${account(n)}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${account(n)}@example.invalid',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${session(n)}','${account(n)}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO core.account(id) VALUES ('${account(n)}');
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(n)}','${account(n)}');`);
});
after(() => {
  for (const id of sessions) sql(`DELETE FROM core.session_registry WHERE session_id='${id}'; DELETE FROM auth.sessions WHERE id='${id}';`);
});
const create = (mode: string,command = randomUUID(),patch = {}) => request('/recovery-cases',{
  method: 'POST',token: token(1,patch),body: { mode,operation_id: command },
});
test('RC01: manual requests create a real received case, reuse pending cases and disclose only its owner status', () => {
  const command = randomUUID(),response = create('manual',command);
  assert.equal(response.status,202,response.body);
  const data = response.data.data as { id: string; state: string; mode: string };
  assert.equal(data.state,'received'); assert.equal(data.mode,'manual');
  assert.equal((create('manual',command).data.data as { id: string }).id,data.id);
  assert.equal((create('manual').data.data as { id: string }).id,data.id);
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE operation_id='${command}' AND state='succeeded'`)[0].n,1);
  const owner = request(`/recovery-cases/${data.id}`,{ token: token() });
  assert.equal(owner.status,200,owner.body);
  assert.doesNotMatch(owner.body,/minimal_evidence_ref|reviewer|audit_ref|account_ref|approved/);
  assert.equal(request(`/recovery-cases/${data.id}`,{ token: token(2) }).status,404);
  const foreignEnvironment = (process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT) === 'test' ? 'dev' : 'test';
  assert.equal(rows(`SELECT core.recovery_case_result('${account(1)}','${session(1)}','${data.id}','${foreignEnvironment}')->>'code' AS code`)[0].code,'NOT_FOUND');
  assert.equal(request(`/recovery-cases/${data.id}`).status,401);
  assert.equal(create('trusted',command).status,403);
  assert.equal(rows(`SELECT executed_at FROM core.recovery_case WHERE id='${data.id}'`)[0].executed_at,null);
});
test('RC02: trusted recovery requires a current server trust fact and the cooldown still permits manual requests', () => {
  assert.equal(create('trusted').status,403);
  sql(`UPDATE core.session_registry SET trusted_at=clock_timestamp() WHERE session_id='${session(1)}';`);
  try {
    const command = randomUUID();
    assert.equal(create('trusted',command).status,202);
    assert.equal(create('manual',command).status,409,'One command cannot be reused with a different recovery mode');
    sql(`UPDATE core.account SET sensitive_until=clock_timestamp()+interval '1 hour' WHERE id='${account(1)}';`);
    try { assert.equal(create('trusted').status,403); assert.equal(create('manual').status,202); }
    finally { sql(`UPDATE core.account SET sensitive_until=NULL WHERE id='${account(1)}';`); }
  } finally { sql(`UPDATE core.session_registry SET trusted_at=NULL WHERE session_id='${session(1)}';`); }
});

test('RC04: concurrent new recovery commands create one pending case and retain both real operation results', async () => {
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  const commands = [randomUUID(),randomUUID()];
  const responses = await Promise.all(commands.map(command => asynchronousCompose(
    ['exec','-T','db','psql','-X','-qAt','-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1'],
    `SELECT core.request_recovery_result('${account(3)}','${session(3)}','${command}','manual','${environment}');`)));
  const results = responses.map(raw => JSON.parse(raw.trim()) as { code: string; id: string });
  assert.deepEqual(results.map(result => result.code),['OK','OK']);
  assert.equal(results[0].id,results[1].id);
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.recovery_case WHERE account_ref='${account(3)}'`)[0].n,1);
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE actor='${account(3)}' AND action='recovery.request' AND state='succeeded'`)[0].n,2);
});
test('RC03: untrusted input cannot grant recovery, approve a case or select a different account', () => {
  assert.equal(create('mfa_emergency').status,422);
  assert.equal(create('manual',randomUUID(),{ aud: 'share-read' }).status,403);
  assert.equal(create('manual',randomUUID(),{ exp: Math.floor(Date.now()/1000)-1 }).status,401);
  const forged = request('/recovery-cases',{ method: 'POST',token: token(),body: {
    mode: 'manual',operation_id: randomUUID(),account_ref: account(2),state: 'approved',trusted: true,
  } });
  assert.equal(forged.status,422);
  const own = create('manual'),id=(own.data.data as { id: string }).id;
  assert.equal(request(`/recovery-cases/${id}`,{ method: 'PATCH',token: token(),body: { state: 'approved' } }).status,405);
  sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session(1)}';`);
  try { assert.equal(request(`/recovery-cases/${id}`,{ token: token() }).status,401); }
  finally { sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(1)}';`); }
});
