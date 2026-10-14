import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessReviewBaseline } from '../../../tools/ci/gates.ts';
import { reviewFixture } from '../../fixtures/bootstrap/gates.ts';

test('R01: current Codex actual-image review with bound reports and user-approved baseline can pass', () => {
  assert.equal(assessReviewBaseline(reviewFixture()).state, 'passed');
});

test('R02: missing actual image, input digest mismatch, incomplete coverage or truncated output blocks', () => {
  for (const mutate of [
    (input: ReturnType<typeof reviewFixture>) => { input.actual_images_read.pop(); },
    (input: ReturnType<typeof reviewFixture>) => { input.inputs[0].verified_digest = 'e'.repeat(64); },
    (input: ReturnType<typeof reviewFixture>) => { input.coverage.pop(); },
    (input: ReturnType<typeof reviewFixture>) => { input.output_complete = false; },
    (input: ReturnType<typeof reviewFixture>) => { input.inputs[0].read = false; },
  ]) {
    const input = reviewFixture(); mutate(input);
    assert.equal(assessReviewBaseline(input).state, 'blocked');
  }
});

test('R03: private/production/secret inputs and unresolved judgment block', () => {
  for (const dataClass of ['secret', 'production', 'real_user']) {
    const input = reviewFixture(); input.input_data_classes.push(dataClass);
    assert.equal(assessReviewBaseline(input).state, 'blocked');
  }
  assert.equal(assessReviewBaseline({ ...reviewFixture(), unresolved_items: ['cannot judge'] }).state, 'blocked');
  assert.equal(assessReviewBaseline({ ...reviewFixture(), findings: [{ id: 'F1', state: 'open' }] }).state, 'blocked');
});

test('R04: unknown, automatic, model-approved or wrong-candidate baseline blocks', () => {
  for (const patch of [{ state: 'awaiting_confirmation' }, { approver: 'current-codex' }, { auto_updated: true }, { confirmed_digest: 'e'.repeat(64) }, { authorization_ref: '' }, { coverage: ['ios:loading'] }]) {
    const input = reviewFixture(); Object.assign(input.baseline, patch);
    assert.equal(assessReviewBaseline(input).state, 'blocked');
  }
});

test('R05: low pixel difference cannot conceal failed actual interaction or accessibility', () => {
  for (const patch of [{ interactions_passed: false }, { accessibility_passed: false }, { source: 'local' }, { state: 'skipped' }]) {
    const input = reviewFixture(); Object.assign(input.actual_checks, patch);
    assert.equal(assessReviewBaseline(input).state, 'blocked');
  }
});

test('R06: different target SHA or invented independent model call blocks this reviewer route', () => {
  for (const patch of [{ target_sha: 'e'.repeat(40) }, { reviewer: '' }, { session_ref: '' }, { execution_mode: 'independent-cloud-ai' }]) {
    assert.equal(assessReviewBaseline({ ...reviewFixture(), ...patch }).state, 'blocked');
  }
});
