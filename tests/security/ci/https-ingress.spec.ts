import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createIngress, deriveIngressToken, type IngressIdentity } from '../../../tools/ci/https-ingress.ts';

const seed = 'synthetic-nonproduction-seed-'.repeat(3);
const identity: IngressIdentity = { run_id: '12345', attempt: 1, target_sha: 'a'.repeat(40), environment: 'test' };
async function listen(server: Server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return `http://127.0.0.1:${address.port}`;
}
async function close(server: Server) {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
async function fixture(run: (base: string, hits: string[], advance: () => void) => Promise<void>) {
  const hits: string[] = [];
  const upstream = createServer((request, response) => {
    hits.push(request.url || '');
    response.setHeader('content-type', 'application/json');
    response.end('{"name":"GoTrue","version":"synthetic-upstream"}');
  });
  const origin = await listen(upstream);
  let currentTime = 1000;
  const ingress = createIngress({ seed, identity, upstream: origin, expires_at: 2000, now: () => currentTime });
  const base = await listen(ingress);
  try { await run(base, hits, () => { currentTime = 2001; }); }
  finally { await close(ingress); await close(upstream); }
}

test('HG01: ephemeral identity binds environment, run, attempt and commit without accepting a weak seed', () => {
  const token = deriveIngressToken(seed, identity);
  assert.match(token, /^[a-f0-9]{64}$/);
  for (const patch of [{ environment: 'dev' as const }, { run_id: '12346' }, { attempt: 2 }, { target_sha: 'b'.repeat(40) }]) {
    assert.notEqual(deriveIngressToken(seed, { ...identity, ...patch }), token);
  }
  assert.throws(() => deriveIngressToken('', identity));
});

test('HG02: authorized HTTP ingress forwards only the real allowed health route and preserves its bytes', async () => {
  await fixture(async (base, hits) => {
    const response = await fetch(base + '/auth/v1/health', { headers: { authorization: 'Bearer ' + deriveIngressToken(seed, identity) } });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { name: 'GoTrue', version: 'synthetic-upstream' });
    assert.deepEqual(hits, ['/health']);
  });
});

test('HG03: absent, forged, other environment and previous run credentials never reach the upstream', async () => {
  await fixture(async (base, hits) => {
    for (const credential of ['', 'Bearer synthetic-forged', 'Bearer ' + deriveIngressToken(seed, { ...identity, environment: 'dev' }),
      'Bearer ' + deriveIngressToken(seed, { ...identity, run_id: '12344' })]) {
      assert.equal((await fetch(base + '/auth/v1/health', { headers: { authorization: credential } })).status, 401);
    }
    assert.deepEqual(hits, []);
  });
});

test('HG04: private paths, query secrets and writes are rejected even with the current valid identity', async () => {
  await fixture(async (base, hits) => {
    const headers = { authorization: 'Bearer ' + deriveIngressToken(seed, identity) };
    for (const route of ['/studio', '/rest/v1/users', '/auth/v1/admin', '/auth/v1/health?token=synthetic']) {
      assert.equal((await fetch(base + route, { headers })).status, 404);
    }
    assert.equal((await fetch(base + '/auth/v1/health', { method: 'POST', headers })).status, 405);
    assert.deepEqual(hits, []);
  });
});

test('HG05: expiry ends access and response metadata exposes no reusable authentication material', async () => {
  await fixture(async (base, hits, advance) => {
    const token = deriveIngressToken(seed, identity);
    const headers = { authorization: 'Bearer ' + token };
    const before = await fetch(base + '/auth/v1/health', { headers });
    assert.equal(before.status, 200);
    assert.equal(before.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(JSON.stringify([...before.headers]) + await before.text(), new RegExp(token));
    advance();
    assert.equal((await fetch(base + '/auth/v1/health', { headers })).status, 401);
    assert.deepEqual(hits, ['/health']);
  });
});
