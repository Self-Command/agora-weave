-- Bind a password-authenticated, already admitted ordinary account in local dev.
-- Provisioning is a separate, explicit operator action; this function never
-- creates accounts, admissions, passwords, or administrator permissions.
CREATE FUNCTION core.complete_dev_test_login_result(actor uuid, session_ref uuid, command uuid,
  expected_actor uuid, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE existing core.session_registry; payload_digest text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF actor IS NULL OR session_ref IS NULL OR command IS NULL OR expected_actor IS NULL
    OR target_environment IS DISTINCT FROM 'dev' THEN
    RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE');
  END IF;
  IF actor IS DISTINCT FROM expected_actor THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF NOT EXISTS (
    SELECT 1 FROM core.account a
    JOIN core.admission admitted ON admitted.account_id=a.id
    JOIN auth.users u ON u.id=a.id
    JOIN auth.sessions s ON s.user_id=a.id AND s.id=session_ref
    WHERE a.id=actor AND a.status='active' AND u.deleted_at IS NULL
      AND u.phone ~ '^\+?[1-9][0-9]{7,14}$' AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (a.sensitive_until IS NULL OR a.sensitive_until<=clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='password' AND amr.created_at>=s.created_at
        AND amr.created_at<=clock_timestamp())
  ) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=actor AND g.revoked_at IS NULL
    AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) THEN
    RETURN jsonb_build_object('code','FORBIDDEN');
  END IF;
  SELECT * INTO existing FROM core.session_registry r WHERE r.session_id=session_ref FOR UPDATE;
  IF existing.id IS NOT NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  payload_digest:=encode(sha256(convert_to(jsonb_build_array(session_ref,expected_actor,target_environment)::text,'UTF8')),'hex');
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=complete_dev_test_login_result.actor
    AND op.action='auth.dev_test_login' AND op.operation_id=command) THEN
    RETURN jsonb_build_object('code','CONFLICT');
  END IF;
  INSERT INTO core.session_registry(session_id,account_id,device_label)
    VALUES (session_ref,actor,'Development test account');
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,'dev','auth.dev_test_login',command,payload_digest,actor,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'auth.dev_test_login',actor,'dev','core',
      'Official Auth password session verified for provisioned dev account','admitted',command);
  RETURN jsonb_build_object('code','OK','admitted',true);
END $$;
REVOKE ALL ON FUNCTION core.complete_dev_test_login_result(uuid,uuid,uuid,uuid,text)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.complete_dev_test_login_result(uuid,uuid,uuid,uuid,text) TO core_runtime;
