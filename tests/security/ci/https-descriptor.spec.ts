import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateHttpsDescriptor } from '../../../tools/ci/https-descriptor.ts';
import type { IngressIdentity } from '../../../tools/ci/https-ingress.ts';

const identity: IngressIdentity = { run_id: '4242', attempt: 1, target_sha: 'a'.repeat(40), environment: 'dev' };
const descriptor = { ...identity, schema_version: 1, source: 'github-actions', runner_environment: 'github-hosted',
  url: 'https://synthetic-test.trycloudflare.com', started_at: 1000, expires_at: 1000 + 75 * 60000 };

test('HD01: only current authenticated temporary HTTPS metadata can be consumed by a native runner', () => {
  assert.equal(validateHttpsDescriptor(descriptor, identity, 2000), true);
  for (const patch of [{ run_id: '4241' }, { attempt: 2 }, { target_sha: 'b'.repeat(40) }, { environment: 'test' },
    { source: 'local' }, { runner_environment: 'self-hosted' }, { schema_version: 9 }]) {
    assert.equal(validateHttpsDescriptor({ ...descriptor, ...patch }, identity, 2000), false);
  }
});

test('HD02: expiry, overlong lifetime and secret-bearing or nonprovider URLs cannot enter a client config', () => {
  assert.equal(validateHttpsDescriptor(descriptor, identity, descriptor.expires_at), false);
  for (const patch of [{ expires_at: descriptor.expires_at + 1 }, { started_at: 3000 }, { expires_at: 1000 },
    { url: 'http://synthetic-test.trycloudflare.com' }, { url: 'https://example.org' },
    { url: 'https://synthetic-test.trycloudflare.com/path' }, { url: descriptor.url + '?token=synthetic' },
    { url: 'https://user:password@synthetic-test.trycloudflare.com' }, { token: 'synthetic-secret' }]) {
    assert.equal(validateHttpsDescriptor({ ...descriptor, ...patch }, identity, 2000), false);
  }
});
