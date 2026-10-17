CREATE FUNCTION core.registration_documents_result(target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE documents jsonb; set_digest text;
BEGIN
  IF target_environment NOT IN ('dev','test','production') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT jsonb_agg(jsonb_build_object('release_id',r.id,'document_id',d.id,'kind',d.kind,
      'title',v.title,'body',v.body,'digest',r.content_digest) ORDER BY d.stable_key,d.locale,r.id),
    encode(sha256(convert_to(string_agg(r.id::text || ':' || r.content_digest,',' ORDER BY d.stable_key,d.locale,r.id),'UTF8')),'hex')
    INTO documents,set_digest
    FROM core.managed_document d JOIN core.document_release r ON r.id = d.active_release_id AND r.document_id = d.id
    JOIN core.document_revision v ON v.id = r.revision_ref AND v.document_id = d.id AND v.content_digest = r.content_digest
    WHERE d.kind IN ('terms','privacy') AND d.locale = 'zh-CN' AND 'app' = ANY(d.public_surfaces)
      AND r.state = 'published' AND r.published_at <= clock_timestamp() AND v.state = 'ready'
      AND r.scope @> jsonb_build_object('environment',target_environment,'surfaces',jsonb_build_array('app'),'purposes',jsonb_build_array('register'));
  IF documents IS NULL OR NOT documents @> '[{"kind":"terms"}]'::jsonb THEN
    RETURN jsonb_build_object('code','TERMS_UNAVAILABLE');
  END IF;
  RETURN jsonb_build_object('code','OK','documents',documents,'document_set_digest',set_digest,'age_declaration_version','adult-18-v1');
END $$;

CREATE FUNCTION core.complete_registration_result(actor uuid, session_ref uuid, invitation_hash text,
  age_version text, adult_declared boolean, expected_set text, consents jsonb,
  presentation uuid, command uuid, device_label text, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE invitation core.invitation; documents jsonb; doc jsonb; receipt uuid; terms_release uuid; terms_receipt uuid;
  verified_at timestamptz; payload_digest text; previous core.operation;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF command IS NULL OR presentation IS NULL OR age_version IS DISTINCT FROM 'adult-18-v1'
    OR adult_declared IS DISTINCT FROM true OR invitation_hash !~ '^[a-f0-9]{64}$'
    OR char_length(device_label) NOT BETWEEN 1 AND 120 OR jsonb_typeof(consents) IS DISTINCT FROM 'array' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  payload_digest := encode(sha256(convert_to(jsonb_build_array(session_ref,invitation_hash,age_version,adult_declared,
    expected_set,consents,presentation,device_label,target_environment)::text,'UTF8')),'hex');
  SELECT * INTO previous FROM core.operation op WHERE op.actor = complete_registration_result.actor
    AND op.action = 'auth.register' AND op.operation_id = command;
  IF previous.id IS NOT NULL THEN
    IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
    IF previous.payload_hash <> payload_digest THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','admitted',true);
  END IF;
  -- A verified Auth subject alone has no community account. Read the actual phone/session facts here.
  SELECT u.phone_confirmed_at INTO verified_at FROM auth.users u JOIN auth.sessions s ON s.user_id = u.id
    WHERE u.id = actor AND s.id = session_ref AND nullif(u.phone,'') IS NOT NULL AND u.deleted_at IS NULL
      AND (u.banned_until IS NULL OR u.banned_until <= clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after > clock_timestamp()) AND u.phone_confirmed_at <= clock_timestamp();
  IF verified_at IS NULL THEN RETURN jsonb_build_object('code','PHONE_UNVERIFIED'); END IF;
  IF EXISTS (SELECT 1 FROM core.account WHERE id = actor) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  documents := core.registration_documents_result(target_environment);
  IF documents->>'code' <> 'OK' THEN RETURN documents; END IF;
  IF documents->>'document_set_digest' IS DISTINCT FROM expected_set THEN RETURN jsonb_build_object('code','TERMS_CHANGED'); END IF;
  IF jsonb_array_length(consents) <> jsonb_array_length(documents->'documents') OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(documents->'documents') required WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(consents) c WHERE c = jsonb_build_object(
        'release_id',required->'release_id','digest',required->'digest','decision','consented'))
  ) THEN RETURN jsonb_build_object('code','CONSENT_REQUIRED'); END IF;
  SELECT * INTO invitation FROM core.invitation WHERE token_hash = invitation_hash FOR UPDATE;
  IF invitation.id IS NULL OR invitation.state <> 'unused' OR invitation.expires_at <= clock_timestamp() THEN
    RETURN jsonb_build_object('code','INVITATION_INVALID');
  END IF;
  INSERT INTO core.account(id) VALUES (actor);
  UPDATE core.invitation SET state = 'used',used_account_id = actor,used_at = clock_timestamp() WHERE id = invitation.id;
  FOR doc IN SELECT value FROM jsonb_array_elements(documents->'documents') LOOP
    INSERT INTO core.document_receipt(subject,release_id,revision_digest,presentation_ref,purpose,decision,request_id)
      VALUES (actor,(doc->>'release_id')::uuid,doc->>'digest',presentation,'register','consented',command) RETURNING id INTO receipt;
    IF terms_release IS NULL AND doc->>'kind' = 'terms' THEN terms_release := (doc->>'release_id')::uuid; terms_receipt := receipt; END IF;
  END LOOP;
  INSERT INTO core.admission(account_id,invitation_id,phone_verified_at,age_declaration,terms_version,terms_receipt_id)
    VALUES (actor,invitation.id,verified_at,jsonb_build_object('version',age_version,'declared',true),terms_release,terms_receipt);
  INSERT INTO core.session_registry(session_id,account_id,device_label) VALUES (session_ref,actor,device_label);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'auth.register',command,payload_digest,actor,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'auth.register',actor,target_environment,'core','Explicit invitation admission','admitted',command);
  RETURN jsonb_build_object('code','OK','admitted',true);
END $$;
DO $$ DECLARE name text; BEGIN
  FOREACH name IN ARRAY ARRAY['managed_document','document_release','document_revision'] LOOP
    EXECUTE format('CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.%I FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock()',name);
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION core.registration_documents_result(text),core.complete_registration_result(uuid,uuid,text,text,boolean,text,jsonb,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.registration_documents_result(text),core.complete_registration_result(uuid,uuid,text,text,boolean,text,jsonb,uuid,uuid,text,text) TO core_runtime;
