import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

const bound = (platform: string, measurements: Record<string, unknown>[]) => ({ kind: 'native-measurement-details',
  target_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
  source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
  identity: { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted', platform,
    run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) },
  raw: { measurements } });

test('NM01: mandatory iOS detail admission preserves complete snapshot counts and refuses multiple semantic leaves', () => {
  const measurements = ['light', 'dark'].flatMap(theme => [1, 2.35].map(font_scale => ({ theme, font_scale,
    title_count: 1, title_snapshot_count: 2, title_container_count: 1 })));
  assert.equal(assessBootstrapRaw(bound('ios-26.4', measurements)).state, 'passed');
  for (const patch of [{ title_snapshot_count: undefined }, { title_container_count: undefined },
    { title_snapshot_count: 3, title_container_count: 1 }, { title_snapshot_count: 1, title_container_count: 1 },
    { title_snapshot_count: 1.5, title_container_count: 0.5 }, { title_snapshot_count: 0, title_container_count: -1 },
    { title_count: 2, title_snapshot_count: 3, title_container_count: 1 }]) {
    assert.equal(assessBootstrapRaw(bound('ios-26.4', measurements.map(item => ({ ...item, ...patch })))).state, 'blocked');
  }
});

const android = ['light', 'dark'].flatMap(theme => [1, 2].map(font_scale => ({ theme, font_scale,
  font_measurement_method: 'metric-affecting-spans', font_size_px: Math.ceil(60.375 * font_scale),
  expected_font_size_px: 60.375 * font_scale, base_font_size_px: 61,
  home_package: 'com.google.android.apps.nexuslauncher', observed_home_package: 'com.google.android.apps.nexuslauncher',
  home_resolution_source: 'shell-package-manager' })));

test('NM02: Android detail admission requires effective rendered span metrics rather than the unchanged base TextView paint', () => {
  assert.equal(assessBootstrapRaw(bound('android-api24', android)).state, 'passed');
  for (const patch of [{ font_measurement_method: undefined }, { font_measurement_method: 'base-textview' },
    { font_size_px: 61 }, { font_size_px: Number.NaN }, { expected_font_size_px: 0 }, { expected_font_size_px: undefined }]) {
    assert.equal(assessBootstrapRaw(bound('android-api24', android.map(item => ({ ...item, ...patch })))).state, 'blocked');
  }
});

test('NM03: Android detail admission binds shell-resolved HOME to the actually observed launcher', () => {
  assert.equal(assessBootstrapRaw(bound('android-api36', android)).state, 'passed');
  for (const patch of [{ home_package: 'com.android.settings' }, { observed_home_package: '' },
    { observed_home_package: 'org.agoraweave.app', home_package: 'org.agoraweave.app' },
    { home_resolution_source: 'package-visibility-filtered-query' }, { home_resolution_source: undefined }]) {
    assert.equal(assessBootstrapRaw(bound('android-api36', android.map(item => ({ ...item, ...patch })))).state, 'blocked');
  }
});
