CREATE TABLE core.otp_challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), phone_hash text NOT NULL CHECK (phone_hash ~ '^[a-f0-9]{64}$'),
  ip_hash text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$'), purpose text NOT NULL CHECK (purpose IN ('login','register')),
  otp_hash text NOT NULL CHECK (otp_hash ~ '^[a-f0-9]{64}$'), command uuid NOT NULL, binding jsonb NOT NULL,
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','consumed','locked','expired','superseded')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5), consumed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1, UNIQUE (phone_hash,command)
);
CREATE INDEX ON core.otp_challenge(phone_hash,created_at);
CREATE INDEX ON core.otp_challenge(ip_hash,created_at);
SELECT core.protect_table('core.otp_challenge');

CREATE FUNCTION core.reserve_otp_challenge(phone_digest text, ip_digest text, challenge_purpose text,
  code_digest text, command_ref uuid, context jsonb, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE previous core.otp_challenge; docs jsonb; invitation_ref uuid; new_id uuid; wait_seconds integer;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF phone_digest IS NULL OR ip_digest IS NULL OR code_digest IS NULL OR command_ref IS NULL
    OR phone_digest !~ '^[a-f0-9]{64}$' OR ip_digest !~ '^[a-f0-9]{64}$' OR code_digest !~ '^[a-f0-9]{64}$'
    OR challenge_purpose IS NULL OR challenge_purpose NOT IN ('login','register') OR jsonb_typeof(context) IS DISTINCT FROM 'object'
    OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  -- Trusted ingress supplies keyed phone/IP digests; never accept client IP headers as authority.
  PERFORM pg_advisory_xact_lock(hashtextextended('otp:phone:' || phone_digest,0));
  PERFORM pg_advisory_xact_lock(hashtextextended('otp:ip:' || ip_digest,0));
  SELECT * INTO previous FROM core.otp_challenge WHERE phone_hash = phone_digest AND command = command_ref;
  IF previous.id IS NOT NULL THEN
    IF previous.purpose <> challenge_purpose OR previous.binding <> context OR previous.ip_hash <> ip_digest THEN
      RETURN jsonb_build_object('code','CONFLICT');
    END IF;
    RETURN jsonb_build_object('code','OK','challenge_id',previous.id,'expires_at',previous.expires_at,'reused',true);
  END IF;
  IF challenge_purpose = 'login' AND context <> '{}'::jsonb THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF challenge_purpose = 'register' THEN
    docs := core.registration_documents_result(target_environment);
    IF docs->>'code' <> 'OK' THEN RETURN docs; END IF;
    IF context->>'document_set_digest' IS DISTINCT FROM docs->>'document_set_digest' THEN RETURN jsonb_build_object('code','TERMS_CHANGED'); END IF;
    IF context->'age_declaration' IS DISTINCT FROM '{"version":"adult-18-v1","declared":true}'::jsonb
      OR context - ARRAY['document_set_digest','age_declaration','invitation_hash'] <> '{}'::jsonb THEN
      RETURN jsonb_build_object('code','INVALID_INPUT');
    END IF;
    SELECT id INTO invitation_ref FROM core.invitation WHERE token_hash = context->>'invitation_hash' AND state = 'unused' AND expires_at > clock_timestamp();
    IF invitation_ref IS NULL THEN RETURN jsonb_build_object('code','INVITATION_INVALID'); END IF;
  END IF;
  SELECT greatest(0,ceil(extract(epoch FROM max(created_at)+interval '60 seconds'-clock_timestamp())))::integer
    INTO wait_seconds FROM core.otp_challenge WHERE phone_hash = phone_digest;
  IF wait_seconds > 0 THEN RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',wait_seconds); END IF;
  IF (SELECT count(*) FROM core.otp_challenge WHERE phone_hash = phone_digest AND created_at > clock_timestamp()-interval '1 hour') >= 5
    OR (SELECT count(*) FROM core.otp_challenge WHERE phone_hash = phone_digest AND created_at > clock_timestamp()-interval '1 day') >= 10
    OR (SELECT count(*) FROM core.otp_challenge WHERE ip_hash = ip_digest AND created_at > clock_timestamp()-interval '1 hour') >= 30 THEN
    RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',3600);
  END IF;
  UPDATE core.otp_challenge SET state = 'superseded' WHERE phone_hash = phone_digest AND purpose = challenge_purpose AND state = 'pending';
  INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding)
    VALUES (phone_digest,ip_digest,challenge_purpose,code_digest,command_ref,context) RETURNING id INTO new_id;
  RETURN jsonb_build_object('code','OK','challenge_id',new_id,'expires_at',clock_timestamp()+interval '5 minutes','retry_after',60,'reused',false);
END $$;

CREATE FUNCTION core.consume_otp_challenge(challenge_ref uuid, candidate_hash text, expected_purpose text, expected_context jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE challenge core.otp_challenge;
BEGIN
  SELECT * INTO challenge FROM core.otp_challenge WHERE id = challenge_ref FOR UPDATE;
  IF challenge.id IS NULL OR challenge.state <> 'pending' OR candidate_hash IS NULL OR candidate_hash !~ '^[a-f0-9]{64}$'
    OR challenge.purpose IS DISTINCT FROM expected_purpose OR challenge.binding IS DISTINCT FROM expected_context THEN
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  IF challenge.expires_at <= clock_timestamp() THEN
    UPDATE core.otp_challenge SET state='expired' WHERE id = challenge_ref;
    RETURN jsonb_build_object('code','OTP_EXPIRED');
  END IF;
  IF challenge.otp_hash <> candidate_hash THEN
    UPDATE core.otp_challenge SET attempts=attempts+1,state=CASE WHEN attempts+1 >= 5 THEN 'locked' ELSE 'pending' END WHERE id = challenge_ref;
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  UPDATE core.otp_challenge SET state='consumed',consumed_at=clock_timestamp() WHERE id = challenge_ref;
  RETURN jsonb_build_object('code','OK');
END $$;
REVOKE ALL ON FUNCTION core.reserve_otp_challenge(text,text,text,text,uuid,jsonb,text),core.consume_otp_challenge(uuid,text,text,jsonb)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.reserve_otp_challenge(text,text,text,text,uuid,jsonb,text),core.consume_otp_challenge(uuid,text,text,jsonb) TO core_runtime;
