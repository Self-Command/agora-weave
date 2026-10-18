-- Repair PL/pgSQL actor/column ambiguity in the three installed upload commands.

CREATE OR REPLACE FUNCTION core.create_image_upload_result(actor uuid,session_ref uuid,env text,command_ref uuid,
  expected_size integer,expected_hash text,image_byte_limit integer,config_version text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media_ref uuid:=gen_random_uuid(); upload_ref uuid:=gen_random_uuid();
  receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR expected_size IS NULL OR expected_size NOT BETWEEN 1 AND 10000000
    OR expected_hash IS NULL OR expected_hash !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session u WHERE u.owner=actor AND u.environment=env
    AND u.allocation_operation=command_ref;
  IF entry.id IS NOT NULL THEN
    IF entry.expected_size<>expected_size OR entry.expected_sha256<>expected_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=create_image_upload_result.actor AND op.environment=env AND op.action='upload.create' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF config_version IS NULL OR core.response_config_version(env) IS DISTINCT FROM config_version
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF image_byte_limit IS NULL OR image_byte_limit NOT BETWEEN 1 AND 10000000
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF expected_size>image_byte_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=create_image_upload_result.actor
    AND op.environment=env AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,sha256,size_bytes,state,data_class)
    VALUES(media_ref,actor,'core','post-images-private',media_ref::text || '/original',expected_hash,expected_size,'allocated','content');
  INSERT INTO core.image_upload_session(id,media_id,owner,environment,allocation_operation,expected_size,expected_sha256)
    VALUES(upload_ref,media_ref,actor,env,command_ref,expected_size,expected_hash) RETURNING * INTO entry;
  receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','allocated',
    'uploaded_parts','[]'::jsonb,'expires_at',entry.expires_at,'reusable_refs','[]'::jsonb);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'upload.create',command_ref,
      encode(sha256(convert_to(jsonb_build_array('post','image',expected_size,expected_hash)::text,'UTF8')),'hex'),media_ref,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'upload.allocate',media_ref,env,'core','Private image upload allocated','allocated',command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;

CREATE OR REPLACE FUNCTION core.image_upload_part_result(actor uuid,session_ref uuid,env text,upload_ref uuid,
  command_ref uuid,actual_hash text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media core.media_object; receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env,upload_ref);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR actual_hash IS NULL OR actual_hash !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session WHERE id=upload_ref FOR UPDATE;
  SELECT * INTO media FROM core.media_object WHERE id=entry.media_id FOR UPDATE;
  IF entry.expected_sha256<>actual_hash THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF entry.part_operation IS NOT NULL THEN
    IF entry.part_operation<>command_ref OR entry.uploaded_sha256<>actual_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=image_upload_part_result.actor AND op.environment=env AND op.action='upload.part' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  ELSE
    IF entry.expires_at<=clock_timestamp() OR media.state NOT IN ('allocated','uploading')
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=image_upload_part_result.actor
      AND op.environment=env AND op.operation_id=command_ref)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    UPDATE core.media_object SET state='uploading' WHERE id=entry.media_id;
    UPDATE core.media_object SET state='uploaded' WHERE id=entry.media_id;
    UPDATE core.image_upload_session SET part_operation=command_ref,uploaded_sha256=actual_hash WHERE id=upload_ref;
    receipt:=jsonb_build_object('upload_id',upload_ref,'part',0,'uploaded_parts','[0]'::jsonb);
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
      VALUES(actor,session_ref,env,'upload.part',command_ref,
        encode(sha256(convert_to(jsonb_build_array(upload_ref,0,actual_hash)::text,'UTF8')),'hex'),entry.media_id,'succeeded')
      RETURNING id INTO operation_ref;
    INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('upload_id',upload_ref,'part',0,'uploaded_parts','[0]'::jsonb));
END $$;

CREATE OR REPLACE FUNCTION core.complete_image_upload_result(actor uuid,session_ref uuid,env text,upload_ref uuid,
  command_ref uuid,actual_hash text,detected_type text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
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
  IF entry.expected_sha256<>actual_hash OR entry.uploaded_sha256<>actual_hash THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF entry.completion_operation IS NOT NULL THEN
    IF entry.completion_operation<>command_ref OR entry.detected_mime<>detected_type THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=complete_image_upload_result.actor AND op.environment=env AND op.action='upload.complete' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  ELSE
    IF entry.expires_at<=clock_timestamp() OR entry.uploaded_sha256 IS NULL OR media.state<>'uploaded'
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=complete_image_upload_result.actor
      AND op.environment=env AND op.operation_id=command_ref)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    UPDATE core.media_object SET state='validated',detected_mime=detected_type,codec=CASE WHEN detected_type='image/png' THEN 'png' ELSE 'jpeg' END
      WHERE id=entry.media_id;
    UPDATE core.image_upload_session SET completion_operation=command_ref,detected_mime=detected_type WHERE id=upload_ref;
    receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','validated',
      'uploaded_parts','[0]'::jsonb,'expires_at',entry.expires_at,'reusable_refs',jsonb_build_array(entry.media_id));
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
      VALUES(actor,session_ref,env,'upload.complete',command_ref,
        encode(sha256(convert_to(jsonb_build_array(upload_ref,actual_hash,detected_type)::text,'UTF8')),'hex'),entry.media_id,'succeeded')
      RETURNING id INTO operation_ref;
    INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('id',entry.id,'media_id',entry.media_id,
    'state','validated','uploaded_parts','[0]'::jsonb,'expires_at',entry.expires_at,'reusable_refs',jsonb_build_array(entry.media_id)));
END $$;
