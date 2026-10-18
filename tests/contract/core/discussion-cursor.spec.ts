import assert from 'node:assert/strict';
import test from 'node:test';
import { readCommentCursor, writeCommentCursor, type CommentScope } from '../../../supabase/functions/core/routes/discussion-cursor.ts';

const id = '10000000-0000-4000-8000-000000000001';
const scope: CommentScope = { scope: 'post-comments-v1', post_id: id, sort: 'latest', subject: null,
  session: null, environment: 'test', limit: 20, client_release: 'fixture-v1' };

test('comment cursor binds post, sort, reader, release and signature', async () => {
  const secret = 'fixture-secret';
  const token = await writeCommentCursor({ ...scope, position: id, created_at: '2026-10-18T00:00:00.000000Z',
    score: null, config_version: 'fixture-v1' }, secret);
  assert.equal((await readCommentCursor(token, scope, secret)).position, id);
  await assert.rejects(readCommentCursor(token, { ...scope, post_id: '20000000-0000-4000-8000-000000000001' }, secret));
  await assert.rejects(readCommentCursor(token, { ...scope, sort: 'hot' }, secret));
  await assert.rejects(readCommentCursor(token, scope, 'other-secret'));
});
