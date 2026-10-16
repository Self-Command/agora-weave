import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { accountApi, AccountError, normalizePhone } from '../../../apps/mobile/src/features/account/api.ts';
import { recoverChangedTerms } from '../../../apps/mobile/src/features/account/recovery.ts';
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
