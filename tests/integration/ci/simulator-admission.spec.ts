import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const matrix = JSON.parse(readFileSync('infra/ci/device-matrix.json', 'utf8'));
const manifest = JSON.parse(readFileSync('tools/ci/validation-manifest.json', 'utf8'));

test('ED14: simulator-only admission removes physical device checks without weakening simulator coverage', () => {
  assert.ok(matrix.decisions.includes('ED-14'));
  assert.ok(!matrix.decisions.includes('ED-13'));
  assert.ok(matrix.devices.some((device: { id: string; os?: string }) => device.id === 'ios-minimum' && device.os === '16.4'));
  assert.ok(matrix.devices.some((device: { id: string; api?: number }) => device.id === 'android-minimum' && device.api === 24));
  assert.ok(matrix.devices.every((device: { id: string }) => !device.id.endsWith('-physical')));
  assert.ok(!matrix.devices.some((device: { state?: string; id: string }) => device.state === 'unavailable' && device.id.includes('physical')));
  assert.ok(!matrix.unavailable_required_resources_block_ci_ready);
  assert.ok(!manifest.bootstrap_checks.some((check: { id: string }) => check.id === 'bootstrap.physical-devices'));
  assert.ok(manifest.bootstrap_checks.some((check: { id: string }) => check.id === 'bootstrap.minimum-ios'));
  assert.ok(manifest.bootstrap_checks.some((check: { id: string }) => check.id === 'bootstrap.minimum-android'));
});
