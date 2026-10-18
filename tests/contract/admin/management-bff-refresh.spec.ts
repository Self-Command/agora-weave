import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import type { CoreSession, Administrator } from '../../../apps/admin/src/features/management/contracts.ts';

const require = createRequire(resolve(process.cwd(), 'package.json'));
const adminRequire = createRequire(resolve(process.cwd(), 'apps/admin/package.json'));
const ts = require('typescript') as typeof import('typescript');
const { NextRequest } = adminRequire('next/server') as { NextRequest: new (input: string, init?: RequestInit) => Request };
const origin = 'http://localhost:3000';
const previous: CoreSession = { access_token: 'synthetic.expired.access', refresh_token: 'synthetic-valid-refresh', expires_at: 1 };
const renewed: CoreSession = { access_token: 'synthetic.renewed.access', refresh_token: 'synthetic-rotated-refresh', expires_at: 2000000000 };
const administrator: Administrator = { account: { id: '00000000-0000-4000-8000-000000000001', phone_masked: '+1***0123' },
  environment: 'test', roles: ['super_admin'], permissions: ['config.read'],
  mfa: { aal: 'aal2', enrolled: true, verified: true }, sensitive_until: null };
const json = (data: unknown, status = 200) => Response.json(status < 400 ? { request_id: crypto.randomUUID(), config_version: 'synthetic-config', data } : data, { status });

function bff(transport: typeof fetch, options: { origin?: string; environment?: string; nodeEnv?: string } = {}) {
  const source = resolve(fileURLToPath(new URL('../../../', import.meta.url)), 'apps/admin/src');
  const cache = new Map<string, Record<string, unknown>>();
  const env = { AGORAWEAVE_ADMIN_CORE_API_URL: 'http://127.0.0.1:8000/functions/v1/core/api/v1',
    NODE_ENV: options.nodeEnv ?? 'development', AGORAWEAVE_ADMIN_ENVIRONMENT: options.environment ?? 'test', AGORAWEAVE_ADMIN_SESSION_KEY: '34'.repeat(32) };
  const load = (file: string): Record<string, unknown> => {
    const full = resolve(file);
    if (!full.startsWith(source + sep)) throw new Error('BFF source outside its explicit scope');
    const previous = cache.get(full); if (previous) return previous;
    const module = { exports: {} as Record<string, unknown> }; cache.set(full, module.exports);
    const imported = (name: string): unknown => {
      if (name === 'next/server') return adminRequire(name);
      if (name === 'node:crypto' || name === 'node:zlib') return require(name);
      if (name.startsWith('.') || name.startsWith('@/')) {
        const base = name.startsWith('@/') ? resolve(source, name.slice(2)) : resolve(dirname(full), name);
        const target = [base, base + '.ts'].find(candidate => existsSync(candidate));
        if (target) return load(target);
      }
      throw new Error('Unexpected management BFF import: ' + name);
    };
    const compiled = ts.transpileModule(readFileSync(full, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022
    } }).outputText;
    // The actual NextRequest/NextResponse, route, crypto, JSON reader and upstream adapter execute.
    // Only deployment configuration and the HTTP transport are isolated fixtures.
    runInNewContext(compiled, { module, exports: module.exports, require: imported,
      process: { env }, Buffer, crypto, fetch: transport, Response, Request, URL, Headers, TextEncoder, TextDecoder, AbortSignal }, { filename: full });
    return module.exports;
  };
  const session = load(resolve(source, 'lib/management-session.ts')) as unknown as {
    sealManagementSession(value: CoreSession): string; openManagementSession(value: string): CoreSession | null;
  };
  const route = load(resolve(source, 'app/api/management/[...path]/route.ts')) as unknown as {
    POST(request: Request, context: { params: Promise<{ path: string[] }> }): Promise<Response>;
  };
  const browserOrigin = options.origin ?? origin;
  const refresh = (body: unknown = {}, headers: Record<string, string> = {}, withCookie = true) => route.POST(new NextRequest(browserOrigin + '/api/management/auth/refresh', {
    method: 'POST', headers: { Origin: browserOrigin, Host: new URL(browserOrigin).host, 'Content-Type': 'application/json', 'X-AgoraWeave-CSRF': '1',
      ...(withCookie ? { Cookie: 'agora-admin=' + session.sealManagementSession(previous) } : {}), ...headers }, body: JSON.stringify(body)
  }), { params: Promise.resolve({ path: ['auth', 'refresh'] }) });
  return { refresh, session };
}

for (const browserOrigin of [origin, 'http://127.0.0.1:3000']) test(`ABR01-${new URL(browserOrigin).hostname}: expired access is omitted during the real BFF refresh flow; renewed identity is rechecked before encrypted-cookie rotation`, async () => {
  const calls: { path: string; method: string | undefined; authorization: string | null; body: unknown }[] = [];
  const transport: typeof fetch = async (url, options) => {
    const path = new URL(String(url)).pathname, headers = new Headers(options?.headers);
    const body = options?.body ? JSON.parse(String(options.body)) : undefined;
    calls.push({ path, method: options?.method, authorization: headers.get('Authorization'), body });
    if (path.endsWith('/auth/refresh')) {
      // This mirrors the core's pre-route principal rejection of an expired bearer.
      if (headers.has('Authorization')) return json({ code: 'SESSION_INVALID', message: 'Expired bearer', retryable: false }, 401);
      assert.deepEqual(body, { refresh_token: previous.refresh_token });
      return json({ session: renewed });
    }
    assert.ok(path.endsWith('/admin/session'));
    assert.equal(headers.get('Authorization'), 'Bearer ' + renewed.access_token);
    return json(administrator);
  };
  const { refresh, session } = bff(transport, { origin: browserOrigin });
  assert.ok(previous.expires_at < Math.floor(Date.now() / 1000));
  const result = await refresh();
  assert.equal(result.status, 200);
  assert.deepEqual(calls.map(call => [call.path, call.method, call.authorization]), [
    ['/functions/v1/core/api/v1/auth/refresh', 'POST', null],
    ['/functions/v1/core/api/v1/admin/session', 'GET', 'Bearer ' + renewed.access_token]
  ]);
  const setCookie = result.headers.get('set-cookie'); assert.ok(setCookie);
  assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=strict/i);
  assert.ok(!setCookie.includes(renewed.access_token)); assert.ok(!setCookie.includes(renewed.refresh_token));
  const encrypted = setCookie.split(';')[0].slice('agora-admin='.length);
  assert.deepEqual(JSON.parse(JSON.stringify(session.openManagementSession(encrypted))), renewed);
  const output = await result.json();
  assert.deepEqual(output.data, { administrator });
  const publicBody = JSON.stringify(output);
  for (const secret of [previous.access_token, previous.refresh_token, renewed.access_token, renewed.refresh_token]) assert.ok(!publicBody.includes(secret));
  assert.equal(result.headers.get('cache-control'), 'no-store');
});

test('ABR02: a failed current-grant recheck prevents a refreshed token from being persisted or returned', async () => {
  const paths: string[] = [];
  const { refresh } = bff(async (url, options) => {
    const path = new URL(String(url)).pathname; paths.push(path);
    if (path.endsWith('/auth/refresh')) { assert.equal(new Headers(options?.headers).has('Authorization'), false); return json({ session: renewed }); }
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer ' + renewed.access_token);
    return json({ code: 'FORBIDDEN', message: 'Current grant removed', retryable: false }, 403);
  });
  const result = await refresh();
  assert.equal(result.status, 403); assert.equal(paths.length, 2); assert.equal(result.headers.get('set-cookie'), null);
  const output = await result.json(); assert.equal(output.code, 'FORBIDDEN'); assert.equal(output.data, undefined);
  assert.ok(!JSON.stringify(output).includes(renewed.access_token)); assert.ok(!JSON.stringify(output).includes(renewed.refresh_token));
});

test('ABR03: browser-selected refresh credentials are rejected before any core request', async () => {
  let calls = 0;
  const { refresh } = bff(async () => { calls++; return json({ session: renewed }); });
  const result = await refresh({ refresh_token: 'browser-chosen-refresh-token' });
  assert.equal(result.status, 422); assert.equal((await result.json()).code, 'INVALID_INPUT');
  assert.equal(calls, 0); assert.equal(result.headers.get('set-cookie'), null);
});

test('ABR04: actual NextRequest raw Host permits local 127 writes to reach session rejection, while wrong ports/forwarded hosts/external origins stay forbidden', async () => {
  let calls = 0;
  const { refresh } = bff(async () => { calls++; return json({ session: renewed }); }, { origin: 'http://127.0.0.1:3000' });
  const admitted = await refresh({}, {}, false);
  assert.equal(admitted.status, 401); assert.equal((await admitted.json()).code, 'SESSION_INVALID');
  const changes: Record<string, string>[] = [{ Host: '127.0.0.1:3001' }, { Origin: 'http://127.0.0.1:3001', Host: '127.0.0.1:3001' },
    { Origin: 'https://127.0.0.1:3000' }, { Origin: 'https://external.invalid', 'X-Forwarded-Host': '127.0.0.1:3000', 'X-Forwarded-Proto': 'http' },
    { Host: 'external.invalid', 'X-Forwarded-Host': '127.0.0.1:3000' }];
  for (const changed of changes) assert.equal((await refresh({}, changed, false)).status, 403, JSON.stringify(changed));
  assert.equal(calls, 0);
});

test('ABR05: production never accepts the development 127-to-localhost origin exception', async () => {
  const { refresh } = bff(async () => { throw new Error('must not reach core'); }, { origin: 'http://127.0.0.1:3000', nodeEnv: 'production' });
  assert.equal((await refresh({}, {}, false)).status, 403);
});
