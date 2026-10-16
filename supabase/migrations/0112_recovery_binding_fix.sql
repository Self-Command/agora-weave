CREATE OR REPLACE FUNCTION core.recovery_case_result(actor uuid, session_ref uuid, target uuid, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE entry core.recovery_case;
BEGIN
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT * INTO entry FROM core.recovery_case c WHERE c.id=target AND c.account_ref=actor
    AND EXISTS (SELECT 1 FROM core.audit_event a WHERE a.object_ref=c.id AND a.actor=recovery_case_result.actor
      AND a.operation='recovery.request' AND a.environment=target_environment);
  IF entry.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('id',entry.id,'mode',entry.mode,'state',entry.state,
    'created_at',entry.created_at,'updated_at',entry.updated_at,'row_version',entry.row_version));
END $$;

CREATE OR REPLACE FUNCTION core.request_recovery_result(actor uuid, session_ref uuid, command uuid, requested_mode text, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE previous core.operation; entry core.recovery_case; payload_digest text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command IS NULL OR requested_mode IS NULL OR requested_mode NOT IN ('trusted','manual') OR target_environment IS NULL
    OR target_environment NOT IN ('dev','test','production') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF requested_mode='trusted' AND (NOT EXISTS (SELECT 1 FROM core.session_registry r WHERE r.session_id=session_ref
    AND r.account_id=actor AND r.trusted_at<=clock_timestamp() AND r.revoked_at IS NULL)
    OR EXISTS (SELECT 1 FROM core.account a WHERE a.id=actor AND a.sensitive_until>clock_timestamp())) THEN
    RETURN jsonb_build_object('code','FORBIDDEN');
  END IF;
  payload_digest := encode(sha256(convert_to(jsonb_build_array(requested_mode,target_environment)::text,'UTF8')),'hex');
  SELECT * INTO previous FROM core.operation op WHERE op.actor=request_recovery_result.actor
    AND op.action='recovery.request' AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_digest OR previous.environment<>target_environment THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','id',previous.result_ref);
  END IF;
  SELECT * INTO entry FROM core.recovery_case c WHERE c.account_ref=actor AND c.mode=requested_mode
    AND c.state IN ('received','reviewing','need_evidence') AND EXISTS (SELECT 1 FROM core.audit_event a
      WHERE a.object_ref=c.id AND a.actor=request_recovery_result.actor AND a.operation='recovery.request' AND a.environment=target_environment)
    ORDER BY c.created_at,c.id LIMIT 1;
  IF entry.id IS NULL THEN
    INSERT INTO core.recovery_case(account_ref,mode) VALUES (actor,requested_mode) RETURNING * INTO entry;
    INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
      VALUES (actor,session_ref,'recovery.request',entry.id,target_environment,'core','Account owner requested controlled recovery','received',command);
  END IF;
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'recovery.request',command,payload_digest,entry.id,'succeeded');
  RETURN jsonb_build_object('code','OK','id',entry.id);
END $$;
REVOKE ALL ON FUNCTION core.recovery_case_result(uuid,uuid,uuid,text),core.request_recovery_result(uuid,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.recovery_case_result(uuid,uuid,uuid,text),core.request_recovery_result(uuid,uuid,uuid,text,text) TO core_runtime;
