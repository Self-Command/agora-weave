import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

// Rolled-back synthetic mutations still leave intentional entries in the
// independent deny ledger. Resolve their actual transaction status between cases.
beforeEach(() => { sql('SELECT core.reconcile_security_journal();'); });

test('author edits retain the approved reader revision while pending and reject stale or foreign writes', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const result = sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(2)}'; sess uuid:='${session(2)}';
      other uuid:='${account(3)}'; other_sess uuid:='${session(3)}'; env text:='${env}';
      created jsonb; edited jsonb; page jsonb; target uuid; original uuid; current_body text;
      patch jsonb; command uuid:=gen_random_uuid(); base bigint;
    BEGIN
      created:=core.create_text_post_result(actor,sess,env,jsonb_build_object(
        'operation_id',gen_random_uuid(),'type','text','body','approved before edit','visibility','public',
        'reply_scope','all_readers','indexing_mode','inherit','tags','[]'::jsonb,'mentions','[]'::jsonb,
        'media_refs','[]'::jsonb),repeat('a',64),20,2000,core.response_config_version(env));
      IF created->>'code'<>'OK' THEN RAISE EXCEPTION 'Setup failed: %',created; END IF;
      target:=(created->'data'->>'resource_id')::uuid;
      original:=(created->'data'->>'revision_id')::uuid;
      UPDATE core.content_revision SET review_state='approved' WHERE id=original;
      UPDATE core.resource SET publication_state='published',approved_revision_id=original WHERE id=target;
      SELECT row_version INTO base FROM core.resource WHERE id=target;
      patch:=jsonb_build_object('operation_id',command,'base_version',base,'body','pending edit');
      edited:=core.patch_content_result(actor,sess,env,target,'post',patch,repeat('b',64),12,2000,
        core.response_config_version(env));
      IF edited->>'code'<>'OK' OR edited->'data'->>'review_state'<>'pending' THEN
        RAISE EXCEPTION 'Edit not pending: %',edited; END IF;
      IF core.read_resource_result(NULL,NULL,target)->'data'->>'body'<>'approved before edit' THEN
        RAISE EXCEPTION 'Pending revision leaked or approved content disappeared'; END IF;
      page:=core.list_post_revisions_result(actor,sess,env,target,50,NULL);
      IF page->>'code'<>'OK' OR jsonb_array_length(page->'items')<>2 OR
        page->'items'->0->>'body'<>'pending edit' THEN RAISE EXCEPTION 'Author revision history incorrect: %',page; END IF;
      IF core.list_post_revisions_result(other,other_sess,env,target,50,NULL)->>'code'<>'NOT_FOUND' THEN
        RAISE EXCEPTION 'Other account read author history'; END IF;
      IF core.patch_content_result(other,other_sess,env,target,'post',patch,repeat('b',64),12,2000,
        core.response_config_version(env))->>'code' NOT IN ('NOT_FOUND','FORBIDDEN') THEN
        RAISE EXCEPTION 'Foreign edit accepted'; END IF;
      IF core.patch_content_result(actor,sess,env,target,'post',patch,repeat('b',64),12,2000,
        core.response_config_version(env))->'data' IS DISTINCT FROM edited->'data' THEN
        RAISE EXCEPTION 'Retry did not preserve operation receipt'; END IF;
      IF core.patch_content_result(actor,sess,env,target,'post',patch,repeat('c',64),12,2000,
        core.response_config_version(env))->>'code'<>'CONFLICT' THEN
        RAISE EXCEPTION 'Changed payload hash reused operation'; END IF;
      patch:=jsonb_build_object('operation_id',gen_random_uuid(),'base_version',base,'body','stale');
      IF core.patch_content_result(actor,sess,env,target,'post',patch,repeat('d',64),5,2000,
        core.response_config_version(env))->>'code'<>'CONFLICT' THEN
        RAISE EXCEPTION 'Stale base version accepted'; END IF;
      UPDATE core.content_revision SET review_state='rejected' WHERE id=(edited->'data'->>'revision_id')::uuid;
      IF core.read_resource_result(NULL,NULL,target)->'data'->>'body'<>'approved before edit' THEN
        RAISE EXCEPTION 'Rejected revision affected reader'; END IF;
      SELECT body INTO current_body FROM core.content_revision WHERE id=(edited->'data'->>'revision_id')::uuid;
      IF current_body<>'pending edit' THEN RAISE EXCEPTION 'Rejected author content lost'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});

test('user deletion denies new reads and only the author can restore before its original deadline', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const result = sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(2)}'; sess uuid:='${session(2)}';
      other uuid:='${account(3)}'; other_sess uuid:='${session(3)}'; env text:='${env}';
      created jsonb; deleted jsonb; restored jsonb; target uuid; revision uuid; deletion_ref uuid;
      command jsonb; restore_command jsonb; base bigint;
    BEGIN
      created:=core.create_text_post_result(actor,sess,env,jsonb_build_object('operation_id',gen_random_uuid(),
        'type','text','body','restore me','visibility','public','reply_scope','all_readers',
        'indexing_mode','inherit','tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs','[]'::jsonb),
        repeat('e',64),10,2000,core.response_config_version(env));
      IF created->>'code'<>'OK' THEN RAISE EXCEPTION 'Setup failed: %',created; END IF;
      target:=(created->'data'->>'resource_id')::uuid; revision:=(created->'data'->>'revision_id')::uuid;
      UPDATE core.content_revision SET review_state='approved' WHERE id=revision;
      UPDATE core.resource SET publication_state='published',approved_revision_id=revision WHERE id=target;
      SELECT row_version INTO base FROM core.resource WHERE id=target;
      command:=jsonb_build_object('operation_id',gen_random_uuid(),'base_version',base);
      deleted:=core.delete_resource_result(actor,sess,env,target,NULL,command,repeat('f',64));
      IF deleted->>'code'<>'OK' OR deleted->'data'->>'state'<>'deleted' THEN
        RAISE EXCEPTION 'Delete failed: %',deleted; END IF;
      deletion_ref:=(deleted->'data'->>'id')::uuid;
      IF core.read_resource_result(NULL,NULL,target)->>'code'<>'NOT_FOUND' OR
        core.read_resource_result(actor,sess,target)->>'code'<>'NOT_FOUND' THEN
        RAISE EXCEPTION 'Deleted content remains readable'; END IF;
      IF core.list_recently_deleted_result(other,other_sess,env,50,NULL,NULL)->'items' @>
        jsonb_build_array(deleted->'data') THEN RAISE EXCEPTION 'Deletion leaked to other account'; END IF;
      restore_command:=jsonb_build_object('operation_id',gen_random_uuid(),
        'base_version',(deleted->'data'->>'row_version')::bigint);
      IF core.restore_resource_result(other,other_sess,env,deletion_ref,restore_command,repeat('1',64))->>'code'
        NOT IN ('NOT_FOUND','FORBIDDEN') THEN RAISE EXCEPTION 'Foreign restore accepted'; END IF;
      restored:=core.restore_resource_result(actor,sess,env,deletion_ref,restore_command,repeat('1',64));
      IF restored->>'code'<>'OK' OR restored->'data'->>'state'<>'restored' OR
        core.read_resource_result(NULL,NULL,target)->'data'->>'body'<>'restore me' THEN
        RAISE EXCEPTION 'Restore failed: %',restored; END IF;
      IF core.restore_resource_result(actor,sess,env,deletion_ref,restore_command,repeat('1',64))->'data'
        IS DISTINCT FROM restored->'data' THEN RAISE EXCEPTION 'Restore retry changed receipt'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});

test('visibility tightening revokes readers and widening requires the exact current preview', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const result = sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(2)}'; sess uuid:='${session(2)}'; env text:='${env}';
      created jsonb; tightened jsonb; preview jsonb; widened jsonb; target uuid; revision uuid;
      base bigint; op uuid;command jsonb;
    BEGIN
      created:=core.create_text_post_result(actor,sess,env,jsonb_build_object('operation_id',gen_random_uuid(),
        'type','text','body','visible','visibility','public','reply_scope','all_readers',
        'indexing_mode','inherit','tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs','[]'::jsonb),
        repeat('a',64),7,2000,core.response_config_version(env));
      IF created->>'code'<>'OK' THEN RAISE EXCEPTION 'Setup failed: %',created; END IF;
      target:=(created->'data'->>'resource_id')::uuid;revision:=(created->'data'->>'revision_id')::uuid;
      UPDATE core.content_revision SET review_state='approved' WHERE id=revision;
      UPDATE core.resource SET publication_state='published',approved_revision_id=revision WHERE id=target;
      SELECT row_version INTO base FROM core.resource WHERE id=target;
      op:=gen_random_uuid();command:=jsonb_build_object('operation_id',op,'base_version',base,'visibility','self');
      tightened:=core.patch_visibility_result(actor,sess,env,target,command,repeat('b',64));
      IF tightened->>'code'<>'OK' OR core.read_resource_result(NULL,NULL,target)->>'code'<>'NOT_FOUND'
        THEN RAISE EXCEPTION 'Visibility restriction did not revoke public read'; END IF;
      SELECT row_version INTO base FROM core.resource WHERE id=target;
      op:=gen_random_uuid();command:=jsonb_build_object('operation_id',op,'base_version',base,'visibility','public');
      IF core.patch_visibility_result(actor,sess,env,target,command,repeat('c',64))->>'code'<>'CONFLICT'
        THEN RAISE EXCEPTION 'Widening without preview accepted'; END IF;
      preview:=core.preview_post_visibility_result(actor,sess,env,target,command,repeat('d',64));
      IF preview->>'code'<>'OK' THEN RAISE EXCEPTION 'Preview failed: %',preview; END IF;
      command:=command||jsonb_build_object('preview_digest',preview->'data'->>'preview_digest');
      widened:=core.patch_visibility_result(actor,sess,env,target,command,repeat('e',64));
      IF widened->>'code'<>'OK' OR core.read_resource_result(NULL,NULL,target)->>'code'<>'OK'
        THEN RAISE EXCEPTION 'Preview-confirmed widening failed: %',widened; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});

test('reply scope changes immediately restrict new comment submission', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const result = sql(`BEGIN;
    SET LOCAL agoraweave.local_dev_publishing='off';
    DO $check$ DECLARE actor uuid:='${account(2)}';sess uuid:='${session(2)}';
      commenter uuid:='${account(3)}';commenter_sess uuid:='${session(3)}';env text:='${env}';
      created jsonb;target uuid;revision uuid;base bigint;command jsonb;changed jsonb;comment jsonb;
    BEGIN
      created:=core.create_text_post_result(actor,sess,env,jsonb_build_object('operation_id',gen_random_uuid(),
        'type','text','body','commentable','visibility','public','reply_scope','all_readers',
        'indexing_mode','inherit','tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs','[]'::jsonb),
        repeat('a',64),11,2000,core.response_config_version(env));
      IF created->>'code'<>'OK' THEN RAISE EXCEPTION 'Setup failed: %',created; END IF;
      target:=(created->'data'->>'resource_id')::uuid;revision:=(created->'data'->>'revision_id')::uuid;
      UPDATE core.content_revision SET review_state='approved' WHERE id=revision;
      UPDATE core.resource SET publication_state='published',approved_revision_id=revision WHERE id=target;
      SELECT row_version INTO base FROM core.resource WHERE id=target;
      command:=jsonb_build_object('operation_id',gen_random_uuid(),'base_version',base,'scope','closed');
      changed:=core.patch_reply_policy_result(actor,sess,env,target,command,repeat('b',64));
      IF changed->>'code'<>'OK' THEN RAISE EXCEPTION 'Reply patch failed: %',changed; END IF;
      comment:=core.create_text_comment_result(commenter,commenter_sess,env,target,
        jsonb_build_object('operation_id',gen_random_uuid(),'body','denied','media_refs','[]'::jsonb),
        repeat('c',64),6,2000,core.response_config_version(env));
      IF comment->>'code'<>'FORBIDDEN' THEN RAISE EXCEPTION 'Closed post accepted comment: %',comment; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(result,/verified/);
});
