import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

function bound(kind: string, raw: Record<string, unknown>) {
  return { kind, raw, target_sha: 'a'.repeat(40), check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
    identity: { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted', platform: 'android-api24',
      run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) } };
}

test('NC01: actual UIAutomator attribute order does not discard a foreground title or admit another package', () => {
  const raw = { light_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n', dark_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n',
    light_theme: 'light:16', dark_theme: 'dark:32', images: ['d'.repeat(64), 'e'.repeat(64)],
    hierarchy: '<hierarchy><node index="0" text="AgoraWeave" resource-id="" class="android.view.View" package="org.agoraweave.app" enabled="true" /></hierarchy>' };
  assert.equal(assessBootstrapRaw(bound('android', raw)).state, 'passed');
  assert.equal(assessBootstrapRaw(bound('android', { ...raw, hierarchy: raw.hierarchy.replace('org.agoraweave.app', 'com.google.android.apps.nexuslauncher') })).state, 'blocked');
});

test('NC02: React Native exposes Android headings as native Views and still requires heading, actual focus and rendered contrast', () => {
  const measurements = ['light', 'dark'].flatMap(theme => [1, 2].map(font_scale => ({ theme, font_scale, title: 'AgoraWeave',
    role: 'android.view.View', enabled: true, heading: true, accessibility_focused: true, title_count: 1,
    interactive_count: 0, editable_count: 0, contrast_ratio: 12,
    frame: { x: 369, y: 1127, width: 342, height: 82 * font_scale }, viewport: { x: 0, y: 63, width: 1080, height: 2211 },
    screenshot_sha256: 'e'.repeat(64), tree_sha256: 'f'.repeat(64), audit: { method: 'native-semantic-focus', executed: true, issues: [] } })));
  const raw = { source: 'native-android-accessibility', measurements, exclusions: [{ behavior: 'talkback-navigation',
    applicability: 'not_applicable', decision_ref: 'ED-14', reason: 'Locked emulator image has no TalkBack navigation service' }] };
  assert.equal(assessBootstrapRaw(bound('native-accessibility', raw)).state, 'passed');
  for (const patch of [{ heading: false }, { accessibility_focused: false }, { contrast_ratio: 3 },
    { audit: { method: 'native-semantic-focus', executed: false, issues: [] } }]) {
    assert.equal(assessBootstrapRaw(bound('native-accessibility', { ...raw, measurements: measurements.map(item => ({ ...item, ...patch })) })).state, 'blocked');
  }
});
