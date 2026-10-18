import assert from 'node:assert/strict';
import test from 'node:test';
import { account,session,sql } from '../../fixtures/core/runtime.ts';

test('local trusted publishing requires an explicit local switch, active grant and dev environment',()=>{
  const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env==='dev' || env==='test');
  const result=sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${env}';
      command jsonb; receipt jsonb; comment jsonb; target uuid; operation uuid:=gen_random_uuid();
    BEGIN
      INSERT INTO core.dev_trusted_publisher(account_id,environment,reason) VALUES(actor,'dev','Isolated trusted publishing test')
        ON CONFLICT(account_id,environment) DO UPDATE SET revoked_at=NULL,expires_at=NULL;
      IF core.dev_trusted_publisher_active(actor,'dev') THEN RAISE EXCEPTION 'Grant alone enabled bypass'; END IF;
      PERFORM set_config('agoraweave.local_dev_publishing','on',true);
      IF NOT core.dev_trusted_publisher_active(actor,'dev') OR core.dev_trusted_publisher_active(actor,'test')
        OR core.dev_trusted_publisher_active(actor,'production') THEN RAISE EXCEPTION 'Environment bypass'; END IF;
      command:=jsonb_build_object('operation_id',operation,'type','text','body','trusted',
        'visibility','public','reply_scope','all_readers','indexing_mode','inherit','tags','[]'::jsonb,
        'mentions','[]'::jsonb,'media_refs','[]'::jsonb);
      receipt:=core.create_text_post_result(actor,sess,env,command,repeat('a',64),7,2000,core.response_config_version(env));
      IF receipt->>'code'<>'OK' OR receipt->'data'->>'review_state' IS DISTINCT FROM (CASE WHEN env='dev' THEN 'approved' ELSE 'pending' END)
        THEN RAISE EXCEPTION 'Trusted text receipt incorrect: %',receipt; END IF;
      IF core.create_text_post_result(actor,sess,env,command,repeat('a',64),7,2000,core.response_config_version(env))->'data'
        IS DISTINCT FROM receipt->'data' THEN RAISE EXCEPTION 'Trusted retry changed receipt'; END IF;
      IF core.create_text_post_result(actor,sess,env,command,repeat('b',64),7,2000,core.response_config_version(env))->>'code'<>'CONFLICT'
        THEN RAISE EXCEPTION 'Changed payload accepted'; END IF;
      target:=(receipt->'data'->>'resource_id')::uuid;
      IF env='test' THEN
        UPDATE core.content_revision SET review_state='approved' WHERE resource_id=target;
        UPDATE core.resource SET publication_state='published' WHERE id=target;
      END IF;
      comment:=core.create_text_comment_result(actor,sess,env,target,
        jsonb_build_object('operation_id',gen_random_uuid(),'body','comment','media_refs','[]'::jsonb),
        repeat('c',64),7,2000,core.response_config_version(env));
      IF comment->>'code'<>'OK' OR comment->'data'->>'publication_state' IS DISTINCT FROM (CASE WHEN env='dev' THEN 'published' ELSE 'awaiting_review' END)
        THEN RAISE EXCEPTION 'Trusted comment receipt incorrect: %',comment; END IF;
      UPDATE core.dev_trusted_publisher SET expires_at=clock_timestamp()-interval '1 second' WHERE account_id=actor;
      IF core.dev_trusted_publisher_active(actor,'dev') THEN RAISE EXCEPTION 'Expired grant active'; END IF;
      UPDATE core.dev_trusted_publisher SET expires_at=NULL,revoked_at=clock_timestamp() WHERE account_id=actor;
      IF core.dev_trusted_publisher_active(actor,'dev') THEN RAISE EXCEPTION 'Revoked grant active'; END IF;
      IF has_table_privilege('core_runtime','core.dev_trusted_publisher','INSERT') OR
        has_table_privilege('authenticated','core.dev_trusted_publisher','UPDATE') OR
        has_function_privilege('authenticated','core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)','EXECUTE')
        THEN RAISE EXCEPTION 'Client may grant or read private content'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});

test('ordinary pending posts are author-only and paginated without changing original operation receipts',()=>{
  const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env==='dev' || env==='test');
  const result=sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(2)}'; sess uuid:='${session(2)}'; env text:='${env}';
      command uuid:=gen_random_uuid(); receipt jsonb; page jsonb; target uuid; other_page jsonb;
    BEGIN
      receipt:=core.create_text_post_result(actor,sess,env,
        jsonb_build_object('operation_id',command,'type','text','body','pending',
          'visibility','public','reply_scope','all_readers','indexing_mode','inherit','tags','[]'::jsonb,
          'mentions','[]'::jsonb,'media_refs','[]'::jsonb),repeat('d',64),7,2000,core.response_config_version(env));
      IF receipt->>'code'<>'OK' OR receipt->'data'->>'publication_state'<>'awaiting_review'
        THEN RAISE EXCEPTION 'Ordinary account bypassed review: %',receipt; END IF;
      target:=(receipt->'data'->>'resource_id')::uuid;
      IF core.resource_action_result(NULL,NULL,target,'resource.read','read')->>'code'<>'NOT_FOUND'
        THEN RAISE EXCEPTION 'Pending post became public'; END IF;
      page:=core.list_owned_contents_result(actor,sess,env,50);
      IF page->>'code'<>'OK' OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(page->'items') i
        WHERE i->>'resource_id'=target::text AND i->>'publication_state'='awaiting_review')
        THEN RAISE EXCEPTION 'Author cannot find accepted pending content: %',page; END IF;
      other_page:=core.list_owned_contents_result('${account(1)}','${session(1)}',env,50);
      IF EXISTS(SELECT 1 FROM jsonb_array_elements(other_page->'items') i WHERE i->>'resource_id'=target::text)
        THEN RAISE EXCEPTION 'Pending content leaked to another account'; END IF;
      IF core.list_owned_contents_result(NULL,NULL,env,20)->>'code'<>'SESSION_INVALID'
        OR core.list_owned_contents_result(actor,sess,env,51)->>'code'<>'INVALID_INPUT'
        OR core.list_owned_contents_result(actor,sess,env,20,target,NULL)->>'code'<>'INVALID_INPUT'
        THEN RAISE EXCEPTION 'Invalid private list input accepted'; END IF;
      IF core.account_operation_result(actor,sess,command,env,'aal1')->'data'->'result' IS DISTINCT FROM receipt->'data'
        THEN RAISE EXCEPTION 'Accepted receipt lost'; END IF;
      IF (SELECT count(*) FROM core.resource r WHERE r.id=target AND r.author_id=actor)<>1
        THEN RAISE EXCEPTION 'Unexpected resource count'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});
