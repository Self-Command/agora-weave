-- A reservation retry is not permission to reuse expired challenges or stale registration facts.
ALTER TABLE core.otp_challenge ADD COLUMN environment text CHECK (environment IN ('dev','test','production'));

CREATE FUNCTION core.otp_registration_context_result(context jsonb,target_environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE docs jsonb;
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    jsonb_typeof(context) IS DISTINCT FROM 'object' OR
    context->'age_declaration' IS DISTINCT FROM '{"version":"adult-18-v1","declared":true}'::jsonb OR
    context - ARRAY['document_set_digest','age_declaration','invitation_hash'] <> '{}'::jsonb OR
    context->>'invitation_hash' IS NULL OR context->>'invitation_hash' !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  docs := core.registration_documents_result(target_environment);
  IF docs->>'code'<>'OK' THEN RETURN jsonb_build_object('code',docs->>'code'); END IF;
  IF context->>'document_set_digest' IS DISTINCT FROM docs->>'document_set_digest' THEN
    RETURN jsonb_build_object('code','TERMS_CHANGED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM core.invitation WHERE token_hash=context->>'invitation_hash'
    AND state='unused' AND expires_at>clock_timestamp()) THEN
    RETURN jsonb_build_object('code','INVITATION_INVALID');
  END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE OR REPLACE FUNCTION core.reserve_otp_challenge(phone_digest text,ip_digest text,challenge_purpose text,
  code_digest text,command_ref uuid,context jsonb,target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE previous core.otp_challenge; reserved core.otp_challenge; qualification jsonb; wait_seconds integer;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF phone_digest IS NULL OR ip_digest IS NULL OR code_digest IS NULL OR command_ref IS NULL OR
    phone_digest !~ '^[a-f0-9]{64}$' OR ip_digest !~ '^[a-f0-9]{64}$' OR code_digest !~ '^[a-f0-9]{64}$' OR
    challenge_purpose IS NULL OR challenge_purpose NOT IN ('login','register') OR jsonb_typeof(context) IS DISTINCT FROM 'object' OR
    target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('otp:phone:' || phone_digest,0));
  PERFORM pg_advisory_xact_lock(hashtextextended('otp:ip:' || ip_digest,0));
  SELECT * INTO previous FROM core.otp_challenge WHERE phone_hash=phone_digest AND command=command_ref FOR UPDATE;
  IF previous.id IS NOT NULL THEN
    IF previous.purpose IS DISTINCT FROM challenge_purpose OR previous.binding IS DISTINCT FROM context OR
      previous.ip_hash IS DISTINCT FROM ip_digest OR previous.otp_hash IS DISTINCT FROM code_digest OR
      previous.environment IS DISTINCT FROM target_environment THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF previous.state='expired' OR previous.state='pending' AND previous.expires_at<=clock_timestamp() THEN
      IF previous.state='pending' THEN UPDATE core.otp_challenge SET state='expired' WHERE id=previous.id; END IF;
      RETURN jsonb_build_object('code','OTP_EXPIRED');
    END IF;
    IF previous.state<>'pending' THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  END IF;
  IF challenge_purpose='login' AND context<>'{}'::jsonb THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF challenge_purpose='register' THEN
    qualification := core.otp_registration_context_result(context,target_environment);
    IF qualification->>'code'<>'OK' THEN RETURN qualification; END IF;
  END IF;
  IF previous.id IS NOT NULL THEN
    wait_seconds := greatest(0,ceil(extract(epoch FROM previous.created_at+interval '60 seconds'-clock_timestamp())))::integer;
    RETURN jsonb_build_object('code','OK','challenge_id',previous.id,'expires_at',previous.expires_at,'retry_after',wait_seconds,'reused',true);
  END IF;
  SELECT greatest(0,ceil(extract(epoch FROM max(created_at)+interval '60 seconds'-clock_timestamp())))::integer
    INTO wait_seconds FROM core.otp_challenge WHERE phone_hash=phone_digest;
  IF wait_seconds>0 THEN RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',wait_seconds); END IF;
  IF (SELECT count(*) FROM core.otp_challenge WHERE phone_hash=phone_digest AND created_at>clock_timestamp()-interval '1 hour')>=5 OR
    (SELECT count(*) FROM core.otp_challenge WHERE phone_hash=phone_digest AND created_at>clock_timestamp()-interval '1 day')>=10 OR
    (SELECT count(*) FROM core.otp_challenge WHERE ip_hash=ip_digest AND created_at>clock_timestamp()-interval '1 hour')>=30 THEN
    RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',3600);
  END IF;
  UPDATE core.otp_challenge SET state='superseded' WHERE phone_hash=phone_digest AND purpose=challenge_purpose AND state='pending';
  INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,environment)
    VALUES (phone_digest,ip_digest,challenge_purpose,code_digest,command_ref,context,target_environment) RETURNING * INTO reserved;
  RETURN jsonb_build_object('code','OK','challenge_id',reserved.id,'expires_at',reserved.expires_at,'retry_after',60,'reused',false);
END $$;

CREATE OR REPLACE FUNCTION core.consume_otp_challenge(challenge_ref uuid,candidate_hash text,expected_purpose text,expected_context jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE challenge core.otp_challenge; qualification jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  SELECT * INTO challenge FROM core.otp_challenge WHERE id=challenge_ref FOR UPDATE;
  IF challenge.id IS NULL OR challenge.environment IS NULL OR candidate_hash IS NULL OR candidate_hash !~ '^[a-f0-9]{64}$' OR
    challenge.purpose IS DISTINCT FROM expected_purpose OR challenge.binding IS DISTINCT FROM expected_context THEN
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  IF challenge.state='expired' OR challenge.state='pending' AND challenge.expires_at<=clock_timestamp() THEN
    IF challenge.state='pending' THEN UPDATE core.otp_challenge SET state='expired' WHERE id=challenge_ref; END IF;
    RETURN jsonb_build_object('code','OTP_EXPIRED');
  END IF;
  IF challenge.state<>'pending' THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF challenge.purpose='register' THEN
    qualification := core.otp_registration_context_result(challenge.binding,challenge.environment);
    IF qualification->>'code'<>'OK' THEN RETURN qualification; END IF;
  END IF;
  IF challenge.otp_hash<>candidate_hash THEN
    UPDATE core.otp_challenge SET attempts=attempts+1,state=CASE WHEN attempts+1>=5 THEN 'locked' ELSE 'pending' END WHERE id=challenge_ref;
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  UPDATE core.otp_challenge SET state='consumed',consumed_at=clock_timestamp() WHERE id=challenge_ref;
  RETURN jsonb_build_object('code','OK');
END $$;
REVOKE ALL ON FUNCTION core.otp_registration_context_result(jsonb,text) FROM PUBLIC,anon,authenticated,service_role,core_runtime;
