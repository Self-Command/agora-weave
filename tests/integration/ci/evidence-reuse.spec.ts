import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectEvidence } from '../../../tools/ci/collect-evidence.ts';
import { sourceFixture } from '../../fixtures/bootstrap/source.ts';

test('EC01: repeated authenticated source reads reuse exact archive bytes while rechecking access and metadata', async () => {
  const fixture = sourceFixture();
  const first = await collectEvidence(fixture.request, fixture.fetcher);
  const second = await collectEvidence(fixture.request, fixture.fetcher);
  assert.equal(first.state, 'verified_source');
  assert.equal(second.state, 'verified_source');
  assert.deepEqual(second.archive, fixture.archive);
  assert.equal(fixture.requests.filter(item => item.url.includes('synthetic.actions.githubusercontent.com')).length, 1,
    'An unchanged authenticated archive must be transferred once');
  assert.equal(fixture.requests.filter(item => item.url.endsWith('/actions/runs/4242')).length, 2,
    'Cached bytes must not bypass current source authorization');
  fixture.setUnavailable('/actions/runs/4242');
  assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'blocked');
});

test('EC02: simultaneous reads coalesce archive transfer without sharing mutable returned bytes', async () => {
  const fixture = sourceFixture();
  const [first, second] = await Promise.all([collectEvidence(fixture.request, fixture.fetcher), collectEvidence(fixture.request, fixture.fetcher)]);
  assert.equal(first.state, 'verified_source');
  assert.equal(second.state, 'verified_source');
  assert.equal(fixture.requests.filter(item => item.url.includes('synthetic.actions.githubusercontent.com')).length, 1);
  first.archive![0] ^= 255;
  assert.deepEqual(second.archive, fixture.archive, 'One consumer cannot corrupt another verified source');
});

test('EC03: expired, changed attempt, changed SHA and invalid digest metadata cannot hit an earlier valid byte cache', async () => {
  for (const mutation of ['expired', 'attempt', 'sha', 'digest']) {
    const fixture = sourceFixture();
    assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'verified_source');
    if (mutation === 'expired') fixture.artifact.expired = true;
    if (mutation === 'attempt') fixture.run.run_attempt = 3;
    if (mutation === 'sha') fixture.run.head_sha = 'b'.repeat(40);
    if (mutation === 'digest') fixture.artifact.digest = `sha256:${'c'.repeat(64)}`;
    assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'blocked', mutation);
  }
});
