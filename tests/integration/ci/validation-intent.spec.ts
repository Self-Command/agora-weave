import assert from 'node:assert/strict';
import { test } from 'node:test';
import { aggregateBootstrap } from '../../../tools/ci/aggregate.ts';

function fixture() {
  return { profile: 'bootstrap', source_authenticated: true, expected_sha: 'a'.repeat(40), target_sha: 'a'.repeat(40),
    expected_check_set_digest: 'b'.repeat(64), check_set_digest: 'b'.repeat(64),
    frozen_required_ids: ['install', 'service', 'physical'],
    observed: ['install', 'service', 'physical'].map(id => ({ id, state: 'passed',
      source_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), source_verified: true,
      raw_report_digest: 'c'.repeat(64), source_job_conclusion: 'success' })),
    previous_attempts: [], collection_complete: true, reports_read: true,
    code_review: 'passed', visual_review: 'passed', tdd: 'passed', private_archive: 'passed',
    cleanup: 'passed', orchestration: 'passed', bridge: 'passed' };
}

test('EI01: feedback success cannot authorize formal Green or completion', () => {
  for (const required_intent of ['green', 'completion']) {
    const result = aggregateBootstrap({ ...fixture(), validation_intent: 'feedback', required_intent });
    assert.equal(result.state, 'blocked');
    assert.ok((result.reason_codes as string[]).includes('insufficient_validation_intent'));
  }
  assert.equal(aggregateBootstrap({ ...fixture(), validation_intent: 'green', required_intent: 'completion' }).state, 'blocked');
  assert.equal(aggregateBootstrap({ ...fixture(), validation_intent: 'completion', required_intent: 'completion' }).state, 'passed');
});
