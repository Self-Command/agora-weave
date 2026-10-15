import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { assessTddCoverage } from '../../../tools/ci/tdd-coverage.ts';

const tap = 'TAP version 13\n# Subtest: alpha\nok 1 - alpha\n# Subtest: beta\nok 2 - beta\n# Subtest: gamma\nok 3 - gamma\n1..3\n# tests 3\n# pass 3\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
const digest = createHash('sha256').update(tap).digest('hex');
const sha = 'a'.repeat(40);
function cycle(cycle_id: string, titles: string[]) {
  return { cycle_id, target_sha: sha, assessment: { state: 'passed' }, final: { sha, source_authenticated: true,
    run_id: '101', attempt: 1, raw_report_digest: digest, selected_assertions: titles.map(title => ({ title, failed: false })) } };
}
const fixture = () => ({ target_sha: sha, run_id: '101', attempt: 1, source_authenticated: true, expected_count: 3,
  raw_tap: tap, records: [cycle('first', ['alpha', 'beta']), cycle('second', ['gamma'])] });

test('TC01: complete TDD coverage is derived from every actual final assertion rather than a declared complete field', () => {
  assert.equal(assessTddCoverage(fixture()).coverage, 'complete');
  for (const records of [[], [cycle('first', ['alpha', 'beta'])], [cycle('first', ['alpha', 'beta']), cycle('second', ['invented'])]]) {
    assert.equal(assessTddCoverage({ ...fixture(), coverage: 'complete', records }).state, 'blocked');
  }
});

test('TC02: failed skipped cancelled empty or count-mismatched final execution cannot satisfy a covered catalog', () => {
  assert.equal(assessTddCoverage(fixture()).state, 'passed');
  for (const patch of [{ raw_tap: '' }, { expected_count: 4 }, { raw_tap: tap.replace('ok 3 - gamma', 'not ok 3 - gamma') },
    { raw_tap: tap.replace('# skipped 0', '# skipped 1') }, { raw_tap: tap.replace('# cancelled 0', '# cancelled 1') }]) {
    assert.equal(assessTddCoverage({ ...fixture(), ...patch }).state, 'blocked');
  }
});

test('TC03: every covering cycle binds the same authenticated final bytes, commit, run and attempt', () => {
  assert.equal(assessTddCoverage(fixture()).state, 'passed');
  for (const finalPatch of [{ sha: 'b'.repeat(40) }, { run_id: '100' }, { attempt: 2 },
    { source_authenticated: false }, { raw_report_digest: 'c'.repeat(64) },
    { selected_assertions: [{ title: 'gamma', failed: true }] }]) {
    const valid = fixture();
    assert.equal(assessTddCoverage({ ...valid, records: [valid.records[0], { ...valid.records[1], final: { ...valid.records[1].final, ...finalPatch } }] }).state, 'blocked');
  }
  assert.equal(assessTddCoverage({ ...fixture(), source_authenticated: false }).state, 'blocked');
  assert.equal(assessTddCoverage({ ...fixture(), records: [cycle('same', ['alpha', 'beta']), cycle('same', ['gamma'])] }).state, 'blocked');
});
