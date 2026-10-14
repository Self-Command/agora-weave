import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessTddCycle } from '../../../tools/ci/gates.ts';
import { tddFixture } from '../../fixtures/bootstrap/gates.ts';

test('D01: read semantic Red before implementation plus same-oracle Green and final regression can pass', () => {
  assert.equal(assessTddCycle(tddFixture()).state, 'passed');
});

for (const kind of ['compile', 'import', 'network', 'credential', 'no_tests', 'service_unavailable']) {
  test(`D02: ${kind} failure is not a behavior Red`, () => {
    const input = tddFixture(); input.red.failure_kind = kind;
    assert.equal(assessTddCycle(input).state, 'blocked');
  });
}

test('D03: successful Red, unhealthy prerequisite, absent causal read or prior implementation blocks', () => {
  for (const patch of [{ state: 'passed' }, { health: 'failed' }, { cause_read_by: '' }, { cause_read_at: '' }, { implementation_present: true }, { discovered: 0 }]) {
    const input = tddFixture(); Object.assign(input.red, patch);
    assert.equal(assessTddCycle(input).state, 'blocked');
  }
});

test('D04: changed test/oracle/fixture cannot borrow the old Red', () => {
  for (const field of ['test_digest', 'oracle_digest', 'fixture_digest']) {
    const input = tddFixture(); Object.assign(input.green, { [field]: 'e'.repeat(64) });
    assert.equal(assessTddCycle(input).state, 'blocked');
  }
});

test('D05: reversed ancestry, failed regression, stale final or rewritten Red blocks', () => {
  for (const mutate of [
    (input: ReturnType<typeof tddFixture>) => { input.verified_ancestry.red_before_implementation = false; },
    (input: ReturnType<typeof tddFixture>) => { input.verified_ancestry.red_before_green = false; },
    (input: ReturnType<typeof tddFixture>) => { input.green.regressions_passed = false; },
    (input: ReturnType<typeof tddFixture>) => { input.final.sha = 'e'.repeat(40); },
    (input: ReturnType<typeof tddFixture>) => { input.final.state = 'running'; },
    (input: ReturnType<typeof tddFixture>) => { input.raw_red_preserved = false; },
  ]) {
    const input = tddFixture(); mutate(input);
    assert.equal(assessTddCycle(input).state, 'blocked');
  }
});
