import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { setTimeout } from 'node:timers';
import { pathToFileURL } from 'node:url';
import { ownedProcess, processInventory, descendants, powershell, startProcess, stopProcess } from './local-process.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(readFileSync(file, 'utf8'));
const write = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 });
export const parseContainers = text => !text.trim() ? [] : text.trim().startsWith('[') ? JSON.parse(text) : text.trim().split(/\r?\n/).map(line => JSON.parse(line));
export function sourceIdentity(source) {
  const git = args => execFileSync('git', args, { cwd: source, encoding: 'utf8', windowsHide: true }).trim();
  return { source: resolve(source), branch: git(['rev-parse', '--abbrev-ref', 'HEAD']), head: git(['rev-parse', 'HEAD']) };
}
export function assertSourceAvailable(workspace, identity, previous, inspect = {}) {
  const inventories = inspect.processes ?? processInventory;
  const containers = inspect.containers ?? (project => execFileSync('docker', ['ps', '-q', '--filter', `label=com.docker.compose.project=${project}`],
    { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }).trim());
  const stateFiles = ['dev', 'test'].map(environment => resolve(workspace, '.agoraweave/local', environment, 'development/state.json'));
  for (const file of stateFiles.filter(existsSync)) {
    const state = read(file);
    if (state.source !== identity.source || state.branch !== identity.branch) {
      const inventory = inventories();
      if (Object.values(state.processes ?? {}).some(entry => ownedProcess(entry, inventory))) {
        throw new Error('Active development processes belong to another source/branch. Stop them from that source before syncing');
      }
    }
  }
  const switching = previous && (previous.source !== identity.source ||
    (previous.source_branch ? previous.source_branch !== identity.branch : previous.source_head !== identity.head));
  if (!switching) return;
  for (const environment of ['dev', 'test']) {
    const file = resolve(workspace, '.agoraweave/local', environment, 'runtime/identity.json');
    if (!existsSync(file)) continue;
    let active;
    try { active = containers(read(file).project); }
    catch { throw new Error('Cannot verify the existing Docker stack is stopped before source/branch switching; start Docker Desktop and retry'); }
    if (active) throw new Error('Active Supabase containers bind the current runtime source. Stop them from the current source before switching');
  }
}
export function dependencyCheck(workspace, services) {
  if (!services.some(name => ['admin', 'metro'].includes(name))) return;
  const fail = message => { throw new Error(message + '. Run tools/dev/local.ps1 -Install explicitly, then retry -Up'); };
  const lock = read(resolve(workspace, 'package-lock.json'));
  const installedPath = resolve(workspace, 'node_modules/.package-lock.json');
  if (!existsSync(installedPath)) fail('Workspace dependencies are missing');
  const installed = read(installedPath);
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!path.includes('node_modules/') || entry.link || entry.optional || entry.os?.length &&
      !entry.os.includes(process.platform) || entry.cpu?.length && !entry.cpu.includes(process.arch)) continue;
    if (installed.packages?.[path]?.version !== entry.version || !existsSync(resolve(workspace, path))) fail('Workspace dependencies differ from package-lock.json at ' + path);
  }
  const receipt = resolve(workspace, '.agoraweave/dependencies.json');
  if (existsSync(receipt) && read(receipt).lock !== hash(readFileSync(resolve(workspace, 'package-lock.json')))) fail('The dependency lock changed after installation');
  for (const name of services) {
    if (name === 'admin') {
      if (!read(resolve(workspace, 'apps/admin/package.json')).scripts?.dev) throw new Error('apps/admin must provide its real workspace dev script');
      try { createRequire(resolve(workspace, 'apps/admin/package.json')).resolve('next/package.json'); } catch { fail('Next.js dependency unavailable'); }
    }
    if (name === 'metro') try { createRequire(resolve(workspace, 'apps/mobile/package.json')).resolve('expo/bin/cli'); }
    catch { fail('Expo CLI dependency unavailable'); }
  }
}
export function processReady(entry, inventory = processInventory(), listening) {
  if (!ownedProcess(entry, inventory)) return false;
  const owners = listening ?? JSON.parse(powershell(`ConvertTo-Json -Compress -InputObject @(Get-NetTCPConnection -State Listen -LocalPort ${entry.port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)` ) || '[]');
  const family = descendants(entry.pid, inventory);
  return owners.length > 0 && owners.every(pid => family.has(pid));
}
export async function endpointReady(entry) {
  if (!processReady(entry)) return false;
  try {
    const result = await globalThis.fetch(entry.url, { signal: globalThis.AbortSignal.timeout(5000), redirect: 'manual' });
    return entry.service === 'metro' ? result.ok && (await result.text()).includes('packager-status:running') : result.status >= 200 && result.status < 400;
  } catch { return false; }
}
export async function waitUntil(check, timeoutSeconds, description) {
  const deadline = Date.now() + timeoutSeconds * 1000;
  do {
    if (await check()) return;
    await new Promise(done => setTimeout(done, 750));
  } while (Date.now() < deadline);
  throw new Error(`${description} did not become ready within ${timeoutSeconds}s; inspect -Status and private -Logs`);
}
export function validateRuntimeConfig(runtime, config) {
  if (config.networks?.default?.internal !== true || Object.keys(config.services ?? {}).length !== 11 ||
      Object.values(config.services).some(service => service.ports?.length || !service.container_name?.startsWith(runtime.project + '-') || !/@sha256:[a-f0-9]{64}$/.test(service.image))) {
    throw new Error('Local Compose must retain the fixed internal official stack without published ports');
  }
}
export async function main(options) {
  const { action, source, workspace, environment = 'dev', services = ['supabase', 'admin'], timeout = 180, lines = 40, migrate = false, adminPort = 3000, metroPort = 8081 } = options;
  if (!['dev', 'test'].includes(environment)) throw new Error('Development services require dev or test isolation');
  if (!['up', 'status', 'logs', 'stop'].includes(action) || !services.length || services.some(name => !['supabase', 'admin', 'metro'].includes(name))) throw new Error('Select up/status/logs/stop and supabase/admin/metro services');
  for (const value of [adminPort, metroPort]) if (!Number.isInteger(value) || value < 1024 || value > 65535) throw new Error('Development ports must be integers from 1024 to 65535');
  if (!Number.isInteger(lines) || lines < 1 || lines > 1000 || timeout < 1 || timeout > 600) throw new Error('Invalid log line count or readiness timeout');
  if (Object.keys(process.env).some(key => /^(GITHUB_|RUNNER_)/.test(key) && process.env[key])) throw new Error('Local development services cannot mix runner identity');
  process.env.AGORAWEAVE_EXECUTION_SOURCE = 'local'; process.env.AGORAWEAVE_LOCAL_ENVIRONMENT = environment;
  process.chdir(workspace);
  const { prepareLocalServices, readLocalRuntime, healthyServiceInventory } = await import('../ci/local-services.ts');
  const identity = sourceIdentity(source);
  const directory = resolve('.agoraweave/local', environment, 'development');
  mkdirSync(directory, { recursive: true });
  const statePath = resolve(directory, 'state.json');
  const state = existsSync(statePath) ? read(statePath) : { ...identity, environment, processes: {} };
  if (state.source !== identity.source || state.branch !== identity.branch) {
    // Sync guard normally catches this first. Never adopt another source's live processes.
    if (Object.values(state.processes).some(entry => ownedProcess(entry))) throw new Error('Another source/branch owns active development processes; stop from that source before switching');
  }
  let runtime;
  const docker = args => execFileSync('docker', args, { cwd: workspace, encoding: 'utf8', windowsHide: true,
    timeout: args.includes('up') ? (timeout + 30) * 1000 : 30000, stdio: ['ignore', 'pipe', 'pipe'] });
  const compose = args => docker(['compose', '--project-name', runtime.project, '-f', runtime.compose_file, ...args]);
  const probeServices = () => {
    if (!healthyServiceInventory(parseContainers(compose(['ps', '--format', 'json'])))) return false;
    try {
      compose(['exec', '-T', 'db', 'pg_isready', '-U', 'postgres', '-h', 'localhost']);
      compose(['exec', '-T', 'auth', 'wget', '-q', '-O', '-', 'http://localhost:9999/health']);
      compose(['exec', '-T', 'storage', 'wget', '-q', '-O', '-', 'http://storage:5000/status']);
      return true;
    } catch { return false; }
  };
  if (services.includes('supabase')) {
    try { docker(['info', '--format', '{{.ServerVersion}}']); } catch { throw new Error('Docker Desktop Linux engine unavailable; start Docker Desktop, then retry'); }
    const existing = resolve('.agoraweave/local', environment, 'runtime/identity.json');
    if (action === 'up') {
      // Fixed stack and credentials are reused; preparation never starts containers or resets storage.
      runtime = prepareLocalServices();
    } else if (existsSync(existing)) runtime = readLocalRuntime();
    if (runtime) validateRuntimeConfig(runtime, read(runtime.compose_file));
  }
  if (action === 'up') {
    dependencyCheck(workspace, services);
    if (migrate && !services.includes('supabase')) throw new Error('-Migrate requires supabase in -Services');
    if (runtime) {
      // Missing images fail here instead of silently downloading unbudgeted dependencies.
      const images = new Set(Object.values(read(runtime.compose_file).services).map(service => service.image));
      for (const image of images) try { docker(['image', 'inspect', image, '--format', '{{.Id}}']); }
      catch { throw new Error('A pinned Supabase image is missing. Pull the reviewed infra/ci/images.lock.json images explicitly, then retry'); }
      Object.assign(state, identity); state.project = runtime.project; write(statePath, state);
      if (!healthyServiceInventory(parseContainers(compose(['ps', '--all', '--format', 'json'])))) compose(['up', '-d', '--pull', 'never', '--wait', '--wait-timeout', String(timeout)]);
      await waitUntil(probeServices, timeout, 'Official Supabase services');
      if (migrate) execFileSync(process.execPath, ['--experimental-strip-types', 'tools/ci/core-entry.ts', 'migrate'], { cwd: workspace, stdio: 'inherit', windowsHide: true, timeout: 180000 });
      console.log(`supabase ready (${runtime.project}; internal network, no host ports)`);
    }
    for (const service of services.filter(name => name !== 'supabase')) {
      const port = service === 'admin' ? adminPort : metroPort;
      const previous = state.processes[service];
      if (ownedProcess(previous)) {
        if (previous.port !== port) throw new Error(`${service} is already running on port ${previous.port}; stop it before changing ports`);
        await waitUntil(() => endpointReady(previous), timeout, service);
        console.log(`${service} ready (reused pid ${previous.pid}): ${previous.url}`); continue;
      }
      const occupied = powershell(`@(Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue).Count`);
      if (Number(occupied)) throw new Error(`Port ${port} is occupied by an unmanaged process; choose another port or stop its owner`);
      const token = randomUUID(), config = resolve(directory, `${service}-${token}.json`);
      const npm = resolve(process.execPath, '../node_modules/npm/bin/npm-cli.js');
      const require = createRequire(resolve(workspace, 'apps/mobile/package.json'));
      const args = service === 'admin' ? [npm, 'run', 'dev', '--workspace', 'apps/admin', '--', '--hostname', '127.0.0.1', '--port', String(port)] :
        [require.resolve('expo/bin/cli'), 'start', '--dev-client', '--localhost', '--port', String(port)];
      write(config, { executable: process.execPath, args, cwd: service === 'admin' ? workspace : resolve(workspace, 'apps/mobile'),
        env: { AGORAWEAVE_EXECUTION_SOURCE: 'local', AGORAWEAVE_LOCAL_ENVIRONMENT: environment, NODE_ENV: 'development',
          ...(service === 'admin' ? { AGORAWEAVE_ADMIN_TEMPLATE_PREVIEW: '1' } : {}), EXPO_NO_TELEMETRY: '1', NEXT_TELEMETRY_DISABLED: '1', CI: 'false' } });
      const entry = { ...startProcess(config, resolve(directory, `${service}-${token}.out.log`), resolve(directory, `${service}-${token}.err.log`)),
        service, port, url: `http://127.0.0.1:${port}${service === 'metro' ? '/status' : '/'}`, ...identity };
      state.processes[service] = entry; Object.assign(state, identity); write(statePath, state);
      await waitUntil(() => {
        if (!ownedProcess(entry)) throw new Error(`${service} exited before becoming ready; inspect private -Logs`);
        return endpointReady(entry);
      }, timeout, service);
      console.log(`${service} ready (pid ${entry.pid}): ${entry.url}`);
    }
  } else if (action === 'stop') {
    for (const service of services.filter(name => name !== 'supabase')) {
      const entry = state.processes[service];
      console.log(`${service}: ${stopProcess(entry) ? 'stopped owned process tree' : 'no matching managed process'}`);
      delete state.processes[service];
    }
    if (runtime) { compose(['stop', '--timeout', '30']); console.log(`supabase stopped (${runtime.project}; data volumes preserved)`); }
    write(statePath, state);
  } else if (action === 'logs') {
    if (runtime) process.stdout.write(compose(['logs', '--no-color', '--tail', String(lines)]));
    for (const service of services.filter(name => name !== 'supabase')) {
      const entry = state.processes[service];
      for (const file of [entry?.stdout, entry?.stderr].filter(Boolean)) if (existsSync(file)) {
        console.log(`${service}: ${file}`); console.log(readFileSync(file, 'utf8').split(/\r?\n/).slice(-lines).join('\n'));
      }
    }
  } else {
    if (runtime) {
      const containers = parseContainers(compose(['ps', '--all', '--format', 'json']));
      console.log(JSON.stringify({ service: 'supabase', project: runtime.project, ready: probeServices(),
        containers: containers.map(({ Service, State, Health }) => ({ service: Service, state: State, health: Health })) }));
    } else if (services.includes('supabase')) console.log('supabase: not configured');
    for (const service of services.filter(name => name !== 'supabase')) {
      const entry = state.processes[service];
      console.log(JSON.stringify({ service, ready: !!entry && await endpointReady(entry), pid: ownedProcess(entry) ? entry.pid : null,
        url: entry?.url, source: entry?.source, branch: entry?.branch, logs: entry ? [entry.stdout, entry.stderr] : [] }));
    }
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try { await main(JSON.parse(process.argv[2])); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
