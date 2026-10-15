import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { resolveTddSourcePurpose } from '../../../tools/ci/tdd-purpose.ts';

const baseline = 'bb62b29a1c33c2940fdefa546a268463bfdda91c';
const catalog = JSON.parse(execFileSync('git', ['show', `${baseline}:infra/ci/tdd-source-catalog.json`], { encoding: 'utf8' }));
const cycle = catalog.cycles.find((item: { cycle_id: string }) => item.cycle_id === 'ci-original-evidence-001');
const tap = (count: number) => Array.from({ length: count }, (_, index) => `ok ${index + 1} - synthetic ${index + 1}`).join('\n') +
  `\n1..${count}\n# tests ${count}\n# pass ${count}\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n`;

test('LP01: the actual Git reader preserves only pinned approved pre-manifest Red and Green without inventing a frozen set', () => {
  for (const label of ['red', 'green']) {
    const result = resolveTddSourcePurpose({ cycle, label, source: cycle[label], raw: tap(1) });
    assert.equal(result.purpose_authenticated, true, `${label}: the approved original source has no later manifest`);
    assert.equal(result.legacy_pre_intent_source, true);
    assert.equal(result.legacy_intent_baseline, baseline);
    assert.equal(result.legacy_applicable_set_approved, true);
    assert.equal(result.applicable_set_verified, false, 'A legacy approval cannot manufacture a newly frozen manifest');
  }
});

test('LP02: changed legacy tuple, case scope, missing new purpose and current-final use cannot obtain grandfathered approval', () => {
  for (const patch of [
    { source: { ...cycle.green, run_id: '999999' } },
    { source: { ...cycle.green, attempt: 2 } },
    { cycle: { ...cycle, case_titles: ['invented scope'] } },
    { cycle: { ...cycle, fixture_file: 'unknown.ts' } },
    { label: 'final' },
  ]) {
    const result = resolveTddSourcePurpose({ cycle, label: 'green', source: cycle.green, raw: tap(1), ...patch });
    assert.equal(result.purpose_authenticated, false);
    assert.equal(result.legacy_applicable_set_approved, false);
  }
});

test('LP03: current Green purpose uses its actual committed manifest and rejects incomplete whole-set TAP', () => {
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const manifest = JSON.parse(execFileSync('git', ['show', `${sha}:tools/ci/validation-manifest.json`], { encoding: 'utf8' }));
  const input = { cycle, label: 'final', source: { sha, run_id: '1234', attempt: 1 } };
  const good = resolveTddSourcePurpose({ ...input, raw: tap(manifest.engineering_case_count) });
  assert.equal(good.purpose_authenticated, true);
  assert.equal(good.applicable_set_verified, true);
  assert.equal(good.legacy_applicable_set_approved, false);
  assert.equal(resolveTddSourcePurpose({ ...input, raw: tap(1) }).applicable_set_verified, false);
});
