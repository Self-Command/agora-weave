import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { account, session, token, request, sql, rows } from '../../fixtures/core/runtime.ts';
import { compose } from '../../../tools/ci/core-database.ts';

const resource = (number: number) => `40000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const read = (number: number, user?: number, headers?: Record<string, string>) => request(`/posts/${resource(number)}`, { token: user ? token(user) : undefined, headers });
const deny = (response: ReturnType<typeof request>, status = 404) => {
  assert.equal(response.status, status);
  assert.doesNotMatch(response.body, /Synthetic (restricted|private|dependent) body|object_internal_key|secret_ref|service_role/i);
};
before(() => {
  assert.equal(sql('SELECT 1;').trim(), '1', 'The live SQL baseline must remain healthy');
  assert.equal(request('/user', { auth: true, token: token() }).status, 200, 'The real Auth service must recognize the controlled identity');
  sql(readFileSync('tests/fixtures/core/policy.sql', 'utf8'));
});

test('CP01: current primary facts admit the author and effective follower while outsiders and administrator labels cannot read private bodies', () => {
  assert.equal(read(3, 1).status, 200);
  assert.equal((read(2, 2).data.data as Record<string, unknown>).body, 'Synthetic restricted body');
  deny(read(2, 3));
  deny(read(3, 4));
  deny(read(3, 3, { 'X-Account-Id': account(1), 'X-Role': 'super_admin' }));
  const publicRead = read(1);
  assert.equal(publicRead.status, 200);
  assert.equal((publicRead.data.data as Record<string, unknown>).body, 'Synthetic public body');
});

test('CP02: JWT signature issuer audience expiry subject and session ownership are all checked rather than trusting a decodable token', () => {
  assert.equal(read(3, 1).status, 200);
  for (const jwt of [token(1, { iss: 'https://wrong.invalid' }), token(1, { aud: 'service_role' }),
    token(1, { exp: 1 }), token(1, { session_id: undefined }), token(1, { session_id: session(2) }),
    token(1, { sub: account(2) }), token().slice(0, -5) + 'wrong']) {
    deny(request(`/posts/${resource(3)}`, { token: jwt }), 401);
  }
});

test('CP03: the same old JWT loses all new access immediately after a core session revocation or account cancellation commits', () => {
  const jwt = token();
  assert.equal(request(`/posts/${resource(3)}`, { token: jwt }).status, 200);
  try {
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp(),epoch=epoch+1 WHERE session_id='${session()}';`);
    deny(request(`/posts/${resource(3)}`, { token: jwt }), 401);
    sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session()}'; UPDATE core.account SET status='cancelled',identity_epoch=identity_epoch+1 WHERE id='${account()}';`);
    deny(request(`/posts/${resource(3)}`, { token: jwt }), 401);
  } finally {
    sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session()}'; UPDATE core.account SET status='active' WHERE id='${account()}';`);
  }
});

test('CP04: an expired or removed Auth session is rejected even when the core registry and signed JWT still look active', () => {
  assert.equal(read(3, 1).status, 200);
  try {
    sql(`UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 minute' WHERE id='${session()}';`);
    deny(read(3, 1), 401);
  } finally { sql(`UPDATE auth.sessions SET not_after=NULL WHERE id='${session()}';`); }
  sql(`DELETE FROM core.session_registry WHERE session_id='${session(9)}'; DELETE FROM auth.sessions WHERE id='${session(9)}';`);
  deny(request(`/posts/${resource(1)}`, { token: token(9) }), 401);
});

test('CP05: every new resource read uses current follow block visibility deletion and approved-revision facts without positive authorization caching', () => {
  assert.equal(read(2, 2).status, 200);
  try {
    sql(`UPDATE core.follow SET state='removed' WHERE follower_id='${account(2)}' AND followed_id='${account(1)}';`);
    deny(read(2, 2));
    sql(`UPDATE core.follow SET state='effective' WHERE follower_id='${account(2)}' AND followed_id='${account(1)}';
      INSERT INTO core.block(blocker_id,blocked_id) VALUES ('${account(2)}','${account(1)}');`);
    deny(read(2, 2));
    sql(`DELETE FROM core.block WHERE blocker_id='${account(2)}'; UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='${resource(2)}';`);
    deny(read(2, 2));
    sql(`UPDATE core.resource SET visibility='followers',deleted_at=clock_timestamp(),policy_epoch=policy_epoch+1 WHERE id='${resource(2)}';`);
    deny(read(2, 2));
    sql(`UPDATE core.resource SET deleted_at=NULL WHERE id='${resource(2)}'; UPDATE core.content_revision SET review_state='pending' WHERE id='${resource(102)}';`);
    deny(read(2, 2));
  } finally {
    sql(`DELETE FROM core.block WHERE blocker_id='${account(2)}'; UPDATE core.follow SET state='effective' WHERE follower_id='${account(2)}' AND followed_id='${account(1)}';
      UPDATE core.resource SET visibility='followers',deleted_at=NULL WHERE id='${resource(2)}'; UPDATE core.content_revision SET review_state='approved' WHERE id='${resource(102)}';`);
  }
});

test('CP06: quote output including its added text stays hidden whenever any current source dependency is unreadable', () => {
  assert.equal(read(4, 2).status, 200);
  deny(read(4, 3));
  deny(read(4));
  try {
    sql(`UPDATE core.resource SET deleted_at=clock_timestamp(),policy_epoch=policy_epoch+1 WHERE id='${resource(2)}';`);
    deny(read(4, 2));
  } finally { sql(`UPDATE core.resource SET deleted_at=NULL WHERE id='${resource(2)}';`); }
});

test('CP07: share audience applies its method whitelist before private route methods and cannot upgrade through account role or channel headers', () => {
  const jwt = token(1, { aud: 'share-read' });
  assert.equal(request(`/posts/${resource(3)}`, { token: jwt }).status, 200, 'A current author can read their legal restricted share target');
  for (const method of ['GET', 'PATCH', 'PUT']) {
    deny(request('/me/preferences', { token: jwt, method, headers: { 'X-Channel': 'app', 'X-Role': 'super_admin' } }), 403);
  }
  assert.equal(request('/me/preferences', { token: token(), method: 'PUT' }).status, 405);
});

test('CP08: the actual function runtime has a dedicated non-bypass role and no infrastructure credential or arbitrary table access', () => {
  assert.ok(sql("SELECT to_regrole('core_runtime');").trim(), 'A separate runtime database role must exist');
  const role = rows("SELECT rolsuper,rolcreaterole,rolcreatedb,rolbypassrls FROM pg_roles WHERE rolname='core_runtime'")[0];
  assert.deepEqual(role, { rolsuper: false, rolcreaterole: false, rolcreatedb: false, rolbypassrls: false });
  for (const table of ['account','admin_grant','resource','content_revision','security_journal','audit_event']) {
    for (const privilege of ['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) {
      assert.equal(sql(`SELECT has_table_privilege('core_runtime','core.${table}','${privilege}');`).trim(), 'f');
    }
  }
  assert.equal(compose(['exec', '-T', 'functions', 'bash', '-c',
    'if [[ "${SUPABASE_DB_URL-}" == *"://postgres:"* || -n "${SUPABASE_SERVICE_ROLE_KEY-}" ]]; then printf high_privilege; else printf restricted; fi']), 'restricted');
});

test('CP09: a read sanction on a transitive source hides the entire quote until the current restriction ends',()=>{
  const sanction=randomUUID();
  assert.equal(read(2,2).status,200);assert.equal(read(4,2).status,200);
  try {
    sql(`INSERT INTO core.sanction(id,target,type,functions,starts_at,reason,state) VALUES
      ('${sanction}','${resource(2)}','function',ARRAY['read'],clock_timestamp(),'Synthetic dependent read restriction','active');`);
    deny(read(2,2));deny(read(4,2));
    const direct=JSON.parse(sql(`SELECT core.resource_action_result('${account(2)}','${session(2)}','${resource(4)}','media.read','read');`).trim());
    assert.equal(direct.code,'NOT_FOUND');
  } finally {sql(`UPDATE core.sanction SET state='revoked' WHERE id='${sanction}';`);}
  assert.equal(read(4,2).status,200);
});
