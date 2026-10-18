import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

test('post, comment and like commands commit once while review gates public reads', () => {
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(environment === 'dev' || environment === 'test');
  const postOperation = randomUUID();
  const commentOperation = randomUUID();
  const likeOperation = randomUUID();
  const unlikeOperation = randomUUID();
  const output = sql(`BEGIN;
    DO $check$ DECLARE
      actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${environment}';
      post_command uuid:='${postOperation}'; comment_command uuid:='${commentOperation}';
      like_command uuid:='${likeOperation}'; unlike_command uuid:='${unlikeOperation}';
      post_result jsonb; comment_result jsonb; result jsonb; first_like jsonb; item uuid; revision uuid;
    BEGIN
      INSERT INTO core.account(id) VALUES (actor) ON CONFLICT DO NOTHING;
      INSERT INTO core.session_registry(session_id,account_id) VALUES (sess,actor) ON CONFLICT DO NOTHING;
      IF NOT core.current_identity(actor,sess) THEN RAISE EXCEPTION 'Fixture identity unavailable'; END IF;
      post_result:=core.create_text_post_result(actor,sess,env,
        jsonb_build_object('operation_id',post_command,'type','text','body','test','tags','[]'::jsonb,
          'mentions','[]'::jsonb,'media_refs','[]'::jsonb,'visibility','public',
          'reply_scope','all_readers','indexing_mode','inherit'),repeat('a',64),4,2000,
        core.response_config_version(env));
      IF post_result->>'code' IS DISTINCT FROM 'OK' THEN RAISE EXCEPTION 'Post rejected: %',post_result; END IF;
      item:=(post_result->'data'->>'resource_id')::uuid;
      revision:=(post_result->'data'->>'revision_id')::uuid;
      IF core.resource_action_result(NULL,NULL,item,'resource.read','read')->>'code' IS DISTINCT FROM 'NOT_FOUND'
      THEN RAISE EXCEPTION 'Pending post escaped review'; END IF;
      result:=core.create_text_post_result(actor,sess,env,
        jsonb_build_object('operation_id',post_command,'type','text','body','test','tags','[]'::jsonb,
          'mentions','[]'::jsonb,'media_refs','[]'::jsonb,'visibility','public',
          'reply_scope','all_readers','indexing_mode','inherit'),repeat('a',64),4,2000,
        core.response_config_version(env));
      IF result->'data' IS DISTINCT FROM post_result->'data' THEN RAISE EXCEPTION 'Post retry changed receipt'; END IF;
      result:=core.create_text_post_result(actor,sess,env,
        jsonb_build_object('operation_id',post_command,'type','text','body','test','tags','[]'::jsonb,
          'mentions','[]'::jsonb,'media_refs','[]'::jsonb,'visibility','public',
          'reply_scope','all_readers','indexing_mode','inherit'),repeat('b',64),4,2000,
        core.response_config_version(env));
      IF result->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Changed payload accepted'; END IF;
      result:=core.account_operation_result(actor,sess,post_command,env,'aal1');
      IF result->'data'->'result' IS DISTINCT FROM post_result->'data' THEN RAISE EXCEPTION 'Post result not recoverable'; END IF;
      IF (SELECT count(*) FROM core.operation op WHERE op.actor='${account(1)}'::uuid
        AND op.action='post.create' AND op.operation_id=post_command)<>1 THEN RAISE EXCEPTION 'Duplicate post operation'; END IF;
      UPDATE core.content_revision SET review_state='approved' WHERE id=revision;
      UPDATE core.resource SET publication_state='published' WHERE id=item;
      IF core.resource_action_result(NULL,NULL,item,'resource.read','read')->>'code' IS DISTINCT FROM 'OK'
      THEN RAISE EXCEPTION 'Approved post unreadable'; END IF;
      comment_result:=core.create_text_comment_result(actor,sess,env,item,
        jsonb_build_object('operation_id',comment_command,'body','hello','media_refs','[]'::jsonb),
        repeat('c',64),5,2000,core.response_config_version(env));
      IF comment_result->>'code' IS DISTINCT FROM 'OK' THEN RAISE EXCEPTION 'Comment rejected: %',comment_result; END IF;
      result:=core.list_post_comments_result(NULL,NULL,env,item,'latest',20,NULL,NULL,NULL,NULL,'0.0.0');
      IF result->>'code' IS DISTINCT FROM 'OK' OR jsonb_array_length(result->'items')<>0
      THEN RAISE EXCEPTION 'Pending comment escaped review: %',result; END IF;
      UPDATE core.content_revision SET review_state='approved'
        WHERE id=(comment_result->'data'->>'revision_id')::uuid;
      UPDATE core.resource SET publication_state='published'
        WHERE id=(comment_result->'data'->>'resource_id')::uuid;
      result:=core.list_post_comments_result(NULL,NULL,env,item,'latest',20,NULL,NULL,NULL,NULL,'0.0.0');
      IF result->>'code' IS DISTINCT FROM 'OK' OR jsonb_array_length(result->'items')<>1
      THEN RAISE EXCEPTION 'Approved comment missing: %',result; END IF;
      first_like:=core.set_resource_like_result(actor,sess,env,item,like_command,repeat('d',64),true);
      IF first_like->>'code' IS DISTINCT FROM 'OK' OR (first_like->'data'->>'count')::int<>1
      THEN RAISE EXCEPTION 'Like failed: %',first_like; END IF;
      result:=core.set_resource_like_result(actor,sess,env,item,like_command,repeat('d',64),true);
      IF result->'data' IS DISTINCT FROM first_like->'data' THEN RAISE EXCEPTION 'Like retry changed result'; END IF;
      result:=core.set_resource_like_result(actor,sess,env,item,unlike_command,repeat('e',64),false);
      IF result->>'code' IS DISTINCT FROM 'OK' OR (result->'data'->>'count')::int<>0
      THEN RAISE EXCEPTION 'Unlike failed: %',result; END IF;
      result:=core.account_operation_result(actor,sess,like_command,env,'aal1');
      IF result->'data'->'result' IS DISTINCT FROM first_like->'data'
      THEN RAISE EXCEPTION 'Original like result not recoverable'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(output, /verified/);
});
