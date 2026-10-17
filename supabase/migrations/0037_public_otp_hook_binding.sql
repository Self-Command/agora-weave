-- Keep hook locals distinct from Auth column names in deferred PL/pgSQL queries.
CREATE OR REPLACE FUNCTION core.auth_send_sms_hook(event jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_phone text; v_sms_phone text; v_code text; v_actor uuid; v_result jsonb; v_candidate uuid; v_matches integer;
  v_flow core.public_otp_flow; v_challenge core.otp_challenge;
  v_rejection constant jsonb:='{"error":{"http_code":403,"message":"SMS request is not authorized"}}';
BEGIN
  -- Auth may already hold its user row lock. Never wait for the policy writer
  -- here: completion takes that writer before reading Auth rows.
  IF NOT pg_try_advisory_xact_lock(17013,1) THEN
    RETURN '{"error":{"http_code":503,"message":"SMS request is temporarily unavailable"}}'::jsonb;
  END IF;
  IF jsonb_typeof(event) IS DISTINCT FROM 'object' OR jsonb_typeof(event->'user') IS DISTINCT FROM 'object'
    OR jsonb_typeof(event->'sms') IS DISTINCT FROM 'object' OR jsonb_typeof(event->'sms'->'otp') IS DISTINCT FROM 'string'
    OR jsonb_typeof(event->'user'->'phone') IS DISTINCT FROM 'string' THEN RETURN v_rejection; END IF;
  v_phone:=event->'user'->>'phone';
  IF v_phone ~ '^[1-9][0-9]{7,14}$' THEN v_phone:='+' || v_phone; END IF;
  v_code:=event->'sms'->>'otp';
  IF v_phone !~ '^\+[1-9][0-9]{7,14}$' OR v_code !~ '^[0-9]{6}$' THEN RETURN v_rejection; END IF;
  IF event->'sms' ? 'phone' THEN
    v_sms_phone:=event->'sms'->>'phone';
    IF v_sms_phone ~ '^[1-9][0-9]{7,14}$' THEN v_sms_phone:='+' || v_sms_phone; END IF;
    IF v_sms_phone IS DISTINCT FROM v_phone THEN RETURN v_rejection; END IF;
  END IF;
  BEGIN v_actor:=(event->'user'->>'id')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN RETURN v_rejection; END;
  IF v_actor IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id=v_actor AND u.deleted_at IS NULL
    AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
    AND CASE WHEN u.phone ~ '^[1-9][0-9]{7,14}$' THEN '+' || u.phone ELSE u.phone END=v_phone) THEN RETURN v_rejection; END IF;
  SELECT count(*),min(f.challenge_id::text)::uuid INTO v_matches,v_candidate
    FROM core.public_otp_flow f JOIN core.otp_challenge c ON c.id=f.challenge_id
    WHERE f.dispatch_state='waiting' AND c.state='pending' AND c.expires_at>clock_timestamp()
      AND f.secret_expiry>clock_timestamp() AND f.metadata_expiry>clock_timestamp()
      AND c.environment=f.environment AND c.phone_hash=core.public_otp_digest(f.environment,'phone',v_phone);
  IF v_matches<>1 THEN RETURN v_rejection; END IF;
  SELECT * INTO v_challenge FROM core.otp_challenge WHERE id=v_candidate FOR UPDATE;
  SELECT * INTO v_flow FROM core.public_otp_flow WHERE challenge_id=v_candidate FOR UPDATE;
  v_result:=core.public_otp_guard(v_flow.environment);
  IF v_result->>'code'<>'OK' THEN RETURN v_rejection; END IF;
  IF v_challenge.purpose='register' THEN
    v_result:=core.otp_registration_context_result(v_challenge.binding,v_flow.environment);
    IF v_result->>'code'<>'OK' THEN RETURN v_rejection; END IF;
  END IF;
  UPDATE core.otp_challenge SET otp_hash=core.public_otp_digest(v_flow.environment,'code',v_candidate::text || ':' || v_code)
    WHERE id=v_candidate;
  UPDATE core.public_otp_flow SET hook_user=v_actor,hooked_at=clock_timestamp(),
    otp_cipher=core.public_otp_encrypt(v_flow.environment,v_code),dispatch_state='hooked'
    WHERE challenge_id=v_candidate;
  RETURN '{}'::jsonb;
END $$;
