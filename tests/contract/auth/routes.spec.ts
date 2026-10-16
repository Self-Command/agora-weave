import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { account, session, sql, rows, request, token } from '../../fixtures/core/runtime.ts';
import { validatePage } from '../../../packages/contracts/src/http.ts';

const release = 'synthetic-account-v1';
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const headers = { 'X-Client-Release': release };
const get = (query = '', user = 1, extraHeaders = {}) => request('/me/sessions' + query,
  { token: token(user), headers: { ...headers, ...extraHeaders } });
const data = (response: ReturnType<typeof request>) => response.data.data as {
  items: { id: string; device_label: string; current: boolean; row_version: number }[]; has_more: boolean; next_cursor: string | null;
};
const fixtureSession = (number: number) => session(30 + number);
const fixtureRow = (number: number) => `30000000-0000-4000-8000-${String(30 + number).padStart(12, '0')}`;
let previousConfig: string | undefined;

before(() => {
  assert.equal(sql('SELECT 1;').trim(), '1');
  assert.equal(request('/user', { auth: true, token: token() }).status, 200, 'Real Auth must recognize the controlled subject before business assertions');
  assert.ok(['dev', 'test'].includes(environment || ''));
  previousConfig = rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr as string | undefined;
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}'),('${account(2)}') ON CONFLICT (id) DO NOTHING;
    INSERT INTO core.session_registry(session_id,account_id,device_label) VALUES
      ('${session(1)}','${account(1)}','Synthetic current device'),('${session(2)}','${account(2)}','Synthetic private other account')
      ON CONFLICT (session_id) DO NOTHING;
    INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest)
      VALUES ('synthetic-sessions-v1','[]',1,'{"mobile":["${release}"]}','active',clock_timestamp(),'${'a'.repeat(64)}')
      ON CONFLICT (version) DO NOTHING;
    INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${environment}','synthetic-sessions-v1')
      ON CONFLICT (environment) DO UPDATE SET active_ptr=excluded.active_ptr;`);
  for (let number = 1; number <= 22; number++) {
    sql(`INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
      VALUES ('${fixtureSession(number)}','${account(1)}','2026-01-01T00:00:${String(number).padStart(2, '0')}Z',clock_timestamp(),'aal1') ON CONFLICT (id) DO NOTHING;
      INSERT INTO core.session_registry(id,session_id,account_id,device_label,created_at)
      VALUES ('${fixtureRow(number)}','${fixtureSession(number)}','${account(1)}','Synthetic other device ${number}',
        '2026-01-01T00:00:${String(number).padStart(2, '0')}Z') ON CONFLICT (session_id) DO NOTHING;`);
  }
});
after(() => {
  for (let number = 1; number <= 22; number++) sql(`DELETE FROM core.session_registry WHERE id='${fixtureRow(number)}'; DELETE FROM auth.sessions WHERE id='${fixtureSession(number)}';`);
  if (previousConfig) sql(`UPDATE core.config_activation SET active_ptr='${previousConfig}' WHERE environment='${environment}';`);
  else sql(`DELETE FROM core.config_activation WHERE environment='${environment}' AND active_ptr='synthetic-sessions-v1';`);
});

test('AS01: the authenticated owner receives a bounded current session list with only device fields and the actual configuration version', () => {
  // Break caught: /me/sessions is missing, leaks raw identity records, or fabricates an unbounded list.
  const response = get();
  assert.equal(response.status, 200, response.body);
  assert.equal(response.data.config_version, 'synthetic-sessions-v1');
  assert.match(String(response.data.request_id), /^[a-f0-9-]{36}$/);
  assert.equal(validatePage(data(response)), true);
  assert.equal(data(response).items.length, 20);
  assert.equal(data(response).has_more, true);
  assert.equal(data(response).items.filter(item => item.current).length, 1);
  for (const item of data(response).items) assert.deepEqual(Object.keys(item).sort(),
    ['created_at', 'current', 'device_label', 'id', 'row_version', 'trusted_at']);
  assert.doesNotMatch(response.body, /Synthetic private other account|refresh_token|token_hash|secret_ref|phone|user_id|account_id/);
  const next = get(`?cursor=${data(response).next_cursor}`);
  assert.equal(next.status, 200, next.body);
  assert.equal(data(next).items.length, 3);
  assert.equal(data(next).has_more, false);
  assert.equal(data(next).next_cursor, null);
  assert.equal(new Set([...data(response).items, ...data(next).items].map(item => item.id)).size, 23);
});

test('AS02: another account and share audience cannot acquire this owner session list through headers or a copied cursor', () => {
  // Break caught: a client subject selector or reused page token bypasses current authenticated ownership.
  const other = get('', 2, { 'X-Account-Id': account(1), 'X-Role': 'super_admin' });
  assert.equal(other.status, 200, other.body);
  assert.equal(data(other).items.length, 1);
  assert.doesNotMatch(other.body, /Synthetic other device/);
  const cursor = data(get()).next_cursor;
  assert.equal(get(`?cursor=${cursor}`, 2).status, 422);
  assert.equal(request('/me/sessions', { headers }).status, 401);
  for (const method of ['GET', 'HEAD', 'POST']) assert.equal(request('/me/sessions', {
    method, token: token(1, { aud: 'share-read' }), headers }).status, 403);
});

test('AS03: invalid pagination and forged or query-mismatched cursors are rejected instead of changing the authorized scope', () => {
  // Break caught: cursor bytes choose a private subject, limit changes bypass binding, or unbounded pages are admitted.
  for (const query of ['?limit=0', '?limit=51', '?limit=1.5', '?cursor=malformed', '?account_id=' + account(2)]) {
    assert.equal(get(query).status, 422, query);
  }
  const first = get('?limit=1');
  assert.equal(first.status, 200, first.body);
  const cursor = data(first).next_cursor!;
  assert.equal(get(`?limit=2&cursor=${cursor}`).status, 422);
  assert.equal(get(`?limit=1&cursor=${cursor.slice(0, -1)}%21`).status, 422);
  const envelope = JSON.parse(Buffer.from(cursor, 'base64url').toString());
  const payload = JSON.parse(envelope.payload);
  payload.position = fixtureRow(1);
  const changedPosition = Buffer.from(JSON.stringify({ ...envelope, payload: JSON.stringify(payload) })).toString('base64url');
  assert.equal(get(`?limit=1&cursor=${changedPosition}`).status, 422, 'A well-formed changed position must fail signature verification');
  const signature = Buffer.from(envelope.signature, 'base64url');
  signature[0] ^= 1;
  const changedSignature = Buffer.from(JSON.stringify({ ...envelope, signature: signature.toString('base64url') })).toString('base64url');
  assert.equal(get(`?limit=1&cursor=${changedSignature}`).status, 422, 'A well-formed changed signature must fail verification');
});

test('AS05: pagination uses the actual compatible active bundle and refuses a previous bundle cursor after activation changes', () => {
  // Break caught: a page silently mixes configuration versions or claims success without a compatible active bundle.
  const first = get('?limit=1');
  assert.equal(first.status, 200, first.body);
  const cursor = data(first).next_cursor!;
  try {
    sql(`INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest)
      VALUES ('synthetic-sessions-v2','[]',1,'{"mobile":["${release}"]}','active',clock_timestamp(),'${'b'.repeat(64)}')
      ON CONFLICT (version) DO NOTHING;
      UPDATE core.config_activation SET active_ptr='synthetic-sessions-v2' WHERE environment='${environment}';`);
    assert.equal(get(`?limit=1&cursor=${cursor}`).status, 422);
    const next = get();
    assert.equal(next.status, 200, next.body);
    assert.equal(next.data.config_version, 'synthetic-sessions-v2');
    assert.equal(get('', 1, { 'X-Client-Release': 'incompatible-synthetic-release' }).status, 503);
    sql(`DELETE FROM core.config_activation WHERE environment='${environment}';`);
    assert.equal(get().status, 503);
  } finally {
    sql(`INSERT INTO core.config_activation(environment,active_ptr) VALUES ('${environment}','synthetic-sessions-v1')
      ON CONFLICT (environment) DO UPDATE SET active_ptr=excluded.active_ptr;`);
  }
});

test('AS04: every new list read observes actual session revocation and never treats its signed JWT as sufficient authorization', () => {
  // Break caught: current identity is checked only when a token or page was first issued.
  const old = token(1, { session_id: fixtureSession(1) });
  assert.equal(request('/me/sessions', { token: old, headers }).status, 200);
  try {
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp(),epoch=epoch+1 WHERE id='${fixtureRow(1)}';`);
    assert.equal(request('/me/sessions', { token: old, headers }).status, 401);
    const current = get('?limit=50');
    assert.equal(current.status, 200, current.body);
    assert.equal(data(current).items.some(item => item.id === fixtureRow(1)), false);
  } finally { sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE id='${fixtureRow(1)}';`); }
});
