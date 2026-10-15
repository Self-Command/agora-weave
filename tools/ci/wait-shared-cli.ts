import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { waitSharedExecution } from './wait-shared-execution.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Shared executor waiting requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== process.env.TARGET_SHA) throw new Error('Shared executor target differs from actual checkout');
const input = { expected_sha: sha, repository: process.env.GITHUB_REPOSITORY, run_id: process.env.SOURCE_RUN_ID,
  event: process.env.GITHUB_EVENT_NAME, branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME,
  timeout_ms: 90 * 60 * 1000, interval_ms: 10000 };
const result = await waitSharedExecution(input, async () => {
  const response = await fetch(`https://api.github.com/repos/${input.repository}/actions/runs/${input.run_id}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' },
    redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Authenticated shared executor unavailable');
  return await response.json();
}, milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)), Date.now);
mkdirSync('gate-output', { recursive: true });
writeFileSync('gate-output/shared-wait.json', JSON.stringify({ ...result, source: 'github-actions',
  runner_environment: 'github-hosted', evaluated_at: new Date().toISOString(), readiness: 'not_evaluated' }, null, 2) + '\n');
if (result.state !== 'complete') throw new Error('Required shared executor refused: ' + result.reason_codes.join(','));
