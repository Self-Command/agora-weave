import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { collectEvidence } from './collect-evidence.ts';
import { deriveTddCycle } from './tdd-cycle.ts';
import { selectTddCases } from './tdd-cases.ts';
import { selectEngineeringSource } from './source-run-selection.ts';
import { assessTddCoverage } from './tdd-coverage.ts';
import { normalizeExecution } from './run-check-set.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('TDD journal requires GitHub-hosted Actions');
const repository = process.env.GITHUB_REPOSITORY!;
const token = process.env.GH_TOKEN!;
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const catalog = JSON.parse(readFileSync('infra/ci/tdd-source-catalog.json', 'utf8'));
const hash = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
async function metadata(suffix: string): Promise<Record<string, any>> {
  const response = await fetch(`https://api.github.com/repos/${repository}${suffix}`, { headers: {
    Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10',
  }, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Authenticated TDD metadata unavailable');
  return await response.json();
}
const listing = await metadata(`/actions/runs?head_sha=${sha}&per_page=100`);
const selected = selectEngineeringSource({ target_sha: sha, repository, event: process.env.GITHUB_EVENT_NAME,
  branch: process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME, runs: listing.workflow_runs });
if (selected.state !== 'selected') throw new Error('Unique current event-bound engineering executor required');
const finalSource = { sha, run_id: String(selected.run_id), attempt: Number(selected.attempt) };
mkdirSync('tdd-output', { recursive: true });
const records: Record<string, unknown>[] = [];
let finalRaw: string | undefined;
for (const cycle of catalog.cycles) {
  async function execution(source: Record<string, any>, label: string) {
    const result = await collectEvidence({ repository, token, run_id: source.run_id, expected_sha: source.sha,
      expected_attempt: source.attempt, workflow_path: '.github/workflows/ci-bootstrap.yml',
      artifact_name: `bootstrap-transport-${source.run_id}-${source.attempt}` });
    if (result.state !== 'verified_source' || !result.archive) throw new Error('TDD raw execution source unavailable');
    const root = `tdd-output/${cycle.cycle_id}/${label}`;
    mkdirSync(root, { recursive: true });
    writeFileSync(`${root}/source.zip`, result.archive);
    execFileSync('python3', ['tools/ci/index-archive.py', `${root}/source.zip`, `${root}/raw-files.json`, `${root}/raw`]);
    const raw = readFileSync(`${root}/raw/engineering.tap`, 'utf8');
    if (label === 'final') {
      if (finalRaw !== undefined && hash(finalRaw) !== hash(raw)) throw new Error('Final executor bytes differ between cycles');
      finalRaw = raw;
    }
    const outcome = JSON.parse(readFileSync(`${root}/raw/outcome.json`, 'utf8'));
    const selected = selectTddCases(raw, cycle);
    if (!selected.length) throw new Error('TDD target discovery incomplete');
    const failed = selected.filter(item => item.failed).length;
    const test = execFileSync('git', ['show', `${source.sha}:${cycle.test_file}`]);
    const fixture = execFileSync('git', ['show', `${source.sha}:${cycle.fixture_file}`]);
    const sourceManifest = execFileSync('git', ['show', `${source.sha}:tools/ci/validation-manifest.json`]);
    const applicable = normalizeExecution({ format: 'tap', raw,
      expected_count: JSON.parse(sourceManifest.toString()).engineering_case_count, exit_code: 0 }).state === 'passed';
    let purpose: Record<string, unknown> = { purpose_authenticated: false };
    try {
      const bytes = execFileSync('git', ['show', `${source.sha}:infra/ci/validation-request.json`], { stdio: ['ignore', 'pipe', 'ignore'] });
      const request = JSON.parse(bytes.toString());
      purpose = { validation_intent: request.validation_intent,
        purpose_authenticated: request.schema_version === 1 && ['feedback', 'green', 'completion'].includes(request.validation_intent),
        intent_input_digest: hash(bytes), legacy_pre_intent_source: false };
    } catch {
      // Approved historical cycles predate explicit intent; only ancestors of the original input checkpoint qualify.
      try {
        execFileSync('git', ['merge-base', '--is-ancestor', source.sha, 'bb62b29'], { stdio: 'ignore' });
        purpose = { validation_intent: 'green', purpose_authenticated: true, legacy_pre_intent_source: true,
          legacy_intent_baseline: execFileSync('git', ['rev-parse', 'bb62b29'], { encoding: 'utf8' }).trim() };
      } catch { /* New sources without a committed purpose cannot authorize formal Green. */ }
    }
    return { ...source, source_authenticated: true, source: 'github-actions', discovered: selected.length,
      executed: selected.length, failed, state: failed ? 'failed' : 'passed',
      health: outcome.outcome === 'success' ? 'passed' : 'failed',
      regressions_passed: /^# fail 0\r?$/m.test(raw) && /^# cancelled 0\r?$/m.test(raw) && /^# skipped 0\r?$/m.test(raw),
      test_digest: hash(test), fixture_digest: hash(fixture), oracle_digest: hash(test),
      original_conclusion: result.original_conclusion, archive_sha256: result.archive_sha256,
      artifact_id: result.artifact_id, selected_assertions: selected,
      raw_report_digest: hash(raw), original_attempts: result.attempts,
      ...purpose, applicable_set_verified: applicable, applicable_set_digest: hash(sourceManifest),
      source_reuse: { ...result.reuse_receipt, raw_index_digest: hash(readFileSync(`${root}/raw-files.json`)),
        raw_files_verified: true } };
  }
  const red = await execution(cycle.red, 'red');
  const green = await execution(cycle.green, 'green');
  const final = await execution(finalSource, 'final');
  const ancestors = Object.fromEntries([cycle.implementation_sha, cycle.green.sha, sha].map(target => [target,
    execFileSync('git', ['rev-list', target], { encoding: 'utf8' }).trim().split('\n').slice(1)]));
  const source = { ...cycle, target_sha: sha, require_authenticated_purpose: true, red: { ...red, failure_kind: 'assertion', cause: cycle.cause,
    implementation_present: false, cause_read_by: cycle.cause_read_by, cause_read_at: cycle.cause_read_at },
    green, final, history: { source: 'git-objects', ancestors }, raw_red_preserved: true };
  const assessment = deriveTddCycle(source);
  records.push({ ...source, assessment, feature_complete: false });
}
const passed = records.length > 0 && records.every(record => (record.assessment as Record<string, unknown>).state === 'passed');
const coverage = assessTddCoverage({ ...finalSource, target_sha: sha, source_authenticated: true, records, raw_tap: finalRaw,
  expected_count: JSON.parse(readFileSync('tools/ci/validation-manifest.json', 'utf8')).engineering_case_count });
writeFileSync('tdd-output/journal.json', JSON.stringify({ source: 'github-actions', target_sha: sha,
  checkout_sha: sha, runner_environment: process.env.RUNNER_ENVIRONMENT,
  check_set_digest: hash(readFileSync('tools/ci/validation-manifest.json')),
  toolchain_digest: hash(readFileSync('infra/ci/toolchain-lock.json')),
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT), records,
  state: passed ? 'recorded_cycles_verified' : 'blocked', coverage: coverage.coverage, coverage_assessment: coverage,
  declared_coverage: catalog.coverage,
  readiness: 'not_evaluated', feature_complete: false }, null, 2) + '\n');
if (!passed) throw new Error('Authenticated TDD cycle did not pass');
