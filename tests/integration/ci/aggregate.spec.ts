import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessAggregate } from '../../../tools/ci/evidence.ts';
import { aggregateRequest } from '../../fixtures/bootstrap/evidence.ts';

test('A01: all declared required checks need real complete execution', () => {
  assert.equal(assessAggregate(aggregateRequest()).state, 'passed');
});

test('A02: waiting for only one of two required checks must block', () => {
  const input = aggregateRequest();
  input.required_checks.push({ ...input.required_checks[0], id: 'bootstrap.web' });
  const result = assessAggregate(input);
  assert.equal(result.state, 'blocked');
  assert.ok(result.reason_codes.includes('missing_check'));
});

test('A03: empty required manifest and zero attempts must block', () => {
  assert.equal(assessAggregate({ ...aggregateRequest(), required_checks: [] }).state, 'blocked');
  assert.equal(assessAggregate({ ...aggregateRequest(), attempts: [] }).state, 'blocked');
});

test('A04: a green retry does not conceal an unresolved failed attempt', () => {
  const input = aggregateRequest();
  const prior = { ...input.attempts[0], attempt: 1, state: 'failed' };
  input.attempts[0].attempt = 2;
  input.attempts.unshift(prior);
  const result = assessAggregate(input);
  assert.equal(result.state, 'blocked');
  assert.ok(result.reason_codes.includes('unresolved_attempt'));
});

test('A05: cancelled or skipped prerequisites cannot be hidden by a passed aggregator', () => {
  for (const state of ['skipped', 'cancelled', 'timed_out', 'unavailable']) {
    const input = aggregateRequest();
    input.attempts[0].state = state;
    assert.equal(assessAggregate(input).state, 'blocked');
  }
});

test('A06: a caller cannot replace the frozen check-set digest', () => {
  const input = aggregateRequest();
  input.attempts[0].check_set_digest = 'e'.repeat(64);
  assert.equal(assessAggregate(input).state, 'blocked');
});

test('A07: an expected Red observation alone never supplies required Green evidence', () => {
  const input = aggregateRequest();
  input.attempts[0].state = 'failed';
  input.attempts[0].outcome_class = 'expected_red';
  assert.equal(assessAggregate(input).state, 'blocked');
});
