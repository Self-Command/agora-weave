import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

const values = ['light', 'dark'].flatMap(theme => [1, 2].map(font_scale => ({ theme, font_scale,
  status_bar_contrast_ratio: theme === 'dark' ? 3.0798041132994367 : 5.74183648145415,
  status_bar_measurement_method: 'rendered-system-clock',
  status_bar_clock_bounds: { x: 968, y: 0, width: 91, height: 63 },
  status_bar_background_rgb: theme === 'dark' ? [244, 81, 30] : [255, 255, 255],
  status_bar_power_save: theme === 'dark', status_bar_power_source: 'android-power-manager',
  status_bar_limitation: theme === 'dark' ? { applicability: 'not_applicable', decision_ref: 'ED-18',
    behavior: 'android7-system-warning-bar', reason: 'Android7 power saver forces the system warning color; measured contrast remains below4.5.' } : undefined,
  screenshot_sha256: 'd'.repeat(64), tree_sha256: 'e'.repeat(64) })));
function bound(measurements: Record<string, unknown>[], platform = 'android-api24') {
  return { kind: 'native-system-chrome', target_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
    identity: { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted',
      platform, run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) }, raw: { measurements } };
}

test('SC02: Android7 warning-bar exception preserves measured exclusions and refuses use beyond the approved actual power-save scope', () => {
  const result = assessBootstrapRaw(bound(values));
  assert.equal(result.state, 'passed');
  assert.deepEqual(result.exclusions, [1, 2].map(font_scale => ({ theme: 'dark', font_scale,
    applicability: 'not_applicable', decision_ref: 'ED-18', behavior: 'android7-system-warning-bar',
    measured_contrast_ratio: 3.0798041132994367 })));
  for (const patch of [
    { status_bar_power_save: false }, { status_bar_power_source: 'injected-assumption' },
    { status_bar_limitation: undefined }, { status_bar_background_rgb: [17, 17, 19] },
    { screenshot_sha256: undefined }, { tree_sha256: 'bad' },
    { status_bar_contrast_ratio: 1 }, { status_bar_contrast_ratio: Number.NaN },
    { status_bar_measurement_method: 'theme-assumption' },
    { status_bar_clock_bounds: { x: 0, y: 0, width: 0, height: 63 } },
    { status_bar_limitation: { ...values[2].status_bar_limitation, decision_ref: 'ED-14' } },
    { status_bar_limitation: { ...values[2].status_bar_limitation, applicability: 'passed' } },
    { status_bar_limitation: { ...values[2].status_bar_limitation, behavior: 'application-title' } },
    { status_bar_limitation: { ...values[2].status_bar_limitation, reason: '' } },
  ]) {
    assert.equal(assessBootstrapRaw(bound(values.map((item, index) => index === 2 ? { ...item, ...patch } : item))).state, 'blocked');
  }
  assert.equal(assessBootstrapRaw(bound(values, 'android-api36')).state, 'blocked');
  assert.equal(assessBootstrapRaw(bound(values.map((item, index) => index === 0 ? { ...values[2], theme: 'light' } : item))).state, 'blocked');
  assert.equal(assessBootstrapRaw(bound(values.slice(1))).state, 'blocked');
  assert.equal(assessBootstrapRaw(bound(values.map(item => ({ ...item, theme: 'dark' })))).state, 'blocked');
});
