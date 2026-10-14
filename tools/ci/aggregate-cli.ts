import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { aggregateBootstrap } from './aggregate.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Aggregation is Actions only');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const digest = createHash('sha256').update(manifestBytes).digest('hex');
const manifest = JSON.parse(manifestBytes.toString());
let collected: Record<string, any> = {};
let previous: Record<string, unknown>[] = [];
try {
  collected = JSON.parse(readFileSync('verify-output/collected-checks.json', 'utf8'));
  const attempts = JSON.parse(readFileSync('verify-output/original-attempts-and-jobs.json', 'utf8')) as Record<string, any>[];
  previous = attempts.slice(0, -1).map(attempt => ({ state: attempt.run.conclusion === 'success' ? 'passed' : 'failed',
    resolution: 'unresolved', original_conclusion: attempt.run.conclusion, run_id: attempt.run.id, attempt: attempt.run.run_attempt }));
} catch { collected = {}; }
const needs = JSON.parse(process.env.NEEDS_JSON || '{}');
const currentSource = collected.target_sha === sha && String(collected.run_id) === process.env.GITHUB_RUN_ID &&
  collected.attempt === Number(process.env.GITHUB_RUN_ATTEMPT) && collected.check_set_digest === digest && needs.reports?.result === 'success';
const result = aggregateBootstrap({ profile: 'bootstrap', expected_sha: sha, target_sha: collected.target_sha,
  expected_check_set_digest: digest, check_set_digest: collected.check_set_digest,
  source_authenticated: currentSource, frozen_required_ids: manifest.bootstrap_checks.filter((check: Record<string, unknown>) =>
    check.bootstrap_applicability === 'required').map((check: Record<string, unknown>) => check.id),
  observed: collected.observed || [], previous_attempts: previous, collection_complete: collected.collection_complete,
  reports_read: false, code_review: 'missing', visual_review: 'missing', tdd: 'missing',
  private_archive: needs.archive?.result === 'success' ? 'passed' : 'missing',
  cleanup: 'missing', orchestration: 'missing', bridge: needs.bridge?.result === 'success' ? 'passed' : 'missing' });
mkdirSync('gate-output', { recursive: true });
writeFileSync('gate-output/readiness.json', JSON.stringify({ ...result, source: 'github-actions',
  target_sha: sha, run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  observed: collected.observed || [], original_needs: needs, reports_read: false,
  limitation: 'Current Codex final records, full authenticated TDD and remaining actual admissions still required',
  feature_complete: false }, null, 2) + '\n');
if (result.state !== 'passed') throw new Error(`Initialization blocked: ${JSON.stringify(result.reason_codes)}`);
