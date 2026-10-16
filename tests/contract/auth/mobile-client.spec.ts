import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { accountApi, AccountError, normalizePhone } from '../../../apps/mobile/src/features/account/api.ts';
import { confirmRevocation, recoverChangedTerms, submitRecoveryRequest } from '../../../apps/mobile/src/features/account/recovery.ts';
import { storedSession } from '../../../apps/mobile/src/features/account/session-policy.ts';

test('MC01: phone normalization preserves international numbers and refuses incomplete or non-phone input', () => {
  assert.equal(normalizePhone('138 0013 8000'),'+8613800138000');
  assert.equal(normalizePhone('+1 (555) 555-0101'),'+15555550101');
  for (const input of ['138','abc13800138000','+00012345678','12345678901','+1234567890123456']) assert.equal(normalizePhone(input),null,input);
});
test('MC02: account commands use the current bearer token and preserve one logical command payload across retries', async () => {
  const bodies: unknown[] = [];
  const server = createServer(async (request,response) => {
    assert.equal(request.method,'DELETE'); assert.equal(request.url,'/api/v1/me/sessions/device-1');
    assert.equal(request.headers.authorization,'Bearer controlled-token'); assert.equal(request.headers['x-client-release'],'test-release');
    let body = ''; for await (const chunk of request) body += chunk;
    bodies.push(JSON.parse(body)); response.setHeader('Content-Type','application/json'); response.end(JSON.stringify({ data: { revoked: true } }));
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const address = server.address() as { port: number };
    const api = accountApi(`http://127.0.0.1:${address.port}/api/v1`,'test-release',true);
    await api.revoke('controlled-token','device-1',7,'command-1'); await api.revoke('controlled-token','device-1',7,'command-1');
    assert.deepEqual(bodies,[{ base_version: 7,operation_id: 'command-1' },{ base_version: 7,operation_id: 'command-1' }]);
  } finally { server.close(); await once(server,'close'); }
});
test('MC03: private API failures preserve session-invalid and retry timing, and production refuses cleartext transport', async () => {
  const server = createServer((_request,response) => {
    response.writeHead(401,{ 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ code: 'SESSION_INVALID',message: '登录已失效',retry_after_seconds: 60 }));
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const address = server.address() as { port: number };
    const base = `http://127.0.0.1:${address.port}`;
    await assert.rejects(accountApi(base,'test',true).sessions('old-token'),error => error instanceof AccountError && error.code === 'SESSION_INVALID' && error.retryAfter === 60);
    await assert.rejects(accountApi(base,'test').sessions('old-token'),error => error instanceof AccountError && error.code === 'SERVICE_UNAVAILABLE');
  } finally { server.close(); await once(server,'close'); }
});
test('MC04: changed terms invalidate consent and the previous command before loading the new current set', async () => {
  const state = { consent: true,command: 'old-command',documents: 'old-set' };
  const recovered = await recoverChangedTerms(new AccountError('TERMS_CHANGED','条款已更新'),() => {
    state.consent = false; state.command = ''; state.documents = '';
  },async () => {
    assert.deepEqual(state,{ consent: false,command: '',documents: '' });
    state.documents = 'new-set';
  });
  assert.equal(recovered,true);
  assert.deepEqual(state,{ consent: false,command: '',documents: 'new-set' });
});
test('MC05: access token expiry alone retains refresh credentials while corrupted local state is rejected', () => {
  const session = { access_token: 'expired-access',refresh_token: 'still-valid-refresh',expires_at: 1 };
  assert.deepEqual(storedSession(JSON.stringify(session)),session);
  for (const raw of ['invalid','{}','null',JSON.stringify({ ...session,refresh_token: '' })]) assert.equal(storedSession(raw),null);
});
test('MC06: uncertain revocation queries its owned operation without sending the mutation twice', async () => {
  const seen: string[] = [];
  const server = createServer((request,response) => {
    seen.push(`${request.method} ${request.url}`);
    assert.equal(request.headers.authorization,'Bearer controlled-token');
    response.setHeader('Content-Type','application/json');
    response.end(JSON.stringify({ data: { operation_id: 'command-6',action: 'session.revoke',state: 'succeeded' } }));
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const address = server.address() as { port: number };
    const api = accountApi(`http://127.0.0.1:${address.port}`,'test',true);
    assert.equal(await confirmRevocation(api,'controlled-token','command-6',new AccountError('NETWORK_UNCONFIRMED','网络中断')),true);
    assert.deepEqual(seen,['GET /operations/command-6']);
  } finally { server.close(); await once(server,'close'); }
});
test('MC07: pending, unrelated or inaccessible operation results cannot turn uncertain revocation into success', async () => {
  const failure = new AccountError('NETWORK_UNCONFIRMED','网络中断');
  for (const patch of [{ state: 'unknown' as const },{ state: 'pending' as const },{ action: 'auth.logout' },{ operation_id: 'other' }]) {
    assert.equal(await confirmRevocation({ operation: async () => ({ operation_id: 'command',action: 'session.revoke',state: 'succeeded',...patch }) },'token','command',failure),false);
  }
  await assert.rejects(confirmRevocation({ operation: async () => { throw new AccountError('SESSION_INVALID','已失效'); } },'token','command',failure),
    error => error instanceof AccountError && error.code === 'SESSION_INVALID');
  assert.equal(await confirmRevocation({ operation: async () => { assert.fail('Validation failures must not query operations'); } },'token','command',new AccountError('CONFLICT','冲突')),false);
});
test('MC08: recovery commands preserve their logical ID and read the returned case using the current bearer session', async () => {
  const bodies: unknown[] = [];
  const server = createServer(async (request,response) => {
    assert.equal(request.headers.authorization,'Bearer controlled-session');
    let raw = ''; for await (const chunk of request) raw += chunk;
    if (request.method === 'POST') { assert.equal(request.url,'/recovery-cases'); bodies.push(JSON.parse(raw)); }
    else { assert.equal(request.method,'GET'); assert.equal(request.url,'/recovery-cases/case-id'); }
    response.setHeader('Content-Type','application/json');
    response.end(JSON.stringify({ data: { id: 'case-id',mode: 'manual',state: 'received' } }));
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const address = server.address() as { port: number },api=accountApi(`http://127.0.0.1:${address.port}`,'test',true);
    await api.requestRecovery('controlled-session','manual','command'); await api.requestRecovery('controlled-session','manual','command');
    assert.equal((await api.recoveryCase('controlled-session','case-id')).state,'received');
    assert.deepEqual(bodies,[{ mode: 'manual',operation_id: 'command' },{ mode: 'manual',operation_id: 'command' }]);
  } finally { server.close(); await once(server,'close'); }
});

test('MC09: a recovery submission completing after background and return reads current status before displaying it', async () => {
  let release!: () => void,arrived!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { arrived = resolve; });
  const seen: string[] = [];
  const server = createServer(async (request,response) => {
    seen.push(request.method!);
    if (request.method === 'POST') { arrived(); await pending; }
    response.setHeader('Content-Type','application/json');
    response.end(JSON.stringify({ data: { id: 'case-9',mode: 'manual',state: request.method === 'POST' ? 'received' : 'reviewing' } }));
  });
  server.listen(0,'127.0.0.1'); await once(server,'listening');
  try {
    const address = server.address() as { port: number },api = accountApi(`http://127.0.0.1:${address.port}`,'test',true);
    let generation = 0,active = true,caseId: string | null = null,display = '';
    const ticket = generation;
    const submission = submitRecoveryRequest(() => api.requestRecovery('token','manual','command-9'),{
      mounted: () => true,active: () => active,current: () => ticket === generation,
      remember: record => { caseId = record.id; },show: () => { assert.fail('Stale submission must not paint status'); },
      refresh: async () => { display = (await api.recoveryCase('token',caseId!)).state; },
    });
    await started;
    active = false; generation++; active = true; generation++;
    assert.equal(caseId,null); release(); await submission;
    assert.equal(caseId,'case-9'); assert.equal(display,'reviewing'); assert.deepEqual(seen,['POST','GET']);
  } finally { release(); server.close(); await once(server,'close'); }
});

test('MC10: late recovery results never display in background or write into an unmounted screen', async () => {
  const result = { id: 'case-10',mode: 'manual' as const,state: 'received' as const,created_at: '',updated_at: '',row_version: 1 };
  for (const mounted of [true,false]) {
    let retained = '';
    await submitRecoveryRequest(async () => result,{
      mounted: () => mounted,active: () => false,current: () => false,remember: record => { retained = record.id; },
      show: () => assert.fail('Background result must stay hidden'),refresh: async () => assert.fail('Background must not refresh'),
    });
    assert.equal(retained,mounted ? 'case-10' : '');
  }
});
