import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolveValidationRequest } from './run-check-set.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Validation planning requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
let paths = ['unknown'];
try { paths = execFileSync('git', ['diff', '--name-only', `${sha}^`, sha], { encoding: 'utf8' }).trim().split('\n').filter(Boolean); } catch { /* Initial or unavailable history requires the complete chain. */ }
const request = existsSync('infra/ci/validation-request.json') ? JSON.parse(readFileSync('infra/ci/validation-request.json', 'utf8')) :
  { schema_version: 1, validation_intent: 'completion' };
const plan = resolveValidationRequest(request, { target_sha: event.pull_request?.head.sha || process.env.GITHUB_SHA,
  checkout_sha: sha, event: process.env.GITHUB_EVENT_NAME, event_sha: process.env.GITHUB_SHA,
  pr_head_sha: event.pull_request?.head.sha, pr_merge_sha: event.pull_request ? process.env.GITHUB_SHA : undefined,
  repository: process.env.GITHUB_REPOSITORY, changed_paths: paths,
  check_set_digest: createHash('sha256').update(readFileSync('tools/ci/validation-manifest.json')).digest('hex'),
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT) });
mkdirSync('validation-plan', { recursive: true });
writeFileSync('validation-plan/plan.json', JSON.stringify(plan, null, 2) + '\n');
if (plan.state !== 'resolved') throw new Error('Validation request refused');
appendFileSync(process.env.GITHUB_OUTPUT!, `full_required=${plan.full_required}\nvalidation_intent=${plan.validation_intent}\n`);
