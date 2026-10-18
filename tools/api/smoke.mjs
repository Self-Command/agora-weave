import process from 'node:process';
import console from 'node:console';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const surfaces = [
  { name: 'app', port: 4110, path: '/core/api/v1/feeds/latest', headers: { 'X-Client-Release': '0.0.0' } },
  { name: 'admin', port: 4111, path: '/api/management/admin/session', headers: { cookie: 'agora-admin=synthetic-mock-only' } },
  { name: 'core-admin', port: 4112, path: '/core/api/v1/admin/session', headers: { authorization: 'Bearer synthetic-mock-only' } }
];
const children = [], results = [];
async function waitFor(item, child) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('Prism exited before readiness: ' + item.name);
    try {
      const response = await globalThis.fetch(`http://127.0.0.1:${item.port}${item.path}`, { headers: item.headers, signal: globalThis.AbortSignal.timeout(2000) });
      if (response.status === 200) return response;
    } catch { /* Wait only for the process started by this check. */ }
    await delay(300);
  }
  throw new Error('Prism readiness timed out: ' + item.name);
}
try {
  for (const item of surfaces) {
    const child = spawn(process.execPath, [resolve(root, 'tools/api/contracts.mjs'), 'mock', '--surface', item.name, '--port', String(item.port)],
      { cwd: root, stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    let errors = '';
    child.stderr.on('data', part => { errors = (errors + part.toString()).slice(-4096); });
    children.push(child);
    const response = await waitFor(item, child).catch(error => { throw new Error(error.message + ': ' + errors); });
    const body = await response.json();
    assert.ok(body && typeof body.request_id === 'string' && typeof body.config_version === 'string' && body.data);
    results.push({ surface: item.name, status: response.status, path: item.path });
  }
  const invalid = await globalThis.fetch('http://127.0.0.1:4110/core/api/v1/feeds/latest?limit=abc', { headers: surfaces[0].headers });
  assert.equal(invalid.status, 422);
  results.push({ surface: 'app', invalid_limit_status: invalid.status });
  if (process.argv.includes('--specmatic')) {
    const url = process.platform === 'linux' ? 'http://127.0.0.1:4110/core/api/v1' : 'http://host.docker.internal:4110/core/api/v1';
    const args = [resolve(root, 'tools/api/contracts.mjs'), 'verify', '--surface', 'app', '--base-url', url,
      '--operations', 'listLatestPosts', '--filter', "STATUS='200'", '--provider', 'mock', '--anonymous', '--client-release', 'fixture-v1',
      ...(process.platform === 'linux' ? ['--network', 'host'] : [])];
    await new Promise((accept, reject) => {
      const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', windowsHide: true });
      children.push(child);
      child.once('error', reject);
      child.once('exit', code => code === 0 ? accept() : reject(new Error('Mock interoperability check failed')));
    });
    results.push({ tool: 'Specmatic', provider: 'mock', scope: 'tool-interoperability-only', state: 'passed' });
  }
  const directory = process.platform === 'win32'
    ? resolve(JSON.parse(readFileSync(resolve(root, 'infra/development/policy.json'), 'utf8')).runtime_root, 'reports/api-contracts')
    : resolve(root, 'check-output/api');
  mkdirSync(directory, { recursive: true });
  const result = { provider: 'mock', scope: 'tool-interoperability-only', state: 'passed', results };
  writeFileSync(resolve(directory, 'mock-smoke.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  for (const child of children) if (child.exitCode === null) {
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGTERM');
  }
}
