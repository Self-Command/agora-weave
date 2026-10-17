import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveConfiguration } from '../../../packages/config/src/resolve.ts';

const definition = (key: string, defaultValue: unknown, schema: object, patch = {}) => ({
  key, owner: 'core', description: 'Isolated configuration vector', schema, default_value: defaultValue,
  status: 'engineering', scopes: ['global','environment','module','user_group'], dependencies: [], conflicts: [],
  read_permission: 'config.read', write_permission: 'config.write', sensitive: false, effect_mode: 'immediate',
  consumer_ids: ['api','mobile','share'], existing_object_policy: 'new_operations', validation_refs: ['synthetic-vector'], ...patch,
});
const input = () => ({
  environment: 'test', owner: 'core', consumer: 'api', audience: 'authenticated', groups: ['a','b'],
  permissions: ['config.read'], client_release: 'fixture-v1',
  definitions: [definition('content.page_size',20,{ type: 'integer', minimum: 1, maximum: 50 }),
    definition('content.body_limit',2000,{ type: 'integer', minimum: 1, maximum: 10000 })],
  bundle: { version: 'synthetic-b1', schema_version: 1, state: 'active',
    compat_matrix: { api: ['fixture-v1'], mobile: ['fixture-v1'], share: ['fixture-v1'] },
    scope_values: [{ scope: 'global', values: { 'content.page_size': 20, 'content.body_limit': 2000 } }],
    consumers_ready: ['api','mobile','share'] },
});
const values = (value: ReturnType<typeof input>) => resolveConfiguration(value).values as Record<string, unknown>;

test('CFG01: a complete registered bundle resolves one version with global environment owner and explicitly authorized group precedence', () => {
  const value = input();
  value.bundle.scope_values.push({ scope: 'environment', environment: 'test', values: { 'content.page_size': 25 } } as never,
    { scope: 'module', environment: 'test', owner: 'core', values: { 'content.page_size': 30 } } as never,
    { scope: 'user_group', environment: 'test', owner: 'core', group: 'a', priority: 5, values: { 'content.page_size': 40 } } as never,
    { scope: 'user_group', environment: 'test', owner: 'core', group: 'b', priority: 1, values: { 'content.page_size': 35 } } as never);
  const output = resolveConfiguration(value);
  assert.equal(output.state, 'resolved');
  assert.equal(output.version, 'synthetic-b1');
  assert.deepEqual(values(value), { 'content.page_size': 40, 'content.body_limit': 2000 });
  const other = input();
  other.bundle.scope_values.push({ scope: 'environment', environment: 'dev', values: { 'content.page_size': 50 } } as never,
    { scope: 'user_group', environment: 'test', owner: 'core', group: 'outsider', priority: 99, values: { 'content.page_size': 50 } } as never);
  assert.equal(values(other)['content.page_size'], 20);
});

test('CFG02: equal-priority group conflicts fail regardless of input order instead of silently selecting one', () => {
  assert.equal(resolveConfiguration(input()).state, 'resolved');
  const value = input();
  value.bundle.scope_values.push({ scope: 'user_group', environment: 'test', owner: 'core', group: 'a', priority: 4, values: { 'content.page_size': 25 } } as never,
    { scope: 'user_group', environment: 'test', owner: 'core', group: 'b', priority: 4, values: { 'content.page_size': 30 } } as never);
  assert.equal(resolveConfiguration(value).state, 'blocked');
  value.bundle.scope_values.reverse();
  assert.equal(resolveConfiguration(value).state, 'blocked');
});

test('CFG03: incomplete definitions unknown keys illegal scope and invalid JSON schema values block the whole bundle', () => {
  assert.equal(resolveConfiguration(input()).state, 'resolved');
  for (const change of [
    (v: ReturnType<typeof input>) => { delete (v.definitions[0] as Partial<typeof v.definitions[0]>).description; },
    (v: ReturnType<typeof input>) => { v.definitions.push({ ...v.definitions[0], owner: 'other' }); },
    (v: ReturnType<typeof input>) => { v.bundle.scope_values[0].values['content.page_size'] = 51; },
    (v: ReturnType<typeof input>) => { Object.assign(v.bundle.scope_values[0].values, { 'unregistered.key': true }); },
    (v: ReturnType<typeof input>) => { v.bundle.scope_values[0].scope = 'tenant'; },
    (v: ReturnType<typeof input>) => { v.bundle.scope_values[0].values['content.page_size'] = '20' as never; },
  ]) { const value = input(); change(value); assert.equal(resolveConfiguration(value).state, 'blocked'); }
});

test('CFG04: consumers that need reload cannot activate a partial bundle and incompatible releases receive no partial values', () => {
  const value = input();
  value.definitions[0].effect_mode = 'reload';
  assert.equal(resolveConfiguration(value).state, 'resolved');
  value.bundle.consumers_ready = ['api','share'];
  assert.equal(resolveConfiguration(value).state, 'blocked');
  const incompatible = input(); incompatible.client_release = 'unknown';
  assert.equal(resolveConfiguration(incompatible).state, 'blocked');
  const draft = input(); draft.bundle.state = 'draft';
  assert.equal(resolveConfiguration(draft).state, 'blocked');
});

test('CFG05: public consumer projections remove sensitive values and share never acquires account preferences through configuration', () => {
  const value = input();
  value.definitions.push(definition('ai.vendor_secret','secret_ref:fixture',{ type: 'string' }, { sensitive: true }),
    definition('social.preferences',{ video_policy: 'always', preload: true },{ type: 'object' }, { consumer_ids: ['api','mobile'] }));
  Object.assign(value.bundle.scope_values[0].values, { 'ai.vendor_secret': 'secret_ref:fixture', 'social.preferences': { video_policy: 'always', preload: true } });
  value.consumer = 'share'; value.audience = 'share-read';
  assert.equal(resolveConfiguration(value).state, 'resolved');
  assert.deepEqual(values(value), { 'content.page_size': 20, 'content.body_limit': 2000 });
  assert.doesNotMatch(JSON.stringify(resolveConfiguration(value)), /secret_ref|vendor_secret|video_policy|preload/);
});
