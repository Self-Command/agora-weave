import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { account, session, request, rows, sql, token } from '../../fixtures/core/runtime.ts';

const target = 'a2000000-0000-4000-8000-000000000001';
const extraSession = session(80);
const commands = new Map<number,string>();
const operation = (n: number) => { if (!commands.has(n)) commands.set(n,randomUUID()); return commands.get(n)!; };
const send = (path: string, body: unknown, user = 1, method = 'DELETE', patch = {}) => request(path,
  { method, body, token: token(user,patch), headers: { 'X-Client-Release': 'synthetic-account-v1' } });
before(() => {
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}'),('${account(2)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(1)}','${account(1)}'),('${session(2)}','${account(2)}') ON CONFLICT DO NOTHING;
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${extraSession}','${account(1)}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO core.session_registry(id,session_id,account_id,device_label) VALUES ('${target}','${extraSession}','${account(1)}','Synthetic revocation device');`);
});
after(() => {
  sql(`DELETE FROM core.session_registry WHERE id='${target}'; DELETE FROM auth.sessions WHERE id='${extraSession}';`);
});

test('SM01: revocation rejects foreign ownership, self-targeting and stale versions without creating effects', () => {
  const path = `/me/sessions/${target}`;
  assert.equal(send(path,{ operation_id: operation(1),base_version: 1 },2).status,404);
  assert.equal(send(path,{ operation_id: operation(2),base_version: 99 }).status,409);
  assert.equal(send(path,{ operation_id: operation(3),base_version: 1,account_id: account(2) }).status,422);
  assert.equal(send(path,{ operation_id: operation(4),base_version: 1 },1,'DELETE',{ aud: 'share-read' }).status,403);
  const own = rows(`SELECT id,row_version FROM core.session_registry WHERE session_id='${session(1)}'`)[0];
  assert.equal(send(`/me/sessions/${own.id}`,{ operation_id: operation(5),base_version: Number(own.row_version) }).status,422);
  assert.equal(rows(`SELECT revoked_at FROM core.session_registry WHERE id='${target}'`)[0].revoked_at,null);
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE operation_id IN ('${operation(1)}','${operation(2)}','${operation(3)}','${operation(4)}','${operation(5)}')`)[0].n,0);
});

test('SM02: one owned revocation commits durable deny, audit and outbox once and immediately rejects the old JWT', () => {
  const path = `/me/sessions/${target}`;
  const body = { operation_id: operation(6),base_version: 1 };
  const response = send(path,body);
  assert.equal(response.status,200,response.body);
  assert.equal((response.data.data as { revoked: boolean }).revoked,true);
  assert.equal(send(path,body).status,200,'An identical retry must reuse the committed effect');
  assert.equal(send(path,{ ...body,base_version: 2 }).status,409);
  assert.equal(request('/me/sessions',{ token: token(1,{ session_id: extraSession }),headers: { 'X-Client-Release': 'synthetic-account-v1' } }).status,401);
  for (const statement of [
    `SELECT count(*)::int AS n FROM core.operation WHERE operation_id='${operation(6)}' AND state='succeeded'`,
    `SELECT count(*)::int AS n FROM core.audit_event WHERE request_id='${operation(6)}' AND operation='session.revoke'`,
    `SELECT count(*)::int AS n FROM core.security_journal WHERE deny_intent_id='${operation(6)}' AND target='${extraSession}'`,
    `SELECT count(*)::int AS n FROM core.outbox WHERE effect_key='session.revoke:${operation(6)}:${account(1)}'`,
  ]) assert.equal(rows(statement)[0].n,1);
});

test('SM03: logout only revokes its actual current session and its retry cannot reopen private access', () => {
  const body = { operation_id: operation(7) };
  // Use a separate real Auth session to leave the shared owner fixture active.
  const logoutSession = session(81);
  sql(`INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${logoutSession}','${account(1)}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${logoutSession}','${account(1)}');`);
  try {
    const response = send('/auth/logout',body,1,'POST',{ session_id: logoutSession });
    assert.equal(response.status,200,response.body);
    assert.equal((response.data.data as { clear_restricted_cache: boolean }).clear_restricted_cache,true);
    assert.equal(send('/auth/logout',body,1,'POST',{ session_id: logoutSession }).status,200);
    assert.equal(send('/auth/logout',{ operation_id: operation(8) },1,'POST',{ session_id: logoutSession }).status,401);
    assert.equal(request('/me/sessions',{ token: token(1,{ session_id: logoutSession }) }).status,401);
    assert.equal(rows(`SELECT core.current_identity('${account(1)}','${session(1)}') AS active`)[0].active,true);
  } finally {
    sql(`DELETE FROM core.session_registry WHERE session_id='${logoutSession}'; DELETE FROM auth.sessions WHERE id='${logoutSession}';`);
  }
});
