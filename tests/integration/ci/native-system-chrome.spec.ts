import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

const measurements = ['light', 'dark'].flatMap(theme => [1, 2].map(font_scale => ({ theme, font_scale,
  status_bar_contrast_ratio: 17.1, status_bar_measurement_method: 'rendered-system-clock',
  status_bar_clock_bounds: { x: 50, y: 43, width: 104, height: 43 } })));
const bound = (values: Record<string, unknown>[]) => ({ kind: 'native-system-chrome',
  target_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
  source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
  identity: { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted',
    platform: 'android-api36', run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) },
  raw: { measurements: values } });

test('SC01: native system chrome admission refuses unreadable or unmeasured rendered status clocks in every capture', () => {
  assert.equal(assessBootstrapRaw(bound(measurements)).state, 'passed');
  for (const patch of [{ status_bar_contrast_ratio: 1 }, { status_bar_contrast_ratio: 4.49 },
    { status_bar_contrast_ratio: undefined }, { status_bar_contrast_ratio: Number.NaN },
    { status_bar_measurement_method: 'theme-assumption' }, { status_bar_clock_bounds: { x: 0, y: 0, width: 0, height: 1 } }]) {
    assert.equal(assessBootstrapRaw(bound(measurements.map((item, index) => index === 0 ? { ...item, ...patch } : item))).state, 'blocked');
  }
  assert.equal(assessBootstrapRaw(bound(measurements.slice(1))).state, 'blocked');
});
