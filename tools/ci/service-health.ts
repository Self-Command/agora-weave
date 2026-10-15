import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted' ||
  !['dev', 'test'].includes(process.env.CI_ENVIRONMENT || '')) throw new Error('Service health requires an isolated GitHub-hosted environment');
const base = ['compose', '--project-directory', 'supabase/upstream/docker', '--env-file', `${process.env.RUNNER_TEMP}/agoraweave-ci.env`,
  '-f', 'supabase/upstream/docker/docker-compose.yml', '-f', 'infra/ci/compose.yml', '-f', `${process.env.RUNNER_TEMP}/agoraweave-images.json`];
mkdirSync('service-output', { recursive: true });
const capture = (file: string, args: string[], input?: Buffer) => {
  const bytes = execFileSync('docker', [...base, ...args], { input, timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
  writeFileSync('service-output/' + file, bytes);
};
capture('database-health.txt', ['exec', '-T', 'db', 'pg_isready', '-U', 'postgres', '-h', 'localhost']);
capture('auth-health.json', ['exec', '-T', 'auth', 'wget', '-q', '-O', '-', 'http://localhost:9999/health']);
capture('storage-health.json', ['exec', '-T', 'storage', 'wget', '-q', '-O', '-', 'http://storage:5000/status']);
for (const file of ['schema-seed-probe.txt', 'schema-seed-probe-repeat.txt']) {
  capture(file, ['exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'], readFileSync('infra/ci/bootstrap-probe.sql'));
}
capture('service-health.json', ['ps', '--format', 'json']);
