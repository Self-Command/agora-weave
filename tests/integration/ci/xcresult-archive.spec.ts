import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planArchive, verifyReadback } from '../../../tools/ci/archive-evidence.ts';

test('XA01: original XCTest data names retain their bytes and remain within the private archive boundary', () => {
  // Shape observed in the original iOS 16.4 Actions artifact 11931165122.
  const path = 'ios-tests-dark.xcresult/Data/data.0~45OthQLuHd--lRv4XgG_Z5tvhYw_tBRhXv2D31wEIfNcNSQVJT2lwIs1ywUIYY5g42hr32JbMScGcOq8JgQ6dg==';
  const input = { repository: 'Self-Command/agora-weave', target_sha: 'a'.repeat(40),
    run_id: '38636632772', attempt: 1, artifact_id: '11931165122', source_state: 'verified_source',
    original_conclusion: 'failure', archive_sha256: 'b'.repeat(64),
    raw_files: [{ path, sha256: 'c'.repeat(64), size_bytes: 123 }],
    data_class: 'engineering', retention_class: 'ordinary', archived_at: '2026-10-15T00:00:00Z',
    cleanup: { credentials: 'not_used', sandbox: 'removed' } };
  const plan = planArchive(input);
  assert.equal(plan.state, 'archive_planned');
  assert.deepEqual(plan.raw_files, input.raw_files);
  assert.equal(plan.original_conclusion, 'failure');
  assert.equal(verifyReadback(plan, { storage: 'dedicated-private-sftp', archive_sha256: input.archive_sha256,
    index_sha256: 'd'.repeat(64), expected_index_sha256: 'd'.repeat(64), raw_files: input.raw_files }).state,
  'archived_and_readback_verified');
  for (const unsafe of ['../' + path, '/' + path, 'C:/' + path, 'data\\' + path, 'data/./' + path,
    'data/../' + path, 'data//' + path, path + '\n', path + ';command']) {
    assert.equal(planArchive({ ...input, raw_files: [{ ...input.raw_files[0], path: unsafe }] }).state, 'blocked');
  }
});
