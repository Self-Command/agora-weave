import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

function fixture(platform = 'android-api24') {
  const measurements = ['light', 'dark'].flatMap(theme => [1, 2].map(font_scale => ({ theme, font_scale,
    status_bar_clock_clipped: font_scale === 2, status_bar_clock_clip_method: 'rendered-clock-edge-pixels',
    status_bar_clock_owner: 'com.android.systemui', status_bar_clock_resource: 'com.android.systemui:id/clock',
    status_bar_clock_bounds: { x: 895, y: 0, width: 164, height: 63 },
    status_bar_clock_edge_pixels: font_scale === 2 ? 34 : 0,
    status_bar_clock_size_source: 'systemui-status-bar-clock-size',
    status_bar_clock_expected_text_px: font_scale === 2 ? 73.5 : 36.75,
    screenshot_sha256: 'd'.repeat(64), tree_sha256: 'e'.repeat(64),
    status_bar_clock_limitation: font_scale === 2 ? { applicability: 'not_applicable', decision_ref: 'ED-19',
      behavior: 'android7-large-system-clock-clipping', reason: 'Actual API24 font_scale2 SystemUI clock is clipped by its fixed-height bar.' } : undefined,
  })));
  return { kind: 'native-clock-clipping', target_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
    identity: { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted',
      platform, run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) }, raw: { measurements } };
}

test('CL01: measured Android7 200% system clock clipping records only the approved ED19 exclusions', () => {
  const result = assessBootstrapRaw(fixture());
  assert.equal(result.state, 'passed');
  assert.deepEqual(result.exclusions, ['light', 'dark'].map(theme => ({ theme, font_scale: 2,
    applicability: 'not_applicable', decision_ref: 'ED-19', behavior: 'android7-large-system-clock-clipping' })));
  assert.equal((result.cases as string[]).filter(id => id.endsWith(':2')).length, 0, 'Excluded clipping cannot count as passed');
  for (const patch of [{ screenshot_sha256: undefined }, { tree_sha256: 'bad' },
    { status_bar_clock_owner: 'org.agoraweave.app' }, { status_bar_clock_resource: 'application-title' },
    { status_bar_clock_edge_pixels: 0 }, { status_bar_clock_clipped: false },
    { status_bar_clock_size_source: 'assumed' }, { status_bar_clock_expected_text_px: 30 },
    { status_bar_clock_clip_method: 'image-assumption' }, { status_bar_clock_bounds: { x: 0, y: 0, width: 0, height: 63 } },
    { status_bar_clock_limitation: undefined },
    { status_bar_clock_limitation: { ...fixture().raw.measurements[1].status_bar_clock_limitation, decision_ref: 'ED-18' } },
    { status_bar_clock_limitation: { ...fixture().raw.measurements[1].status_bar_clock_limitation, applicability: 'passed' } },
    { status_bar_clock_limitation: { ...fixture().raw.measurements[1].status_bar_clock_limitation, reason: '' } },
  ]) {
    const invalid = fixture(); Object.assign(invalid.raw.measurements[1], patch);
    assert.equal(assessBootstrapRaw(invalid).state, 'blocked', JSON.stringify(patch));
  }
  assert.equal(assessBootstrapRaw(fixture('android-api36')).state, 'blocked');
  const normal = fixture(); Object.assign(normal.raw.measurements[0], normal.raw.measurements[1], { font_scale: 1 });
  assert.equal(assessBootstrapRaw(normal).state, 'blocked');
});

test('CL02: missing measurements and unapproved clipping never pass the system clock gate', () => {
  const input = fixture('android-api36');
  for (const item of input.raw.measurements) {
    Object.assign(item, { status_bar_clock_clipped: false, status_bar_clock_edge_pixels: 0, status_bar_clock_limitation: undefined });
  }
  assert.equal(assessBootstrapRaw(input).state, 'passed');
  for (const patch of [{ status_bar_clock_clipped: true, status_bar_clock_edge_pixels: 34 },
    { status_bar_clock_clipped: undefined }, { status_bar_clock_edge_pixels: undefined }]) {
    const invalid = structuredClone(input); Object.assign(invalid.raw.measurements[1], patch);
    assert.equal(assessBootstrapRaw(invalid).state, 'blocked');
  }
  input.raw.measurements.pop();
  assert.equal(assessBootstrapRaw(input).state, 'blocked');
});
