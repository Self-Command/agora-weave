import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deriveTddCycle } from '../../../tools/ci/tdd-cycle.ts';

function fixture() {
  const digest = 'd'.repeat(64);
  const execution = { source_authenticated: true, source: 'github-actions', health: 'passed', discovered: 2,
    executed: 2, test_digest: digest, fixture_digest: digest, oracle_digest: digest, regressions_passed: true };
  return { behavior_id: 'engineering.source-verification', target_sha: 'c'.repeat(40),
    red: { ...execution, sha: 'a'.repeat(40), run_id: '101', state: 'failed', failed: 2,
      failure_kind: 'assertion', cause: 'missing_behavior', implementation_present: false,
      cause_read_by: 'current-codex', cause_read_at: '2026-10-15T00:00:00Z' },
    green: { ...execution, sha: 'b'.repeat(40), run_id: '102', state: 'passed', failed: 0 },
    final: { ...execution, sha: 'c'.repeat(40), run_id: '103', state: 'passed', failed: 0 },
    implementation_sha: 'b'.repeat(40),
    history: { source: 'git-objects', ancestors: { ['a'.repeat(40)]: [], ['b'.repeat(40)]: ['a'.repeat(40)],
      ['c'.repeat(40)]: ['a'.repeat(40), 'b'.repeat(40)] } },
    raw_red_preserved: true };
}

test('TS01: authenticated original Red, same inputs and actual ancestry produce a bound TDD result', () => {
  assert.equal(deriveTddCycle(fixture()).state, 'passed');
});

test('TS02: claimed ancestry flags cannot replace the actual commit ancestry graph', () => {
  const input = fixture(); input.history.ancestors['b'.repeat(40)] = [];
  assert.equal(deriveTddCycle({ ...input, verified_ancestry: { red_before_implementation: true } }).state, 'blocked');
});

test('TS03: changed test oracle, unauthenticated raw source and environment failures reject', () => {
  for (const patch of [{ oracle_digest: 'e'.repeat(64) }, { source_authenticated: false },
    { health: 'failed' }, { failure_kind: 'import' }, { failed: 0 }]) {
    const input = fixture(); Object.assign(input.red, patch);
    assert.equal(deriveTddCycle(input).state, 'blocked');
  }
});

test('TS04: no final Green, reduced regression or implementation already in Red rejects', () => {
  for (const patch of [{ final: { ...fixture().final, sha: 'e'.repeat(40) } },
    { green: { ...fixture().green, regressions_passed: false } },
    { implementation_sha: 'a'.repeat(40) }, { raw_red_preserved: false }]) {
    assert.equal(deriveTddCycle({ ...fixture(), ...patch }).state, 'blocked');
  }
});
