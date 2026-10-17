import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateEvent, projectEvent } from '../../../packages/contracts/src/events.ts';
const types = ['resource.changed', 'revision.changed', 'batch.changed', 'relation.changed', 'message.saved', 'access.changed',
  'request.changed', 'notification.changed', 'ai.source.changed', 'index.policy.changed', 'document.publication.changed',
  'config.activated', 'plugin.lifecycle.changed', 'release.changed', 'purge.changed', 'service.health.changed'];
const envelope = (type: string) => ({ event_id: '30000000-0000-4000-8000-000000000001', type, schema_version: 1,
  aggregate_ref: '30000000-0000-4000-8000-000000000002', aggregate_version: 1, owner_plugin: 'core', environment_id: 'test',
  request_id: '30000000-0000-4000-8000-000000000003', operation_id: '30000000-0000-4000-8000-000000000004',
  effect_key: 'core:fixture:1', occurred_at: '2026-10-15T00:00:00.000Z', policy_epoch: 1, lifecycle_epoch: 1,
  payload: { state: 'changed', target_ref: '30000000-0000-4000-8000-000000000002' } });
test('EV01: every registered event has the complete typed envelope and rejects unregistered versions and payload fields', () => {
  for (const type of types) {
    const event = envelope(type);
    assert.equal(validateEvent(event), true, type);
    assert.equal(validateEvent({ ...event, schema_version: 2 }), false);
    assert.equal(validateEvent({ ...event, payload: { ...event.payload, body: 'private content' } }), false);
    assert.equal(validateEvent({ ...event, payload: { ...event.payload, token: 'secret' } }), false);
    assert.equal(validateEvent({ ...event, secret_ref: 'private' }), false);
  }
  assert.equal(validateEvent(envelope('arbitrary.execute')), false);
});
test('EV02: internal events do not grant client, administration, recovery or AI reading purposes', () => {
  for (const audience of ['app', 'share-read', 'admin', 'recovery', 'evidence', 'ai', 'unknown']) {
    assert.equal(projectEvent(envelope('resource.changed'), audience), null, 'A raw event cannot substitute current recipient admission');
  }
});
