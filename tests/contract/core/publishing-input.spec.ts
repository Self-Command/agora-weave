import assert from 'node:assert/strict';
import test from 'node:test';
import { textPostCommand } from '../../../supabase/functions/core/routes/publishing-input.ts';

const base = {
  operation_id: '10000000-0000-4000-8000-000000000001',
  type: 'text', body: 'A\r\nB', visibility: 'public', reply_scope: 'all_readers',
};

test('plain text command preserves content while normalizing newlines and stable IDs', () => {
  assert.deepEqual(textPostCommand({ ...base, operation_id: base.operation_id.toUpperCase() }), {
    operation_id: base.operation_id, type: 'text', body: 'A\nB', tags: [], mentions: [],
    media_refs: [], visibility: 'public', reply_scope: 'all_readers', indexing_mode: 'inherit',
  });
  assert.equal(textPostCommand({ ...base, body: '  \n  ' })?.body, '  \n  ');
});

test('first slice rejects fields whose policies are not yet backed by a publication transaction', () => {
  for (const change of [
    { type: 'images' }, { media_refs: [base.operation_id] }, { tags: ['topic'] },
    { mentions: [base.operation_id] }, { reply_scope: 'mentioned' },
    { indexing_mode: 'allow' }, { source_id: base.operation_id },
    { poll: { question: 'Q' } }, { made_up: true }, { body: '' },
    { operation_id: 'not-a-uuid' }, { visibility: 'private' },
    { visibility: { toString: 'public' } }, { body: 'hello\u0000world' },
  ]) assert.equal(textPostCommand({ ...base, ...change }), null);
});
