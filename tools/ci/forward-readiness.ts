import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { initializationDigests } from './bridge-inputs.ts';
import { validDevelopmentReadiness } from './development-readiness.ts';
import { developmentSourceJobs, developmentSourceRun, readDevelopmentSource } from './development-source.ts';
import { waitSharedExecution } from './wait-shared-execution.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Readiness forwarding requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== process.env.TARGET_SHA) throw new Error('Readiness forwarding checkout changed');
const request = { repository: process.env.GITHUB_REPOSITORY!, token: process.env.GH_TOKEN!,
  run_id: process.env.SOURCE_RUN_ID!, expected_sha: sha };
const purpose = JSON.parse(readFileSync('infra/ci/validation-request.json', 'utf8'));
if (purpose.schema_version !== 1 || !['green', 'completion'].includes(purpose.validation_intent)) throw new Error('Feedback cannot authorize development or completion');
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME;
async function currentRun() {
  const run = await developmentSourceRun(request);
  if (run.event !== process.env.GITHUB_EVENT_NAME || run.head_branch !== branch) throw new Error('Readiness source event or branch changed');
  return run;
}
mkdirSync('gate-output', { recursive: true });
if (purpose.validation_intent === 'completion') {
  const result = await waitSharedExecution({ expected_sha: sha, repository: request.repository, run_id: request.run_id,
    event: process.env.GITHUB_EVENT_NAME, branch, timeout_ms: 90 * 60 * 1000, interval_ms: 10000 },
  currentRun, milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)), Date.now);
  writeFileSync('gate-output/shared-wait.json', JSON.stringify(result, null, 2) + '\n');
  if (result.state !== 'complete') throw new Error('Required complete shared executor did not pass');
  process.env.SOURCE_SHA = sha;
  for (const [artifact, directory] of [['verify-executor-outcomes', 'verify-output'], ['codex-record-validation', 'review-output'],
    ['private-source-receipts', 'private-receipts']]) {
    try { execFileSync(process.execPath, ['--experimental-strip-types', 'tools/ci/download-source.ts',
      `${artifact}-${request.run_id}-${result.attempt}`, directory], { stdio: 'inherit' }); } catch { /* Full aggregation rejects any missing original evidence. */ }
  }
  execFileSync(process.execPath, ['--experimental-strip-types', 'tools/ci/aggregate-cli.ts'], { stdio: 'inherit' });
} else {
  const deadline = Date.now() + 45 * 60 * 1000;
  const manifest = createHash('sha256').update(readFileSync('tools/ci/validation-manifest.json')).digest('hex');
  let interval = 3000;
  for (;;) {
    const run = await currentRun();
    let source: Record<string, any> | undefined;
    try { source = await readDevelopmentSource(request); } catch {
      const publishers = (await developmentSourceJobs(request, run.run_attempt)).filter(job => String(job.name).endsWith(' / development-readiness'));
      if (publishers.length > 1 || publishers.some(job => job.status === 'completed' && job.conclusion !== 'success') || run.status === 'completed') {
        throw new Error('Original foundational readiness is missing or failed');
      }
    }
    if (source) {
      const authenticated = { ...source, ancestor_verified: source.document.target_sha === sha };
      if (!validDevelopmentReadiness(authenticated, initializationDigests(), manifest)) throw new Error('Original foundational reports or current inputs did not pass');
      writeFileSync('gate-output/readiness.json', JSON.stringify({ ...source.document,
        forwarded_by: { run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
          authenticated_source_archive_digest: source.archive_digest } }, null, 2) + '\n');
      break;
    }
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new Error('Original foundational readiness timed out');
    await new Promise(resolve => setTimeout(resolve, Math.min(interval, remaining)));
    interval = Math.min(interval * 2, 30000);
  }
}
