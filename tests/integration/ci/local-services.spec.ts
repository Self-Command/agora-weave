import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { healthyServiceInventory } from '../../../tools/ci/local-services.ts';

type Volume = { target: string; type: string; source: string };
type Service = { ports?: unknown[]; container_name: string; image: string; volumes: Volume[]; environment: Record<string, string> };

test('LS01: local preparation uses the fixed official Compose with private credentials and separate internal dev and test resources', () => {
  // Break caught: local entry is runner-only, exposes infrastructure ports, reuses dev/test storage, or runs an unlocked image.
  const root = mkdtempSync(join(tmpdir(), 'aw-local-services-'));
  try {
    for (const directory of ['tools/ci', 'infra/ci', 'supabase/upstream/docker', 'supabase/functions/core']) {
      cpSync(directory, join(root, directory), { recursive: true });
    }
    cpSync('package.json', join(root, 'package.json')); cpSync('package-lock.json', join(root, 'package-lock.json'));
    writeFileSync(join(root, '.gitignore'), '.agoraweave/\n');
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Local fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'synthetic service adapter'], { cwd: root });
    const base: NodeJS.ProcessEnv = { ...process.env, AGORAWEAVE_EXECUTION_SOURCE: 'local' };
    for (const key of Object.keys(base)) if (/^(GITHUB_|RUNNER_)/.test(key) || key === 'NODE_TEST_CONTEXT') delete base[key];
    const projects: string[] = [], secrets: string[] = [], dataVolumes: string[] = [];
    for (const environment of ['dev', 'test']) {
      const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/core-entry.ts', 'prepare-local'],
        { cwd: root, env: { ...base, AGORAWEAVE_LOCAL_ENVIRONMENT: environment,
          JWT_SECRET: 'synthetic-parent-secret-must-never-enter-local-services', POSTGRES_PASSWORD: 'synthetic-parent-password',
          OPENAI_API_KEY: 'synthetic-external-provider-key' }, encoding: 'utf8', timeout: 30000 });
      assert.equal(result.status, 0, result.stderr);
      const directory = join(root, '.agoraweave/local', environment, 'runtime');
      const identity = JSON.parse(readFileSync(join(directory, 'identity.json'), 'utf8'));
      assert.equal(identity.source, 'local'); assert.equal(identity.environment, environment);
      assert.match(identity.project, new RegExp(`^agoraweave-local-${environment}-[a-f0-9]{12}$`));
      projects.push(identity.project);
      const config: { networks: { default: { internal: boolean } }; services: Record<string, Service>; volumes: Record<string, { name: string }> } = JSON.parse(execFileSync('docker', ['compose', '--project-name', identity.project,
        '-f', join(directory, 'compose.json'), 'config', '--format', 'json'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
      assert.equal(config.networks.default.internal, true);
      assert.equal(Object.keys(config.services).length, 11);
      assert.equal(config.services.auth.environment.GOTRUE_JWT_ISSUER, config.services.functions.environment.CORE_JWT_ISSUER,
        'The real Auth issuer and core signature verifier must agree in each isolated environment');
      const cloudConfig = JSON.parse(execFileSync('docker', ['compose', '--project-directory', join(root, 'supabase/upstream/docker'),
        '--env-file', join(directory, 'services.env'), '-f', join(root, 'supabase/upstream/docker/docker-compose.yml'),
        '-f', join(root, 'infra/ci/compose.yml'), 'config', '--format', 'json'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...base, CI_ENVIRONMENT: environment, GITHUB_WORKSPACE: root, API_EXTERNAL_URL: 'https://different-fixture.invalid/auth/v1' } }));
      assert.equal(cloudConfig.services.auth.environment.GOTRUE_JWT_ISSUER, cloudConfig.services.functions.environment.CORE_JWT_ISSUER,
        'A different runner external URL must not make actual Auth refresh tokens unverifiable by the core');
      const lock: { images: { repo_digests: string[] }[] } = JSON.parse(readFileSync(join(root, 'infra/ci/images.lock.json'), 'utf8'));
      for (const [name, service] of Object.entries(config.services)) {
        assert.equal(service.ports?.length || 0, 0, name);
        assert.match(service.container_name, new RegExp('^' + identity.project));
        assert.ok(lock.images.some(image => image.repo_digests.includes(service.image)), name);
      }
      for (const [name, target] of [['db', '/var/lib/postgresql/data'], ['storage', '/var/lib/storage'], ['studio', '/app/snippets']]) {
        const volume = config.services[name].volumes.find(entry => entry.target === target)!;
        assert.equal(volume.type, 'volume');
        const actualName = config.volumes[volume.source].name;
        assert.match(actualName, new RegExp('^' + identity.project));
        dataVolumes.push(actualName);
      }
      const functions = config.services.functions;
      assert.equal(functions.volumes.some(entry => entry.target === '/home/deno/functions'), false,
        'A read-only parent prevents the nested core mount from being created');
      assert.equal(functions.volumes.some(entry => entry.target === '/home/deno/functions/main'), true);
      assert.equal(functions.volumes.some(entry => entry.target === '/home/deno/functions/deno.jsonc'), true);
      assert.equal(functions.environment.SUPABASE_SERVICE_ROLE_KEY, '');
      assert.match(functions.environment.SUPABASE_DB_URL, /^postgresql:\/\/core_runtime:/);
      assert.equal(functions.volumes.find(entry => entry.target === '/home/deno/functions/core')!.source.replaceAll('\\', '/'), join(root, 'supabase/functions/core').replaceAll('\\', '/'));
      assert.equal(config.services.auth.environment.GOTRUE_EXTERNAL_PHONE_ENABLED, 'false');
      const secret = config.services.auth.environment.GOTRUE_JWT_SECRET;
      assert.ok(secret.length >= 64); secrets.push(secret);
      assert.notEqual(secret, 'synthetic-parent-secret-must-never-enter-local-services');
      const privateEnvironment = readFileSync(join(directory, 'services.env'), 'utf8');
      assert.ok(privateEnvironment.includes(`JWT_SECRET=${secret}\n`));
      assert.notEqual(config.services.db.environment.POSTGRES_PASSWORD, 'synthetic-parent-password');
      assert.equal(config.services.studio.environment.OPENAI_API_KEY, '');
      assert.equal((result.stdout + result.stderr).includes(secret), false);
      assert.equal(existsSync(join(root, 'service-output')), false);
      const admitted = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
        "import {requireCoreEnvironment} from './tools/ci/core-database.ts'; requireCoreEnvironment();"],
      { cwd: root, env: { ...base, AGORAWEAVE_LOCAL_ENVIRONMENT: environment }, encoding: 'utf8' });
      assert.equal(admitted.status, 0, admitted.stderr);
      const configurationPath = join(directory, 'compose.json');
      const original = readFileSync(configurationPath);
      writeFileSync(configurationPath, original.toString().replace('"internal": true', '"internal": false'));
      const changed = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e',
        "import {requireCoreEnvironment} from './tools/ci/core-database.ts'; requireCoreEnvironment();"],
      { cwd: root, env: { ...base, AGORAWEAVE_LOCAL_ENVIRONMENT: environment }, encoding: 'utf8' });
      assert.notEqual(changed.status, 0, 'A changed isolation boundary must be refused');
      writeFileSync(configurationPath, original);
    }
    assert.equal(new Set(projects).size, 2);
    assert.equal(new Set(secrets).size, 2);
    assert.equal(new Set(dataVolumes).size, 6);
    const forbidden = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/core-entry.ts', 'prepare-local'],
      { cwd: root, env: { ...base, AGORAWEAVE_LOCAL_ENVIRONMENT: 'production' }, encoding: 'utf8' });
    assert.notEqual(forbidden.status, 0);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('LS02: a starting unhealthy missing or externally published service prevents healthy local admission', () => {
  // Break caught: successful SQL/Auth probes conceal an unhealthy function runtime or an exposed infrastructure service.
  const services = ['api-gw','auth','db','functions','imgproxy','meta','realtime','rest','storage','studio','supavisor'];
  const healthy = services.map(Service => ({ Service, State: 'running', Health: 'healthy', Publishers: [] }));
  assert.equal(healthyServiceInventory(healthy), true);
  for (const name of services) {
    assert.equal(healthyServiceInventory(healthy.filter(entry => entry.Service !== name)), false, name);
    for (const state of ['starting', 'unhealthy']) {
      assert.equal(healthyServiceInventory(healthy.map(entry => entry.Service === name ? { ...entry, Health: state } : entry)), false, name + state);
    }
  }
  assert.equal(healthyServiceInventory([...healthy, healthy[0]]), false);
  assert.equal(healthyServiceInventory(healthy.map(entry => entry.Service === 'db' ?
    { ...entry, Publishers: [{ URL: '0.0.0.0', PublishedPort: 5432, TargetPort: 5432 }] } : entry)), false);
});
