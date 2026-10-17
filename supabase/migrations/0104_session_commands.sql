CREATE FUNCTION core.revoke_session_result(actor uuid, session_ref uuid, target uuid, expected_version bigint,
  command uuid, payload_digest text, target_environment text, logout boolean DEFAULT false) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE entry core.session_registry; previous core.operation; action_name text; last_hash text; deny_id uuid;
BEGIN
  -- Acquire the output admission gate before row locks, including idempotency locks.
  PERFORM pg_advisory_xact_lock(17013,1);
  IF command IS NULL OR payload_digest !~ '^[a-f0-9]{64}$' OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  action_name := CASE WHEN logout THEN 'auth.logout' ELSE 'session.revoke' END;
  SELECT * INTO previous FROM core.operation op WHERE op.actor = revoke_session_result.actor
    AND op.action = action_name AND op.operation_id = command;
  IF logout AND previous.id IS NOT NULL AND previous.session_id = session_ref AND previous.state = 'succeeded'
    AND previous.payload_hash = payload_digest AND previous.environment = target_environment THEN
    RETURN jsonb_build_object('code','OK','revoked',true,'clear_restricted_cache',true);
  END IF;
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash <> payload_digest OR previous.environment <> target_environment
      OR logout AND previous.session_id <> session_ref THEN
      RETURN jsonb_build_object('code','CONFLICT');
    END IF;
    RETURN jsonb_build_object('code','OK','revoked',true,'clear_restricted_cache',logout);
  END IF;
  IF logout THEN
    SELECT * INTO entry FROM core.session_registry WHERE session_id = session_ref AND account_id = actor FOR UPDATE;
  ELSE
    SELECT * INTO entry FROM core.session_registry WHERE id = target AND account_id = actor FOR UPDATE;
    IF entry.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    IF entry.session_id = session_ref THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    IF expected_version IS DISTINCT FROM entry.row_version OR entry.revoked_at IS NOT NULL THEN
      RETURN jsonb_build_object('code','CONFLICT');
    END IF;
  END IF;
  UPDATE core.session_registry SET revoked_at = clock_timestamp(),epoch = epoch + 1 WHERE id = entry.id;
  -- Core denies immediately even while Auth refresh tokens await their own expiry or cleanup.
  UPDATE auth.sessions SET not_after = clock_timestamp(),updated_at = clock_timestamp() WHERE id = entry.session_id;
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,action_name,command,payload_digest,entry.id,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,action_name,entry.id,target_environment,'core','Owner requested session revocation','revoked',command);
  SELECT hash_chain INTO last_hash FROM core.security_journal ORDER BY seq DESC LIMIT 1;
  deny_id := gen_random_uuid();
  INSERT INTO core.security_journal(id,deny_intent_id,target,subject,action,policy_epoch,committed_result,hash_chain)
    VALUES (deny_id,command,entry.session_id,actor,action_name,entry.epoch + 1,'revoked',
      encode(sha256(convert_to(coalesce(last_hash,'') || deny_id::text || command::text || entry.session_id::text
        || actor::text || action_name || (entry.epoch + 1)::text,'UTF8')),'hex'));
  INSERT INTO core.outbox(event_id,aggregate_id,aggregate_version,owner_plugin,lifecycle_epoch,effect_key)
    VALUES (gen_random_uuid(),entry.id,entry.row_version + 1,'core',entry.epoch + 1,action_name || ':' || command::text || ':' || actor::text);
  RETURN jsonb_build_object('code','OK','revoked',true,'clear_restricted_cache',logout);
END $$;
REVOKE ALL ON FUNCTION core.revoke_session_result(uuid,uuid,uuid,bigint,uuid,text,text,boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.revoke_session_result(uuid,uuid,uuid,bigint,uuid,text,text,boolean) TO core_runtime;
