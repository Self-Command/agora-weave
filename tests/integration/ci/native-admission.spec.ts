import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

const identity = { checkout_sha: 'a'.repeat(40), source: 'github-actions', runner_environment: 'github-hosted',
  run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64), platform: 'ios-26.4' };
const bound = (kind: string, raw: Record<string, unknown>, platform = 'ios-26.4') => ({ kind, raw,
  identity: { ...identity, platform }, target_sha: identity.checkout_sha, check_set_digest: identity.check_set_digest,
  toolchain_digest: identity.toolchain_digest, source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1 });
const https = { source: 'native-xctest-urlsession', run_id: '101', attempt: 1, target_sha: identity.checkout_sha,
  environments: ['dev', 'test'].map(environment => ({ environment, accepted: 200, anonymous: 401,
    other_environment: 401, private_path: 404, body_sha256: 'd'.repeat(64) })) };
const frame = { x: 40, y: 250, width: 220, height: 30 };
const sample = (theme: string, fontScale: number) => ({ theme, font_scale: fontScale, title: 'AgoraWeave',
  role: 'staticText', enabled: true, title_count: 1, interactive_count: 0, editable_count: 0,
  frame: { ...frame, height: fontScale * 30 }, viewport: { x: 0, y: 24, width: 375, height: 700 },
  screenshot_sha256: 'e'.repeat(64), tree_sha256: 'f'.repeat(64),
  audit: { method: 'xctest-system-audit', executed: true, issues: [] } });
const accessibility = { source: 'native-xctest', measurements: [sample('light', 1), sample('dark', 1),
  sample('light', 2.35), sample('dark', 2.35)],
  exclusions: [{ behavior: 'voiceover-navigation', applicability: 'not_applicable', decision_ref: 'ED-14',
    reason: 'Current iOS runtime has no supported VoiceOver UI service' }] };

test('HN01: native HTTPS admission uses both real environments and every positive and refusal status', () => {
  assert.equal(assessBootstrapRaw(bound('native-https', { report: https, cleanup: { temporary_config_removed: true } })).state, 'passed');
  for (const patch of [{ environments: https.environments.slice(1) },
    { environments: [https.environments[0], https.environments[0]] },
    ...['accepted', 'anonymous', 'other_environment', 'private_path'].map(key => ({ environments:
      [https.environments[0], { ...https.environments[1], [key]: 200 === https.environments[1][key as keyof typeof https.environments[1]] ? 401 : 200 }] })),
    { environments: [https.environments[0], { ...https.environments[1], body_sha256: '' }] }]) {
    assert.equal(assessBootstrapRaw(bound('native-https', { report: { ...https, ...patch }, cleanup: { temporary_config_removed: true } })).state, 'blocked');
  }
});

test('HN02: native HTTPS output must bind the current attempt, platform SDK and removed configuration', () => {
  assert.equal(assessBootstrapRaw(bound('native-https', { report: https, cleanup: { temporary_config_removed: true } })).state, 'passed');
  for (const patch of [{ run_id: '100' }, { attempt: 2 }, { target_sha: '9'.repeat(40) },
    { source: 'native-android-httpsurlconnection' }]) {
    assert.equal(assessBootstrapRaw(bound('native-https', { report: { ...https, ...patch }, cleanup: { temporary_config_removed: true } })).state, 'blocked');
  }
  assert.equal(assessBootstrapRaw(bound('native-https', { report: https, cleanup: { temporary_config_removed: false } })).state, 'blocked');
  assert.equal(assessBootstrapRaw(bound('native-https', { report: { ...https, source: 'native-android-httpsurlconnection' },
    cleanup: { temporary_config_removed: true } }, 'android-api24')).state, 'passed');
});

test('NA01: simulator accessibility admission requires actual semantic bounds and both themes at normal and at least 200 percent', () => {
  assert.equal(assessBootstrapRaw(bound('native-accessibility', accessibility)).state, 'passed');
  for (const measurements of [accessibility.measurements.slice(0, 3),
    accessibility.measurements.map(item => ({ ...item, font_scale: 1 })),
    accessibility.measurements.map(item => ({ ...item, theme: 'light' })),
    accessibility.measurements.map(item => ({ ...item, frame: { ...item.frame, x: -50 } })),
    accessibility.measurements.map(item => ({ ...item, title_count: 0 })),
    accessibility.measurements.map(item => ({ ...item, tree_sha256: '' }))]) {
    assert.equal(assessBootstrapRaw(bound('native-accessibility', { ...accessibility, measurements })).state, 'blocked');
  }
});

test('NA02: supported iOS audits cannot be skipped, waived or replace failed system checks with a green claim', () => {
  assert.equal(assessBootstrapRaw(bound('native-accessibility', accessibility)).state, 'passed');
  for (const audit of [{ method: 'xctest-system-audit', executed: false, issues: [] },
    { method: 'xctest-system-audit', executed: true, issues: ['contrast'] },
    { method: 'semantic-only', executed: true, issues: [] }]) {
    assert.equal(assessBootstrapRaw(bound('native-accessibility', { ...accessibility,
      measurements: accessibility.measurements.map(item => ({ ...item, audit })) })).state, 'blocked');
  }
  const minimum = { ...accessibility, measurements: accessibility.measurements.map(item => ({ ...item,
    audit: { method: 'unavailable-before-ios17', executed: false, decision_ref: 'ED-14', issues: [] } })) };
  assert.equal(assessBootstrapRaw(bound('native-accessibility', minimum, 'ios-16.4')).state, 'passed');
  assert.equal(assessBootstrapRaw(bound('native-accessibility', minimum)).state, 'blocked');
});

test('NA03: a bootstrap title cannot claim controls, input, screen-reader execution or unobserved font growth', () => {
  assert.equal(assessBootstrapRaw(bound('native-accessibility', accessibility)).state, 'passed');
  for (const patch of [{ interactive_count: 1 }, { editable_count: 1 }, { title: '' },
    { frame: { ...frame, height: 30 } }, { enabled: false }]) {
    assert.equal(assessBootstrapRaw(bound('native-accessibility', { ...accessibility,
      measurements: accessibility.measurements.map(item => ({ ...item, ...patch })) })).state, 'blocked');
  }
  assert.equal(assessBootstrapRaw(bound('native-accessibility', { ...accessibility,
    exclusions: [{ ...accessibility.exclusions[0], applicability: 'passed' }] })).state, 'blocked');
});
