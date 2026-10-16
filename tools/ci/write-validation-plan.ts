import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolveValidationRequest } from './run-check-set.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Validation planning requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, 'utf8'));
let paths = ['unknown'];
let rangeBase: string | undefined;
try {
  const before = process.env.GITHUB_EVENT_NAME === 'pull_request' ? event.pull_request?.base?.sha : event.before;
  if (typeof before !== 'string' || !/^[a-f0-9]{40}$/.test(before) || /^0+$/.test(before) ||
    (process.env.GITHUB_EVENT_NAME === 'push' && event.after !== sha)) throw new Error('Unbound event change range');
  rangeBase = process.env.GITHUB_EVENT_NAME === 'pull_request' ?
    execFileSync('git', ['merge-base', before, sha], { encoding: 'utf8' }).trim() : before;
  paths = execFileSync('git', ['diff', '--name-only', rangeBase, sha], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  if (!paths.length) paths = ['unknown'];
} catch { /* Missing, initial or unavailable event history requires the complete chain. */ }
const savedRequest = existsSync('infra/ci/validation-request.json') ? JSON.parse(readFileSync('infra/ci/validation-request.json', 'utf8')) :
  { schema_version: 1, validation_intent: 'completion' };
const request = process.env.GITHUB_EVENT_NAME === 'workflow_dispatch'
  ? { schema_version: 1, validation_intent: event.inputs?.verification_profile === 'legacy-full' ? 'completion' : 'batch',
    target_ids: String(event.inputs?.core_targets || '').split(',').map(id => id.trim()).filter(Boolean) } : savedRequest;
const plan = resolveValidationRequest(request, { target_sha: event.pull_request?.head.sha || process.env.GITHUB_SHA,
  checkout_sha: sha, event: process.env.GITHUB_EVENT_NAME, event_sha: process.env.GITHUB_SHA,
  pr_head_sha: event.pull_request?.head.sha, pr_merge_sha: event.pull_request ? process.env.GITHUB_SHA : undefined,
  repository: process.env.GITHUB_REPOSITORY, changed_paths: paths, change_range_base: rangeBase,
  available_target_ids: JSON.parse(readFileSync('tools/ci/validation-manifest.json', 'utf8')).core_targets.map((target: { id: string }) => target.id),
  check_set_digest: createHash('sha256').update(readFileSync('tools/ci/validation-manifest.json')).digest('hex'),
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT) });
mkdirSync('validation-plan', { recursive: true });
writeFileSync('validation-plan/plan.json', JSON.stringify(plan, null, 2) + '\n');
if (plan.state !== 'resolved') throw new Error('Validation request refused');
appendFileSync(process.env.GITHUB_OUTPUT!, `full_required=${plan.full_required}\ndevelopment_required=${plan.development_required}\nvalidation_intent=${plan.validation_intent}\n`);
