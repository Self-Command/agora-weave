import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planArchive, verifyReadback } from '../../../tools/ci/archive-evidence.ts';

function fixture() {
  return { repository: 'Self-Command/agora-weave', target_sha: 'a'.repeat(40),
    run_id: '4242', attempt: 2, artifact_id: '77', source_state: 'verified_source',
    original_conclusion: 'failure', archive_sha256: 'b'.repeat(64),
    raw_files: [{ path: 'tests/results.tap', sha256: 'c'.repeat(64), size_bytes: 123 }],
    data_class: 'engineering', retention_class: 'ordinary',
    archived_at: '2026-10-15T00:00:00Z', cleanup: { credentials: 'revoked', sandbox: 'removed' } };
}

test('A01: failed source remains failed in a private archive with separate raw and ZIP digests', () => {
  const result = planArchive(fixture());
  assert.equal(result.state, 'archive_planned');
  assert.equal(result.original_conclusion, 'failure');
  assert.equal(result.archive_sha256, 'b'.repeat(64));
  assert.deepEqual(result.raw_files, fixture().raw_files);
  assert.equal(result.expires_at, '2027-01-13T00:00:00.000Z');
  assert.equal(result.readiness, 'not_evaluated');
});

test('A02: formal evidence retains one year; sensitive evidence requires its earlier explicit deadline', () => {
  assert.equal(planArchive({ ...fixture(), retention_class: 'formal' }).expires_at, '2027-10-15T00:00:00.000Z');
  const sensitive = { ...fixture(), data_class: 'sensitive', sensitive_expires_at: '2026-10-16T00:00:00Z' };
  assert.equal(planArchive(sensitive).expires_at, '2026-10-16T00:00:00.000Z');
  for (const patch of [{ sensitive_expires_at: undefined }, { sensitive_expires_at: '2026-10-23T00:00:00Z' },
    { sensitive_expires_at: '2026-10-14T00:00:00Z' }]) {
    assert.equal(planArchive({ ...sensitive, ...patch }).state, 'blocked');
  }
});

test('A03: missing authenticated source, unknown identity or raw digest cannot enter the archive index', () => {
  for (const patch of [{ source_state: 'unknown' }, { target_sha: 'wrong' }, { artifact_id: '' },
    { raw_files: [] }, { raw_files: [{ path: 'report', sha256: 'bad', size_bytes: 1 }] }]) {
    assert.equal(planArchive({ ...fixture(), ...patch }).state, 'blocked');
  }
});

test('A04: path escape, duplicate files, secrets and retained temporary credentials are rejected', () => {
  for (const patch of [{ raw_files: [{ path: '../secret', sha256: 'c'.repeat(64), size_bytes: 1 }] },
    { raw_files: [...fixture().raw_files, ...fixture().raw_files] }, { data_class: 'secret' },
    { cleanup: { credentials: 'retained', sandbox: 'removed' } }, { token: 'synthetic-token' }]) {
    assert.equal(planArchive({ ...fixture(), ...patch }).state, 'blocked');
  }
});

test('A05: verified private readback must bind the same archive, index and every raw file', () => {
  const plan = planArchive(fixture());
  const readback = { archive_sha256: 'b'.repeat(64), index_sha256: 'd'.repeat(64),
    expected_index_sha256: 'd'.repeat(64), raw_files: fixture().raw_files, storage: 'dedicated-private-sftp' };
  assert.equal(verifyReadback(plan, readback).state, 'archived_and_readback_verified');
  for (const patch of [{ archive_sha256: 'e'.repeat(64) }, { index_sha256: 'e'.repeat(64) },
    { raw_files: [] }, { storage: 'public-github' }]) {
    assert.equal(verifyReadback(plan, { ...readback, ...patch }).state, 'blocked');
  }
});

test('A06: nested unregistered fields cannot copy credentials into the private index', () => {
  for (const patch of [{ cleanup: { ...fixture().cleanup, token: 'synthetic-secret' } },
    { raw_files: [{ ...fixture().raw_files[0], private_key: 'synthetic-secret' }] }]) {
    assert.equal(planArchive({ ...fixture(), ...patch }).state, 'blocked');
  }
});
