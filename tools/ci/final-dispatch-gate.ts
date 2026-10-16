import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
  throw new Error('Final dispatch aggregation requires GitHub-hosted Actions');
}
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
let needs: Record<string, any> = {};
try { needs = JSON.parse(process.env.NEEDS_JSON || '{}'); } catch { /* Malformed dependency outcomes are refused below. */ }
const outputs = needs?.plan?.outputs;
const intent = outputs?.validation_intent || 'invalid_or_missing';
const reasons = [];
if (sha !== (process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA)) reasons.push('checkout_identity_mismatch');
if (needs?.plan?.result !== 'success') reasons.push('validation_plan_not_passed');
const batch = intent === 'batch' && process.env.GITHUB_EVENT_NAME === 'workflow_dispatch';
if (batch) {
  if (outputs?.full_required !== 'false' || outputs?.development_required !== 'true' ||
      needs?.development?.result !== 'success' || needs?.bootstrap?.result !== 'skipped') reasons.push('functional_batch_not_passed');
} else {
  if (intent !== 'completion' || outputs?.full_required !== 'true' || outputs?.development_required !== 'false') reasons.push('formal_completion_plan_required');
  if (needs?.bootstrap?.result !== 'success' || needs?.development?.result !== 'skipped') reasons.push('complete_formal_chain_not_passed');
}
mkdirSync('dispatch-gate-output', { recursive: true });
writeFileSync('dispatch-gate-output/result.json', JSON.stringify({
  state: reasons.length ? 'blocked' : 'passed', reason_codes: reasons, validation_intent: intent,
  ci_ready: !batch && reasons.length === 0, feature_complete: false, target_sha: sha, checkout_sha: sha,
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  source: 'github-actions', runner_environment: process.env.RUNNER_ENVIRONMENT,
  evidence_kind: 'final_dispatch_outcome', original_needs: needs,
}, null, 2) + '\n');
if (reasons.length) { process.stderr.write('Formal initialization refused: ' + reasons.join(',') + '\n'); process.exitCode = 1; }
