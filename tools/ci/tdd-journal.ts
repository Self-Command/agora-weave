import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { collectEvidence } from './collect-evidence.ts';
import { deriveTddCycle } from './tdd-cycle.ts';

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
const candidates = listing.workflow_runs.filter((run: Record<string, any>) => run.head_sha === sha &&
  run.path === '.github/workflows/ci-bootstrap.yml' && run.head_repository.full_name === repository);
if (candidates.length !== 1) throw new Error('Unique current engineering executor required');
const finalSource = { sha, run_id: String(candidates[0].id), attempt: candidates[0].run_attempt };
mkdirSync('tdd-output', { recursive: true });
const records: Record<string, unknown>[] = [];
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
    const outcome = JSON.parse(readFileSync(`${root}/raw/outcome.json`, 'utf8'));
    const assertions = [...raw.matchAll(/^(not )?ok (\d+) - (.+)\r?$/gm)];
    const selected = assertions.filter(item => cycle.case_ids.some((id: string) => item[3].startsWith(`${id}:`)));
    if (selected.length !== cycle.case_ids.length || cycle.case_ids.some((id: string) =>
      selected.filter(item => item[3].startsWith(`${id}:`)).length !== 1)) throw new Error('TDD target discovery incomplete');
    const failed = selected.filter(item => item[1]).length;
    const test = execFileSync('git', ['show', `${source.sha}:${cycle.test_file}`]);
    const fixture = execFileSync('git', ['show', `${source.sha}:${cycle.fixture_file}`]);
    return { ...source, source_authenticated: true, source: 'github-actions', discovered: selected.length,
      executed: selected.length, failed, state: failed ? 'failed' : 'passed',
      health: outcome.outcome === 'success' ? 'passed' : 'failed',
      regressions_passed: /^# fail 0\r?$/m.test(raw) && /^# cancelled 0\r?$/m.test(raw) && /^# skipped 0\r?$/m.test(raw),
      test_digest: hash(test), fixture_digest: hash(fixture), oracle_digest: hash(test),
      original_conclusion: result.original_conclusion, archive_sha256: result.archive_sha256,
      artifact_id: result.artifact_id, raw_report_digest: hash(raw), original_attempts: result.attempts };
  }
  const red = await execution(cycle.red, 'red');
  const green = await execution(cycle.green, 'green');
  const final = await execution(finalSource, 'final');
  const ancestors = Object.fromEntries([cycle.implementation_sha, cycle.green.sha, sha].map(target => [target,
    execFileSync('git', ['rev-list', target], { encoding: 'utf8' }).trim().split('\n').slice(1)]));
  const source = { ...cycle, target_sha: sha, red: { ...red, failure_kind: 'assertion', cause: cycle.cause,
    implementation_present: false, cause_read_by: cycle.cause_read_by, cause_read_at: cycle.cause_read_at },
    green, final, history: { source: 'git-objects', ancestors }, raw_red_preserved: true };
  const assessment = deriveTddCycle(source);
  records.push({ ...source, assessment, feature_complete: false });
}
const passed = records.length > 0 && records.every(record => (record.assessment as Record<string, unknown>).state === 'passed');
writeFileSync('tdd-output/journal.json', JSON.stringify({ source: 'github-actions', target_sha: sha,
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT), records,
  state: passed ? 'recorded_cycles_verified' : 'blocked', coverage: catalog.coverage,
  readiness: 'not_evaluated', feature_complete: false }, null, 2) + '\n');
if (!passed) throw new Error('Authenticated TDD cycle did not pass');
