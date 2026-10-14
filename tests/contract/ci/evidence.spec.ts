import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessReport } from '../../../tools/ci/evidence.ts';
import { reportFixture, reportRequest } from '../../fixtures/bootstrap/evidence.ts';

test('E01: matching nonempty required execution can pass evidence assessment', () => {
  assert.equal(assessReport(reportRequest()).state, 'passed');
});

for (const state of ['failed', 'skipped', 'neutral', 'cancelled', 'timed_out', 'missing', 'unavailable', 'unknown', 'running', 'queued']) {
  test(`E02: required ${state} execution cannot be accepted`, () => {
    const report = reportFixture();
    report.state = state;
    assert.equal(assessReport(reportRequest(report)).state, 'blocked');
  });
}

for (const field of ['target_sha', 'checkout_sha', 'check_set_digest', 'toolchain_digest']) {
  test(`E03: mismatched ${field} blocks the report`, () => {
    const report = { ...reportFixture(), [field]: 'e'.repeat(field.endsWith('sha') ? 40 : 64) };
    const result = assessReport(reportRequest(report));
    assert.equal(result.state, 'blocked');
    assert.ok(result.reason_codes.includes('identity_mismatch'));
  });
}

test('E04: an artifact with a different downloaded digest blocks the report', () => {
  const report = reportFixture();
  report.artifacts[0].downloaded_sha256 = 'e'.repeat(64);
  assert.equal(assessReport(reportRequest(report)).state, 'blocked');
});

test('E05: missing raw report or artifact is not evidence', () => {
  assert.equal(assessReport({ ...reportRequest(), report: null }).state, 'blocked');
  const report = { ...reportFixture(), artifacts: [] };
  assert.equal(assessReport(reportRequest(report)).state, 'blocked');
});

test('E06: missing script cannot turn into success by omission', () => {
  const report = reportFixture();
  report.scripts[0] = { name: 'ci:contracts', present: false, exit_code: 0 };
  assert.equal(assessReport(reportRequest(report)).state, 'blocked');
});

test('E07: zero discovery and incomplete execution cannot pass', () => {
  for (const values of [{ discovered: 0, executed: 0 }, { discovered: 2, executed: 1 }]) {
    const report = { ...reportFixture(), ...values };
    assert.equal(assessReport(reportRequest(report)).state, 'blocked');
  }
});

test('E08: required case omission or skipped case cannot pass', () => {
  const missing = reportFixture();
  missing.cases.pop();
  assert.equal(assessReport(reportRequest(missing)).state, 'blocked');
  const skipped = reportFixture();
  skipped.cases[0].state = 'skipped';
  assert.equal(assessReport(reportRequest(skipped)).state, 'blocked');
});

test('E09: deferred applicability is distinct from actual passing execution', () => {
  const report = { ...reportFixture(), applicability: 'not_yet_applicable' };
  assert.equal(assessReport(reportRequest(report)).state, 'blocked');
});

test('E10: local execution markers cannot satisfy Actions evidence', () => {
  for (const values of [{ source: 'local' }, { runner_environment: 'self-hosted' }]) {
    const report = { ...reportFixture(), ...values };
    assert.equal(assessReport(reportRequest(report)).state, 'blocked');
  }
});

test('E11: an empty required case set cannot be accepted', () => {
  assert.equal(assessReport({ ...reportRequest(), required_case_ids: [] }).state, 'blocked');
});
