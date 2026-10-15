import { execFileSync } from 'node:child_process';

export function requireCoreEnvironment() {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted' ||
    !['dev', 'test'].includes(process.env.CI_ENVIRONMENT || '') ||
    process.env.COMPOSE_PROJECT_NAME !== `agoraweave-${process.env.CI_ENVIRONMENT}-${process.env.GITHUB_RUN_ID}`) {
    throw new Error('Core execution requires the run-scoped isolated Actions services');
  }
}

/** Commands enter the isolated network through Compose; no database port is published. */
export function compose(args: string[], input?: string): string {
  requireCoreEnvironment();
  return execFileSync('docker', ['compose', '--project-directory', 'supabase/upstream/docker',
    '--env-file', `${process.env.RUNNER_TEMP}/agoraweave-ci.env`,
    '-f', 'supabase/upstream/docker/docker-compose.yml', '-f', 'infra/ci/compose.yml',
    '-f', `${process.env.RUNNER_TEMP}/agoraweave-images.json`, ...args],
  { input, encoding: 'utf8', timeout: 60000, maxBuffer: 4 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
}

export function sql(statement: string): string {
  return compose(['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres',
    '-v', 'ON_ERROR_STOP=1'], statement);
}
