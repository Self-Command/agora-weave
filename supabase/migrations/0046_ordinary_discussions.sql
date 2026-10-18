-- Ordinary top-level text comments and one like relation per actor/target.
CREATE TABLE core.reaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid NOT NULL REFERENCES core.account(id),
  target uuid NOT NULL REFERENCES core.resource(id),
  kind text NOT NULL CHECK (kind='like'),
  active boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  UNIQUE(actor,target,kind)
);
CREATE INDEX ON core.reaction(target,kind) WHERE active;
SELECT core.protect_table('core.reaction');

CREATE FUNCTION core.create_text_comment_result(
  actor uuid,session_ref uuid,target_environment text,post_id uuid,payload jsonb,
  payload_hash text,visible_count integer,body_limit integer,config_version text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; admitted jsonb; previous core.operation; post core.resource;
  entry core.resource; revision_id uuid:=gen_random_uuid(); command uuid;
  operation_ref uuid; receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF post_id IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','body','media_refs']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>3
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR jsonb_typeof(payload->'body')<>'string' OR payload->'media_refs'<>'[]'::jsonb
    OR visible_count IS NULL OR visible_count<1 OR visible_count>char_length(payload->>'body')
    OR octet_length(payload->>'body')>65536
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command:=(payload->>'operation_id')::uuid;

  admitted:=core.resource_action_result(actor,session_ref,post_id,'resource.read','read');
  IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
  SELECT * INTO post FROM core.resource r WHERE r.id=post_id AND r.kind='post';
  IF post.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=post_id)
    AND s.functions && ARRAY['comment.create','comment','interact','write','all']::text[])
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.reply_policy p WHERE p.post_id=post_id AND p.scope='all_readers')
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;

  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_text_comment_result.actor
    AND op.action='comment.create' AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment
      OR NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=previous.result_ref
        AND r.author_id=actor AND r.root_post=post_id)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  IF config_version IS NULL OR core.response_config_version(target_environment) IS DISTINCT FROM config_version
    OR body_limit IS NULL OR body_limit<1 OR body_limit>2000
  THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF visible_count>body_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;

  INSERT INTO core.resource(author_id,kind,visibility,root_post,publication_state)
    VALUES (actor,'comment',post.visibility,post_id,'pending') RETURNING * INTO entry;
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
    VALUES (revision_id,entry.id,1,payload->>'body',actor,'pending',clock_timestamp());
  UPDATE core.resource SET current_revision_id=revision_id WHERE id=entry.id RETURNING * INTO entry;
  INSERT INTO core.resource_dependency(dependent,source,kind,purposes)
    VALUES (entry.id,post_id,'comment_post',ARRAY['read']::text[]);
  receipt:=jsonb_build_object('resource_id',entry.id,'revision_id',revision_id,'operation_id',command,
    'review_state','pending','publication_state','awaiting_review','row_version',entry.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'comment.create',command,payload_hash,entry.id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'comment.create',entry.id,target_environment,'core','Submitted text comment for review',
      'awaiting_review',command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.create_text_comment_result(uuid,uuid,text,uuid,jsonb,text,integer,integer,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.create_text_comment_result(uuid,uuid,text,uuid,jsonb,text,integer,integer,text)
  TO core_runtime;

CREATE FUNCTION core.set_resource_like_result(
  actor uuid,session_ref uuid,target_environment text,target_id uuid,command uuid,
  payload_hash text,desired_active boolean
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; admitted jsonb; previous core.operation; target core.resource;
  reaction_row core.reaction; operation_ref uuid; receipt jsonb; like_count bigint;
  action_name text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target_id IS NULL OR command IS NULL OR desired_active IS NULL OR payload_hash IS NULL
    OR payload_hash !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  action_name:=CASE WHEN desired_active THEN 'like.put' ELSE 'like.remove' END;
  admitted:=core.resource_action_result(actor,session_ref,target_id,'resource.read','read');
  IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
  SELECT * INTO target FROM core.resource r WHERE r.id=target_id AND r.kind IN ('post','comment');
  IF target.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=target_id)
    AND s.functions && ARRAY['like','like.put','like.remove','interact','write','all']::text[])
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO previous FROM core.operation op WHERE op.actor=set_resource_like_result.actor
    AND op.action=action_name AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment
      OR previous.result_ref<>target_id THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  INSERT INTO core.reaction(actor,target,kind,active) VALUES (actor,target_id,'like',desired_active)
    ON CONFLICT(actor,target,kind) DO UPDATE SET active=EXCLUDED.active RETURNING * INTO reaction_row;
  SELECT count(*) INTO like_count FROM core.reaction r JOIN core.account a ON a.id=r.actor
    WHERE r.target=target_id AND r.kind='like' AND r.active AND a.status='active';
  receipt:=jsonb_build_object('target_id',target_id,'active',desired_active,'count',like_count);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,action_name,command,payload_hash,target_id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,action_name,target_id,target_environment,'core','Actor changed resource like',
      CASE WHEN desired_active THEN 'active' ELSE 'removed' END,command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.set_resource_like_result(uuid,uuid,text,uuid,uuid,text,boolean)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.set_resource_like_result(uuid,uuid,text,uuid,uuid,text,boolean)
  TO core_runtime;

CREATE FUNCTION core.list_post_comments_result(
  actor uuid,session_ref uuid,target_environment text,post_id uuid,sort_name text,page_limit integer,
  cursor_position uuid,cursor_created timestamptz,cursor_score numeric,cursor_version text,client_release text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; admitted jsonb; active_version text; entry record; checked jsonb;
  items jsonb:='[]'::jsonb; item_count integer:=0; more boolean:=false;
  last_id uuid; last_created timestamptz; last_score numeric;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF post_id IS NULL OR sort_name NOT IN ('latest','hot') OR page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50
    OR client_release IS NULL OR client_release !~ '^[A-Za-z0-9_.-]{1,128}$'
    OR (cursor_position IS NULL)<>(cursor_created IS NULL)
    OR (cursor_position IS NULL)<>(cursor_version IS NULL)
    OR (cursor_position IS NOT NULL AND sort_name='hot' AND cursor_score IS NULL)
    OR (sort_name='latest' AND cursor_score IS NOT NULL)
    OR (cursor_created IS NOT NULL AND NOT isfinite(cursor_created))
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  admitted:=core.resource_action_result(actor,session_ref,post_id,'resource.read','read');
  IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
  IF NOT EXISTS (SELECT 1 FROM core.resource p WHERE p.id=post_id AND p.kind='post')
  THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT b.version INTO active_version FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1
      AND b.effective_at<=clock_timestamp() AND b.compat @> jsonb_build_object('mobile',jsonb_build_array(client_release));
  IF active_version IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF cursor_position IS NOT NULL AND cursor_version IS DISTINCT FROM active_version
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;

  FOR entry IN
    WITH candidates AS MATERIALIZED (
      SELECT r.id,r.created_at,
        (SELECT count(*)::numeric FROM core.reaction l JOIN core.account a ON a.id=l.actor
          WHERE l.target=r.id AND l.kind='like' AND l.active AND a.status='active') AS hot_score,
        core.resource_action_result(actor,session_ref,r.id,'resource.read','read') AS access
      FROM core.resource r WHERE r.kind='comment' AND r.root_post=post_id
        AND EXISTS (SELECT 1 FROM core.resource_dependency d WHERE d.dependent=r.id
          AND d.source=post_id AND d.kind='comment_post')
    ), eligible AS MATERIALIZED (
      SELECT c.id,c.created_at,c.hot_score FROM candidates c WHERE c.access->>'code'='OK'
    )
    SELECT e.id,e.created_at,e.hot_score FROM eligible e
      WHERE cursor_position IS NULL
        OR sort_name='latest' AND (e.created_at,e.id)<(cursor_created,cursor_position)
        OR sort_name='hot' AND (e.hot_score,e.created_at,e.id)<(cursor_score,cursor_created,cursor_position)
      ORDER BY CASE WHEN sort_name='hot' THEN e.hot_score END DESC,e.created_at DESC,e.id DESC
      LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true; EXIT; END IF;
    checked:=core.resource_action_result(actor,session_ref,entry.id,'resource.read','read');
    IF checked->>'code'<>'OK' THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    items:=items || jsonb_build_array(jsonb_build_object(
      'id',entry.id,'post_id',post_id,'author_id',checked->'data'->'author_id',
      'parent_comment_id',NULL,'reply_to_id',NULL,'display_depth',1,
      'body',checked->'data'->'body','media','[]'::jsonb,
      'row_version',checked->'data'->'row_version',
      'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'allowed_actions','[]'::jsonb));
    item_count:=item_count+1; last_id:=entry.id; last_created:=entry.created_at; last_score:=entry.hot_score;
  END LOOP;
  RETURN jsonb_build_object('code','OK','config_version',active_version,'items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_created_at',CASE WHEN more THEN to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
    'next_score',CASE WHEN more AND sort_name='hot' THEN last_score::text END);
END $$;
REVOKE ALL ON FUNCTION core.list_post_comments_result(uuid,uuid,text,uuid,text,integer,uuid,timestamptz,numeric,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_post_comments_result(uuid,uuid,text,uuid,text,integer,uuid,timestamptz,numeric,text,text)
  TO core_runtime;
