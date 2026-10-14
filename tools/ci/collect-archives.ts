import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { collectEvidence } from './collect-evidence.ts';
import { planArchive } from './archive-evidence.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
  throw new Error('Archive collection requires GitHub-hosted Actions');
}
const token = process.env.GH_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const runId = process.env.SOURCE_RUN_ID || process.env.GITHUB_RUN_ID;
const expectedSha = process.env.SOURCE_SHA || process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA;
if (!token || repository !== 'Self-Command/agora-weave' || !runId || !/^[1-9]\d*$/.test(runId) ||
  !expectedSha || !/^[a-f0-9]{40}$/.test(expectedSha)) throw new Error('Missing trusted archive target');
const headers = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10' };
async function metadata(suffix: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.github.com/repos/${repository}${suffix}`, {
    headers, redirect: 'error', signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Archive metadata unavailable: ${response.status}`);
  return await response.json() as Record<string, unknown>;
}
const run = await metadata(`/actions/runs/${runId}`);
if (run.head_sha !== expectedSha || !Number.isInteger(run.run_attempt) || typeof run.path !== 'string') {
  throw new Error('Archive source differs from approved target');
}
const artifacts: Record<string, unknown>[] = [];
for (let page = 1; page <= 100; page++) {
  const listing = await metadata(`/actions/runs/${runId}/artifacts?per_page=100&page=${page}`);
  if (!Number.isInteger(listing.total_count) || !Array.isArray(listing.artifacts)) throw new Error('Incomplete archive listing');
  artifacts.push(...listing.artifacts);
  if (artifacts.length === listing.total_count) break;
  if (!listing.artifacts.length || artifacts.length > Number(listing.total_count) || page === 100) throw new Error('Ambiguous archive listing');
}
const names = artifacts.map(artifact => artifact.name);
if (!artifacts.length || names.some(name => typeof name !== 'string') || new Set(names).size !== names.length) {
  throw new Error('Missing or duplicate original archive artifacts');
}
mkdirSync('archive-output', { recursive: true });
const catalog: Record<string, unknown>[] = [];
for (const artifact of artifacts) {
  const result = await collectEvidence({ repository, run_id: runId, expected_sha: expectedSha,
    expected_attempt: Number(run.run_attempt), workflow_path: run.path, artifact_name: String(artifact.name), token });
  if (result.state !== 'verified_source' || !result.archive || !result.archive_sha256 || !result.artifact_id) {
    writeFileSync('archive-output/collection-failure.json', JSON.stringify({ state: 'blocked', artifact_name: artifact.name,
      reason_codes: result.reason_codes, target_sha: expectedSha, source_run: runId }, null, 2) + '\n');
    throw new Error('Original source authentication failed');
  }
  const directory = `archive-output/${result.artifact_id}`;
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/source.zip`, result.archive);
  execFileSync('python3', ['tools/ci/index-archive.py', `${directory}/source.zip`, `${directory}/raw-files.json`], { stdio: 'inherit' });
  const plan = planArchive({ repository, target_sha: expectedSha, run_id: runId,
    attempt: Number(run.run_attempt), artifact_id: String(result.artifact_id), source_state: result.state,
    original_conclusion: result.original_conclusion, archive_sha256: result.archive_sha256,
    raw_files: JSON.parse(readFileSync(`${directory}/raw-files.json`, 'utf8')), data_class: 'engineering',
    retention_class: 'ordinary', archived_at: new Date().toISOString(),
    cleanup: { credentials: 'not_used', sandbox: 'removed', scope: 'archive-classification-no-product-credentials-or-sandbox' } });
  if (plan.state !== 'archive_planned') throw new Error(`Private index rejected: ${JSON.stringify(plan.reason_codes)}`);
  const remote = `${plan.remote_directory}_${process.env.GITHUB_RUN_ID}_${process.env.GITHUB_RUN_ATTEMPT}`;
  const index = { ...plan, remote_directory: remote, artifact_name: artifact.name,
    source_run_metadata: result.source_run, original_attempts: result.attempts,
    archive_execution: { run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
      checkout_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), source: 'github-actions' },
    product_cleanup: 'separate_original_executor_reports_required' };
  const bytes = JSON.stringify(index, null, 2) + '\n';
  writeFileSync(`${directory}/index.json`, bytes);
  catalog.push({ artifact_id: result.artifact_id, artifact_name: artifact.name, directory, remote_directory: remote,
    archive_sha256: result.archive_sha256, index_sha256: createHash('sha256').update(bytes).digest('hex'),
    original_conclusion: result.original_conclusion, source_sha: expectedSha, source_run: runId });
}
writeFileSync('archive-output/catalog.json', JSON.stringify(catalog, null, 2) + '\n');
