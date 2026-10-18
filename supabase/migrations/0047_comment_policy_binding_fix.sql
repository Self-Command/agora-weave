-- Qualify the function parameter against reply_policy.post_id; the installed 0046 remains immutable.
CREATE OR REPLACE FUNCTION core.create_text_comment_result(
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
  IF NOT EXISTS (SELECT 1 FROM core.reply_policy p WHERE p.post_id=create_text_comment_result.post_id AND p.scope='all_readers')
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

