import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { accountApi, AccountError, normalizePhone } from '../../../apps/mobile/src/features/account/api.ts';
import { confirmRevocation, recoverChangedTerms, submitRecoveryRequest } from '../../../apps/mobile/src/features/account/recovery.ts';
import { storedSession } from '../../../apps/mobile/src/features/account/session-policy.ts';
import type { AccountApi,DeviceSession,RecoveryCase,RegistrationDocuments,SessionTokens } from '../../../apps/mobile/src/features/account/api.ts';
import { createSessionController } from '../../../apps/mobile/src/features/account/session-controller.ts';
import { createAuthController } from '../../../apps/mobile/src/features/account/auth-controller.ts';
import { createSecurityController } from '../../../apps/mobile/src/features/account/security-controller.ts';
import { createRecoveryController } from '../../../apps/mobile/src/features/account/recovery-controller.ts';

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

const controllerApi = (overrides: Partial<AccountApi>) => ({ ...accountApi(undefined,'controller-test'),...overrides });
const tokens: SessionTokens = { access_token: 'current-access',refresh_token: 'current-refresh',expires_at: 100 };
const documents: RegistrationDocuments = { document_set_digest: 'set-1',age_declaration_version: 'adult-1',
  documents: [{ release_id: 'terms-1',digest: 'digest-1',kind: 'terms',title: '条款',body: '正文' }] };
const recoveryRecord = (state: RecoveryCase['state'] = 'received'): RecoveryCase => ({
  id: '71000000-0000-4000-8000-000000000001',mode: 'manual',state,created_at: '2026-10-17T00:00:00Z',updated_at: '2026-10-17T00:00:00Z',row_version: 1,
});
function controllerLifecycle() {
  let active = true;
  const listeners = new Set<() => void>();
  return {
    isActive: () => active,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    change(value: boolean) { active = value; listeners.forEach(listener => listener()); },
    listenerCount: () => listeners.size,
  };
}
function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (failure: unknown) => void;
  const promise = new Promise<Value>((complete,fail) => { resolve = complete; reject = fail; });
  return { promise,resolve,reject };
}
const idleTurn = () => new Promise<void>(resolve => setImmediate(resolve));

test('MC11: the session controller refreshes expired credentials before publishing and cancels its expiry timer at disposal', async () => {
  const seen: unknown[] = [],refreshed = { ...tokens,expires_at: 20 };
  const timer = 1 as unknown as ReturnType<typeof setTimeout>;
  let scheduled: (() => void) | undefined,publications = 0;
  const controller = createSessionController(controllerApi({ refresh: async token => { seen.push(token); return { session: refreshed }; } }),{
    readSession: async () => ({ ...tokens,expires_at: 1 }),
    saveSession: async value => { seen.push(value); },clearSession: async () => { assert.fail('Refresh must retain valid credentials'); },
  },{ now: () => 10_000,schedule: (callback,delay) => { seen.push(delay); scheduled = callback; return timer; },cancel: value => { seen.push(value); } });
  const unsubscribe = controller.subscribe(() => { publications++; });
  await controller.start();
  assert.equal(controller.getSnapshot().ready,true);
  assert.equal(controller.getSnapshot().session,refreshed);
  assert.deepEqual(seen,['current-refresh',refreshed,10_000]);
  assert.ok(scheduled); assert.ok(publications > 0);
  controller.openRecovery(true); assert.deepEqual(controller.getSnapshot().recovery,{ trusted: true });
  controller.closeRecovery(); assert.equal(controller.getSnapshot().recovery,null);
  unsubscribe(); controller.dispose(); assert.equal(seen.at(-1),timer);
});

test('MC12: transient session refresh failure retains secure credentials while session invalidation clears them', async () => {
  for (const code of ['SERVICE_UNAVAILABLE','SESSION_INVALID']) {
    let clears = 0;
    const controller = createSessionController(controllerApi({ refresh: async () => { throw new AccountError(code,'refresh failed'); } }),{
      readSession: async () => ({ ...tokens,expires_at: 1 }),saveSession: async () => assert.fail('Failed refresh must not save tokens'),
      clearSession: async () => { clears++; },
    });
    await controller.restore();
    assert.equal(clears,code === 'SESSION_INVALID' ? 1 : 0);
    assert.equal(controller.getSnapshot().error,code === 'SESSION_INVALID' ? '' : 'refresh failed');
    assert.equal(controller.getSnapshot().session,null); assert.equal(controller.getSnapshot().ready,true);
    controller.dispose();
  }
});

test('MC13: auth controller rejects invalid input and retains the same challenge command only until an input edit', async () => {
  const bodies: unknown[] = [];
  let ids = 0,unavailable = false;
  const controller = createAuthController(controllerApi({ documents: async () => documents,challenge: async body => {
    bodies.push(body); throw unavailable ? new AccountError('SERVICE_UNAVAILABLE','账号服务暂时不可用，请稍后重试') : new AccountError('RATE_LIMITED','稍后重试',30);
  } }),async () => assert.fail('Challenge failure cannot authenticate'),() => `challenge-${++ids}`,() => 1000);
  await controller.sendCode(); assert.equal(bodies.length,0); assert.equal(controller.getSnapshot().error,'请输入有效手机号');
  assert.equal(controller.getSnapshot().fieldErrors.phone,'请输入有效手机号');
  controller.setPhone('13800138000'); await controller.sendCode(); await controller.sendCode();
  assert.equal(controller.getSnapshot().retryAt,31_000); assert.equal(controller.remaining(),30);
  assert.deepEqual(bodies[0],bodies[1]);
  controller.setPhone('13900139000'); await controller.sendCode();
  assert.deepEqual(bodies[2],{ phone: '+8613900139000',purpose: 'login',operation_id: 'challenge-2' });
  assert.equal(controller.getSnapshot().phone,'13900139000'); assert.equal(controller.getSnapshot().busy,false);
  unavailable = true;
  await controller.sendCode();
  assert.equal(controller.getSnapshot().error,'短信服务暂时不可用，请稍后重试。输入已保留。');
  assert.equal(controller.getSnapshot().phone,'13900139000');assert.equal(controller.getSnapshot().step,'details');
  controller.changeMode();await idleTurn();
  controller.setInvitation('invite');controller.setAdult(true);controller.setConsent(true);await controller.sendCode();
  assert.equal(controller.getSnapshot().error,'短信服务暂时不可用，请稍后重试。输入已保留。');
  assert.equal(controller.getSnapshot().phone,'13900139000');assert.equal(controller.getSnapshot().invitation,'invite');
  assert.equal(controller.getSnapshot().consent,true);assert.equal(controller.getSnapshot().adult,true);
  controller.dispose();
});

test('MC14: registration terms changes invalidate consent, OTP and commands before loading the current document set', async () => {
  let documentReads = 0,ids = 0;
  const challengeBodies: unknown[] = [],verifyBodies: unknown[] = [];
  const controller = createAuthController(controllerApi({
    documents: async () => { documentReads++; return { ...documents,document_set_digest: `set-${documentReads}` }; },
    challenge: async body => {
      challengeBodies.push(body);
      if (challengeBodies.length === 1) throw new AccountError('TERMS_CHANGED','changed');
      return { challenge_id: 'challenge',expires_at: new Date(60_000).toISOString(),retry_after: 60 };
    },
    verify: async body => { verifyBodies.push(body); throw new AccountError('TERMS_CHANGED','changed'); },
  }),async () => assert.fail('Terms change cannot authenticate'),() => `command-${++ids}`,() => 1000);
  controller.changeMode(); await idleTurn();
  controller.setPhone('13800138000'); controller.setInvitation(' invite '); controller.setAdult(true); controller.setConsent(true);
  await controller.sendCode();
  assert.equal(controller.getSnapshot().consent,false); assert.equal(controller.getSnapshot().documents?.document_set_digest,'set-2');
  controller.setConsent(true); await controller.sendCode();
  assert.deepEqual(challengeBodies[1],{ phone: '+8613800138000',purpose: 'register',operation_id: 'command-2',invitation_ref: 'invite',
    age_declaration: { version: 'adult-1',declared: true },document_set_digest: 'set-2' });
  controller.setOtp('123456'); await controller.verify();
  assert.deepEqual(verifyBodies[0],{ challenge_id: 'challenge',otp: '123456',operation_id: 'command-3',
    age_declaration: { version: 'adult-1',declared: true },document_set_digest: 'set-2',
    consents: [{ release_id: 'terms-1',digest: 'digest-1',decision: 'consented' }] });
  assert.equal(controller.getSnapshot().consent,false); assert.equal(controller.getSnapshot().otp,''); assert.equal(controller.getSnapshot().challenge,null);
  assert.equal(controller.getSnapshot().step,'otp'); assert.equal(controller.getSnapshot().errorCode,'TERMS_CHANGED');
  assert.equal(controller.getSnapshot().documents?.document_set_digest,'set-3');
  assert.match(controller.getSnapshot().error,/重新获取验证码/);
  controller.setConsent(true); await controller.sendCode();
  assert.equal((challengeBodies[2] as { operation_id: string }).operation_id,'command-4');
});

test('MC15: OTP retries preserve their command, edits reset it, expiry and an unadmitted account cannot publish a session', async () => {
  let now = 1000,ids = 0,authenticated = 0,admitted = false;
  const bodies: { operation_id: string; otp: string }[] = [];
  const controller = createAuthController(controllerApi({
    challenge: async () => ({ challenge_id: 'challenge',expires_at: new Date(10_000).toISOString(),retry_after: 60 }),
    verify: async body => {
      bodies.push(body as typeof bodies[number]);
      if (bodies.length < 3) throw new AccountError('NETWORK_UNCONFIRMED','retry');
      return { session: tokens,account: { id: 'account',admitted } };
    },
  }),async session => { assert.equal(session,tokens); authenticated++; },() => `command-${++ids}`,() => now);
  controller.setPhone('13800138000'); await controller.sendCode();
  controller.setOtp('a12 34567'); assert.equal(controller.getSnapshot().otp,'123456');
  await controller.verify(); await controller.verify(); assert.deepEqual(bodies[0],bodies[1]);
  controller.setOtp('654321'); await controller.verify();
  assert.notEqual(bodies[2].operation_id,bodies[1].operation_id); assert.equal(authenticated,0);
  assert.match(controller.getSnapshot().error,/尚未完成加入/);
  admitted = true; await controller.verify(); assert.equal(authenticated,1);
  now = 10_000; await controller.verify(); assert.equal(bodies.length,4); assert.match(controller.getSnapshot().error,/已过期/);
  controller.changeDetails(); assert.equal(controller.getSnapshot().challenge,null); assert.equal(controller.getSnapshot().otp,'');
});

test('MC16: device pagination deduplicates entries and a late read cannot restore data cleared by a background transition', async () => {
  const lifecycle = controllerLifecycle(),late = deferred<{ items: DeviceSession[]; next_cursor: string | null; has_more: boolean }>();
  const first: DeviceSession = { id: 'one',device_label: 'one',current: true,row_version: 1,created_at: '',trusted_at: '2000-01-01' };
  const second = { ...first,id: 'two',current: false,trusted_at: null };
  let reads = 0;
  const controller = createSecurityController(controllerApi({ sessions: async (_token,cursor) => {
    reads++; if (reads === 3) return late.promise;
    return { items: cursor ? [first,second] : [first],next_cursor: cursor ? null : 'next',has_more: !cursor };
  } }),tokens,async () => assert.fail('Valid read cannot sign out'),lifecycle,() => 'command',() => 1000);
  await controller.start(); assert.equal(lifecycle.listenerCount(),1); assert.equal(controller.canRequestTrustedRecovery(),true);
  await controller.load('next'); assert.deepEqual(controller.getSnapshot().items.map(item => item.id),['one','two']);
  const pending = controller.load(); lifecycle.change(false);
  late.resolve({ items: [second],next_cursor: 'stale',has_more: true }); await pending;
  assert.deepEqual(controller.getSnapshot().items,[]); assert.equal(controller.getSnapshot().next,null);
  lifecycle.change(true); await idleTurn(); assert.deepEqual(controller.getSnapshot().items,[first]);
  controller.dispose(); assert.equal(lifecycle.listenerCount(),0);
});

test('MC17: uncertain device revocation keeps its original command and version until its owned success or a conflict resolves it', async () => {
  const item: DeviceSession = { id: 'device',device_label: '',current: false,row_version: 7,created_at: '',trusted_at: null };
  const mutations: unknown[] = [],operations: string[] = [];
  let ids = 0,ownedSuccess = false,conflict = false;
  const controller = createSecurityController(controllerApi({
    sessions: async () => ({ items: [],next_cursor: null,has_more: false }),
    revoke: async (_token,id,version,operation) => { mutations.push({ id,version,operation }); throw new AccountError(conflict ? 'CONFLICT' : 'NETWORK_UNCONFIRMED','retry'); },
    operation: async (_token,id) => { operations.push(id); return { operation_id: id,action: 'session.revoke',state: ownedSuccess ? 'succeeded' : 'pending' }; },
  }),tokens,async () => assert.fail('Revocation retry cannot sign out'),controllerLifecycle(),() => `revoke-${++ids}`,() => 1000);
  await controller.revoke(item); await controller.revoke({ ...item,row_version: 8 });
  assert.deepEqual(mutations[0],{ id: 'device',version: 7,operation: 'revoke-1' }); assert.deepEqual(mutations[0],mutations[1]);
  ownedSuccess = true; await controller.revoke(item); assert.equal(operations.at(-1),'revoke-1');
  conflict = true; await controller.revoke(item); await controller.revoke(item);
  assert.deepEqual(mutations.slice(-2),[{ id: 'device',version: 7,operation: 'revoke-2' },{ id: 'device',version: 7,operation: 'revoke-3' }]);
  assert.equal(controller.getSnapshot().busy,false); controller.dispose();
});

test('MC18: logout retries retain their command and invalid authorization clears device state and invokes secure signout', async () => {
  const commands: string[] = [];
  let signedOut = 0,readsInvalid = false;
  const item: DeviceSession = { id: 'device',device_label: '',current: true,row_version: 1,created_at: '',trusted_at: null };
  const controller = createSecurityController(controllerApi({
    sessions: async () => { if (readsInvalid) throw new AccountError('SESSION_INVALID','invalid'); return { items: [item],next_cursor: null,has_more: false }; },
    logout: async (_token,id) => { commands.push(id); if (commands.length === 1) throw new AccountError('NETWORK_UNCONFIRMED','retry'); return {}; },
  }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'logout-command',() => 1000);
  await controller.load(); await controller.logout(); assert.equal(signedOut,0); assert.deepEqual(controller.getSnapshot().items,[item]);
  await controller.logout(); assert.deepEqual(commands,['logout-command','logout-command']); assert.equal(signedOut,1); assert.deepEqual(controller.getSnapshot().items,[]);
  await controller.load(); readsInvalid = true; await controller.load();
  assert.equal(signedOut,2); assert.deepEqual(controller.getSnapshot().items,[]); assert.equal(controller.getSnapshot().next,null);
  controller.dispose();
});

test('MC19: the recovery controller re-reads current status when a submission arrives after background and return', async () => {
  const lifecycle = controllerLifecycle(),late = deferred<RecoveryCase>(),seen: string[] = [];
  const controller = createRecoveryController(controllerApi({
    requestRecovery: async () => { seen.push('submit'); return late.promise; },
    recoveryCase: async (_token,id) => { assert.equal(id,recoveryRecord().id); seen.push('read'); return recoveryRecord('reviewing'); },
  }),tokens,async () => assert.fail('Valid recovery cannot sign out'),lifecycle,() => 'command',() => 1000);
  controller.start(); const pending = controller.submit('manual'); lifecycle.change(false); lifecycle.change(true);
  assert.equal(controller.getSnapshot().record,null);
  late.resolve(recoveryRecord()); await pending;
  assert.deepEqual(seen,['submit','read']); assert.equal(controller.getSnapshot().record?.state,'reviewing');
  assert.equal(controller.getSnapshot().caseId,recoveryRecord().id); assert.equal(controller.getSnapshot().busy,false);
  controller.dispose(); assert.equal(lifecycle.listenerCount(),0);
});

test('MC20: recovery retries retain separate mode commands and disposed controllers never publish late results', async () => {
  const lifecycle = controllerLifecycle(),late = deferred<RecoveryCase>(),commands: string[] = [];
  let ids = 0,lateRequest = false,signedOut = 0;
  const controller = createRecoveryController(controllerApi({ requestRecovery: async (_token,mode,id) => {
    commands.push(`${mode}:${id}`);
    if (lateRequest) return late.promise;
    throw new AccountError(mode === 'trusted' ? 'SESSION_INVALID' : 'NETWORK_UNCONFIRMED','retry');
  } }),tokens,async () => { signedOut++; },lifecycle,() => `command-${++ids}`,() => 1000);
  controller.start(); await controller.submit('manual'); await controller.submit('manual'); await controller.submit('trusted');
  assert.deepEqual(commands,['manual:command-1','manual:command-1','trusted:command-2']); assert.equal(signedOut,1);
  lateRequest = true; const pending = controller.submit('manual'); controller.dispose(); const snapshot = controller.getSnapshot();
  late.resolve(recoveryRecord()); await pending;
  assert.equal(controller.getSnapshot(),snapshot); assert.equal(controller.getSnapshot().caseId,null); assert.equal(controller.getSnapshot().record,null);
});

const sessionClock = { now: () => 10_000,schedule: () => 1 as unknown as ReturnType<typeof setTimeout>,cancel: () => undefined };

test('MC21: signing out or disposing during refresh prevents the old session from being saved or published', async () => {
  for (const action of ['signout','dispose'] as const) {
    const pendingRefresh = deferred<{ session: SessionTokens }>(),started = deferred<void>();
    let saved = 0,cleared = 0;
    const controller = createSessionController(controllerApi({ refresh: async () => { started.resolve(); return pendingRefresh.promise; } }),{
      readSession: async () => ({ ...tokens,expires_at: 1 }),saveSession: async () => { saved++; },clearSession: async () => { cleared++; },
    },sessionClock);
    const restoration = controller.restore(); await started.promise;
    if (action === 'signout') await controller.signedOut(); else controller.dispose();
    const snapshot = controller.getSnapshot(); pendingRefresh.resolve({ session: tokens }); await restoration;
    assert.equal(saved,0); assert.equal(cleared,action === 'signout' ? 1 : 0);
    assert.equal(controller.getSnapshot(),snapshot); assert.equal(controller.getSnapshot().session,null);
    controller.dispose();
  }
});

test('MC22: an old refresh rejection cannot clear or report errors over a newly authenticated session', async () => {
  for (const code of ['SESSION_INVALID','SERVICE_UNAVAILABLE']) {
    const pendingRefresh = deferred<{ session: SessionTokens }>(),started = deferred<void>();
    const newer = { ...tokens,access_token: 'new-access' };
    let stored: SessionTokens | null = null,cleared = 0;
    const controller = createSessionController(controllerApi({ refresh: async () => { started.resolve(); return pendingRefresh.promise; } }),{
      readSession: async () => ({ ...tokens,expires_at: 1 }),saveSession: async value => { stored = value; },clearSession: async () => { cleared++; stored = null; },
    },sessionClock);
    const restoration = controller.restore(); await started.promise; await controller.authenticated(newer);
    const snapshot = controller.getSnapshot(); pendingRefresh.reject(new AccountError(code,'old request')); await restoration;
    assert.equal(stored,newer); assert.equal(cleared,0); assert.equal(controller.getSnapshot(),snapshot);
    assert.equal(controller.getSnapshot().session,newer); assert.equal(controller.getSnapshot().error,''); controller.dispose();
  }
});

test('MC23: a secure save already in progress finishes before a later signout clears storage', async () => {
  const saveStarted = deferred<void>(),releaseSave = deferred<void>(),seen: string[] = [];
  let stored: SessionTokens | null = null;
  const controller = createSessionController(controllerApi({}),{
    readSession: async () => null,saveSession: async value => { seen.push('save-start'); saveStarted.resolve(); await releaseSave.promise; stored = value; seen.push('save-end'); },
    clearSession: async () => { stored = null; seen.push('clear'); },
  },sessionClock);
  const authentication = controller.authenticated(tokens); await saveStarted.promise;
  const signout = controller.signedOut(); await idleTurn(); assert.deepEqual(seen,['save-start']);
  releaseSave.resolve(); await Promise.all([authentication,signout]);
  assert.deepEqual(seen,['save-start','save-end','clear']); assert.equal(stored,null); assert.equal(controller.getSnapshot().session,null);
  controller.dispose();
});

test('MC24: storage ordering spans disposed session controllers and prevents an old save overwriting the replacement session', async () => {
  const saveStarted = deferred<void>(),releaseSave = deferred<void>(),seen: string[] = [];
  const newer = { ...tokens,access_token: 'replacement-access' };
  let stored: SessionTokens | null = null;
  const storage = {
    readSession: async () => stored,
    saveSession: async (value: SessionTokens) => {
      seen.push(`save:${value.access_token}`);
      if (value === tokens) { saveStarted.resolve(); await releaseSave.promise; }
      stored = value;
    },
    clearSession: async () => { seen.push('clear'); stored = null; },
  };
  const old = createSessionController(controllerApi({}),storage,sessionClock);
  const oldSave = old.authenticated(tokens); await saveStarted.promise; old.dispose();
  const replacement = createSessionController(controllerApi({}),{ ...storage },sessionClock);
  const newSave = replacement.authenticated(newer); await idleTurn(); assert.deepEqual(seen,['save:current-access']);
  releaseSave.resolve(); await Promise.all([oldSave,newSave]);
  assert.equal(stored,newer); assert.equal(old.getSnapshot().session,null); assert.equal(replacement.getSnapshot().session,newer);
  await old.signedOut(); await old.authenticated(tokens); await old.restore(); assert.equal(stored,newer);
  replacement.dispose();
});

test('MC25: a disposed authentication controller cannot authenticate or publish errors from a late verification', async () => {
  for (const outcome of ['success','failure'] as const) {
    const result = deferred<{ session: SessionTokens; account: { id: string; admitted: boolean } }>();
    let authenticated = 0;
    const controller = createAuthController(controllerApi({
      challenge: async () => ({ challenge_id: 'challenge',expires_at: new Date(60_000).toISOString(),retry_after: 0 }),verify: async () => result.promise,
    }),async () => { authenticated++; },() => 'command',() => 1000);
    controller.setPhone('13800138000'); await controller.sendCode(); controller.setOtp('123456');
    const verification = controller.verify(); controller.dispose(); const snapshot = controller.getSnapshot();
    if (outcome === 'success') result.resolve({ session: tokens,account: { id: 'account',admitted: true } });
    else result.reject(new AccountError('TERMS_CHANGED','old terms'));
    await verification; assert.equal(authenticated,0); assert.equal(controller.getSnapshot(),snapshot);
  }
});

test('MC26: superseded auth requests cannot restore an old challenge or document set after editing or disposal', async () => {
  const challenge = deferred<{ challenge_id: string; expires_at: string; retry_after: number }>(),documentSet = deferred<RegistrationDocuments>();
  const controller = createAuthController(controllerApi({ challenge: async () => challenge.promise,documents: async () => documentSet.promise }),
    async () => assert.fail('No verification requested'),() => 'command',() => 1000);
  controller.setPhone('13800138000'); const sending = controller.sendCode(); controller.setPhone('13900139000');
  challenge.resolve({ challenge_id: 'old-phone',expires_at: '',retry_after: 30 }); await sending;
  assert.equal(controller.getSnapshot().challenge,null); assert.equal(controller.getSnapshot().phone,'13900139000');
  const reading = controller.loadDocuments(); controller.dispose(); const snapshot = controller.getSnapshot();
  documentSet.resolve(documents); await reading; assert.equal(controller.getSnapshot(),snapshot);
  await controller.sendCode(); await controller.verify(); await controller.loadDocuments(); assert.equal(controller.getSnapshot(),snapshot);
});

test('MC27: disposed security controllers neither reload private devices nor sign out from late revocation or operation results', async () => {
  const item: DeviceSession = { id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null };
  for (const outcome of ['success','invalid','operation-success','operation-invalid'] as const) {
    const mutation = deferred<unknown>(),operation = deferred<{ operation_id: string; action: string; state: 'succeeded' }>(),operationStarted = deferred<void>();
    let reads = 0,signedOut = 0;
    const controller = createSecurityController(controllerApi({
      revoke: async () => mutation.promise,sessions: async () => { reads++; return { items: [item],next_cursor: null,has_more: false }; },
      operation: async () => { operationStarted.resolve(); return operation.promise; },
    }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'command',() => 1000);
    const revocation = controller.revoke(item);
    if (outcome.startsWith('operation-')) { mutation.reject(new AccountError('NETWORK_UNCONFIRMED','retry')); await operationStarted.promise; }
    controller.dispose(); const snapshot = controller.getSnapshot();
    if (outcome === 'success') mutation.resolve({});
    else if (outcome === 'invalid') mutation.reject(new AccountError('SESSION_INVALID','old session'));
    else if (outcome === 'operation-success') operation.resolve({ operation_id: 'command',action: 'session.revoke',state: 'succeeded' });
    else operation.reject(new AccountError('SESSION_INVALID','old lookup'));
    await revocation; assert.equal(reads,0); assert.equal(signedOut,0); assert.equal(controller.getSnapshot(),snapshot);
    await controller.load(); await controller.revoke(item); await controller.logout(); assert.equal(reads,0); assert.equal(signedOut,0);
  }
});

test('MC28: disposed security controllers cannot clear a replacement session after late logout or device-list failure', async () => {
  for (const outcome of ['logout-success','logout-invalid','read-invalid'] as const) {
    const logout = deferred<unknown>(),read = deferred<{ items: DeviceSession[]; next_cursor: string | null; has_more: boolean }>();
    let signedOut = 0;
    const controller = createSecurityController(controllerApi({ logout: async () => logout.promise,sessions: async () => read.promise }),
      tokens,async () => { signedOut++; },controllerLifecycle(),() => 'command',() => 1000);
    const pending = outcome === 'read-invalid' ? controller.load() : controller.logout(); controller.dispose(); const snapshot = controller.getSnapshot();
    if (outcome === 'logout-success') logout.resolve({});
    else if (outcome === 'logout-invalid') logout.reject(new AccountError('SESSION_INVALID','old logout'));
    else read.reject(new AccountError('SESSION_INVALID','old device list'));
    await pending; assert.equal(signedOut,0); assert.equal(controller.getSnapshot(),snapshot);
  }
});

test('MC29: a newer logout invalidates an in-flight revocation and device read before they can reload or sign out twice', async () => {
  const mutation = deferred<unknown>(),read = deferred<{ items: DeviceSession[]; next_cursor: string | null; has_more: boolean }>();
  const item: DeviceSession = { id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null };
  let reads = 0,signedOut = 0;
  const controller = createSecurityController(controllerApi({
    sessions: async () => { reads++; return read.promise; },revoke: async () => mutation.promise,logout: async () => ({}),
  }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'command',() => 1000);
  const reading = controller.load(),revoking = controller.revoke(item); await controller.logout();
  const snapshot = controller.getSnapshot(); mutation.reject(new AccountError('SESSION_INVALID','old revoke'));
  read.resolve({ items: [item],next_cursor: null,has_more: false }); await Promise.all([reading,revoking]);
  assert.equal(reads,1); assert.equal(signedOut,1); assert.equal(controller.getSnapshot(),snapshot); assert.deepEqual(controller.getSnapshot().items,[]);
  controller.dispose();
});

test('MC30: disposed recovery controllers cannot restart or sign out after late invalidation', async () => {
  const request = deferred<RecoveryCase>(),lifecycle = controllerLifecycle();
  let signedOut = 0,requests = 0;
  const controller = createRecoveryController(controllerApi({ requestRecovery: async () => { requests++; return request.promise; } }),
    tokens,async () => { signedOut++; },lifecycle,() => 'command',() => 1000);
  controller.start(); const pending = controller.submit('manual'); controller.dispose(); const snapshot = controller.getSnapshot();
  request.reject(new AccountError('SESSION_INVALID','old recovery')); await pending;
  controller.start(); await controller.submit('manual'); await controller.refresh(); lifecycle.change(false); lifecycle.change(true);
  assert.equal(requests,1); assert.equal(signedOut,0); assert.equal(lifecycle.listenerCount(),0); assert.equal(controller.getSnapshot(),snapshot);
});

test('MC31: reading current registration terms never supplies consent and an unchecked or unavailable version cannot request an OTP', async () => {
  const reading = deferred<RegistrationDocuments>();
  let requests = 0;
  const controller = createAuthController(controllerApi({ documents: async () => reading.promise,challenge: async () => {
    requests++; return { challenge_id: 'registration-challenge',expires_at: new Date(60_000).toISOString(),retry_after: 60 };
  } }),async () => assert.fail('Only a challenge was requested'),() => 'command',() => 1000);
  controller.changeMode(); controller.setPhone('13800138000'); controller.setInvitation('invite'); controller.setAdult(true);
  controller.setConsent(true); assert.equal(controller.getSnapshot().consent,false);
  await controller.sendCode(); assert.equal(requests,0); assert.equal(controller.getSnapshot().step,'details');
  reading.resolve(documents); await idleTurn(); assert.equal(controller.getSnapshot().consent,false);
  await controller.sendCode(); assert.equal(requests,0); assert.equal(controller.getSnapshot().errorCode,'CONSENT_REQUIRED');
  controller.setConsent(true); await controller.sendCode();
  assert.equal(requests,1); assert.equal(controller.getSnapshot().step,'otp'); assert.equal(controller.getSnapshot().challenge?.challenge_id,'registration-challenge');
  controller.changeDetails(); assert.equal(controller.getSnapshot().step,'details'); assert.equal(controller.getSnapshot().challenge,null);
  assert.equal(controller.getSnapshot().phone,'13800138000'); assert.equal(controller.getSnapshot().invitation,'invite');
  controller.dispose();
});

test('MC32: authentication pending states prevent duplicate sends and verification, and OTP rejection preserves input for correction', async () => {
  const sent = deferred<Awaited<ReturnType<AccountApi['challenge']>>>(),verified = deferred<Awaited<ReturnType<AccountApi['verify']>>>();
  let sends = 0,verifications = 0;
  const controller = createAuthController(controllerApi({ challenge: async () => { sends++; return sent.promise; },verify: async () => { verifications++; return verified.promise; } }),
    async () => assert.fail('Rejected OTP cannot authenticate'),() => 'command',() => 1000);
  controller.setPhone('13800138000'); const sending = controller.sendCode();
  assert.equal(controller.getSnapshot().pending,'send'); assert.equal(controller.getSnapshot().busy,true);
  await controller.sendCode(); assert.equal(sends,1);
  sent.resolve({ challenge_id: 'challenge',expires_at: new Date(60_000).toISOString(),retry_after: 0 }); await sending;
  assert.equal(controller.getSnapshot().pending,null); controller.setOtp('123456'); const verification = controller.verify();
  assert.equal(controller.getSnapshot().pending,'verify'); await controller.verify(); assert.equal(verifications,1);
  verified.reject(new AccountError('OTP_INVALID','验证码不正确，请检查后重试。')); await verification;
  assert.equal(controller.getSnapshot().otp,'123456'); assert.equal(controller.getSnapshot().busy,false); assert.equal(controller.getSnapshot().pending,null);
  assert.equal(controller.getSnapshot().errorCode,'OTP_INVALID'); assert.equal(controller.getSnapshot().fieldErrors.otp,'验证码不正确，请检查后重试。');
  controller.setOtp('654321'); assert.equal(controller.getSnapshot().error,''); assert.deepEqual(controller.getSnapshot().fieldErrors,{});
  controller.dispose();
});

test('MC33: explicit revocation queries never repeat DELETE and only the owned matching operation can remove a pending device', async () => {
  const item: DeviceSession = { id: 'other-device',device_label: 'Other device',current: false,row_version: 7,created_at: '',trusted_at: null };
  let deletions = 0,queries = 0,reads = 0;
  let operation: Awaited<ReturnType<AccountApi['operation']>> = { operation_id: 'revoke-command',action: 'session.revoke',state: 'pending' };
  const controller = createSecurityController(controllerApi({
    sessions: async () => { reads++; return { items: reads === 1 ? [item] : [],next_cursor: null,has_more: false }; },
    revoke: async (_token,id,version,command) => {
      deletions++; assert.equal(id,item.id); assert.equal(version,7); assert.equal(command,'revoke-command'); throw new AccountError('NETWORK_UNCONFIRMED','结果未知');
    },
    operation: async (_token,id) => { queries++; assert.equal(id,'revoke-command'); return operation; },
  }),tokens,async () => assert.fail('Other-device revocation cannot sign out this device'),controllerLifecycle(),() => 'revoke-command',() => 1000);
  await controller.start(); await controller.revoke(item);
  assert.deepEqual(controller.getSnapshot().pendingRevocation,{ target: item.id,operationId: 'revoke-command' });
  assert.equal(queries,1); await controller.queryRevocation(); assert.equal(queries,2); assert.equal(deletions,1);
  for (const patch of [{ operation_id: 'another-command' },{ action: 'auth.logout' }]) {
    operation = { operation_id: 'revoke-command',action: 'session.revoke',state: 'succeeded',...patch };
    await controller.queryRevocation(); assert.ok(controller.getSnapshot().pendingRevocation);
    assert.equal(reads,1); assert.equal(controller.getSnapshot().notice,'');
  }
  operation = { operation_id: 'revoke-command',action: 'session.revoke',state: 'succeeded' };
  await controller.queryRevocation(); assert.equal(deletions,1); assert.equal(reads,2);
  assert.equal(controller.getSnapshot().pendingRevocation,null); assert.deepEqual(controller.getSnapshot().items,[]);
  assert.match(controller.getSnapshot().notice,/已撤销/); controller.dispose();
});

test('MC34: uncertain recovery queries keep pending commands without POST and replay only the owned successful command to retrieve its case', async () => {
  const commands: string[] = [];
  let operation: Awaited<ReturnType<AccountApi['operation']>> = { operation_id: 'recovery-command',action: 'recovery.request',state: 'pending' };
  const record = recoveryRecord();
  const controller = createRecoveryController(controllerApi({
    requestRecovery: async (_token,mode,command) => {
      assert.equal(mode,'manual'); commands.push(command);
      if (commands.length === 1) throw new AccountError('NETWORK_UNCONFIRMED','结果未知');
      return record;
    },
    operation: async (_token,id) => { assert.equal(id,'recovery-command'); return operation; },
  }),tokens,async () => assert.fail('A pending application cannot change authentication'),controllerLifecycle(),() => 'recovery-command',() => 1000);
  controller.start(); await controller.submit('manual'); assert.deepEqual(commands,['recovery-command']);
  assert.deepEqual(controller.getSnapshot().pending,{ operationId: 'recovery-command',mode: 'manual' });
  await controller.queryPending(); assert.deepEqual(commands,['recovery-command']); assert.equal(controller.getSnapshot().record,null);
  for (const patch of [{ operation_id: 'another-command' },{ action: 'session.revoke' }]) {
    operation = { operation_id: 'recovery-command',action: 'recovery.request',state: 'succeeded',...patch };
    await controller.queryPending(); assert.ok(controller.getSnapshot().pending);
    assert.deepEqual(commands,['recovery-command']); assert.equal(controller.getSnapshot().record,null);
  }
  operation = { operation_id: 'recovery-command',action: 'recovery.request',state: 'succeeded' };
  await controller.queryPending(); assert.deepEqual(commands,['recovery-command','recovery-command']);
  assert.equal(controller.getSnapshot().record,record); assert.equal(controller.getSnapshot().caseId,record.id);
  assert.equal(controller.getSnapshot().pending,null); assert.equal(controller.getSnapshot().busy,false); controller.dispose();
});

test('MC35: background transitions hide private account state and old device mutation or case-read errors cannot cover a fresh foreground result', async () => {
  const lifecycle = controllerLifecycle(),mutation = deferred<unknown>();
  const item: DeviceSession = { id: 'device',device_label: 'Private device',current: false,row_version: 1,created_at: '',trusted_at: null };
  const security = createSecurityController(controllerApi({
    sessions: async () => ({ items: [item],next_cursor: null,has_more: false }),revoke: async () => mutation.promise,
  }),tokens,async () => assert.fail('An ordinary old failure cannot sign out'),lifecycle,() => 'command',() => 1000);
  await security.start(); const revoking = security.revoke(item);
  lifecycle.change(false); assert.equal(security.getSnapshot().active,false); assert.deepEqual(security.getSnapshot().items,[]);
  lifecycle.change(true); assert.deepEqual(security.getSnapshot().items,[]); await idleTurn();
  assert.deepEqual(security.getSnapshot().items,[item]); mutation.reject(new Error('old-device-error')); await revoking;
  assert.equal(security.getSnapshot().error,''); assert.deepEqual(security.getSnapshot().items,[item]); security.dispose();

  const caseLifecycle = controllerLifecycle(),oldRead = deferred<RecoveryCase>(),fresh = recoveryRecord('reviewing');
  let reads = 0;
  const recovery = createRecoveryController(controllerApi({ requestRecovery: async () => recoveryRecord(),
    recoveryCase: async () => ++reads === 1 ? oldRead.promise : fresh,
  }),tokens,async () => assert.fail('An old read failure cannot sign out'),caseLifecycle,() => 'command',() => 1000);
  recovery.start(); await recovery.submit('manual'); const reading = recovery.refresh();
  caseLifecycle.change(false); assert.equal(recovery.getSnapshot().active,false); assert.equal(recovery.getSnapshot().record,null);
  caseLifecycle.change(true); assert.equal(recovery.getSnapshot().record,null); await idleTurn();
  assert.equal(recovery.getSnapshot().record,fresh); oldRead.reject(new Error('old-case-error')); await reading;
  assert.equal(recovery.getSnapshot().record,fresh); assert.equal(recovery.getSnapshot().error,''); recovery.dispose();
});

test('MC36: uncertain logout only queries its existing command and never accepts another action or a pending result as logout success', async () => {
  let mutations = 0,signedOut = 0;
  let operation: Awaited<ReturnType<AccountApi['operation']>> = { operation_id: 'logout-command',action: 'auth.logout',state: 'pending' };
  const controller = createSecurityController(controllerApi({ logout: async (_token,command) => {
    mutations++; assert.equal(command,'logout-command'); throw new AccountError('NETWORK_UNCONFIRMED','结果未知');
  },operation: async (_token,id) => { assert.equal(id,'logout-command'); return operation; } }),
  tokens,async () => { signedOut++; },controllerLifecycle(),() => 'logout-command',() => 1000);
  await controller.logout(); assert.equal(controller.getSnapshot().pendingLogout,true);
  await controller.queryLogout(); assert.equal(signedOut,0); assert.equal(mutations,1);
  for (const patch of [{ operation_id: 'another-command' },{ action: 'session.revoke' }]) {
    operation = { operation_id: 'logout-command',action: 'auth.logout',state: 'succeeded',...patch };
    await controller.queryLogout(); assert.equal(signedOut,0); assert.equal(controller.getSnapshot().pendingLogout,true);
  }
  operation = { operation_id: 'logout-command',action: 'auth.logout',state: 'succeeded' };
  await controller.queryLogout(); assert.equal(signedOut,1); assert.equal(mutations,1); assert.equal(controller.getSnapshot().pendingLogout,false);
  controller.dispose();
});

test('MC37: refreshing an established session preserves its account generation and recovery while the current token is verified and stored', async () => {
  const refresh = deferred<{ session: SessionTokens }>(),started = deferred<void>();
  const newer = { ...tokens,access_token: 'refreshed-access',expires_at: 200 };
  let time = 1000,stored: SessionTokens | null = null;
  const controller = createSessionController(controllerApi({ refresh: async () => { started.resolve(); return refresh.promise; } }),{
    readSession: async () => stored,saveSession: async value => { stored = value; },clearSession: async () => { stored = null; },
  },{ ...sessionClock,now: () => time });
  await controller.authenticated(tokens); controller.openRecovery(true);
  const accountGeneration = controller.getSnapshot().accountGeneration;
  assert.equal(accountGeneration,1); time = 100_000;
  const restoring = controller.restore(); await started.promise;
  assert.equal(controller.getSnapshot().ready,false); assert.equal(controller.getSnapshot().session,tokens);
  assert.deepEqual(controller.getSnapshot().recovery,{ trusted: true }); assert.equal(controller.getSnapshot().accountGeneration,accountGeneration);
  refresh.resolve({ session: newer }); await restoring;
  assert.equal(controller.getSnapshot().session,newer); assert.equal(stored,newer); assert.equal(controller.getSnapshot().ready,true);
  assert.equal(controller.getSnapshot().accountGeneration,accountGeneration); assert.deepEqual(controller.getSnapshot().recovery,{ trusted: true });
  await controller.signedOut(); assert.equal(controller.getSnapshot().accountGeneration,accountGeneration+1);
  assert.equal(controller.getSnapshot().session,null); assert.equal(controller.getSnapshot().recovery,null);
  await controller.signedOut(); assert.equal(controller.getSnapshot().accountGeneration,accountGeneration+1);
  await controller.authenticated(newer); assert.equal(controller.getSnapshot().accountGeneration,accountGeneration+2); controller.dispose();
});

test('MC38: a transient refresh failure retains the established tokens without pretending that renewal succeeded', async () => {
  let time = 1000,stored: SessionTokens | null = null,clears = 0;
  const controller = createSessionController(controllerApi({ refresh: async () => { throw new AccountError('SERVICE_UNAVAILABLE','暂时无法刷新'); } }),{
    readSession: async () => stored,saveSession: async value => { stored = value; },clearSession: async () => { clears++; stored = null; },
  },{ ...sessionClock,now: () => time });
  await controller.authenticated(tokens); controller.openRecovery(false); time = 100_000;
  const generation = controller.getSnapshot().accountGeneration; await controller.restore();
  assert.equal(controller.getSnapshot().session,tokens); assert.equal(stored,tokens); assert.equal(clears,0);
  assert.equal(controller.getSnapshot().ready,true); assert.equal(controller.getSnapshot().error,'暂时无法刷新');
  assert.equal(controller.getSnapshot().accountGeneration,generation); assert.deepEqual(controller.getSnapshot().recovery,{ trusted: false }); controller.dispose();
});

test('MC39: failed secure credential deletion is visible after invalidation or signout, leaves no active identity, and never rejects restoration', async () => {
  for (const outcome of ['restore','signout'] as const) {
    let time = 1000,stored: SessionTokens | null = null,clears = 0;
    const controller = createSessionController(controllerApi({ refresh: async () => { throw new AccountError('SESSION_INVALID','已失效'); } }),{
      readSession: async () => stored,saveSession: async value => { stored = value; },
      clearSession: async () => { clears++; throw new Error('SecureStore unavailable'); },
    },{ ...sessionClock,now: () => time });
    await controller.authenticated(tokens); controller.openRecovery(true); time = outcome === 'restore' ? 100_000 : 1000;
    const generation = controller.getSnapshot().accountGeneration;
    await assert.doesNotReject(outcome === 'restore' ? controller.restore() : controller.signedOut());
    assert.equal(clears,1); assert.equal(controller.getSnapshot().ready,true); assert.equal(controller.getSnapshot().session,null);
    assert.equal(controller.getSnapshot().recovery,null); assert.equal(controller.getSnapshot().accountGeneration,generation+1);
    assert.match(controller.getSnapshot().error,/无法清除本机安全登录信息/); assert.equal(stored,tokens);
    await assert.doesNotReject(controller.restore()); assert.equal(clears,2); assert.equal(controller.getSnapshot().session,null);
    assert.match(controller.getSnapshot().error,/无法清除本机安全登录信息/);
    controller.dispose();
  }
});

test('MC40: malformed recovery POST responses remain unknown and malformed or mismatched GET records cannot display a successful case', async () => {
  const invalid = [null,{}, { ...recoveryRecord(),id: 'not-a-uuid' },{ ...recoveryRecord(),state: 'restored' },
    { ...recoveryRecord(),mode: 'unsupported' },{ ...recoveryRecord(),row_version: 0 },{ ...recoveryRecord(),row_version: 1.5 },
    { ...recoveryRecord(),created_at: '' },{ ...recoveryRecord(),updated_at: 'invalid-time' }];
  for (const response of invalid) {
    const controller = createRecoveryController(controllerApi({ requestRecovery: async () => response as RecoveryCase }),tokens,
      async () => assert.fail('Malformed data cannot change authentication'),controllerLifecycle(),() => 'malformed-command',() => 1000);
    controller.start(); await controller.submit('manual');
    assert.equal(controller.getSnapshot().record,null); assert.equal(controller.getSnapshot().caseId,null);
    assert.deepEqual(controller.getSnapshot().pending,{ operationId: 'malformed-command',mode: 'manual' });
    assert.equal(controller.getSnapshot().errorCode,'NETWORK_UNCONFIRMED'); controller.dispose();
  }
  for (const response of [...invalid,{ ...recoveryRecord(),id: '71000000-0000-4000-8000-000000000002' }]) {
    const controller = createRecoveryController(controllerApi({ requestRecovery: async () => recoveryRecord(),
      recoveryCase: async () => response as RecoveryCase,
    }),tokens,async () => assert.fail('Malformed current reads cannot change authentication'),controllerLifecycle(),() => 'command',() => 1000);
    controller.start(); await controller.submit('manual'); await controller.refresh();
    assert.equal(controller.getSnapshot().record,null); assert.equal(controller.getSnapshot().caseId,recoveryRecord().id);
    assert.equal(controller.getSnapshot().pending,null); assert.equal(controller.getSnapshot().errorCode,'SERVICE_UNAVAILABLE'); controller.dispose();
  }
});

test('MC41: updating account controller tokens preserves pending command IDs and case state while all later queries use the new token', async () => {
  const newer = { ...tokens,access_token: 'renewed-access' },device: DeviceSession = {
    id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null,
  };
  const securityCalls: string[] = [];
  const security = createSecurityController(controllerApi({
    sessions: async token => { securityCalls.push(`read:${token}`); return { items: [],next_cursor: null,has_more: false }; },
    revoke: async token => { securityCalls.push(`delete:${token}`); throw new AccountError('NETWORK_UNCONFIRMED','未知'); },
    operation: async (token,id) => { securityCalls.push(`query:${token}:${id}`); return { operation_id: id,action: 'session.revoke',state: token === tokens.access_token ? 'pending' : 'succeeded' }; },
  }),tokens,async () => assert.fail('Other-device revoke cannot sign out'),controllerLifecycle(),() => 'same-revoke',() => 1000);
  await security.revoke(device); const pending = security.getSnapshot().pendingRevocation;
  security.updateSession(newer); assert.equal(security.getSnapshot().pendingRevocation,pending); await security.queryRevocation();
  assert.deepEqual(securityCalls,['delete:current-access','query:current-access:same-revoke','query:renewed-access:same-revoke','read:renewed-access']); security.dispose();

  const recoveryCalls: string[] = [];
  const recovery = createRecoveryController(controllerApi({
    requestRecovery: async (token,_mode,id) => {
      recoveryCalls.push(`post:${token}:${id}`); if (token === tokens.access_token) throw new AccountError('NETWORK_UNCONFIRMED','未知'); return recoveryRecord();
    },
    operation: async (token,id) => { recoveryCalls.push(`query:${token}:${id}`); return { operation_id: id,action: 'recovery.request',state: 'succeeded' }; },
    recoveryCase: async (token,id) => { recoveryCalls.push(`read:${token}:${id}`); return recoveryRecord('reviewing'); },
  }),tokens,async () => assert.fail('Recovery does not sign in'),controllerLifecycle(),() => 'same-recovery',() => 1000);
  recovery.start(); await recovery.submit('manual'); const pendingRecovery = recovery.getSnapshot().pending;
  recovery.updateSession(newer); assert.equal(recovery.getSnapshot().pending,pendingRecovery); await recovery.queryPending();
  assert.equal(recovery.getSnapshot().caseId,recoveryRecord().id); recovery.updateSession({ ...newer,access_token: 'latest-access' });
  await recovery.refresh(); assert.equal(recovery.getSnapshot().record?.state,'reviewing');
  assert.deepEqual(recoveryCalls,['post:current-access:same-recovery','query:renewed-access:same-recovery','post:renewed-access:same-recovery',`read:latest-access:${recoveryRecord().id}`]);
  recovery.dispose();
});

test('MC42: late old-token device reads, revocations, logouts and operation queries cannot invalidate a rotated session', async () => {
  const newer = { ...tokens,access_token: 'rotated-access' },item: DeviceSession = {
    id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null,
  };
  for (const scenario of ['read','revoke','logout','query-revoke','query-logout'] as const) {
    const late = deferred<never>();
    let signedOut = 0,mutations = 0,holdQuery = false;
    const action = scenario.endsWith('logout') ? 'auth.logout' : 'session.revoke';
    const controller = createSecurityController(controllerApi({
      sessions: async token => token === tokens.access_token ? late.promise : { items: [item],next_cursor: null,has_more: false },
      revoke: async () => {
        mutations++; if (scenario === 'revoke') return late.promise;
        throw new AccountError('NETWORK_UNCONFIRMED','未知');
      },
      logout: async () => {
        mutations++; if (scenario === 'logout') return late.promise;
        throw new AccountError('NETWORK_UNCONFIRMED','未知');
      },
      operation: async (token,id) => {
        if (token === tokens.access_token && holdQuery) return late.promise;
        return { operation_id: id,action,state: token === tokens.access_token ? 'pending' : 'succeeded' };
      },
    }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'rotation-command',() => 1000);
    let pending: Promise<unknown>;
    if (scenario === 'read') pending = controller.load();
    else if (scenario === 'revoke') pending = controller.revoke(item);
    else if (scenario === 'logout') pending = controller.logout();
    else {
      if (scenario === 'query-revoke') await controller.revoke(item); else await controller.logout();
      holdQuery = true; pending = scenario === 'query-revoke' ? controller.queryRevocation() : controller.queryLogout();
    }
    controller.updateSession(newer);
    assert.equal(controller.getSnapshot().busy,false); assert.equal(controller.getSnapshot().loading,false);
    if (scenario === 'read') await controller.load();
    else if (scenario.endsWith('logout')) {
      assert.equal(controller.getSnapshot().pendingLogout,true); await controller.queryLogout();
    } else {
      assert.deepEqual(controller.getSnapshot().pendingRevocation,{ target: item.id,operationId: 'rotation-command' }); await controller.queryRevocation();
    }
    const snapshot = controller.getSnapshot(),signoutsBeforeLate = signedOut;
    late.reject(new AccountError('SESSION_INVALID','old token expired')); await pending;
    assert.equal(controller.getSnapshot(),snapshot); assert.equal(signedOut,signoutsBeforeLate);
    assert.equal(signedOut,scenario.endsWith('logout') ? 1 : 0); assert.equal(mutations,scenario === 'read' ? 0 : 1);
    controller.dispose();
  }
});

test('MC43: recovery token rotation preserves case or command identity and ignores old-token read, submit and query invalidation', async () => {
  const newer = { ...tokens,access_token: 'rotated-access' };
  for (const scenario of ['read','submit','query'] as const) {
    const late = deferred<never>(),commands: string[] = [];
    let signedOut = 0;
    const controller = createRecoveryController(controllerApi({
      requestRecovery: async (token,_mode,command) => {
        commands.push(command);
        if (scenario === 'submit' && token === tokens.access_token) return late.promise;
        if (scenario === 'query' && token === tokens.access_token) throw new AccountError('NETWORK_UNCONFIRMED','未知');
        return recoveryRecord();
      },
      recoveryCase: async token => token === tokens.access_token ? late.promise : recoveryRecord('reviewing'),
      operation: async (token,id) => token === tokens.access_token ? late.promise : { operation_id: id,action: 'recovery.request',state: 'succeeded' },
    }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'rotation-recovery',() => 1000);
    controller.start(); let pending: Promise<unknown>;
    if (scenario === 'read') { await controller.submit('manual'); pending = controller.refresh(); }
    else if (scenario === 'submit') pending = controller.submit('manual');
    else { await controller.submit('manual'); pending = controller.queryPending(); }
    controller.updateSession(newer); assert.equal(controller.getSnapshot().busy,false);
    if (scenario === 'read') {
      assert.equal(controller.getSnapshot().caseId,recoveryRecord().id); await controller.refresh();
    } else {
      assert.deepEqual(controller.getSnapshot().pending,{ operationId: 'rotation-recovery',mode: 'manual' }); await controller.queryPending();
      assert.deepEqual(commands,['rotation-recovery','rotation-recovery']);
    }
    const snapshot = controller.getSnapshot(); assert.equal(snapshot.caseId,recoveryRecord().id); assert.ok(snapshot.record);
    late.reject(new AccountError('SESSION_INVALID','old token expired')); await pending;
    assert.equal(controller.getSnapshot(),snapshot); assert.equal(signedOut,0); controller.dispose();
  }
});

test('MC44: foregrounding expired account tokens never starts an old-token device or recovery read and preserves the state needed after renewal', async () => {
  let now = 1000,deviceReads = 0,caseReads = 0,mutations = 0,queries = 0;
  const securityLifecycle = controllerLifecycle(),recoveryLifecycle = controllerLifecycle();
  const item: DeviceSession = { id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null };
  const security = createSecurityController(controllerApi({
    sessions: async () => { deviceReads++; return { items: [item],next_cursor: null,has_more: false }; },
    revoke: async () => { mutations++; throw new AccountError('NETWORK_UNCONFIRMED','未知'); },
    logout: async () => { mutations++; return {}; },
    operation: async (_token,id) => { queries++; return { operation_id: id,action: 'session.revoke',state: 'pending' }; },
  }),tokens,async () => assert.fail('Expiry must retain refresh credentials'),securityLifecycle,() => 'expired-revoke',() => now);
  const recovery = createRecoveryController(controllerApi({ requestRecovery: async () => { mutations++; return recoveryRecord(); },
    recoveryCase: async () => { caseReads++; return recoveryRecord('reviewing'); },
  }),tokens,async () => assert.fail('Expiry must retain the pending case'),recoveryLifecycle,() => 'expired-case',() => now);
  await security.start(); recovery.start(); await recovery.submit('manual'); await security.revoke(item);
  assert.equal(deviceReads,1); assert.equal(mutations,2); assert.equal(queries,1);
  now = tokens.expires_at*1000; securityLifecycle.change(false); recoveryLifecycle.change(false);
  securityLifecycle.change(true); recoveryLifecycle.change(true); await idleTurn();
  await security.load(); await security.revoke(item); await security.logout(); await security.queryRevocation(); await security.queryLogout();
  await recovery.refresh(); await recovery.submit('manual'); await recovery.queryPending();
  assert.equal(deviceReads,1); assert.equal(caseReads,0); assert.equal(mutations,2); assert.equal(queries,1);
  assert.deepEqual(security.getSnapshot().items,[]); assert.deepEqual(security.getSnapshot().pendingRevocation,{ target: item.id,operationId: 'expired-revoke' });
  assert.equal(recovery.getSnapshot().record,null); assert.equal(recovery.getSnapshot().caseId,recoveryRecord().id);
  const newer = { ...tokens,access_token: 'renewed',expires_at: 200 };
  security.updateSession(newer); recovery.updateSession(newer); await security.load(); await recovery.refresh();
  assert.equal(deviceReads,2); assert.equal(caseReads,1); assert.equal(recovery.getSnapshot().record?.state,'reviewing');
  assert.deepEqual(security.getSnapshot().pendingRevocation,{ target: item.id,operationId: 'expired-revoke' });
  security.dispose(); recovery.dispose();
});

test('MC45: in-flight requests expiring before their 401 preserve renewal and original commands while a confirmed logout still signs out', async () => {
  const newer = { ...tokens,access_token: 'renewed-access',expires_at: 200 },item: DeviceSession = {
    id: 'device',device_label: '',current: false,row_version: 1,created_at: '',trusted_at: null,
  };
  for (const scenario of ['read','revoke','logout','query-revoke','query-logout'] as const) {
    const late = deferred<never>();
    let now = 1000,signedOut = 0,holdQuery = false,mutations = 0;
    const controller = createSecurityController(controllerApi({
      sessions: async token => token === tokens.access_token ? late.promise : { items: [item],next_cursor: null,has_more: false },
      revoke: async () => { mutations++; if (scenario === 'revoke') return late.promise; throw new AccountError('NETWORK_UNCONFIRMED','未知'); },
      logout: async () => { mutations++; if (scenario === 'logout') return late.promise; throw new AccountError('NETWORK_UNCONFIRMED','未知'); },
      operation: async (token,id) => token === tokens.access_token && holdQuery ? late.promise : {
        operation_id: id,action: scenario.endsWith('logout') ? 'auth.logout' : 'session.revoke',state: token === tokens.access_token ? 'pending' : 'succeeded',
      },
    }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'expiry-command',() => now);
    let pending: Promise<unknown>;
    if (scenario === 'read') pending = controller.load();
    else if (scenario === 'revoke') pending = controller.revoke(item);
    else if (scenario === 'logout') pending = controller.logout();
    else {
      if (scenario === 'query-revoke') await controller.revoke(item); else await controller.logout();
      holdQuery = true; pending = scenario === 'query-revoke' ? controller.queryRevocation() : controller.queryLogout();
    }
    now = tokens.expires_at*1000; late.reject(new AccountError('SESSION_INVALID','access token expired')); await pending;
    assert.equal(signedOut,0); assert.equal(controller.getSnapshot().busy,false); assert.notEqual(controller.getSnapshot().errorCode,'SESSION_INVALID');
    controller.updateSession(newer);
    if (scenario === 'read') await controller.load();
    else if (scenario.endsWith('logout')) {
      assert.equal(controller.getSnapshot().pendingLogout,true); await controller.queryLogout(); assert.equal(signedOut,1);
    } else {
      assert.deepEqual(controller.getSnapshot().pendingRevocation,{ target: item.id,operationId: 'expiry-command' }); await controller.queryRevocation();
      assert.equal(controller.getSnapshot().pendingRevocation,null);
    }
    assert.equal(mutations,scenario === 'read' ? 0 : 1); controller.dispose();
  }
  for (const scenario of ['read','submit','query'] as const) {
    const late = deferred<never>(),commands: string[] = [];
    let now = 1000,signedOut = 0;
    const controller = createRecoveryController(controllerApi({
      requestRecovery: async (token,_mode,id) => {
        commands.push(id); if (scenario === 'submit' && token === tokens.access_token) return late.promise;
        if (scenario === 'query' && token === tokens.access_token) throw new AccountError('NETWORK_UNCONFIRMED','未知'); return recoveryRecord();
      },
      recoveryCase: async token => token === tokens.access_token ? late.promise : recoveryRecord('reviewing'),
      operation: async (token,id) => token === tokens.access_token ? late.promise : { operation_id: id,action: 'recovery.request',state: 'succeeded' },
    }),tokens,async () => { signedOut++; },controllerLifecycle(),() => 'expiry-recovery',() => now);
    controller.start(); let pending: Promise<unknown>;
    if (scenario === 'read') { await controller.submit('manual'); pending = controller.refresh(); }
    else if (scenario === 'submit') pending = controller.submit('manual');
    else { await controller.submit('manual'); pending = controller.queryPending(); }
    now = tokens.expires_at*1000; late.reject(new AccountError('SESSION_INVALID','access token expired')); await pending;
    assert.equal(signedOut,0); assert.equal(controller.getSnapshot().busy,false); assert.notEqual(controller.getSnapshot().errorCode,'SESSION_INVALID');
    if (scenario === 'read') assert.equal(controller.getSnapshot().caseId,recoveryRecord().id);
    else assert.deepEqual(controller.getSnapshot().pending,{ mode: 'manual',operationId: 'expiry-recovery' });
    controller.updateSession(newer);
    if (scenario === 'read') await controller.refresh(); else await controller.queryPending();
    assert.equal(controller.getSnapshot().caseId,recoveryRecord().id); assert.ok(controller.getSnapshot().record); assert.equal(signedOut,0);
    assert.deepEqual(commands,scenario === 'read' ? ['expiry-recovery'] : ['expiry-recovery','expiry-recovery']); controller.dispose();
  }
  let now = 1000,signedOut = 0;
  const success = deferred<unknown>();
  const logout = createSecurityController(controllerApi({ logout: async () => success.promise }),tokens,async () => { signedOut++; },
    controllerLifecycle(),() => 'confirmed-logout',() => now);
  const pending = logout.logout(); now = tokens.expires_at*1000; success.resolve({}); await pending;
  assert.equal(signedOut,1); logout.dispose();
});
