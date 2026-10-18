-- Profile images use the existing private image transport but have their own intent.
ALTER TABLE core.image_upload_session ADD COLUMN intent text NOT NULL DEFAULT 'post'
  CHECK (intent IN ('post','profile'));

CREATE OR REPLACE FUNCTION core.image_upload_access(actor uuid,session_ref uuid,env text,target uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; entry core.image_upload_session; requested_intent text:='post';
BEGIN
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NOT NULL THEN
    SELECT * INTO entry FROM core.image_upload_session u WHERE u.id=target;
    IF entry.id IS NULL OR entry.owner<>actor OR entry.environment<>env THEN
      RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    requested_intent:=entry.intent;
  END IF;
  IF requested_intent='post' AND EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor
    AND s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.create_profile_image_upload_result(actor uuid,session_ref uuid,env text,command_ref uuid,
  expected_size integer,expected_hash text,image_byte_limit integer,config_version text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; entry core.image_upload_session; media_ref uuid:=gen_random_uuid();
  upload_ref uuid:=gen_random_uuid(); receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR expected_size IS NULL OR expected_size NOT BETWEEN 1 AND 10000000
    OR expected_hash IS NULL OR expected_hash !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session u WHERE u.owner=actor AND u.environment=env
    AND u.allocation_operation=command_ref;
  IF entry.id IS NOT NULL THEN
    IF entry.intent<>'profile' OR entry.expected_size<>expected_size OR entry.expected_sha256<>expected_hash
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=create_profile_image_upload_result.actor AND op.environment=env
      AND op.action='upload.create' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF config_version IS NULL OR core.response_config_version(env) IS DISTINCT FROM config_version
    OR image_byte_limit IS NULL OR image_byte_limit NOT BETWEEN 1 AND 10000000
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF expected_size>image_byte_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=create_profile_image_upload_result.actor
    AND op.environment=env AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,sha256,size_bytes,state,data_class)
    VALUES(media_ref,actor,'core','post-images-private',media_ref::text || '/original',
      expected_hash,expected_size,'allocated','profile');
  INSERT INTO core.image_upload_session(id,media_id,owner,environment,allocation_operation,
    expected_size,expected_sha256,intent)
    VALUES(upload_ref,media_ref,actor,env,command_ref,expected_size,expected_hash,'profile') RETURNING * INTO entry;
  receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','allocated',
    'uploaded_parts','[]'::jsonb,'expires_at',entry.expires_at,'reusable_refs','[]'::jsonb);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'upload.create',command_ref,
      encode(sha256(convert_to(jsonb_build_array('profile','image',expected_size,expected_hash)::text,'UTF8')),'hex'),
      media_ref,'succeeded') RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'upload.allocate',media_ref,env,'core','Private profile image allocated','allocated',command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.create_profile_image_upload_result(uuid,uuid,text,uuid,integer,text,integer,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.create_profile_image_upload_result(uuid,uuid,text,uuid,integer,text,integer,text)
  TO core_runtime;

-- A completed profile upload may be selected in a profile update. The upload
-- receipt remains "validated", as specified by UploadSession.
CREATE OR REPLACE FUNCTION core.complete_image_upload_result(actor uuid,session_ref uuid,env text,upload_ref uuid,
  command_ref uuid,actual_hash text,detected_type text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media core.media_object; receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env,upload_ref);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR actual_hash IS NULL OR actual_hash !~ '^[a-f0-9]{64}$'
    OR detected_type IS NULL OR detected_type NOT IN ('image/png','image/jpeg')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session WHERE id=upload_ref FOR UPDATE;
  SELECT * INTO media FROM core.media_object WHERE id=entry.media_id FOR UPDATE;
  IF entry.expected_sha256<>actual_hash OR entry.uploaded_sha256<>actual_hash
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF entry.completion_operation IS NOT NULL THEN
    IF entry.completion_operation<>command_ref OR entry.detected_mime<>detected_type
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=complete_image_upload_result.actor AND op.environment=env
      AND op.action='upload.complete' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF entry.expires_at<=clock_timestamp() OR entry.uploaded_sha256 IS NULL OR media.state<>'uploaded'
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=complete_image_upload_result.actor
    AND op.environment=env AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  UPDATE core.media_object SET state='validated',detected_mime=detected_type,
    codec=CASE WHEN detected_type='image/png' THEN 'png' ELSE 'jpeg' END WHERE id=entry.media_id;
  IF entry.intent='profile' THEN UPDATE core.media_object SET state='reviewed'
    WHERE id=entry.media_id; END IF;
  UPDATE core.image_upload_session SET completion_operation=command_ref,detected_mime=detected_type
    WHERE id=upload_ref;
  receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','validated',
    'uploaded_parts','[0]'::jsonb,'expires_at',entry.expires_at,'reusable_refs',jsonb_build_array(entry.media_id));
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'upload.complete',command_ref,
      encode(sha256(convert_to(jsonb_build_array(upload_ref,actual_hash,detected_type)::text,'UTF8')),'hex'),
      entry.media_id,'succeeded') RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;

-- Profile media is readable only while the owner currently exposes that exact
-- reviewed object and the viewer can read the current profile.
CREATE FUNCTION core.profile_media_read_result(actor uuid,session_ref uuid,env text,target uuid,variant text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.media_object; visible jsonb;
BEGIN
  IF variant IS DISTINCT FROM 'original' THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT * INTO entry FROM core.media_object m WHERE m.id=target AND m.state='reviewed'
    AND m.data_class='profile' AND m.plugin='core' AND m.bucket='post-images-private';
  IF entry.id IS NULL OR entry.bound_resource IS NOT NULL OR entry.detected_mime NOT IN ('image/png','image/jpeg')
    OR NOT EXISTS(SELECT 1 FROM core.image_upload_session u WHERE u.media_id=entry.id
      AND u.intent='profile' AND u.owner=entry.owner AND u.environment=env AND u.completion_operation IS NOT NULL)
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  visible:=core.read_profile_result(actor,session_ref,entry.owner,env);
  IF visible->>'code'<>'OK' THEN RETURN jsonb_build_object('code',visible->>'code'); END IF;
  IF visible->'data'->>'avatar_media_ref' IS DISTINCT FROM target::text
    AND visible->'data'->>'background_media_ref' IS DISTINCT FROM target::text
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,
    'mime',entry.detected_mime,'codec',entry.codec,'size_bytes',entry.size_bytes,
    'duration_ms',entry.duration_ms,'variant','original','hash',entry.sha256),
    'source',jsonb_build_object('bucket',entry.bucket,'key',entry.object_internal_key));
END $$;
REVOKE ALL ON FUNCTION core.profile_media_read_result(uuid,uuid,text,uuid,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.profile_media_read_result(uuid,uuid,text,uuid,text) TO core_runtime;
