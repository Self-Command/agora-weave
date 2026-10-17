import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { canPreviewTemplate, requestHostname } from '../../../apps/admin/src/lib/template-preview.mjs';

const preview = { nodeEnv: 'development', enabled: '1', hostname: '127.0.0.1', pathname: '/dashboard/overview', method: 'GET', requestOrigin: 'http://127.0.0.1:3000' };

test('AT06: raw Host is validated before Next normalizes its internal request URL', () => {
  for (const host of ['127.0.0.1:3000', 'localhost:3000', '[::1]:3000']) assert.equal(canPreviewTemplate({ ...preview, hostname: requestHostname(host) }), true);
  for (const host of [null, 'external.example:3000', 'localhost.external.example:3000', 'localhost@external.example', '127.0.0.1/path', 'localhost?host=external.example', 'localhost#fragment', 'localhost,external.example']) {
    assert.equal(canPreviewTemplate({ ...preview, hostname: requestHostname(host) }), false, String(host));
  }
});

test('AT07: real Next encoded chunk names are allowed without opening encoded business or traversal paths', () => {
  for (const pathname of ['/_next/static/chunks/%5Bturbopack%5D_browser.js', '/_next/static/chunks/node_modules_%40base-ui_react.js']) {
    assert.equal(canPreviewTemplate({ ...preview, pathname }), true);
    assert.equal(canPreviewTemplate({ ...preview, pathname, nodeEnv: 'production' }), false);
  }
  for (const pathname of ['/dashboard/%62illing', '/_next/static/%2e%2e/auth/sign-in', '/_next/static/%252e%252e/private', '/_next/static/%5cprivate', '/_next/static/%ZZ', '/_next/static/%2f/auth']) {
    assert.equal(canPreviewTemplate({ ...preview, pathname }), false, pathname);
  }
});

test('AT01: production, omitted opt-in and non-loopback hosts deny every template route', () => {
  for (const pathname of ['/', '/dashboard/overview', '/api/products', '/_next/static/file.js']) {
    for (const override of [{ nodeEnv: 'production' }, { nodeEnv: 'test' }, { enabled: undefined }, { enabled: 'true' }, { hostname: 'admin.example.com' }, { hostname: '127.0.0.1.example.com' }]) {
      assert.equal(canPreviewTemplate({ ...preview, pathname, ...override }), false);
    }
  }
});

test('AT02: local opt-in permits preserved official layout, tables, forms and assets', () => {
  for (const pathname of ['/', '/dashboard', '/dashboard/overview', '/dashboard/product', '/dashboard/product/new', '/dashboard/product/42', '/dashboard/users', '/dashboard/forms/basic', '/dashboard/kanban', '/dashboard/chat', '/dashboard/ai-chat', '/dashboard/notifications', '/_next/static/chunk.js', '/_next/image', '/favicon.ico']) {
    assert.equal(canPreviewTemplate({ ...preview, pathname }), true, pathname);
  }
});

test('AT03: Clerk, external API example, real management and unknown routes remain denied', () => {
  for (const pathname of ['/auth/sign-in', '/auth/sign-up', '/dashboard/profile', '/dashboard/workspaces', '/dashboard/workspaces/team', '/dashboard/billing', '/dashboard/exclusive', '/dashboard/react-query', '/monitoring', '/api/admin', '/api/auth', '/admin/accounts', '/dashboard/unknown', '/dashboard/%62illing', '//dashboard/overview']) {
    assert.equal(canPreviewTemplate({ ...preview, pathname }), false, pathname);
  }
});

test('AT04: synthetic writes require same Origin and reject cross-site and arbitrary methods', () => {
  for (const method of ['POST', 'PUT', 'DELETE']) {
    assert.equal(canPreviewTemplate({ ...preview, pathname: '/api/products/42', method }), false);
    assert.equal(canPreviewTemplate({ ...preview, pathname: '/api/products/42', method, origin: preview.requestOrigin }), true);
    assert.equal(canPreviewTemplate({ ...preview, pathname: '/api/products/42', method, origin: 'https://external.example' }), false);
  }
  assert.equal(canPreviewTemplate({ ...preview, fetchSite: 'cross-site' }), false);
  assert.equal(canPreviewTemplate({ ...preview, origin: 'https://external.example' }), false);
  assert.equal(canPreviewTemplate({ ...preview, method: 'POST', origin: preview.requestOrigin }), false);
  assert.equal(canPreviewTemplate({ ...preview, pathname: '/api/products', method: 'TRACE', origin: preview.requestOrigin }), false);
});

test('AT05: all 582 pinned upstream files retain their original bytes and source mapping', () => {
  const base = new URL('../../../apps/admin/', import.meta.url);
  const source = JSON.parse(readFileSync(new URL('upstream-metadata/source-map.json', base), 'utf8')) as {
    commit: string;
    files: Array<{ upstream_path: string; imported_path: string; original_path?: string; upstream_sha256: string }>;
  };
  assert.equal(source.commit, '7705dfc0d13889e45c26a55ad5908da6a7a9a605');
  assert.equal(source.files.length, 582);
  assert.equal(new Set(source.files.map(file => file.upstream_path)).size, 582);
  for (const file of source.files) {
    const original = file.original_path ?? file.imported_path;
    assert.ok(!original.split('/').includes('..') && !original.startsWith('/'));
    assert.equal(createHash('sha256').update(readFileSync(new URL(original, base))).digest('hex'), file.upstream_sha256, file.upstream_path);
  }
});
