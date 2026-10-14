import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateReviewSchema } from '../../../tools/ci/review-schema.ts';
import { reviewFixture } from '../../fixtures/bootstrap/gates.ts';

function record(kind: string): Record<string, unknown> {
  const base = reviewFixture();
  return { ...base, review_kind: kind, actual_checks: { ...base.actual_checks, report_refs: ['artifact:actual-checks.json'] },
    images: base.required_images.map(id => ({ id, sha256: 'a'.repeat(64), platform: id.startsWith('ios') ? 'ios' : 'android',
      state: 'launch', theme: 'light', viewport: '390x844', read_at: base.reviewed_at, full_screen: true })),
    interaction_report_refs: ['artifact:interaction.json'], accessibility_report_refs: ['artifact:accessibility.json'] };
}

test('RS01: the frozen JSON schemas accept complete code and actual-image records', () => {
  for (const kind of ['code', 'visual']) assert.equal(validateReviewSchema(kind, record(kind)).state, 'passed');
});

test('RS02: required fields, actual date formats, image enums and false reading claims reject', () => {
  const invalid: [string, Record<string, unknown>][] = [
    ['code', { ...record('code'), session_ref: '' }],
    ['code', { ...record('code'), reviewed_at: 'tomorrow' }],
    ['code', { ...record('code'), inputs: [{ id: 'source.diff', digest: 'a'.repeat(64), read: false }] }],
    ['visual', { ...record('visual'), images: [{ id: 'ios.png', sha256: 'a'.repeat(64), platform: 'web', state: 'launch',
      theme: 'dark', viewport: '390x844', read_at: '2026-10-15T01:10:00Z', full_screen: true }] }],
  ];
  for (const [kind, candidate] of invalid) assert.equal(validateReviewSchema(kind, candidate).state, 'blocked');
});

test('RS03: unresolved, missing and wrong-kind review records stay blocked without losing their original payload', () => {
  const candidate = { ...record('code'), unresolved_items: ['physical-device-evidence-missing'] };
  assert.equal(validateReviewSchema('code', candidate).state, 'blocked');
  assert.deepEqual(candidate.unresolved_items, ['physical-device-evidence-missing']);
  assert.equal(validateReviewSchema('code', record('visual')).state, 'blocked');
  assert.equal(validateReviewSchema('unknown', null).state, 'blocked');
});
