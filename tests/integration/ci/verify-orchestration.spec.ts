import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessOrchestration } from '../../../tools/ci/gates.ts';
import { orchestrationFixture } from '../../fixtures/bootstrap/gates.ts';

test('O01: complete dispatched nonempty initialization execution graph can pass', () => {
  assert.equal(assessOrchestration(orchestrationFixture()).state, 'passed');
});

for (const missing of ['install', 'service', 'discover', 'admin', 'share', 'ios', 'android', 'reports', 'review']) {
  test(`O02: aggregator alone cannot conceal missing ${missing} executor`, () => {
    const input = orchestrationFixture();
    input.nodes = input.nodes.filter(node => node.id !== missing);
    assert.equal(assessOrchestration(input).state, 'blocked');
  });
}

test('O03: missing dependency edge, cycle, empty matrix and undispatched graph block', () => {
  for (const mutate of [
    (input: ReturnType<typeof orchestrationFixture>) => { input.edges.pop(); },
    (input: ReturnType<typeof orchestrationFixture>) => { input.edges.push(['aggregate', 'install']); },
    (input: ReturnType<typeof orchestrationFixture>) => { input.nodes = []; },
    (input: ReturnType<typeof orchestrationFixture>) => { input.actual_dispatch = false; },
  ]) {
    const input = orchestrationFixture(); mutate(input);
    assert.equal(assessOrchestration(input).state, 'blocked');
  }
});

test('O04: zero discovery, missing script, skipped execution, missing raw report all block', () => {
  for (const patch of [{ executed: 0 }, { script_present: false }, { state: 'skipped' }, { report_digest: '' }]) {
    const input = orchestrationFixture(); Object.assign(input.nodes[2], patch);
    assert.equal(assessOrchestration(input).state, 'blocked');
  }
});

test('O05: SHA/profile/check-set mismatch or conditional aggregation blocks', () => {
  for (const patch of [{ checkout_sha: 'e'.repeat(40) }, { profile: 'full-release' }, { check_set_digest: 'e'.repeat(64) }, { aggregate_condition: 'success' }]) {
    assert.equal(assessOrchestration({ ...orchestrationFixture(), ...patch }).state, 'blocked');
  }
});
