import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicBridgeReceipt } from '../../../tools/ci/bridge-public.ts';

test('PB04: the actual public receipt consumer accepts the admitted private path and binds its source identity', () => {
  const record = { state: 'passed', target_sha: 'a'.repeat(40), run_id: '1234', attempt: 1,
    development_source: { private_document: true } };
  const privateCopy = { path: `/archive/ordinary/bridge-admission-${record.target_sha}-1234-1.json`,
    sha256: 'b'.repeat(64), state: 'archived_and_readback_verified', temporary_key_files_removed: true };
  let receipt: Record<string, unknown> = {};
  assert.doesNotThrow(() => { receipt = publicBridgeReceipt(record, privateCopy); },
    'A verified write-once private record must survive the actual public receipt boundary');
  assert.deepEqual(receipt.private_record, privateCopy);
  assert.equal(receipt.development_source, undefined);
  for (const path of [privateCopy.path.replace('1234-1', '1235-1'),
    privateCopy.path.replace(record.target_sha, 'c'.repeat(40)), privateCopy.path.replace('1234-1', '1234-2')]) {
    assert.throws(() => publicBridgeReceipt(record, { ...privateCopy, path }));
  }
});
