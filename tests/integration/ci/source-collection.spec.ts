import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { collectEvidence } from '../../../tools/ci/collect-evidence.ts';
import { sourceFixture } from '../../fixtures/bootstrap/source.ts';

test('C01: source authentication retains every attempt and original failed conclusion', async () => {
  const fixture = sourceFixture();
  const result = await collectEvidence(fixture.request, fixture.fetcher);
  assert.equal(result.state, 'verified_source');
  assert.equal(result.artifact_id, 77);
  assert.equal(result.attempts?.length, 2);
  assert.equal(result.attempts?.[0].conclusion, 'failure');
  assert.equal(result.attempts?.[1].conclusion, 'success');
  assert.deepEqual(result.archive, fixture.archive);
  assert.equal(result.archive_sha256, createHash('sha256').update(fixture.archive).digest('hex'));
});

for (const mutation of ['run_sha', 'workflow', 'repository', 'attempt', 'artifact_run', 'artifact_sha', 'expired', 'digest'] as const) {
  test(`C02: ${mutation} mismatch rejects an otherwise green source`, async () => {
    const fixture = sourceFixture();
    if (mutation === 'run_sha') fixture.run.head_sha = 'b'.repeat(40);
    if (mutation === 'workflow') fixture.run.path = '.github/workflows/unreviewed.yml';
    if (mutation === 'repository') fixture.run.head_repository.full_name = 'untrusted/repository';
    if (mutation === 'attempt') fixture.attempts[1].run_attempt = 3;
    if (mutation === 'artifact_run') fixture.artifact.workflow_run.id = 4243;
    if (mutation === 'artifact_sha') fixture.artifact.workflow_run.head_sha = 'b'.repeat(40);
    if (mutation === 'expired') fixture.artifact.expired = true;
    if (mutation === 'digest') fixture.artifact.digest = `sha256:${'b'.repeat(64)}`;
    assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'blocked');
  });
}

test('C03: a duplicate artifact on a later page cannot be hidden by a first match', async () => {
  const fixture = sourceFixture();
  fixture.setPages([Array.from({ length: 100 }, (_, id) => id === 0 ? fixture.artifact : { ...fixture.artifact, id: id + 100, name: `unrelated-${id}` }),
    [{ ...fixture.artifact, id: 78 }]]);
  assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'blocked');
});

test('C04: missing prior attempt is unavailable rather than silently replaced by the green retry', async () => {
  const fixture = sourceFixture();
  fixture.setUnavailable('/attempts/1');
  assert.equal((await collectEvidence(fixture.request, fixture.fetcher)).state, 'blocked');
});

test('C05: GitHub authorization is absent from the signed artifact redirect request', async () => {
  const fixture = sourceFixture();
  const result = await collectEvidence(fixture.request, fixture.fetcher);
  assert.equal(result.state, 'verified_source');
  assert.ok(fixture.requests.some(request => request.authorization === `Bearer ${fixture.request.token}`));
  const download = fixture.requests.find(request => request.url.startsWith('https://synthetic.actions.githubusercontent.com/'));
  assert.ok(download);
  assert.equal(download.authorization, null);
});

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
