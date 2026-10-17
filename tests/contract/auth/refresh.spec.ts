import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { account, request, sql } from '../../fixtures/core/runtime.ts';

test('RF01: controlled Auth refresh rotates a real refresh token and core revocation prevents its next output', () => {
  // Controlled legacy-format token; the real Auth service validates and rotates it.
  const session = randomUUID(),refresh = randomBytes(6).toString('hex');
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}') ON CONFLICT DO NOTHING;
    INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal) VALUES ('${session}','${account(1)}',clock_timestamp(),clock_timestamp(),'aal1');
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session}','${account(1)}');
    INSERT INTO auth.refresh_tokens(instance_id,token,user_id,session_id,revoked,created_at,updated_at,parent)
      VALUES ('00000000-0000-0000-0000-000000000000','${refresh}','${account(1)}','${session}',false,clock_timestamp(),clock_timestamp(),'');`);
  try {
    const response = request('/auth/refresh',{ method: 'POST',body: { refresh_token: refresh } });
    if (response.status !== 200) {
      const auth = request('/token?grant_type=refresh_token',{ auth: true,method: 'POST',body: { refresh_token: refresh } });
      assert.fail(JSON.stringify({ core_status: response.status,auth_status: auth.status,auth_error_code: auth.data.error_code || auth.data.error || auth.data.code,
        auth_message: String(auth.data.msg || auth.data.error_description || auth.data.message || '').replaceAll(refresh,'[redacted]').slice(0,256) }));
    }
    assert.equal(response.status,200,JSON.stringify({ status: response.status,code: response.data.code }));
    const sessionData = (response.data.data as { session: { access_token: string; refresh_token: string; expires_at: number } }).session;
    assert.ok(sessionData.expires_at > Date.now()/1000);
    assert.equal(sessionData.refresh_token !== refresh,true,'The Auth service must rotate the controlled refresh token');
    assert.equal(request('/user',{ auth: true,token: sessionData.access_token }).status,200,'The real Auth service must accept the returned signed token');
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session}';`);
    const rejected = request('/auth/refresh',{ method: 'POST',body: { refresh_token: sessionData.refresh_token } });
    assert.equal(rejected.status,401);
    assert.doesNotMatch(rejected.body,/access_token|refresh_token/);
  } finally {
    sql(`DELETE FROM auth.refresh_tokens WHERE session_id='${session}'; DELETE FROM core.session_registry WHERE session_id='${session}'; DELETE FROM auth.sessions WHERE id='${session}';`);
  }
});
test('RF02: malformed or invalid refresh credentials fail without exposing tokens or accepting client identity fields', () => {
  assert.equal(request('/auth/refresh',{ method: 'POST',body: { refresh_token: 'bad' } }).status,422);
  assert.equal(request('/auth/refresh',{ method: 'POST',body: { refresh_token: 'a'.repeat(20) + String.fromCharCode(0) } }).status,422);
  assert.equal(request('/auth/refresh',{ method: 'POST',body: { refresh_token: 'a'.repeat(64),account_id: account(1) } }).status,422);
  const invalid = request('/auth/refresh',{ method: 'POST',body: { refresh_token: randomBytes(32).toString('hex') } });
  assert.equal(invalid.status,401);
  assert.doesNotMatch(invalid.body,/access_token|refresh_token|sql|stack/i);
});
