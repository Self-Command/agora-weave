import assert from 'node:assert/strict';
import test from 'node:test';
import { completeImageUploadCommand, createImageUploadCommand, imagePartCommand } from '../../../supabase/functions/core/routes/upload-input.ts';

const id = '10000000-0000-4000-8000-000000000001';
const sha = 'a'.repeat(64);

test('image allocation stays within first release limits and binds a stable operation', () => {
  const input = { operation_id: id, intent: 'post', kind: 'image', size_bytes: 10_000_000, sha256: sha };
  assert.deepEqual(createImageUploadCommand(input), input);
  assert.deepEqual(createImageUploadCommand({ ...input,intent:'profile' }), { ...input,intent:'profile' });
  for (const change of [{ size_bytes: 10_000_001 }, { size_bytes: 0 }, { size_bytes: 1.5 },
    { intent: 'message' }, { kind: 'gif' }, { sha256: 'not-a-hash' }, { extra: true }])
    assert.equal(createImageUploadCommand({ ...input, ...change }), null);
});

test('bounded binary part and matching completion command have explicit shape', () => {
  assert.deepEqual(imagePartCommand(id, '0', id, 'application/octet-stream', '10000000'),
    { upload_id: id, part: 0, operation_id: id, size_bytes: 10_000_000 });
  assert.equal(imagePartCommand(id, '0', id, 'application/octet-stream', null)?.size_bytes, null);
  assert.equal(imagePartCommand(id, '1', id, 'application/octet-stream', '1')?.part, 1);
  for (const part of ['01', '-1', '9007199254740992']) assert.equal(imagePartCommand(id, part, id, 'application/octet-stream', '1'), null);
  assert.equal(imagePartCommand(id, '0', id, 'image/png', '1'), null);
  assert.equal(imagePartCommand(id, '0', id, 'application/octet-stream', '10000001'), null);
  assert.deepEqual(completeImageUploadCommand({ operation_id: id, sha256: sha }), { operation_id: id, sha256: sha });
  assert.equal(completeImageUploadCommand({ operation_id: id, sha256: sha, extra: true }), null);
});
