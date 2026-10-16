import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/** Actual execution environment; this is not a readiness certificate. */
export function executionContext(): Record<string, any> {
  const checkout_sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  if (process.env.AGORAWEAVE_EXECUTION_SOURCE === 'local') {
    if (Object.keys(process.env).some(key => /^(GITHUB_|RUNNER_)/.test(key) && process.env[key])) {
      throw new Error('Local execution cannot mix runner identity');
    }
    const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || 'engineering';
    if (!['engineering', 'dev', 'test'].includes(environment)) throw new Error('Nonproduction environment required');
    return { source: 'local', checkout_sha, environment };
  }
  if (process.env.AGORAWEAVE_EXECUTION_SOURCE && process.env.AGORAWEAVE_EXECUTION_SOURCE !== 'github-actions' ||
      process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
    throw new Error('Select explicit local execution or GitHub-hosted Actions');
  }
  return { source: 'github-actions', checkout_sha, environment: process.env.CI_ENVIRONMENT,
    run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT) };
}

export function executionDirectory(kind: string, context: Record<string, any>): string {
  if (!/^[a-z-]+$/.test(kind)) throw new Error('Invalid report directory');
  return context.source === 'local' ? resolve('.agoraweave/local', context.environment, `${kind}-output`) : `${kind}-output`;
}
