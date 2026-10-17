import assert from 'node:assert/strict';
import { test } from 'node:test';
import { sql, rows, token, request } from '../../fixtures/core/runtime.ts';

const required = {
  account: ['id', 'status', 'phone_changed_at', 'sensitive_until', 'identity_epoch', 'registered_at'],
  session_registry: ['session_id', 'account_id', 'device_label', 'trusted_at', 'revoked_at', 'epoch'],
  admin_grant: ['account_id', 'role', 'operation_scopes', 'resource_scope', 'environment', 'expires_at', 'revoked_at'],
  stepup_challenge: ['id', 'account_id', 'session_id', 'action_digest', 'aal', 'verified_at', 'expires_at', 'consumed_at'],
  follow: ['follower_id', 'followed_id', 'created_at', 'state'], block: ['blocker_id', 'blocked_id', 'active', 'created_at', 'revoked_at'],
  user_preferences: ['account_id', 'follow_approval', 'dm_policy', 'read_receipt', 'typing', 'push', 'notification_categories', 'video_policy', 'preload'],
  mute_rule: ['owner', 'kind', 'target', 'active'],
  audit_event: ['actor', 'session_id', 'operation', 'object_ref', 'environment', 'plugin', 'reason', 'before_digest', 'after_digest', 'result', 'request_id'],
  operation: ['actor', 'session_id', 'environment', 'action', 'operation_id', 'payload_hash', 'result_ref', 'state'],
  outbox: ['event_id', 'aggregate_id', 'aggregate_version', 'owner_plugin', 'lifecycle_epoch', 'effect_key', 'lease', 'attempt', 'result'],
  inbox: ['consumer', 'effect_key', 'event_id', 'result'],
  resource: ['id', 'author_id', 'kind', 'visibility', 'current_revision_id', 'policy_epoch', 'publication_state', 'deleted_at', 'data_class', 'root_post', 'thread_id', 'source_id'],
  resource_dependency: ['dependent', 'source', 'kind', 'source_revision', 'purposes'],
  media_object: ['owner', 'plugin', 'bucket', 'object_internal_key', 'sha256', 'detected_mime', 'codec', 'size_bytes', 'duration_ms', 'state', 'data_class'],
  media_derivative: ['parent_media', 'kind', 'hash', 'size', 'state'],
  deletion: ['target', 'actor', 'kind', 'deleted_at', 'undo_until', 'restore_until', 'state', 'epoch'],
  dependency_hide: ['cause_deletion', 'affected_resource', 'previous_validity', 'hidden_at'],
  retention_record: ['target', 'storage_ref', 'class', 'owner_plugin', 'trigger_at', 'due_at', 'rule_version', 'purge_state'],
  retention_interest: ['target', 'subject', 'purpose', 'allowed_scope', 'expires_at', 'reason', 'grant_ref', 'audit_ref'],
  security_journal: ['seq', 'deny_intent_id', 'target', 'subject', 'action', 'policy_epoch', 'committed_result', 'timestamp', 'hash_chain'],
  config_definition: ['key', 'owner', 'schema', 'default_value', 'range', 'scopes', 'priority', 'permissions', 'dependencies', 'effect_mode', 'existing_policy', 'evidence_refs'],
  config_bundle: ['version', 'scoped_values', 'schema_version', 'compat', 'state', 'effective_at', 'preview_digest', 'actor', 'audit_ref'],
  config_activation: ['environment', 'active_ptr'],
  managed_document: ['id', 'stable_key', 'kind', 'locale', 'owner', 'public_surfaces', 'active_release_id', 'row_version'],
  document_revision: ['document_id', 'version', 'title', 'body', 'content_digest', 'linked_release_refs', 'state', 'row_version', 'editor', 'created_at'],
  document_release: ['id', 'document_id', 'revision_ref', 'content_digest', 'scope', 'state', 'publisher', 'published_at', 'confirmation_ref', 'audit_ref'],
  document_receipt: ['subject', 'release_id', 'revision_digest', 'presentation_ref', 'purpose', 'decision', 'occurred_at', 'request_id'],
};
test('CF01: the controlled fixture is a real Auth user and live SQL database, with no signup or SMS claim', () => {
  assert.equal(sql('SELECT 1;').trim(), '1');
  assert.equal(request('/user', { auth: true, token: token() }).status, 200, 'The real GoTrue service must authenticate the controlled session');
});
for (const [table, columns] of Object.entries(required)) {
  test(`SCHEMA.${table}: the authoritative core table has every required model field and enforced row security`, () => {
    const actual = rows(`SELECT column_name,data_type FROM information_schema.columns WHERE table_schema='core' AND table_name='${table}'`);
    assert.ok(actual.length > 0, `The ${table} model must exist in the real database`);
    for (const column of columns) assert.ok(actual.some(value => value.column_name === column), `${table}.${column}`);
    const security = rows(`SELECT relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid='core.${table}'::regclass`)[0];
    assert.equal(security.relrowsecurity, true);
    assert.equal(security.relforcerowsecurity, true);
    assert.equal(sql(`SELECT has_table_privilege('anon','core.${table}','SELECT');`).trim(), 'f');
    if (columns.includes('id')) assert.equal(actual.find(value => value.column_name === 'id')?.data_type, 'uuid');
    for (const column of columns.filter(column => /_at$|^timestamp$/.test(column))) {
      assert.equal(actual.find(value => value.column_name === column)?.data_type, 'timestamp with time zone', `${table}.${column} is UTC-capable`);
    }
  });
}
