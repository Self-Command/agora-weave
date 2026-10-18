import assert from 'node:assert/strict';
import { test } from 'node:test';
import { managementConfiguration, managementPath, sameOriginWrite, isAdministrator } from '../../../apps/admin/src/lib/management-policy.ts';
import { managementCookie, openManagementSession, sealManagementSession, serializeManagementSession } from '../../../apps/admin/src/lib/management-session.ts';
import { managementJson } from '../../../apps/admin/src/lib/management-json.ts';

test('AM01: upstream configuration rejects unconfigured, credentialed, redirected and untrusted local destinations', () => {
  const base = { AGORAWEAVE_ADMIN_ENVIRONMENT: 'dev', AGORAWEAVE_ADMIN_CORE_API_URL: 'http://127.0.0.1:8000/functions/v1/core/api/v1' };
  assert.equal(managementConfiguration(base)?.environment, 'dev');
  for (const url of ['http://external.invalid/core/api/v1', 'http://127.0.0.1@external.invalid/core/api/v1',
    'http://127.0.0.1:8000/core/api/v1?target=other', 'http://127.0.0.1:8000/core/api/v1#fragment', 'file:///core/api/v1',
    'http://127.0.0.1:8000/auth/v1', 'http://localhost.external.invalid/core/api/v1']) {
    assert.equal(managementConfiguration({ ...base, AGORAWEAVE_ADMIN_CORE_API_URL: url }), null, url);
  }
  assert.equal(managementConfiguration({}), null);
  assert.equal(managementConfiguration({ ...base, AGORAWEAVE_ADMIN_ENVIRONMENT: 'other' }), null);
  assert.equal(managementConfiguration({ AGORAWEAVE_ADMIN_ENVIRONMENT: 'production', AGORAWEAVE_ADMIN_CORE_API_URL: 'http://api-gw:8000/functions/v1/core/api/v1' })?.environment, 'production');
  assert.equal(managementConfiguration({ AGORAWEAVE_ADMIN_ENVIRONMENT: 'production', AGORAWEAVE_ADMIN_CORE_API_URL: 'http://127.0.0.1:8000/core/api/v1' }), null);
});

test('AM02: mutations require exact Origin, explicit CSRF header and JSON, including logout', () => {
  const request = (headers: Record<string, string>) => new Request('https://admin.example.invalid/api/management/auth/logout', { method: 'POST', headers });
  const headers = { origin: 'https://admin.example.invalid', 'content-type': 'application/json; charset=utf-8', 'x-agoraweave-csrf': '1' };
  assert.equal(sameOriginWrite(request(headers)), true);
  const changes: Record<string, string>[] = [{ origin: 'https://external.invalid' }, { origin: 'null' }, { 'x-agoraweave-csrf': '' },
    { 'content-type': 'text/plain' }, { 'sec-fetch-site': 'cross-site' }];
  for (const change of changes) assert.equal(sameOriginWrite(request({ ...headers, ...change })), false);
  assert.equal(sameOriginWrite(request({})), false);
});

test('AM03: the management BFF exposes only frozen methods and paths without bootstrap or arbitrary proxying', () => {
  assert.equal(managementPath(['admin', 'session'], 'GET'), '/admin/session');
  assert.equal(managementPath(['admin', 'mfa', 'verify'], 'POST'), '/admin/mfa/verify');
  for (const path of [['admin', 'roles'], ['admin', 'bootstrap'], ['admin', 'mfa', 'factors', 'delete'], ['..', 'auth'], ['admin%2fsession'], ['https:', 'other']]) {
    assert.equal(managementPath(path, 'POST'), null);
  }
  assert.equal(managementPath(['admin', 'session'], 'POST'), null);
  assert.equal(managementPath(['admin', 'mfa', 'factors'], 'DELETE'), null);
});

test('AM09: only explicit local development accepts the raw-Host 127-to-localhost normalization', () => {
  const env = { NODE_ENV: 'development', AGORAWEAVE_ADMIN_ENVIRONMENT: 'dev' };
  const headers = { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000', 'content-type': 'application/json', 'x-agoraweave-csrf': '1' };
  const request = (changes: Record<string, string> = {}) => new Request('http://localhost:3000/api/management/auth/refresh', { method: 'POST', headers: { ...headers, ...changes } });
  assert.equal(sameOriginWrite(request(), env), true);
  assert.equal(sameOriginWrite(request(), { ...env, AGORAWEAVE_ADMIN_ENVIRONMENT: 'test' }), true);
  for (const changed of [{ NODE_ENV: 'production', AGORAWEAVE_ADMIN_ENVIRONMENT: 'dev' },
    { NODE_ENV: 'development', AGORAWEAVE_ADMIN_ENVIRONMENT: 'production' }, { AGORAWEAVE_ADMIN_ENVIRONMENT: 'dev' }]) {
    assert.equal(sameOriginWrite(request(), changed), false);
  }
  const changes: Record<string, string>[] = [{ host: '127.0.0.1:3001' }, { origin: 'http://127.0.0.1:3001', host: '127.0.0.1:3001' },
    { origin: 'https://127.0.0.1:3000' }, { host: 'external.invalid' }, { host: 'localhost:3000' },
    { origin: 'http://external.invalid:3000', host: 'external.invalid:3000' }, { host: '127.0.0.1:3000,external.invalid' },
    { origin: 'http://127.0.0.1:3000/path' }, { 'sec-fetch-site': 'cross-site' },
    { origin: 'https://external.invalid', 'x-forwarded-host': '127.0.0.1:3000', 'x-forwarded-proto': 'http' }];
  for (const change of changes) assert.equal(sameOriginWrite(request(change), env), false, JSON.stringify(change));
  const noHost = new Request('http://localhost:3000/api/management/auth/refresh', { method: 'POST', headers: {
    origin: headers.origin, 'content-type': 'application/json', 'x-agoraweave-csrf': '1', 'x-forwarded-host': headers.host } });
  assert.equal(sameOriginWrite(noHost, env), false);
  assert.equal(sameOriginWrite(request({ origin: 'http://localhost:3000', host: 'external.invalid' }), env), false);
});

test('AM04: a current management DTO must have grants and match the configured environment', () => {
  const dto = { account: { id: 'synthetic-account', phone_masked: '+86***1234' }, environment: 'test', roles: ['auditor'], permissions: [],
    mfa: { aal: 'aal1', enrolled: true, verified: false }, sensitive_until: null };
  assert.equal(isAdministrator(dto, 'test'), true);
  assert.equal(isAdministrator(dto, 'dev'), false);
  assert.equal(isAdministrator({ ...dto, roles: [] }, 'test'), false);
  assert.equal(isAdministrator({ ...dto, mfa: { aal: 'aal2' } }, 'test'), false);
});

test('AM05: authenticated cookie encryption detects tampering, uses random nonces and binds the environment', () => {
  const beforeKey = process.env.AGORAWEAVE_ADMIN_SESSION_KEY, beforeEnv = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT;
  try {
    process.env.AGORAWEAVE_ADMIN_SESSION_KEY = '12'.repeat(32); process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = 'test';
    const session = { access_token: 'synthetic.access.token', refresh_token: 'synthetic-refresh-token', expires_at: 2000000000 };
    const first = sealManagementSession(session), second = sealManagementSession(session);
    assert.notEqual(first, second); assert.ok(!first.includes(session.access_token));
    assert.deepEqual(openManagementSession(first), session);
    const tampered = Buffer.from(first, 'base64url'); tampered[30] ^= 1;
    assert.equal(openManagementSession(tampered.toString('base64url')), null);
    assert.equal(openManagementSession('a'.repeat(3801)), null);
    process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = 'dev'; assert.equal(openManagementSession(first), null);
    delete process.env.AGORAWEAVE_ADMIN_SESSION_KEY;
    assert.throws(() => sealManagementSession(session), /SERVICE_UNAVAILABLE/);
  } finally {
    if (beforeKey === undefined) delete process.env.AGORAWEAVE_ADMIN_SESSION_KEY; else process.env.AGORAWEAVE_ADMIN_SESSION_KEY = beforeKey;
    if (beforeEnv === undefined) delete process.env.AGORAWEAVE_ADMIN_ENVIRONMENT; else process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = beforeEnv;
  }
});

test('AM06: cookies are session-scoped, HttpOnly and Strict, with production host/Secure protection', () => {
  const before = process.env.AGORAWEAVE_ADMIN_ENVIRONMENT;
  try {
    process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = 'production';
    assert.deepEqual(managementCookie(), { name: '__Host-agora-admin', options: { httpOnly: true, secure: true, sameSite: 'strict', path: '/' } });
    process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = 'dev';
    assert.equal(managementCookie().options.secure, false); assert.equal('maxAge' in managementCookie().options, false);
  } finally { if (before === undefined) delete process.env.AGORAWEAVE_ADMIN_ENVIRONMENT; else process.env.AGORAWEAVE_ADMIN_ENVIRONMENT = before; }
});

test('AM07: same-session mutations serialize and a failed action releases coordination', async () => {
  const events: string[] = [];
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const first = serializeManagementSession('synthetic-cookie', async () => { events.push('first'); await gate; throw new Error('fixture failure'); });
  const rejected = assert.rejects(first, /fixture failure/);
  const second = serializeManagementSession('synthetic-cookie', async () => { events.push('second'); return 2; });
  await Promise.resolve(); assert.deepEqual(events, ['first']); release();
  await rejected; assert.equal(await second, 2); assert.deepEqual(events, ['first', 'second']);
});

test('AM08: streamed JSON is bounded by bytes and rejects malformed UTF-8 before parsing', async () => {
  const valid = new Response('{"reason":"修改"}');
  assert.deepEqual(await managementJson(valid, 128), { reason: '修改' });
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) { controller.enqueue(new Uint8Array(10)); controller.enqueue(new Uint8Array(10)); },
    cancel() { cancelled = true; }
  });
  await assert.rejects(managementJson(new Response(stream), 16), /INVALID_INPUT/); assert.equal(cancelled, true);
  await assert.rejects(managementJson(new Response(Uint8Array.from([0x7b, 0xff, 0x7d])), 16));
});
