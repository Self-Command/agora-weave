import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bindReviewRecord } from '../../../tools/ci/review-record.ts';
import { validateReviewSchema } from '../../../tools/ci/review-schema.ts';
import { reviewFixture } from '../../fixtures/bootstrap/gates.ts';

function fixture() {
  const common = reviewFixture();
  const record = { ...common, interaction_report_refs: ['test-report.json'], accessibility_report_refs: ['test-report.json'],
    images: [
      { id: 'ios.png', sha256: 'c'.repeat(64), platform: 'ios', state: 'loading', theme: 'light',
        viewport: '390x844', read_at: '2026-10-15T01:10:00Z', full_screen: true },
      { id: 'android.png', sha256: 'c'.repeat(64), platform: 'android', state: 'error', theme: 'light',
        viewport: '390x844', read_at: '2026-10-15T01:10:00Z', full_screen: true },
    ] };
  const context = { source_authenticated: true, source: 'github-actions', runner_environment: 'github-hosted',
    expected_sha: record.target_sha, contract_digest: record.contract_digest, review_kind: record.review_kind,
    required_coverage: record.required_coverage, required_images: record.required_images,
    verified_inputs: record.inputs.map(input => ({ id: input.id, digest: input.digest })),
    actual_checks: record.actual_checks, baseline: record.baseline };
  return { record, context };
}

test('RI01: per-image visual digests must match authenticated bytes even when the shared input inventory is correct', () => {
  const { record, context } = fixture();
  assert.equal(validateReviewSchema('visual', record).state, 'passed');
  assert.equal(bindReviewRecord(record, context).state, 'passed');
  const forged = { ...record, images: [record.images[0], { ...record.images[1], sha256: 'e'.repeat(64) }] };
  assert.equal(validateReviewSchema('visual', forged).state, 'passed');
  assert.equal(bindReviewRecord(forged, context).state, 'blocked');
});

test('RI02: the per-image visual inventory cannot omit, duplicate or invent an authenticated required image', () => {
  const { record, context } = fixture();
  assert.equal(validateReviewSchema('visual', record).state, 'passed');
  assert.equal(bindReviewRecord(record, context).state, 'passed');
  for (const images of [record.images.slice(1), [record.images[0], record.images[0]],
    [record.images[0], { ...record.images[1], id: 'invented.png' }]]) {
    const incomplete = { ...record, images };
    assert.equal(validateReviewSchema('visual', incomplete).state, 'passed');
    assert.equal(bindReviewRecord(incomplete, context).state, 'blocked');
  }
});
