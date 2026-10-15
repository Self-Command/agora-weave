import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bindReviewRecord } from '../../../tools/ci/review-record.ts';
import { reviewFixture } from '../../fixtures/bootstrap/gates.ts';

function fixture() {
  const record = reviewFixture();
  const context = { source_authenticated: true, source: 'github-actions', runner_environment: 'github-hosted',
    expected_sha: record.target_sha, contract_digest: record.contract_digest, review_kind: record.review_kind,
    required_coverage: record.required_coverage, required_images: record.required_images,
    verified_inputs: record.inputs.map(input => ({ id: input.id, digest: input.digest })),
    actual_checks: record.actual_checks, baseline: record.baseline };
  return { record, context };
}

test('RB01: a review binds required coverage and image bytes from authenticated source context', () => {
  const { record, context } = fixture();
  assert.equal(bindReviewRecord(record, context).state, 'passed');
});

test('RB02: self-declared verification cannot conceal a different actual input digest', () => {
  const { record, context } = fixture();
  context.verified_inputs[0].digest = 'e'.repeat(64);
  assert.equal(bindReviewRecord(record, context).state, 'blocked');
});

test('RB03: a reviewer cannot shrink required coverage or hide a required source image', () => {
  const { record, context } = fixture();
  record.required_coverage.pop(); record.coverage.pop();
  record.required_images.pop(); record.actual_images_read.pop(); record.inputs.pop();
  assert.equal(bindReviewRecord(record, context).state, 'blocked');
});

test('RB04: raw passed claims cannot replace failed or unavailable actual interaction results', () => {
  const { record, context } = fixture();
  context.actual_checks = { ...context.actual_checks, interactions_passed: false };
  assert.equal(bindReviewRecord(record, context).state, 'blocked');
});

test('RB05: unconfirmed authoritative baseline rejects a self-approved confirmed record', () => {
  const { record, context } = fixture();
  context.baseline = { ...context.baseline, state: 'awaiting_confirmation' };
  assert.equal(bindReviewRecord(record, context).state, 'blocked');
});

test('RB06: unauthenticated, local, stale target and empty required input contexts reject', () => {
  for (const patch of [{ source_authenticated: false }, { source: 'local' },
    { expected_sha: 'e'.repeat(40) }, { verified_inputs: [] }]) {
    const { record, context } = fixture();
    assert.equal(bindReviewRecord(record, { ...context, ...patch }).state, 'blocked');
  }
});

test('RB07: code record validation binds actual contracts independently of physical accessibility admission', () => {
  const { record, context } = fixture();
  record.review_kind = context.review_kind = 'code';
  record.actual_checks = context.actual_checks = { ...context.actual_checks, interactions_passed: false, accessibility_passed: false };
  assert.equal(bindReviewRecord(record, context).state, 'passed');
});
