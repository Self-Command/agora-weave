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

test('SA01: exact frozen authenticated check set can pass after all actual admissions', () => {
  assert.equal(aggregateBootstrap(fixture()).state, 'passed');
});

test('SA02: physical resource or absent original report remains blocked without reducing the frozen set', () => {
  const input = fixture(); input.observed[2].state = 'unavailable';
  assert.equal(aggregateBootstrap(input).state, 'blocked');
  input.observed.pop();
  assert.equal(aggregateBootstrap(input).state, 'blocked');
});

test('SA03: preserved unresolved attempts cannot be concealed by a green final attempt', () => {
  assert.equal(aggregateBootstrap({ ...fixture(), previous_attempts: [{ state: 'failed', resolution: 'unresolved' }] }).state, 'blocked');
  assert.equal(aggregateBootstrap({ ...fixture(), previous_attempts: [{ state: 'failed', resolution: 'expected_red_observed',
    observation_source_verified: true, raw_preserved: true }] }).state, 'passed');
});

test('SA04: incomplete collection, stale checkout and unverified source fail closed', () => {
  for (const patch of [{ source_authenticated: false }, { collection_complete: false },
    { target_sha: 'e'.repeat(40) }, { check_set_digest: 'e'.repeat(64) }]) {
    assert.equal(aggregateBootstrap({ ...fixture(), ...patch }).state, 'blocked');
  }
  const input = fixture(); input.observed[0].source_verified = false;
  assert.equal(aggregateBootstrap(input).state, 'blocked');
});

test('SA05: unread reports or missing review, archive, TDD, cleanup, graph and bridge reject', () => {
  for (const key of ['reports_read', 'code_review', 'visual_review', 'tdd', 'private_archive', 'cleanup', 'orchestration', 'bridge']) {
    assert.equal(aggregateBootstrap({ ...fixture(), [key]: key === 'reports_read' ? false : 'missing' }).state, 'blocked');
  }
});
