import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:net';
import { assertSourceAvailable, dependencyCheck, endpointReady, main, parseContainers, processReady, validateRuntimeConfig, waitUntil } from '../../../tools/dev/local-services.mjs';
import { ownedProcess, processInventory, startProcess, stopProcess } from '../../../tools/dev/local-process.mjs';

test('LD01: source or branch switching cannot overwrite active Node or Supabase runtime; incremental same-source sync can proceed', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-development-source-'));
  try {
    const directory = join(root, '.agoraweave/local/dev/development'); mkdirSync(directory, { recursive: true });
    const entry = { pid: 41, creation: 'actual-created', config: 'private-config.json' };
    writeFileSync(join(directory, 'state.json'), JSON.stringify({ source: 'original', branch: 'current', processes: { admin: entry } }));
    const inventory = [{ ProcessId: 41, CreationDate: 'actual-created', CommandLine: 'node local-process.mjs private-config.json' }];
    const identity = { source: 'original', branch: 'next', head: 'next-head' };
    const previous = { source: 'original', source_branch: 'current', source_head: 'current-head' };
    assert.throws(() => assertSourceAvailable(root, identity, previous, { processes: () => inventory }), /Active development processes/);
    // A recycled PID is never adopted or killed.
    assert.equal(ownedProcess(entry, [{ ...inventory[0], CreationDate: 'recycled' }]), undefined);
    const runtime = join(root, '.agoraweave/local/dev/runtime'); mkdirSync(runtime, { recursive: true });
    writeFileSync(join(runtime, 'identity.json'), JSON.stringify({ project: 'existing-project' }));
    assert.throws(() => assertSourceAvailable(root, identity, previous, { processes: () => [], containers: () => 'container-id' }), /Active Supabase/);
    assert.throws(() => assertSourceAvailable(root, identity, previous, { processes: () => [], containers: () => { throw new Error('offline'); } }), /Cannot verify/);
    assert.doesNotThrow(() => assertSourceAvailable(root, identity, previous, { processes: () => [], containers: () => '' }));
    assert.doesNotThrow(() => assertSourceAvailable(root, { ...identity, branch: 'current' }, previous,
      { processes: () => inventory, containers: () => { throw new Error('same source must not query or stop Docker'); } }));
    assert.equal(existsSync(join(directory, 'state.json')), true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('LD05: repeated Up reuses a ready managed process and Stop preserves private files', { skip: process.platform !== 'win32', timeout: 60000 }, async () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-development-up-'));
  const original = process.cwd();
  try {
    mkdirSync(join(root, 'apps/admin'), { recursive: true });
    mkdirSync(join(root, 'node_modules/next'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'synthetic-local-up', private: true, workspaces: ['apps/*'] }));
    writeFileSync(join(root, 'apps/admin/package.json'), JSON.stringify({ name: 'synthetic-admin', scripts: { dev: 'node ../../fixture-server.mjs' } }));
    writeFileSync(join(root, 'node_modules/next/package.json'), JSON.stringify({ name: 'next', version: '0.0.0' }));
    const lock = { packages: { 'node_modules/next': { version: '0.0.0' } } };
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify(lock));
    writeFileSync(join(root, 'node_modules/.package-lock.json'), JSON.stringify(lock));
    writeFileSync(join(root, 'fixture-server.mjs'), "import {createServer} from 'node:http';createServer((q,r)=>r.end('synthetic ready')).listen(Number(process.argv.at(-1)),'127.0.0.1');");
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', 'package.json'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Synthetic fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture'], { cwd: root });
    const reservation = createServer();
    await new Promise<void>(done => reservation.listen(0, '127.0.0.1', done));
    const address = reservation.address(); assert.ok(address && typeof address !== 'string');
    const port = address.port;
    await new Promise<void>(done => reservation.close(() => done()));
    const options = { action: 'up', source: root, workspace: root, environment: 'dev', services: ['admin'], adminPort: port, timeout: 15 };
    await main(options);
    const stateFile = join(root, '.agoraweave/local/dev/development/state.json');
    const first = JSON.parse(readFileSync(stateFile, 'utf8')).processes.admin;
    await main(options);
    const second = JSON.parse(readFileSync(stateFile, 'utf8')).processes.admin;
    assert.equal(second.pid, first.pid); assert.equal(second.config, first.config);
    await main({ ...options, action: 'status' });
    await main({ ...options, action: 'stop' });
    assert.equal(ownedProcess(first), undefined);
    assert.equal(existsSync(first.config), true); assert.equal(existsSync(first.stdout), true);
  } finally {
    const state = join(root, '.agoraweave/local/dev/development/state.json');
    if (existsSync(state)) for (const entry of Object.values(JSON.parse(readFileSync(state, 'utf8')).processes)) stopProcess(entry);
    process.chdir(original);
    rmSync(root, { recursive: true, force: true });
  }
});

test('LD06: public PowerShell action collection preserves a one-item array for every service action', { skip: process.platform !== 'win32' }, () => {
  const source = readFileSync(resolve('tools/dev/local.ps1'), 'utf8');
  const start = source.indexOf('$taskActions ='), end = source.indexOf('if (@($taskActions).Count', start);
  assert.ok(start >= 0 && end > start);
  const actualAssignment = source.slice(start, end);
  for (const name of ['Up', 'Status', 'Logs', 'Stop']) {
    const flags = ['Up', 'Status', 'Logs', 'Stop'].map(value => `$${value}=$${value === name ? 'true' : 'false'};`).join('');
    const result = execFileSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', flags + actualAssignment +
      'ConvertTo-Json -Compress @{ count=@($taskActions).Count; action=$taskActions[0].Name }'], { encoding: 'utf8', windowsHide: true });
    assert.deepEqual(JSON.parse(result), { count: 1, action: name.toLowerCase() });
  }
});

test('LD02: readiness requires the verified process tree to own the port; Compose parsing preserves exposure checks', () => {
  const entry = { pid: 41, creation: 'actual', config: 'fixture.json', port: 3000 };
  const inventory = [{ ProcessId: 41, CreationDate: 'actual', CommandLine: 'node local-process.mjs fixture.json', ParentProcessId: 1 },
    { ProcessId: 42, ParentProcessId: 41 }, { ProcessId: 43, ParentProcessId: 42 }];
  assert.equal(processReady(entry, inventory, [43]), true);
  assert.equal(processReady(entry, inventory, [99]), false);
  assert.equal(processReady(entry, inventory, []), false);
  assert.equal(processReady({ ...entry, creation: 'recycled' }, inventory, [43]), false);
  assert.deepEqual(parseContainers(''), []);
  assert.deepEqual(parseContainers('{"Service":"db"}\n{"Service":"auth"}'), [{ Service: 'db' }, { Service: 'auth' }]);
  assert.deepEqual(parseContainers('[{"Service":"db"}]'), [{ Service: 'db' }]);
  const services = Object.fromEntries(Array.from({ length: 11 }, (_, i) => ['service' + i,
    { container_name: 'existing-service' + i, image: 'official@sha256:' + 'a'.repeat(64), ports: [] }]));
  const config = { networks: { default: { internal: true } }, services };
  assert.doesNotThrow(() => validateRuntimeConfig({ project: 'existing' }, config));
  assert.throws(() => validateRuntimeConfig({ project: 'existing' }, { ...config, networks: { default: { internal: false } } }), /fixed internal/);
  services.service0.ports.push({ target: 5432 } as never);
  assert.throws(() => validateRuntimeConfig({ project: 'existing' }, config), /without published ports/);
});

test('LD03: dependency drift reports an explicit installation action without replacing files', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-development-dependencies-'));
  try {
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ packages: { 'node_modules/next': { version: '16.2.12' } } }));
    assert.throws(() => dependencyCheck(root, ['admin']), /dependencies are missing.*-Install/);
    mkdirSync(join(root, 'node_modules/next'), { recursive: true });
    const installed = join(root, 'node_modules/.package-lock.json');
    writeFileSync(installed, JSON.stringify({ packages: { 'node_modules/next': { version: '0.0.0' } } }));
    const before = readFileSync(installed, 'utf8');
    assert.throws(() => dependencyCheck(root, ['admin']), /differ from package-lock.json.*-Install/);
    assert.equal(readFileSync(installed, 'utf8'), before);
    assert.doesNotThrow(() => dependencyCheck(root, ['supabase']));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('LD04: Windows hidden runner supports real HTTP readiness, reused ownership and safe owned-tree stop', { skip: process.platform !== 'win32', timeout: 60000 }, async () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-development-process-'));
  let entry: ReturnType<typeof startProcess> | undefined;
  try {
    const child = join(root, 'fixture-server.mjs');
    // Ephemeral loopback port and synthetic payload; no shared runtime, DB, Metro or product service.
    const portFile = join(root, 'port.txt');
    writeFileSync(child, "import {createServer} from 'node:http'; import {writeFileSync} from 'node:fs'; const server=createServer((q,r)=>{r.end('packager-status:running')}); server.listen(0,'127.0.0.1',()=>writeFileSync(process.argv[2],String(server.address().port)));");
    const config = join(root, 'private-config.json');
    writeFileSync(config, JSON.stringify({ executable: process.execPath, args: [child, portFile], cwd: root, env: {} }));
    entry = startProcess(config, join(root, 'stdout.log'), join(root, 'stderr.log'));
    await waitUntil(() => existsSync(portFile), 10, 'Synthetic loopback service');
    const port = Number(readFileSync(portFile, 'utf8'));
    const managed = { ...entry, service: 'metro', port, url: `http://127.0.0.1:${port}/status` };
    assert.equal(await endpointReady(managed), true);
    assert.equal(ownedProcess(entry, processInventory())?.ProcessId, entry.pid);
    assert.equal(await endpointReady({ ...managed, service: 'metro', url: `http://127.0.0.1:${port + 1}/status` }), false);
    assert.equal(stopProcess({ ...entry, creation: 'wrong-process-creation' }), false);
    assert.equal(await endpointReady(managed), true, 'identity mismatch must leave the real service alive');
    assert.equal(stopProcess(entry), true);
    await waitUntil(() => !ownedProcess(entry), 10, 'Synthetic runner shutdown');
    assert.equal(await endpointReady(managed), false);
    assert.equal(stopProcess(entry), false);
  } finally {
    if (entry) stopProcess(entry);
    rmSync(root, { recursive: true, force: true });
  }
});
