CREATE FUNCTION core.complete_login_result(actor uuid, session_ref uuid, command uuid,
  device_label text, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE previous core.operation; entry core.session_registry; payload_digest text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF actor IS NULL OR session_ref IS NULL OR command IS NULL OR device_label IS NULL
    OR char_length(device_label) NOT BETWEEN 1 AND 120 OR target_environment IS NULL
    OR target_environment NOT IN ('dev','test','production') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.account a JOIN core.admission admitted ON admitted.account_id=a.id
    JOIN auth.users u ON u.id=a.id JOIN auth.sessions s ON s.user_id=a.id
    WHERE a.id=actor AND a.status='active' AND s.id=session_ref AND u.deleted_at IS NULL
      AND nullif(u.phone,'') IS NOT NULL AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='otp' AND amr.created_at<=clock_timestamp())) THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  SELECT * INTO entry FROM core.session_registry r WHERE r.session_id=session_ref;
  IF entry.id IS NOT NULL AND (entry.account_id<>actor OR entry.revoked_at IS NOT NULL) THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  payload_digest := encode(sha256(convert_to(jsonb_build_array(session_ref,device_label,target_environment)::text,'UTF8')),'hex');
  SELECT * INTO previous FROM core.operation op WHERE op.actor=complete_login_result.actor
    AND op.action='auth.login' AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_digest OR previous.session_id<>session_ref OR previous.environment<>target_environment THEN
      RETURN jsonb_build_object('code','CONFLICT');
    END IF;
    IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
    RETURN jsonb_build_object('code','OK','admitted',true);
  END IF;
  IF entry.id IS NULL THEN
    INSERT INTO core.session_registry(session_id,account_id,device_label) VALUES (session_ref,actor,device_label);
  END IF;
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'auth.login',command,payload_digest,actor,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'auth.login',actor,target_environment,'core','Verified existing account session','admitted',command);
  RETURN jsonb_build_object('code','OK','admitted',true);
END $$;
REVOKE ALL ON FUNCTION core.complete_login_result(uuid,uuid,uuid,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.complete_login_result(uuid,uuid,uuid,text,text) TO core_runtime;
