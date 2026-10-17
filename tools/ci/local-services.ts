import { createHash, createHmac, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { executionContext } from './execution-context.ts';

const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const random = (bytes = 32) => randomBytes(bytes).toString('hex');
const inputs = ['infra/ci/images.lock.json', 'infra/ci/compose.yml', 'infra/ci/supabase-source.json', 'tools/ci/local-services.ts'];

/** Preserve the complete official template; overwrite client-supplied ingress claims on the functions route. */
export function authIngressTemplate(source: string, secret: string): string {
  if (!/^[a-f0-9]{64}$/.test(secret)) throw new Error('Invalid private ingress credential');
  const template=source.replaceAll('\r\n','\n');
  const marker='                      - name: functions-v1-all\n';
  const start=template.indexOf(marker),end=template.indexOf('                        typed_per_filter_config:',start);
  if (start<0 || end<start || template.indexOf(marker,start+1)>=0 || template.includes('key: X-Core-Ingress-Token'))
    throw new Error('Official functions ingress route changed');
  const block=template.slice(start,end),anchor='                        request_headers_to_add:\n';
  if (block.split(anchor).length!==2) throw new Error('Official functions header extension changed');
  const headers=`                          - header:\n                              key: X-Core-Ingress-Token\n                              value: "${secret}"\n                            append_action: OVERWRITE_IF_EXISTS_OR_ADD\n                          - header:\n                              key: X-Core-Client-IP\n                              value: "%DOWNSTREAM_DIRECT_REMOTE_ADDRESS_WITHOUT_PORT%"\n                            append_action: OVERWRITE_IF_EXISTS_OR_ADD\n`;
  return template.slice(0,start)+block.replace(anchor,anchor+headers)+template.slice(end);
}

export function healthyServiceInventory(containers: unknown): boolean {
  const names = ['api-gw','auth','db','functions','imgproxy','meta','realtime','rest','storage','studio','supavisor'];
  return Array.isArray(containers) && containers.length === names.length && names.every(name =>
    containers.filter(container => container?.Service === name && container.State === 'running' &&
      (container.Health === 'healthy' || ['meta','rest'].includes(name) && !container.Health) &&
      Array.isArray(container.Publishers) && !container.Publishers.some((port: any) => Number(port.PublishedPort) > 0)).length === 1);
}

export function localRuntime() {
  if (process.env.AGORAWEAVE_EXECUTION_SOURCE !== 'local' ||
      Object.keys(process.env).some(key => /^(GITHUB_|RUNNER_)/.test(key) && process.env[key])) throw new Error('Local services cannot acquire runner identity');
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT;
  if (!['dev', 'test'].includes(environment || '')) throw new Error('Local services require explicit dev or test isolation');
  const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const project = `agoraweave-local-${environment}-${hash(root).slice(0, 12)}`;
  const directory = resolve('.agoraweave/local', environment!, 'runtime');
  return { source: 'local', environment, project, directory, root,
    environment_file: resolve(directory, 'services.env'), compose_file: resolve(directory, 'compose.json') };
}

export function readLocalRuntime() {
  const runtime = localRuntime();
  const identity = JSON.parse(readFileSync(resolve(runtime.directory, 'identity.json'), 'utf8'));
  if (identity.source !== 'local' || identity.project !== runtime.project || identity.environment !== runtime.environment ||
      inputs.some(path => identity.input_digests?.[path] !== hash(readFileSync(path))) ||
      identity.compose_digest !== hash(readFileSync(runtime.compose_file)) ||
      identity.environment_digest !== hash(readFileSync(runtime.environment_file)) ||
      identity.auth_ingress_digest !== hash(readFileSync(resolve(runtime.directory,'auth-ingress.yaml')))) throw new Error('Local service configuration changed; prepare it again before use');
  return runtime;
}

/** Resolve the existing official stack; all generated credentials and resolved configuration stay private. */
export function prepareLocalServices() {
  executionContext();
  const runtime = localRuntime();
  mkdirSync(runtime.directory, { recursive: true });
  if (!existsSync(runtime.environment_file)) {
    const values = Object.fromEntries(readFileSync('supabase/upstream/docker/.env.example', 'utf8').split(/\r?\n/)
      .filter(line => /^[A-Z][A-Z0-9_]*=/.test(line)).map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)]));
    Object.assign(values, { POSTGRES_PASSWORD: random(), JWT_SECRET: random(), CORE_DATABASE_PASSWORD: random(),
      DASHBOARD_PASSWORD: random(), SECRET_KEY_BASE: random(64), REALTIME_DB_ENC_KEY: random(8), VAULT_ENC_KEY: random(16),
      PG_META_CRYPTO_KEY: random(), LOGFLARE_PUBLIC_ACCESS_TOKEN: random(), LOGFLARE_PRIVATE_ACCESS_TOKEN: random(),
      S3_PROTOCOL_ACCESS_KEY_ID: random(16), S3_PROTOCOL_ACCESS_KEY_SECRET: random(), MINIO_ROOT_USER: random(16), MINIO_ROOT_PASSWORD: random(),
      SUPABASE_PUBLIC_URL: 'http://api-gw:8000', API_EXTERNAL_URL: 'http://api-gw:8000/auth/v1', SITE_URL: 'http://local.invalid',
      ADDITIONAL_REDIRECT_URLS: '', OPENAI_API_KEY: '', ENABLE_PHONE_SIGNUP: 'false', ENABLE_EMAIL_SIGNUP: 'false' });
    const jwt = (role: string) => {
      const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
      const now = Math.floor(Date.now() / 1000);
      const input = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ role, iss: 'supabase-local', iat: now, exp: now + 365 * 86400 })}`;
      return `${input}.${createHmac('sha256', values.JWT_SECRET).update(input).digest('base64url')}`;
    };
    values.ANON_KEY = jwt('anon'); values.SERVICE_ROLE_KEY = jwt('service_role');
    writeFileSync(runtime.environment_file, Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n', { mode: 0o600 });
  }
  let currentPrivate = readFileSync(runtime.environment_file,'utf8');
  if (!/^CORE_WORKER_DATABASE_PASSWORD=/m.test(currentPrivate)) {
    writeFileSync(runtime.environment_file,currentPrivate.replace(/\s*$/,'')+'\nCORE_WORKER_DATABASE_PASSWORD='+random()+'\n',{mode:0o600});
  }
  currentPrivate=readFileSync(runtime.environment_file,'utf8');
  if (!/^CORE_INGRESS_TOKEN=/m.test(currentPrivate))
    writeFileSync(runtime.environment_file,currentPrivate.replace(/\s*$/,'')+'\nCORE_INGRESS_TOKEN='+random()+'\n',{mode:0o600});
  currentPrivate=readFileSync(runtime.environment_file,'utf8');
  if (!/^AGORAWEAVE_ADMIN_SESSION_KEY=/m.test(currentPrivate))
    writeFileSync(runtime.environment_file,currentPrivate.replace(/\s*$/,'')+'\nAGORAWEAVE_ADMIN_SESSION_KEY='+random()+'\n',{mode:0o600});
  const ingressSecret=readFileSync(runtime.environment_file,'utf8').match(/^CORE_INGRESS_TOKEN=([a-f0-9]{64})$/m)?.[1];
  if (!ingressSecret) throw new Error('Private ingress credential is unavailable');
  const ingressPath=resolve(runtime.directory,'auth-ingress.yaml');
  writeFileSync(ingressPath,authIngressTemplate(readFileSync('supabase/upstream/docker/volumes/api/envoy/lds.template.yaml','utf8'),ingressSecret),{mode:0o600});
  const serviceVariables = new Set(readFileSync(runtime.environment_file, 'utf8').split(/\r?\n/)
    .filter(line => /^[A-Z][A-Z0-9_]*=/.test(line)).map(line => line.slice(0, line.indexOf('='))));
  const controlled = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    !serviceVariables.has(key.toUpperCase()) && !key.toUpperCase().startsWith('COMPOSE_')));
  controlled.AGORAWEAVE_WORKSPACE = runtime.root;
  const config = JSON.parse(execFileSync('docker', ['compose', '--project-name', runtime.project,
    '--project-directory', 'supabase/upstream/docker', '--env-file', runtime.environment_file,
    '-f', 'supabase/upstream/docker/docker-compose.yml', '-f', 'infra/ci/compose.yml', 'config', '--format', 'json'],
  { env: controlled, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
  const lock = JSON.parse(readFileSync('infra/ci/images.lock.json', 'utf8'));
  const source = JSON.parse(readFileSync('infra/ci/supabase-source.json', 'utf8'));
  if (lock.upstream_commit !== source.commit || config.networks.default.internal !== true ||
      Object.keys(config.services).length !== 11) throw new Error('Local stack differs from the fixed isolated official source');
  const data = new Map([['/var/lib/postgresql/data', 'local-db'], ['/var/lib/storage', 'local-storage'], ['/app/snippets', 'local-snippets']]);
  config.volumes ??= {};
  for (const [name, service] of Object.entries<any>(config.services)) {
    const image = lock.images.find((item: any) => item.reference === service.image && item.os === 'linux' && item.architecture === 'amd64');
    if (!image || !/^.+@sha256:[a-f0-9]{64}$/.test(image.repo_digests[0]) || service.ports?.length) throw new Error('Unlocked or exposed local service');
    service.image = image.repo_digests[0]; service.container_name = `${runtime.project}-${name}`;
    if (name==='api-gw') for (const volume of service.volumes || [])
      if (volume.target==='/etc/envoy/lds.template.yaml') volume.source=ingressPath;
    if (name === 'functions') service.volumes = service.volumes.flatMap((volume: any) =>
      volume.target === '/home/deno/functions' ? [
        { type: 'bind', source: resolve('supabase/upstream/docker/volumes/functions/main'), target: '/home/deno/functions/main', read_only: true },
        { type: 'bind', source: resolve('supabase/upstream/docker/volumes/functions/deno.jsonc'), target: '/home/deno/functions/deno.jsonc', read_only: true },
      ] : [volume]);
    for (const volume of service.volumes || []) {
      const key = data.get(volume.target);
      if (key) {
        config.volumes[key] = { name: `${runtime.project}-${key}` };
        volume.type = 'volume'; volume.source = key; delete volume.bind;
      } else if (volume.type === 'bind') volume.read_only = true;
    }
  }
  writeFileSync(runtime.compose_file, JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
  writeFileSync(resolve(runtime.directory, 'identity.json'), JSON.stringify({ source: 'local', environment: runtime.environment,
    project: runtime.project, upstream_commit: source.commit, input_digests: Object.fromEntries(inputs.map(path => [path, hash(readFileSync(path))])),
    compose_digest: hash(readFileSync(runtime.compose_file)), environment_digest: hash(readFileSync(runtime.environment_file)),
    auth_ingress_digest: hash(readFileSync(ingressPath)),
    readiness: 'not_evaluated' }, null, 2) + '\n');
  return runtime;
}
