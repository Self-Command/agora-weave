import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { aggregateBootstrap } from './aggregate.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Aggregation is Actions only');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const digest = hash(manifestBytes);
const manifest = JSON.parse(manifestBytes.toString());
const sourceRunId = process.env.SOURCE_RUN_ID || process.env.GITHUB_RUN_ID!;
const headers = { Authorization: 'Bearer ' + process.env.GH_TOKEN, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
async function metadata(suffix: string): Promise<Record<string, any>> {
  const response = await fetch('https://api.github.com/repos/' + process.env.GITHUB_REPOSITORY + suffix, {
    headers, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Final source metadata unavailable');
  return await response.json();
}
const liveRun = await metadata('/actions/runs/' + sourceRunId);
const liveJobs: Record<string, any>[] = [];
for (let page = 1; page <= 100; page++) {
  const listing = await metadata('/actions/runs/' + sourceRunId + '/attempts/' + liveRun.run_attempt + '/jobs?per_page=100&page=' + page);
  if (!Array.isArray(listing.jobs) || !Number.isInteger(listing.total_count)) throw new Error('Incomplete final source jobs');
  liveJobs.push(...listing.jobs);
  if (liveJobs.length === listing.total_count) break;
  if (!listing.jobs.length || liveJobs.length > listing.total_count || page === 100) throw new Error('Incomplete final source jobs');
}
const jobResult = (pattern: string) => {
  const selected = liveJobs.filter(job => String(job.name).includes(pattern));
  return selected.length === 1 ? selected[0].conclusion || selected[0].status : 'missing_or_ambiguous';
};
let collected: Record<string, any> = {};
let previous: Record<string, unknown>[] = [];
try {
  collected = JSON.parse(readFileSync('verify-output/collected-checks.json', 'utf8'));
  const attempts = JSON.parse(readFileSync('verify-output/original-attempts-and-jobs.json', 'utf8')) as Record<string, any>[];
  previous = attempts.slice(0, -1).map(attempt => ({ state: attempt.run.conclusion === 'success' ? 'passed' : 'failed',
    resolution: 'unresolved', original_conclusion: attempt.run.conclusion, run_id: attempt.run.id, attempt: attempt.run.run_attempt }));
} catch { collected = {}; }
const needs = { reports: { result: jobResult(' / reports') }, review: { result: jobResult(' / review / records') },
  archive: { result: jobResult(' / archive / archive') }, bridge: { result: jobResult(' / bridge / scope') } };
const currentSource = liveRun.head_sha === sha && liveRun.repository?.full_name === process.env.GITHUB_REPOSITORY &&
  collected.target_sha === sha && String(collected.run_id) === sourceRunId &&
  collected.attempt === Number(liveRun.run_attempt) && collected.check_set_digest === digest && needs.reports.result === 'success';
let review: Record<string, any> = {};
try {
  const candidate = JSON.parse(readFileSync('review-output/validation.json', 'utf8'));
  if (candidate.target_sha === sha && candidate.context_digest === hash(readFileSync('verify-output/review-context.json'))) review = candidate;
} catch { review = {}; }
const reviewState = (kind: string) => needs.review.result === 'success' && review.assessments?.filter((item: Record<string, unknown>) =>
  item.review_kind === kind && item.state === 'passed').length === 1 ? 'passed' : 'missing';
let receipts: Record<string, any>[] = [];
let privateArchive = false;
try {
  receipts = readdirSync('private-receipts').map(file => JSON.parse(readFileSync('private-receipts/' + file, 'utf8')));
  privateArchive = needs.archive.result === 'success' && receipts.length > 0 && receipts.every(receipt =>
    receipt.state === 'archived_and_readback_verified' && receipt.source_sha === sha && String(receipt.source_run) === sourceRunId &&
    receipt.temporary_key_files_removed === true && Number(receipt.raw_file_count) > 0) &&
    collected.observed?.filter((item: Record<string, unknown>) => item.artifact_id).every((item: Record<string, unknown>) =>
      receipts.some(receipt => String(receipt.artifact_id) === String(item.artifact_id)));
} catch { privateArchive = false; }
const observed = (collected.observed || []).map((check: Record<string, any>) => {
  const state = check.id === 'bootstrap.source-archive' ? privateArchive ? 'passed' : 'missing' :
    check.id === 'bootstrap.codex-code-review' ? reviewState('code') : check.id === 'bootstrap.codex-visual-review' ? reviewState('visual') : undefined;
  if (!state) return check;
  return { ...check, state, source_verified: currentSource, source_job_conclusion: state === 'passed' ? 'success' : 'missing',
    source_sha: sha, check_set_digest: digest, raw_report_digest: state === 'passed' ?
      hash(JSON.stringify(check.id === 'bootstrap.source-archive' ? receipts : review)) : undefined };
});
const result = aggregateBootstrap({ profile: 'bootstrap', expected_sha: sha, target_sha: collected.target_sha,
  expected_check_set_digest: digest, check_set_digest: collected.check_set_digest,
  source_authenticated: currentSource, frozen_required_ids: manifest.bootstrap_checks.filter((check: Record<string, unknown>) =>
    check.bootstrap_applicability === 'required').map((check: Record<string, unknown>) => check.id),
  observed, previous_attempts: previous, collection_complete: collected.collection_complete,
  reports_read: reviewState('code') === 'passed' && reviewState('visual') === 'passed',
  code_review: reviewState('code'), visual_review: reviewState('visual'), tdd: 'missing',
  private_archive: privateArchive ? 'passed' : 'missing', cleanup: 'missing', orchestration: 'missing',
  bridge: needs.bridge.result === 'success' ? 'passed' : 'missing' });
mkdirSync('gate-output', { recursive: true });
writeFileSync('gate-output/readiness.json', JSON.stringify({ ...result, source: 'github-actions',
  target_sha: sha, run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  source_run_id: sourceRunId, observed, original_needs: needs,
  reports_read: reviewState('code') === 'passed' && reviewState('visual') === 'passed',
  limitation: 'Current Codex final records, complete TDD coverage and remaining actual admissions are required',
  feature_complete: false }, null, 2) + '\n');
writeFileSync('gate-output/final-source-job-outcomes.json', JSON.stringify({ run: liveRun, jobs: liveJobs }, null, 2) + '\n');
if (result.state !== 'passed') throw new Error('Initialization blocked: ' + JSON.stringify(result.reason_codes));
