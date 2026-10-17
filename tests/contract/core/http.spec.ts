import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateCommand, validateError, validatePage, validatePreferencesPatch } from '../../../packages/contracts/src/http.ts';
import { request } from '../../fixtures/core/runtime.ts';

const id = '30000000-0000-4000-8000-000000000001';
test('HC01: commands require a UUID operation, CAS and a bounded closed DTO without silently trimming input', () => {
  assert.equal(validateCommand({ operation_id: id, base_version: 1, body: '  正文\n' }), true);
  for (const value of [{ operation_id: 'wrong', base_version: 1 }, { operation_id: id, base_version: -1 },
    { operation_id: id, base_version: 1, service_role: 'forbidden' }, { operation_id: id, base_version: 1.5 }]) {
    assert.equal(validateCommand(value), false);
  }
});
test('HC02: unified errors preserve retry and field recovery while excluding internal secrets', () => {
  const value = { request_id: id, code: 'VERSION_CONFLICT', message: '内容已更新，请检查后重试', retryable: false,
    operation_id: id, current_config_version: 'core-v1', field_errors: { body: '请保留输入' } };
  assert.equal(validateError(value), true);
  for (const patch of [{ retryable: 'yes' }, { code: '' }, { retry_after_seconds: -1 }, { secret_ref: 'private' }]) {
    assert.equal(validateError({ ...value, ...patch }), false);
  }
});
test('HC03: list DTOs enforce the fifty-item ceiling and opaque bounded cursors', () => {
  assert.equal(validatePage({ items: Array.from({ length: 50 }, (_, index) => ({ id: String(index) })), next_cursor: 'eyJwb3MiOiIxIn0', has_more: true }), true);
  assert.equal(validatePage({ items: Array(51).fill({}), next_cursor: null, has_more: false }), false);
  assert.equal(validatePage({ items: [], next_cursor: '../private-source', has_more: true }), false);
  assert.equal(validatePage({ items: [], next_cursor: null, has_more: false, secret: true }), false);
});
test('HC04: preference PATCH preserves partial fields, rejects unknown settings and requires CAS plus operation identity', () => {
  const value = { operation_id: id, base_version: 1, video_policy: 'wifi_only', preload: false };
  assert.equal(validatePreferencesPatch(value), true);
  assert.equal(validatePreferencesPatch({ operation_id: id, base_version: 1, typing: false }), true);
  for (const patch of [{ video_policy: 'cellular' }, { preload: 'false' }, { local_theme: 'dark' }, { base_version: undefined }, { operation_id: undefined }]) {
    assert.equal(validatePreferencesPatch({ ...value, ...patch }), false);
  }
});
test('HC05: the actual core HTTP boundary returns a typed unauthorized error with no protected output', () => {
  const result = request('/me/preferences');
  assert.equal(result.status, 401, 'An absent session must receive the registered identity error');
  assert.equal(validateError(result.data), true);
  assert.equal(result.data.code, 'SESSION_INVALID');
  assert.equal(result.body.includes('secret_ref'), false);
});
