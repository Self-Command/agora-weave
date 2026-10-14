import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { deriveOrchestrationSource } from '../../../tools/ci/orchestration-source.ts';

function source() {
  const sha = 'a'.repeat(40), digest = 'b'.repeat(64);
  return { expected_sha: sha, expected_check_set_digest: digest, repository: 'synthetic/repository',
    source_authenticated: true, actual_case_count: 126, source_run_id: '101',
    run: { id: 101, head_sha: sha, repository: { full_name: 'synthetic/repository' },
      path: '.github/workflows/verify-release.yml', event: 'push' },
    workflow: readFileSync('.github/workflows/verify-increment.yml', 'utf8'),
    dispatcher: readFileSync('.github/workflows/verify-release.yml', 'utf8'),
    scripts: JSON.parse(readFileSync('package.json', 'utf8')).scripts,
    reports_complete: true,
    checks: ['install', 'dev-services', 'test-services', 'discovery', 'admin', 'share', 'ios',
      'minimum-ios', 'android', 'minimum-android'].map(id => ({ id: 'bootstrap.' + id, state: 'passed',
        source_sha: sha, check_set_digest: digest, source_verified: true, raw_report_digest: 'c'.repeat(64) })),
    review: { code: 'passed', visual: 'passed', report_digest: 'd'.repeat(64) },
    jobs: [' / install', ' / service / Official Compose (dev)', ' / service / Official Compose (test)',
      ' / discover', ' / web / web', ' / native / iOS shell 26.4', ' / native / iOS shell 16.4',
      ' / native / Android shell API 24', ' / native / Android shell API 36',
      ' / reports', ' / review / records', ' / agoraweave/ci-gate'].map(name => ({ name: 'bootstrap' + name,
        status: name.includes('ci-gate') ? 'in_progress' : 'completed',
        conclusion: name.includes('ci-gate') ? null : 'success' })) };
}

test('OS01: current nonempty reports and actual workflow dependencies prove the executor chain while aggregation is invoked', () => {
  assert.equal(deriveOrchestrationSource(source()).state, 'passed');
});

test('OS02: missing dependency or conditional aggregation is refused even when every visible job looks green', () => {
  const input = source();
  for (const workflow of [input.workflow.replace('needs: [install, service]', 'needs: install'),
    input.workflow.replace('needs: reports\n', 'needs: install\n'),
    input.workflow.replace('    if: ${{ always() }}\n', '    if: ${{ success() }}\n')]) {
    assert.equal(deriveOrchestrationSource({ ...input, workflow }).state, 'blocked');
  }
});

test('OS03: source mismatch missing runtime reports empty discovery or a missing actual job cannot be masked by a called aggregator', () => {
  const input = source();
  for (const patch of [{ source_authenticated: false }, { actual_case_count: 0 }, { checks: [] },
    { expected_sha: 'e'.repeat(40) }, { source_run_id: '102' }, { reports_complete: false },
    { scripts: { ...input.scripts, 'ci:run': '' } }, { jobs: input.jobs.filter(job => !job.name.includes('Android shell API 24')) }]) {
    assert.equal(deriveOrchestrationSource({ ...input, ...patch }).state, 'blocked');
  }
});
