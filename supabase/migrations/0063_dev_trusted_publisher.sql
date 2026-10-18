-- A narrowly scoped development privilege for the user's App test account.
-- Production and test environments always retain normal content review.
CREATE TABLE core.dev_trusted_publisher (
  account_id uuid NOT NULL REFERENCES core.account(id),
  environment text NOT NULL CHECK (environment = 'dev'),
  reason text NOT NULL CHECK (length(reason) BETWEEN 1 AND 500),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  PRIMARY KEY (account_id,environment)
);
SELECT core.protect_table('core.dev_trusted_publisher');

CREATE FUNCTION core.dev_trusted_publisher_active(actor uuid,env text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT env='dev' AND EXISTS(
    SELECT 1 FROM core.dev_trusted_publisher g JOIN core.account a ON a.id=g.account_id
    WHERE g.account_id=actor AND g.environment='dev' AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()) AND a.status='active'
  );
$$;
REVOKE ALL ON FUNCTION core.dev_trusted_publisher_active(uuid,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.dev_trusted_publisher_active(uuid,text) TO core_runtime;

-- The two existing post commands are replaced below. Validation, active sanctions,
-- media ownership, operation idempotency, and audit still run before publication.

CREATE OR REPLACE FUNCTION core.create_text_post_result(
  actor uuid, session_ref uuid, target_environment text, payload jsonb,
  payload_hash text, visible_count integer, body_limit integer, config_version text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE
  context jsonb;
  previous core.operation;
  v_resource core.resource;
  v_revision_id uuid := gen_random_uuid();
  v_operation_id uuid;
  v_operation_ref uuid;
  v_receipt jsonb; v_auto boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context := core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR payload_hash IS NULL
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','type','body','visibility','reply_scope',
      'indexing_mode','tags','mentions','media_refs']::text[])
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'type'<>'text' OR jsonb_typeof(payload->'body')<>'string'
    OR payload->>'visibility' NOT IN ('public','followers','self')
    OR payload->>'reply_scope'<>'all_readers' OR payload->>'indexing_mode'<>'inherit'
    OR payload->'tags'<>'[]'::jsonb OR payload->'mentions'<>'[]'::jsonb
    OR payload->'media_refs'<>'[]'::jsonb
    OR payload ? 'poll' OR payload ? 'source_id'
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>9
    OR visible_count IS NULL OR visible_count<1 OR visible_count>char_length(payload->>'body')
    OR octet_length(payload->>'body')>65536
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_operation_id := (payload->>'operation_id')::uuid;

  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor AND s.state='active'
    AND s.starts_at<=clock_timestamp() AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;

  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_text_post_result.actor
    AND op.action='post.create' AND op.operation_id=v_operation_id;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment THEN
      RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=previous.result_ref AND r.author_id=actor)
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=previous.id;
    IF v_receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',v_receipt);
  END IF;

  IF config_version IS NULL OR core.response_config_version(target_environment) IS DISTINCT FROM config_version
    OR body_limit IS NULL OR body_limit<1 THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  IF visible_count>body_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_auto:=core.dev_trusted_publisher_active(actor,target_environment);

  INSERT INTO core.resource(author_id,kind,visibility,publication_state)
    VALUES (actor,'post',payload->>'visibility',CASE WHEN v_auto THEN 'published' ELSE 'pending' END) RETURNING * INTO v_resource;
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
    VALUES (v_revision_id,v_resource.id,1,payload->>'body',actor,CASE WHEN v_auto THEN 'approved' ELSE 'pending' END,clock_timestamp());
  UPDATE core.resource SET current_revision_id=v_revision_id WHERE id=v_resource.id RETURNING * INTO v_resource;
  INSERT INTO core.reply_policy(post_id,scope) VALUES (v_resource.id,'all_readers');
  v_receipt := jsonb_build_object('resource_id',v_resource.id,'revision_id',v_revision_id,
    'operation_id',v_operation_id,'review_state',CASE WHEN v_auto THEN 'approved' ELSE 'pending' END,
    'publication_state',CASE WHEN v_auto THEN 'published' ELSE 'awaiting_review' END,
    'row_version',v_resource.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'post.create',v_operation_id,payload_hash,v_resource.id,'succeeded')
    RETURNING id INTO v_operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (v_operation_ref,v_receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'post.create',v_resource.id,target_environment,'core',CASE WHEN v_auto THEN 'Published by dev trusted publisher grant' ELSE 'Submitted text post for review' END,
      CASE WHEN v_auto THEN 'published' ELSE 'awaiting_review' END,v_operation_id);
  RETURN jsonb_build_object('code','OK','data',v_receipt);
END $$;

CREATE OR REPLACE FUNCTION core.create_image_post_result(actor uuid,session_ref uuid,env text,payload jsonb,
  payload_hash text,visible_count integer,body_limit integer,image_limit integer,image_byte_limit integer,config_version text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; target core.resource; media core.media_object;
  revision_ref uuid:=gen_random_uuid(); operation_ref uuid; command_ref uuid; receipt jsonb;
  media_ref_text text; ordinal integer:=0; media_count integer; auto_publish boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','type','body','visibility','reply_scope','indexing_mode','tags','mentions','media_refs']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>9
    OR payload->>'operation_id' IS NULL
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'type' IS DISTINCT FROM 'images' OR jsonb_typeof(payload->'body') IS DISTINCT FROM 'string'
    OR payload->>'visibility' IS NULL OR payload->>'visibility' NOT IN ('public','followers','self')
    OR payload->>'reply_scope' IS DISTINCT FROM 'all_readers'
    OR payload->>'indexing_mode' IS DISTINCT FROM 'inherit'
    OR payload->'tags' IS DISTINCT FROM '[]'::jsonb OR payload->'mentions' IS DISTINCT FROM '[]'::jsonb
    OR jsonb_typeof(payload->'media_refs') IS DISTINCT FROM 'array'
    OR visible_count IS NULL OR visible_count<0 OR visible_count>char_length(payload->>'body')
    OR octet_length(payload->>'body')>65536
    OR body_limit IS NULL OR body_limit NOT BETWEEN 1 AND 10000
    OR image_limit IS NULL OR image_limit NOT BETWEEN 1 AND 9
    OR image_byte_limit IS NULL OR image_byte_limit NOT BETWEEN 1 AND 10000000
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  media_count:=jsonb_array_length(payload->'media_refs');
  IF media_count NOT BETWEEN 1 AND image_limit OR visible_count>body_limit
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'media_refs') j(value) WHERE jsonb_typeof(j.value)<>'string')
    OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(payload->'media_refs') j(value)
      WHERE j.value !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
    OR (SELECT count(DISTINCT value) FROM jsonb_array_elements_text(payload->'media_refs'))<>media_count
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor AND s.state='active'
    AND s.starts_at<=clock_timestamp() AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_image_post_result.actor
    AND op.action='post.create' AND op.operation_id=command_ref;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>env THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF NOT EXISTS(SELECT 1 FROM core.resource r WHERE r.id=previous.result_ref AND r.author_id=actor)
      THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT p.receipt INTO receipt FROM core.operation_receipt p WHERE p.operation_ref=previous.id;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF config_version IS NULL OR core.response_config_version(env) IS DISTINCT FROM config_version
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  auto_publish:=core.dev_trusted_publisher_active(actor,env);
  -- Lock every exact media row before the post insert. No foreign or unvalidated object can bind.
  FOR media_ref_text IN SELECT value FROM jsonb_array_elements_text(payload->'media_refs') LOOP
    SELECT * INTO media FROM core.media_object m WHERE m.id=media_ref_text::uuid FOR UPDATE;
    IF media.id IS NULL OR media.owner<>actor OR media.state<>'validated' OR media.bound_resource IS NOT NULL
      OR media.plugin<>'core' OR media.bucket<>'post-images-private' OR media.detected_mime NOT IN ('image/png','image/jpeg')
      OR media.size_bytes NOT BETWEEN 1 AND image_byte_limit
      OR NOT EXISTS(SELECT 1 FROM core.image_upload_session u WHERE u.media_id=media.id AND u.owner=actor
        AND u.environment=env AND u.detected_mime=media.detected_mime AND u.expires_at>clock_timestamp())
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END LOOP;
  INSERT INTO core.resource(author_id,kind,visibility,publication_state)
    VALUES(actor,'post',payload->>'visibility',CASE WHEN auto_publish THEN 'published' ELSE 'pending' END) RETURNING * INTO target;
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
    VALUES(revision_ref,target.id,1,payload->>'body',actor,CASE WHEN auto_publish THEN 'approved' ELSE 'pending' END,clock_timestamp());
  UPDATE core.resource SET current_revision_id=revision_ref WHERE id=target.id RETURNING * INTO target;
  INSERT INTO core.reply_policy(post_id,scope) VALUES(target.id,'all_readers');
  FOR media_ref_text IN SELECT value FROM jsonb_array_elements_text(payload->'media_refs') LOOP
    UPDATE core.media_object SET state='reviewed' WHERE id=media_ref_text::uuid;
    UPDATE core.media_object SET state='bound',bound_resource=target.id WHERE id=media_ref_text::uuid;
    INSERT INTO core.post_image_binding(revision_id,resource_id,media_id,position)
      VALUES(revision_ref,target.id,media_ref_text::uuid,ordinal);
    ordinal:=ordinal+1;
  END LOOP;
  receipt:=jsonb_build_object('resource_id',target.id,'revision_id',revision_ref,
    'operation_id',command_ref,'review_state',CASE WHEN auto_publish THEN 'approved' ELSE 'pending' END,
    'publication_state',CASE WHEN auto_publish THEN 'published' ELSE 'awaiting_review' END,
    'row_version',target.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'post.create',command_ref,payload_hash,target.id,'succeeded') RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'post.create',target.id,env,'core',CASE WHEN auto_publish THEN 'Published by dev trusted publisher grant' ELSE 'Submitted image post for review' END,
      CASE WHEN auto_publish THEN 'published' ELSE 'awaiting_review' END,command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
