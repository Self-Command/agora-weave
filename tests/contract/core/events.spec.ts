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
  payload: type === 'document.publication.changed' ? {
    document_id: '30000000-0000-4000-8000-000000000002',release_id: '30000000-0000-4000-8000-000000000005',content_digest: 'a'.repeat(64),state: 'published',
  } : type === 'index.policy.changed' ? {
    target_ref: '30000000-0000-4000-8000-000000000002',policy_epoch: 1,scope: 'target',policy_digest: 'b'.repeat(64),
  } : { state: 'changed', target_ref: '30000000-0000-4000-8000-000000000002' } });
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

test('EV03: publication events bind the document release digest and actual publication state without private receipts or content',()=>{
  const event=envelope('document.publication.changed');
  for(const state of ['published','superseded','withdrawn'])assert.equal(validateEvent({...event,payload:{...event.payload,state}}),true,state);
  for(const field of ['document_id','release_id','content_digest','state']) {
    const payload:Record<string,unknown>={...event.payload};delete payload[field];
    assert.equal(validateEvent({...event,payload}),false,field);
  }
  for(const patch of [{document_id:'invalid'},{release_id:'invalid'},{content_digest:'not-a-digest'},{state:'consented'},
    {state:'prepared'},{body:'private policy text'},{receipt_id:'30000000-0000-4000-8000-000000000006'},
    {secret_ref:'secret_reference'}])assert.equal(validateEvent({...event,payload:{...event.payload,...patch}}),false);
  assert.equal(validateEvent({...event,payload:{state:'changed',target_ref:event.aggregate_ref}}),false);
});

test('EV04: indexing events identify exactly the target or account policy and carry only bounded current-policy metadata',()=>{
  const event=envelope('index.policy.changed');
  assert.equal(validateEvent(event),true);
  const accountPayload={account_ref:event.aggregate_ref,scope:'account',policy_epoch:2,policy_digest:'c'.repeat(64)};
  assert.equal(validateEvent({...event,payload:accountPayload}),true);
  for(const field of ['account_ref','scope','policy_epoch','policy_digest']) {
    const payload:Record<string,unknown>={...accountPayload};delete payload[field];
    assert.equal(validateEvent({...event,payload}),false,field);
  }
  for(const patch of [{account_ref:'invalid'},{target_ref:event.aggregate_ref},{policy_epoch:0},{policy_epoch:1.5},
    {policy_digest:'bad'},{scope:'target'},{scope:'all_private'},{body:'private content'},{preferences:{preload:false}},{token:'secret'}])
    assert.equal(validateEvent({...event,payload:{...accountPayload,...patch}}),false);
  assert.equal(validateEvent({...event,payload:{state:'changed',target_ref:event.aggregate_ref}}),false);
});
