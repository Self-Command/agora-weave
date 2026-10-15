import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { collectEvidence } from '../../../tools/ci/collect-evidence.ts';
import { sourceFixture } from '../../fixtures/bootstrap/source.ts';

test('CA01: an authenticated actual-size native result archive above 64 MiB remains collectible with exact digest and attempt preservation', async () => {
  const source = sourceFixture();
  const bytes = Buffer.alloc(67750196, 83);
  source.artifact.size_in_bytes = bytes.length;
  source.artifact.digest = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  const fetcher: typeof fetch = async (input, init) => String(input).startsWith('https://synthetic.actions.githubusercontent.com/')
    ? new Response(bytes) : source.fetcher(input, init);
  const result = await collectEvidence(source.request, fetcher);
  assert.equal(result.state, 'verified_source');
  assert.equal(result.archive?.length, 67750196);
  assert.equal(result.archive_sha256, source.artifact.digest.slice(7));
  assert.equal(result.attempts?.length, 2);
  assert.equal(result.attempts?.[0].conclusion, 'failure');
  assert.equal(result.original_conclusion, 'success');
  source.artifact.size_in_bytes = 256 * 1024 * 1024 + 1;
  assert.equal((await collectEvidence(source.request, fetcher)).state, 'blocked');
});
