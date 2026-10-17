import { spawn, execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createIngress, type IngressIdentity } from './https-ingress.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('HTTPS ingress is Actions only');
const temporary = process.env.RUNNER_TEMP!;
const identity: IngressIdentity = { run_id: process.env.GITHUB_RUN_ID!, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  target_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), environment: process.env.CI_ENVIRONMENT as 'dev' | 'test' };
const compose = ['compose', '--project-directory', 'supabase/upstream/docker', '--env-file', `${temporary}/agoraweave-ci.env`,
  '-f', 'supabase/upstream/docker/docker-compose.yml', '-f', 'infra/ci/compose.yml', '-f', `${temporary}/agoraweave-images.json`];
const containerId = execFileSync('docker', [...compose, 'ps', '-q', 'auth'], { encoding: 'utf8' }).trim();
const [container] = JSON.parse(execFileSync('docker', ['inspect', containerId], { encoding: 'utf8' }));
const network = container.NetworkSettings.Networks[process.env.COMPOSE_PROJECT_NAME + '_default'];
if (!network || !/^\d+\.\d+\.\d+\.\d+$/.test(network.IPAddress)) throw new Error('Isolated auth container unavailable');
const started = Date.now();
const server = createIngress({ seed: process.env.AGORAWEAVE_HTTPS_SEED!, identity,
  upstream: `http://${network.IPAddress}:9999`, expires_at: started + 75 * 60000 });
server.listen(43801, '127.0.0.1');
writeFileSync(`${temporary}/https-gateway.pid`, String(process.pid), { mode: 0o600 });
const binary = `${temporary}/cloudflared`;
const expectedDigest = 'd33ff2d14475178d2012c2c56beba87389ac5ded27649519f198a7d3134a99db';
if (createHash('sha256').update(readFileSync(binary)).digest('hex') !== expectedDigest) throw new Error('Unfrozen cloudflared binary');
const child = spawn(binary, ['tunnel', '--no-autoupdate', '--edge-ip-version', '4', '--protocol', 'http2', '--url', 'http://127.0.0.1:43801'], {
  env: { PATH: process.env.PATH, HOME: process.env.HOME }, stdio: ['ignore', 'pipe', 'pipe'],
});
writeFileSync(`${temporary}/https-cloudflared.pid`, String(child.pid), { mode: 0o600 });
let published = false, output = '';
const observe = (bytes: Buffer) => {
  output = (output + bytes.toString()).slice(-16000);
  const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
  if (!published && match) {
    published = true;
    writeFileSync('service-output/https-ready.json', JSON.stringify({ ...identity, schema_version: 1,
      source: 'github-actions', runner_environment: 'github-hosted', url: match[0], started_at: started,
      expires_at: started + 75 * 60000 }, null, 2) + '\n');
  }
};
child.stdout.on('data', observe);
child.stderr.on('data', observe);
child.on('exit', () => { server.close(); process.exitCode = 1; });
child.on('error', () => { server.close(); process.exitCode = 1; });
process.on('SIGTERM', () => { child.kill('SIGTERM'); server.close(() => process.exit(0)); });
