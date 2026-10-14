import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { bindReviewRecord } from './review-record.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Review record validation is Actions only');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const contextBytes = readFileSync('verify-output/review-context.json');
const contexts = JSON.parse(contextBytes.toString());
if (contexts.target_sha !== sha || contexts.source !== 'github-actions' || contexts.source_authenticated !== true) throw new Error('Unbound review input context');
const assessments: Record<string, unknown>[] = [];
for (const kind of ['code', 'visual']) {
  const location = `private-review/${kind}.json`;
  if (!existsSync(location)) {
    assessments.push({ review_kind: kind, state: 'missing', reason_codes: ['current_codex_record_unavailable'] });
    continue;
  }
  const bytes = readFileSync(location);
  if (bytes.length > 2 * 1024 * 1024) throw new Error('Review record exceeds bounded input size');
  const record = JSON.parse(bytes.toString());
  const result = bindReviewRecord(record, contexts[kind]);
  assessments.push({ ...result, review_kind: kind, record_digest: createHash('sha256').update(bytes).digest('hex') });
}
mkdirSync('review-output', { recursive: true });
writeFileSync('review-output/validation.json', JSON.stringify({ target_sha: sha, source: 'github-actions',
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  context_digest: createHash('sha256').update(contextBytes).digest('hex'), assessments,
  semantic_reviewer: 'current-codex', validator_role: 'record-integrity-only',
  readiness: 'not_evaluated', feature_complete: false }, null, 2) + '\n');
if (assessments.some(item => item.state !== 'passed')) throw new Error('Current Codex review records remain incomplete');
