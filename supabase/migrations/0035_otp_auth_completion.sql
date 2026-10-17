-- The private Auth adapter supplies signature-verified subject/session and keyed
-- phone/code digests. Public clients never receive execution rights or digest keys.
ALTER TABLE core.otp_challenge
  ADD COLUMN completion_actor uuid,
  ADD COLUMN completion_session uuid,
  ADD COLUMN completion_operation uuid,
  ADD CONSTRAINT otp_completion_binding CHECK (
    (completion_actor IS NULL AND completion_session IS NULL AND completion_operation IS NULL) OR
    (state='consumed' AND completion_actor IS NOT NULL AND completion_session IS NOT NULL AND completion_operation IS NOT NULL));
CREATE UNIQUE INDEX otp_one_auth_session ON core.otp_challenge(completion_session) WHERE completion_session IS NOT NULL;

CREATE FUNCTION core.complete_otp_authentication_result(challenge_ref uuid,candidate_digest text,
  verified_phone_digest text,verified_phone text,actor uuid,session_ref uuid,command_ref uuid,
  device_label text,verification jsonb,target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE challenge core.otp_challenge; result jsonb; auth_phone text; canonical_phone text;
BEGIN
  -- Completion mutates current identity. Acquire the writer lock before any
  -- challenge row lock, matching admission/session revocation lock ordering.
  PERFORM pg_advisory_xact_lock(17013,1);
  IF challenge_ref IS NULL OR actor IS NULL OR session_ref IS NULL OR command_ref IS NULL OR
    candidate_digest IS NULL OR candidate_digest !~ '^[a-f0-9]{64}$' OR
    verified_phone_digest IS NULL OR verified_phone_digest !~ '^[a-f0-9]{64}$' OR
    verified_phone IS NULL OR verified_phone !~ '^\+[1-9][0-9]{7,14}$' OR
    device_label IS NULL OR char_length(device_label) NOT BETWEEN 1 AND 120 OR
    jsonb_typeof(verification) IS DISTINCT FROM 'object' OR target_environment IS NULL OR
    target_environment NOT IN ('dev','test','production') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  result := core.policy_context_result(NULL,NULL,target_environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  SELECT * INTO challenge FROM core.otp_challenge WHERE id=challenge_ref FOR UPDATE;
  IF challenge.id IS NULL OR challenge.environment IS DISTINCT FROM target_environment OR
    challenge.phone_hash IS DISTINCT FROM verified_phone_digest THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF challenge.purpose='login' AND verification<>'{}'::jsonb OR challenge.purpose='register' AND (
    verification - ARRAY['document_set_digest','age_declaration','consents']<>'{}'::jsonb OR
    verification->'document_set_digest' IS DISTINCT FROM challenge.binding->'document_set_digest' OR
    verification->'age_declaration' IS DISTINCT FROM challenge.binding->'age_declaration' OR
    jsonb_typeof(verification->'consents') IS DISTINCT FROM 'array') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;

  -- A historical phone-confirmed Auth user or a password session is insufficient.
  -- The OTP session must have been established after this exact challenge.
  SELECT u.phone INTO auth_phone FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id
    WHERE u.id=actor AND s.id=session_ref AND u.deleted_at IS NULL
      AND u.phone_confirmed_at IS NOT NULL AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND s.created_at>=challenge.created_at AND s.created_at<=clock_timestamp()
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='otp' AND amr.created_at>=challenge.created_at AND amr.created_at<=clock_timestamp())
    FOR SHARE OF u,s;
  canonical_phone := CASE WHEN auth_phone ~ '^[1-9][0-9]{7,14}$' THEN '+' || auth_phone ELSE auth_phone END;
  IF canonical_phone IS DISTINCT FROM verified_phone THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF EXISTS (SELECT 1 FROM core.session_registry r WHERE r.session_id=session_ref
    AND (r.account_id<>actor OR r.revoked_at IS NOT NULL)) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF EXISTS (SELECT 1 FROM core.otp_challenge c WHERE c.completion_session=session_ref AND c.id<>challenge_ref) THEN
    RETURN jsonb_build_object('code','CONFLICT');
  END IF;
  IF challenge.state='consumed' THEN
    IF challenge.completion_actor IS DISTINCT FROM actor OR challenge.completion_session IS DISTINCT FROM session_ref OR
      challenge.completion_operation IS DISTINCT FROM command_ref OR challenge.otp_hash IS DISTINCT FROM candidate_digest THEN
      RETURN jsonb_build_object('code','CONFLICT');
    END IF;
    IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  ELSE
    -- A caller cannot use an operation from another challenge as a new success.
    IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=complete_otp_authentication_result.actor
      AND op.action=CASE challenge.purpose WHEN 'login' THEN 'auth.login' ELSE 'auth.register' END
      AND op.operation_id=command_ref) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  END IF;

  BEGIN
    IF challenge.state<>'consumed' THEN
      result := core.consume_otp_challenge(challenge_ref,candidate_digest,challenge.purpose,challenge.binding);
      -- Incorrect attempts and expiry remain durable when the outer transaction commits.
      IF result->>'code'<>'OK' THEN RETURN result; END IF;
    END IF;
    IF challenge.purpose='register' THEN
      result := core.complete_registration_result(actor,session_ref,challenge.binding->>'invitation_hash',
        verification->'age_declaration'->>'version',(verification->'age_declaration'->>'declared')::boolean,
        verification->>'document_set_digest',verification->'consents',challenge_ref,command_ref,device_label,target_environment);
    ELSE
      result := core.complete_login_result(actor,session_ref,command_ref,device_label,target_environment);
    END IF;
    -- Admission rejection must not consume a correct OTP or leave partial facts.
    IF result->>'code'<>'OK' THEN RAISE SQLSTATE 'AW001' USING MESSAGE='OTP admission rejected'; END IF;
    UPDATE core.otp_challenge SET completion_actor=actor,completion_session=session_ref,completion_operation=command_ref
      WHERE id=challenge_ref AND completion_operation IS NULL;
  EXCEPTION WHEN SQLSTATE 'AW001' THEN RETURN result;
  END;
  RETURN jsonb_build_object('code','OK','admitted',true,'account_id',actor);
END $$;
REVOKE ALL ON FUNCTION core.complete_otp_authentication_result(uuid,text,text,text,uuid,uuid,uuid,text,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.complete_otp_authentication_result(uuid,text,text,text,uuid,uuid,uuid,text,jsonb,text) TO core_runtime;
