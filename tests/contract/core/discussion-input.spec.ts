import assert from 'node:assert/strict';
import test from 'node:test';
import { likeOperationCommand, textCommentCommand } from '../../../supabase/functions/core/routes/discussion-input.ts';

const id = '10000000-0000-4000-8000-000000000001';

test('ordinary text comment preserves whitespace and normalizes line endings', () => {
  assert.deepEqual(textCommentCommand({ operation_id: id, body: ' A\r\nB ', media_refs: [] }),
    { operation_id: id, body: ' A\nB ', media_refs: [] });
  for (const change of [{ body: '' }, { body: 'a\u0000b' }, { media_refs: [id] },
    { parent_comment_id: id }, { reply_to_id: id }, { extra: true }])
    assert.equal(textCommentCommand({ operation_id: id, body: 'hello', ...change }), null);
});

test('like command accepts only one stable operation ID', () => {
  assert.deepEqual(likeOperationCommand({ operation_id: id }), { operation_id: id });
  assert.equal(likeOperationCommand({ operation_id: id, active: true }), null);
  assert.equal(likeOperationCommand({ operation_id: 'bad' }), null);
});
