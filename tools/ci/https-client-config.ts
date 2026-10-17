import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { collectEvidence } from './collect-evidence.ts';
import { deriveIngressToken, type IngressIdentity } from './https-ingress.ts';
import { validateHttpsDescriptor } from './https-descriptor.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('HTTPS configuration is Actions only');
const run_id = process.env.GITHUB_RUN_ID!, attempt = Number(process.env.GITHUB_RUN_ATTEMPT);
const target_sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const root = `${process.env.RUNNER_TEMP}/https-client-source`;
mkdirSync(root, { recursive: true });
const config: Record<string, unknown> = { run_id, attempt, target_sha };
for (const environment of ['dev', 'test'] as const) {
  const identity: IngressIdentity = { run_id, attempt, target_sha, environment };
  let descriptor: Record<string, any> | undefined;
  for (let poll = 0; poll < 90; poll++) {
    const source = await collectEvidence({ repository: process.env.GITHUB_REPOSITORY!, token: process.env.GH_TOKEN!,
      run_id, expected_sha: target_sha, expected_attempt: attempt, workflow_path: '.github/workflows/verify-release.yml',
      artifact_name: `https-ready-${environment}-${run_id}-${attempt}` });
    if (source.state === 'verified_source' && source.archive) {
      const location = `${root}/${environment}`;
      mkdirSync(location, { recursive: true });
      writeFileSync(`${location}/source.zip`, source.archive);
      execFileSync('python3', ['tools/ci/index-archive.py', `${location}/source.zip`, `${location}/index.json`, `${location}/raw`]);
      descriptor = JSON.parse(readFileSync(`${location}/raw/https-ready.json`, 'utf8'));
      if (!validateHttpsDescriptor(descriptor, identity, Date.now())) throw new Error('Stale or invalid native HTTPS source');
      break;
    }
    if (poll === 89) throw new Error('Authenticated HTTPS readiness source unavailable');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  const credential = deriveIngressToken(process.env.AGORAWEAVE_HTTPS_SEED!, identity);
  const other = deriveIngressToken(process.env.AGORAWEAVE_HTTPS_SEED!, { ...identity, environment: environment === 'dev' ? 'test' : 'dev' });
  console.log('::add-mask::' + credential);
  console.log('::add-mask::' + other);
  config[environment] = { url: descriptor!.url, token: credential, other_token: other, expires_at: descriptor!.expires_at };
}
writeFileSync(`${process.env.RUNNER_TEMP}/https-client.json`, JSON.stringify(config), { mode: 0o600 });
rmSync(root, { recursive: true, force: true });
