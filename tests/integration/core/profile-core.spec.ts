import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

test('profile first write, immutable replay, CAS, reserved name and rename interval', () => {
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(environment === 'dev' || environment === 'test');
  const name = `u${randomUUID().replaceAll('-', '').slice(0, 20)}`;
  const next = `u${randomUUID().replaceAll('-', '').slice(0, 20)}`;
  const first = randomUUID(), second = randomUUID();
  const result = sql(`BEGIN;
    DO $check$ DECLARE
      actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${environment}';
      command uuid:='${first}'; next_command uuid:='${second}';
      payload jsonb; response jsonb; original jsonb;
    BEGIN
      INSERT INTO core.account(id) VALUES(actor) ON CONFLICT DO NOTHING;
      INSERT INTO core.session_registry(session_id,account_id) VALUES(sess,actor) ON CONFLICT DO NOTHING;
      IF NOT core.current_identity(actor,sess) THEN RAISE EXCEPTION 'Fixture identity unavailable'; END IF;
      IF EXISTS(SELECT 1 FROM core.profile p WHERE p.account_id=actor) THEN
        RAISE EXCEPTION 'Synthetic account already has profile'; END IF;
      response:=core.read_profile_result(actor,sess,actor,env);
      IF response->>'code' IS DISTINCT FROM 'NOT_FOUND' THEN RAISE EXCEPTION 'Uninitialized read: %',response; END IF;
      payload:=jsonb_build_object('operation_id',command,'base_version',1,'nickname','真实测试昵称',
        'username','${name}','bio','');
      original:=core.update_profile_result(actor,sess,env,payload,repeat('a',64),3,30,2592000,2592000,
        '["admin","system"]'::jsonb);
      IF original->>'code' IS DISTINCT FROM 'OK' OR original->'data'->>'username' IS DISTINCT FROM '${name}'
        OR (original->'data'->>'row_version')::integer<>1 THEN RAISE EXCEPTION 'First write: %',original; END IF;
      response:=core.update_profile_result(actor,sess,env,payload,repeat('a',64),3,30,2592000,2592000,
        '["admin","system"]'::jsonb);
      IF response->'data' IS DISTINCT FROM original->'data' THEN RAISE EXCEPTION 'Replay changed receipt'; END IF;
      response:=core.update_profile_result(actor,sess,env,payload,repeat('b',64),3,30,2592000,2592000,
        '["admin","system"]'::jsonb);
      IF response->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Changed replay accepted'; END IF;
      response:=core.update_profile_result(actor,sess,env,payload || jsonb_build_object('operation_id',next_command,
        'base_version',2),repeat('c',64),3,30,2592000,2592000,'["admin","system"]'::jsonb);
      IF response->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Stale version accepted'; END IF;
      response:=core.update_profile_result(actor,sess,env,payload || jsonb_build_object('operation_id',next_command,
        'username','admin'),repeat('d',64),3,30,2592000,2592000,'["admin","system"]'::jsonb);
      IF response->>'code' IS DISTINCT FROM 'INVALID_INPUT' THEN RAISE EXCEPTION 'Reserved name accepted'; END IF;
      response:=core.update_profile_result(actor,sess,env,payload || jsonb_build_object('operation_id',next_command,
        'username','${next}'),repeat('e',64),3,30,2592000,2592000,'["admin","system"]'::jsonb);
      IF response->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Early rename accepted'; END IF;
      response:=core.account_operation_result(actor,sess,command,env,'aal1');
      IF response->'data'->'result' IS DISTINCT FROM original->'data' THEN RAISE EXCEPTION 'Original not recoverable'; END IF;
      response:=core.read_profile_result(NULL,NULL,actor,env);
      IF response->>'code' IS DISTINCT FROM 'OK' OR response->'data'->>'username' IS DISTINCT FROM '${name}'
        THEN RAISE EXCEPTION 'Public projection incorrect: %',response; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result, /verified/);
});
