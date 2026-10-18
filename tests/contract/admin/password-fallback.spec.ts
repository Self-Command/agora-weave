import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, sep } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const require = createRequire(resolve(process.cwd(), 'package.json'));
const adminRequire = createRequire(resolve(process.cwd(), 'apps/admin/package.json'));
const ts = require('typescript') as typeof import('typescript');
const { NextRequest } = adminRequire('next/server') as { NextRequest: new (input: string, init?: RequestInit) => Request };
const origin = 'http://localhost:3000', bffKey = '56'.repeat(32), operation = '00000000-0000-4000-8000-000000000041';
const syntheticPassword = 'synthetic-password-1234';
const session = { access_token: 'synthetic.password.access', refresh_token: 'synthetic-password-refresh', expires_at: 2000000000 };
const administrator = { account: { id: '00000000-0000-4000-8000-000000000001', phone_masked: '+1***0123' },
  environment: 'test', roles: ['super_admin'], permissions: [], mfa: { aal: 'aal1', enrolled: true, verified: false }, sensitive_until: null };
const json = (data: unknown, status = 200) => Response.json(status < 400 ? { request_id: crypto.randomUUID(), data } : data, { status });

function bff(transport: typeof fetch, missingKey = false) {
  const source = resolve(fileURLToPath(new URL('../../../', import.meta.url)), 'apps/admin/src'), cache = new Map<string, Record<string, unknown>>();
  const env: Record<string, string | undefined> = { AGORAWEAVE_ADMIN_CORE_API_URL: 'http://127.0.0.1:8000/functions/v1/core/api/v1',
    NODE_ENV: 'development', AGORAWEAVE_ADMIN_ENVIRONMENT: 'test', AGORAWEAVE_ADMIN_SESSION_KEY: '34'.repeat(32),
    AGORAWEAVE_ADMIN_PASSWORD_BFF_KEY: missingKey ? undefined : bffKey };
  const load = (file: string): Record<string, unknown> => {
    const full = resolve(file); if (!full.startsWith(source + sep)) throw new Error('Outside BFF source');
    const prior = cache.get(full); if (prior) return prior;
    const module = { exports: {} as Record<string, unknown> }; cache.set(full, module.exports);
    const imported = (name: string): unknown => {
      if (name === 'next/server') return adminRequire(name);
      if (name === 'node:crypto') {
        const real = require(name) as typeof import('node:crypto');
        return { ...real, randomInt: (min: number, max: number) => max === 1000000 ? 123456 : real.randomInt(min, max) };
      }
      if (name === 'node:zlib') return require(name);
      if (name.startsWith('.') || name.startsWith('@/')) {
        const base = name.startsWith('@/') ? resolve(source, name.slice(2)) : resolve(dirname(full), name);
        const target = [base, base + '.ts'].find(candidate => existsSync(candidate)); if (target) return load(target);
      }
      throw new Error('Unexpected BFF import: ' + name);
    };
    const compiled = ts.transpileModule(readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    runInNewContext(compiled, { module, exports: module.exports, require: imported, process: { env }, Buffer, crypto,
      fetch: transport, Response, Request, URL, Headers, TextEncoder, TextDecoder, AbortSignal }, { filename: full });
    return module.exports;
  };
  const route = load(resolve(source, 'app/api/management/[...path]/route.ts')) as unknown as {
    POST(request: Request, context: { params: Promise<{ path: string[] }> }): Promise<Response>;
  };
  const helper = load(resolve(source, 'lib/management-password.ts')) as unknown as {
    verifyPasswordCaptcha(cookie: string, id: string, answer: string): boolean;
  };
  const post = (path: string, body: unknown, cookie?: string, headers: Record<string, string> = {}, query = '') => route.POST(new NextRequest(origin + '/api/management' + path + query, {
    method: 'POST', headers: { Origin: origin, Host: 'localhost:3000', 'Content-Type': 'application/json', 'X-AgoraWeave-CSRF': '1',
      ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: JSON.stringify(body)
  }), { params: Promise.resolve({ path: path.slice(1).split('/') }) });
  return { post, env, helper };
}

async function challenge(client: ReturnType<typeof bff>) {
  const result = await client.post('/auth/password/captcha', {}); assert.equal(result.status, 200);
  const { data } = await result.json() as { data: { captcha_id: string; image_data_url: string; expires_at: string } };
  const cookie = result.headers.get('set-cookie')!.split(';')[0];
  return { result, data, cookie, input: { username: 'synthetic.admin', password: syntheticPassword, captcha_id: data.captcha_id, captcha_answer: '123456', operation_id: operation } };
}

function signed(path: string, options?: RequestInit) {
  const headers = new Headers(options?.headers), timestamp = headers.get('X-Admin-Password-Time'), nonce = headers.get('X-Admin-Password-Nonce');
  assert.match(timestamp!, /^\d+$/); assert.ok(Math.abs(Number(timestamp) - Math.floor(Date.now() / 1000)) < 10); assert.match(nonce!, /^[a-f0-9-]{36}$/);
  const digest = createHash('sha256').update(String(options?.body)).digest('hex');
  assert.equal(headers.get('X-Admin-Password-Signature'), createHmac('sha256', Buffer.from(bffKey, 'hex')).update(`${timestamp}\n${nonce}\nPOST\n${path}\n${digest}`).digest('hex'));
  assert.equal(headers.has('Authorization'), false);
  return JSON.parse(String(options?.body)) as Record<string, unknown>;
}

test('AP01: captcha is a real PNG with an authenticated HttpOnly cookie; registration receives only signed id/expiry', async () => {
  let registration: Record<string, unknown> | undefined;
  const client = bff(async (url, options) => { assert.ok(String(url).endsWith('/auth/password/captcha')); registration = signed('/auth/password/captcha', options); return json({}); });
  const { result, data, cookie } = await challenge(client);
  assert.deepEqual(Object.keys(data).sort(), ['captcha_id', 'expires_at', 'image_data_url']);
  assert.deepEqual(registration, { captcha_id: data.captcha_id, expires_at: data.expires_at });
  assert.match(data.image_data_url, /^data:image\/png;base64,/); const png = Buffer.from(data.image_data_url.split(',')[1], 'base64');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a'); assert.equal(png.readUInt32BE(16), 184); assert.equal(png.readUInt32BE(20), 64);
  assert.match(result.headers.get('set-cookie')!, /HttpOnly/i); assert.match(result.headers.get('set-cookie')!, /SameSite=strict/i);
  assert.equal(result.headers.get('cache-control'), 'no-store'); assert.ok(!cookie.includes('123456')); assert.ok(!JSON.stringify(data).includes(bffKey));
  assert.equal(client.helper.verifyPasswordCaptcha(cookie.split('=')[1], data.captcha_id, '123456'), true);
});

test('AP02: successful official password session is rechecked and encrypted; aal1 is preserved for the MFA guide', async () => {
  const calls: string[] = [];
  const client = bff(async (url, options) => {
    const path = new URL(String(url)).pathname.replace('/functions/v1/core/api/v1', ''); calls.push(path);
    if (path === '/auth/password/captcha') { signed(path, options); return json({}); }
    if (path === '/auth/password') { const body = signed(path, options); assert.deepEqual(body, { username: 'synthetic.admin', captcha_id: body.captcha_id, operation_id: operation, captcha_valid: true, password: syntheticPassword }); return json({ session }); }
    assert.equal(path, '/admin/session'); assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer ' + session.access_token); return json(administrator);
  });
  const { input, cookie } = await challenge(client), result = await client.post('/auth/password', input, cookie), output = await result.json();
  assert.equal(result.status, 200); assert.deepEqual(output.data, { administrator }); assert.deepEqual(calls, ['/auth/password/captcha', '/auth/password', '/admin/session']);
  assert.match(result.headers.get('set-cookie')!, /agora-admin=/); assert.match(result.headers.get('set-cookie')!, /agora-admin-captcha=;/);
  for (const secret of [session.access_token, session.refresh_token, syntheticPassword, bffKey]) assert.ok(!JSON.stringify(output).includes(secret) && !result.headers.get('set-cookie')!.includes(secret));
});

test('AP03: a wrong answer still reaches durable core consumption without a password and clears the captcha cookie', async () => {
  const client = bff(async (url, options) => {
    const path = new URL(String(url)).pathname.replace('/functions/v1/core/api/v1', ''), body = signed(path, options);
    if (path === '/auth/password/captcha') return json({});
    assert.equal(path, '/auth/password'); assert.equal(body.captcha_valid, false); assert.equal('password' in body, false); assert.equal('captcha_answer' in body, false);
    return json({ code: 'AUTH_FAILED', message: 'Rejected', retryable: false }, 401);
  });
  const { input, cookie } = await challenge(client), result = await client.post('/auth/password', { ...input, captcha_answer: '654321' }, cookie);
  assert.equal(result.status, 401); assert.equal((await result.json()).code, 'AUTH_FAILED'); assert.match(result.headers.get('set-cookie')!, /Max-Age=0/);
});

test('AP04: all three password endpoints enforce origin, CSRF, method-specific strict JSON and query allowlists before upstream', async () => {
  let calls = 0; const client = bff(async () => { calls++; return json({}); });
  const input = { username: 'synthetic.admin', password: syntheticPassword, captcha_id: operation, captcha_answer: '123456', operation_id: operation };
  for (const path of ['/auth/password/captcha', '/auth/password', '/auth/password/forgot']) {
    const body: Record<string, unknown> = path.endsWith('/captcha') ? {} : path.endsWith('/forgot') ? { ...input } : input;
    if (path.endsWith('/forgot')) delete body.password;
    assert.equal((await client.post(path, body, undefined, { Origin: 'https://external.invalid' })).status, 403);
    assert.equal((await client.post(path, body, undefined, { 'X-AgoraWeave-CSRF': '' })).status, 403);
    assert.equal((await client.post(path, { ...body, target: 'external.invalid' })).status, 422);
    assert.equal((await client.post(path, body, undefined, {}, '?target=external')).status, 422);
  }
  assert.equal(calls, 0);
});

test('AP05: missing BFF signing configuration fails closed without issuing a captcha or reaching upstream', async () => {
  let calls = 0; const client = bff(async () => { calls++; return json({}); }, true), result = await client.post('/auth/password/captcha', {});
  assert.equal(result.status, 503); assert.equal((await result.json()).code, 'SERVICE_UNAVAILABLE'); assert.equal(result.headers.get('set-cookie'), null); assert.equal(calls, 0);
});

test('AP06: forgot returns generic acceptance, consumes server-validated captcha, and makes no delivery or session claim', async () => {
  const client = bff(async (url, options) => {
    const path = new URL(String(url)).pathname.replace('/functions/v1/core/api/v1', ''), body = signed(path, options);
    if (path.endsWith('/captcha')) return json({});
    assert.equal(path, '/auth/password/forgot'); assert.equal(body.captcha_valid, true); assert.equal('password' in body, false); assert.equal('captcha_answer' in body, false);
    return json({ accepted: true });
  });
  const { input, cookie } = await challenge(client); const forgot: Record<string, unknown> = { ...input }; delete forgot.password;
  const result = await client.post('/auth/password/forgot', forgot, cookie), output = await result.json();
  assert.equal(result.status, 200); assert.deepEqual(output.data, { accepted: true }); assert.ok(!JSON.stringify(output).includes('sent')); assert.ok(!/agora-admin=/.test(result.headers.get('set-cookie')!));
});

test('AP07: authenticated captcha cookie rejects tampering, a different id, malformed answers and another environment', async () => {
  const client = bff(async () => json({})), { data, cookie } = await challenge(client), value = cookie.split('=')[1];
  const tampered = Buffer.from(value, 'base64url'); tampered[30] ^= 1;
  assert.equal(client.helper.verifyPasswordCaptcha(tampered.toString('base64url'), data.captcha_id, '123456'), false);
  assert.equal(client.helper.verifyPasswordCaptcha(value, operation, '123456'), false);
  assert.equal(client.helper.verifyPasswordCaptcha(value, data.captcha_id, '12345'), false);
  client.env.AGORAWEAVE_ADMIN_ENVIRONMENT = 'dev'; assert.equal(client.helper.verifyPasswordCaptcha(value, data.captcha_id, '123456'), false);
});

test('AP08: a current-grant denial prevents password session persistence and public token disclosure', async () => {
  const client = bff(async url => {
    const path = new URL(String(url)).pathname;
    if (path.endsWith('/captcha')) return json({}); if (path.endsWith('/auth/password')) return json({ session });
    return json({ code: 'FORBIDDEN', message: 'Grant revoked', retryable: false }, 403);
  });
  const { input, cookie } = await challenge(client), result = await client.post('/auth/password', input, cookie), output = await result.json();
  assert.equal(result.status, 403); assert.equal(output.data, undefined); assert.ok(!JSON.stringify(output).includes(session.access_token));
  assert.ok(!/agora-admin=[^;]/.test(result.headers.get('set-cookie')!));
});
