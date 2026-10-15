import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveTddCycle } from '../../../tools/ci/tdd-cycle.ts';

test('TA01: implementation added after the claimed Green cannot form an authenticated TDD cycle', () => {
  const redSha = 'a'.repeat(40), greenSha = 'b'.repeat(40), finalSha = 'c'.repeat(40), implementation = 'e'.repeat(40);
  const execution = { source_authenticated: true, source: 'github-actions', health: 'passed', discovered: 1,
    executed: 1, test_digest: 'd'.repeat(64), fixture_digest: 'd'.repeat(64), oracle_digest: 'd'.repeat(64), regressions_passed: true };
  const input = { behavior_id: 'synthetic.implementation-order', target_sha: finalSha, implementation_sha: implementation,
    red: { ...execution, sha: redSha, run_id: '101', state: 'failed', failed: 1, failure_kind: 'assertion',
      cause: 'missing_behavior', implementation_present: false, cause_read_by: 'current-codex', cause_read_at: '2026-10-14T00:00:00Z' },
    green: { ...execution, sha: greenSha, run_id: '102', state: 'passed', failed: 0 },
    final: { ...execution, sha: finalSha, run_id: '103', state: 'passed', failed: 0 }, raw_red_preserved: true,
    history: { source: 'git-objects', ancestors: { [redSha]: [], [greenSha]: [redSha],
      [implementation]: [greenSha, redSha], [finalSha]: [implementation, greenSha, redSha] } } };
  assert.equal(deriveTddCycle(input).state, 'blocked');
  assert.equal(deriveTddCycle({ ...input, implementation_sha: greenSha }).state, 'passed');
});
