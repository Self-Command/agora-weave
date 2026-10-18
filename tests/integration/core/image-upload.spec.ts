import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

test('image upload operations recover receipts and bind one validated object to one pending post', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const allocate = randomUUID(), part = randomUUID(), complete = randomUUID(), post = randomUUID();
  const imageHash = 'a'.repeat(64), postHash = 'b'.repeat(64);
  const output = sql(`BEGIN;
    DO $check$ DECLARE
      actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${env}';
      created jsonb; result jsonb; upload_ref uuid; media_ref uuid; post_result jsonb; resource_ref uuid;
    BEGIN
      INSERT INTO core.account(id) VALUES(actor) ON CONFLICT DO NOTHING;
      INSERT INTO core.session_registry(session_id,account_id) VALUES(sess,actor) ON CONFLICT DO NOTHING;
      created:=core.create_image_upload_result(actor,sess,env,'${allocate}',1234,'${imageHash}',10000000,core.response_config_version(env));
      IF created->>'code'<>'OK' THEN RAISE EXCEPTION 'Allocation failed: %',created; END IF;
      upload_ref:=(created->'data'->>'id')::uuid; media_ref:=(created->'data'->>'media_id')::uuid;
      result:=core.create_image_upload_result(actor,sess,env,'${allocate}',1234,'${imageHash}',10000000,core.response_config_version(env));
      IF result->'data' IS DISTINCT FROM created->'data' THEN RAISE EXCEPTION 'Allocation retry changed receipt'; END IF;
      result:=core.create_image_upload_result(actor,sess,env,'${allocate}',1235,'${imageHash}',10000000,core.response_config_version(env));
      IF result->>'code'<>'CONFLICT' THEN RAISE EXCEPTION 'Changed allocation accepted'; END IF;
      result:=core.image_upload_part_result(actor,sess,env,upload_ref,'${part}',repeat('c',64));
      IF result->>'code'<>'INVALID_INPUT' THEN RAISE EXCEPTION 'Wrong part digest accepted'; END IF;
      result:=core.image_upload_part_result(actor,sess,env,upload_ref,'${part}','${imageHash}');
      IF result->>'code'<>'OK' THEN RAISE EXCEPTION 'Part rejected: %',result; END IF;
      result:=core.complete_image_upload_result(actor,sess,env,upload_ref,'${complete}','${imageHash}','image/png');
      IF result->>'code'<>'OK' THEN RAISE EXCEPTION 'Completion rejected: %',result; END IF;
      result:=core.account_operation_result(actor,sess,'${complete}',env,'aal1');
      IF result->'data'->'result'->>'media_id' IS DISTINCT FROM media_ref::text
        THEN RAISE EXCEPTION 'Completion receipt not recoverable'; END IF;
      post_result:=core.create_image_post_result(actor,sess,env,
        jsonb_build_object('operation_id','${post}'::uuid,'type','images','body','',
          'tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs',jsonb_build_array(media_ref),
          'visibility','public','reply_scope','all_readers','indexing_mode','inherit'),
        '${postHash}',0,2000,9,10000000,core.response_config_version(env));
      IF post_result->>'code'<>'OK' THEN RAISE EXCEPTION 'Image post rejected: %',post_result; END IF;
      resource_ref:=(post_result->'data'->>'resource_id')::uuid;
      IF (SELECT count(*) FROM core.post_image_binding b WHERE b.resource_id=resource_ref AND b.media_id=media_ref)<>1
        OR (SELECT state FROM core.media_object WHERE id=media_ref)<>'bound'
        THEN RAISE EXCEPTION 'Image not atomically bound'; END IF;
      IF core.media_read_result(NULL,NULL,media_ref,'original')->>'code'='OK'
        THEN RAISE EXCEPTION 'Pending image became public'; END IF;
      IF core.media_review_read_result(actor,sess,env,'aal1',media_ref)->>'code'='OK'
        THEN RAISE EXCEPTION 'Ordinary session read pending image'; END IF;
      result:=core.create_image_post_result(actor,sess,env,
        jsonb_build_object('operation_id','${post}'::uuid,'type','images','body','',
          'tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs',jsonb_build_array(media_ref),
          'visibility','public','reply_scope','all_readers','indexing_mode','inherit'),
        '${postHash}',0,2000,9,10000000,core.response_config_version(env));
      IF result->'data' IS DISTINCT FROM post_result->'data' THEN RAISE EXCEPTION 'Post retry changed receipt'; END IF;
      result:=core.create_image_post_result(actor,sess,env,
        jsonb_build_object('operation_id',gen_random_uuid(),'type','images','body','',
          'tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs',jsonb_build_array(media_ref),
          'visibility','public','reply_scope','all_readers','indexing_mode','inherit'),
        '${postHash}',0,2000,9,10000000,core.response_config_version(env));
      IF result->>'code'<>'INVALID_INPUT' THEN RAISE EXCEPTION 'Already bound media reused'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(output,/verified/);
});
