-- Auth owns OTP generation and verification. This broker only correlates the
-- official Postgres hook, one external SMS attempt, and one Auth verify attempt.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE core.public_otp_secret (
  environment text PRIMARY KEY CHECK (environment IN ('dev','test','production')),
  secret bytea NOT NULL CHECK (octet_length(secret)=32),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO core.public_otp_secret(environment,secret)
  SELECT environment,extensions.gen_random_bytes(32) FROM unnest(ARRAY['dev','test','production']) environment;
SELECT core.protect_table('core.public_otp_secret',false);

CREATE TABLE core.public_otp_flow (
  challenge_id uuid PRIMARY KEY REFERENCES core.otp_challenge(id),
  environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  dispatch_lease uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  dispatch_state text NOT NULL DEFAULT 'waiting' CHECK (dispatch_state IN ('waiting','hooked','sending','sent','failed','unknown')),
  hook_user uuid,
  hooked_at timestamptz,
  phone_cipher bytea,
  otp_cipher bytea,
  secret_expiry timestamptz NOT NULL,
  verify_state text NOT NULL DEFAULT 'idle' CHECK (verify_state IN ('idle','pending','unknown','failed','completed')),
  verify_operation uuid,
  verify_lease uuid UNIQUE,
  verify_payload_hash text,
  verify_verification jsonb,
  verify_started_at timestamptz,
  verify_failure text,
  receipt_cipher bytea,
  receipt_expiry timestamptz,
  receipt_token_hash text,
  receipt_failures integer NOT NULL DEFAULT 0 CHECK (receipt_failures BETWEEN 0 AND 5),
  metadata_expiry timestamptz NOT NULL DEFAULT clock_timestamp()+interval '30 days',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1,
  CHECK (secret_expiry<=metadata_expiry),
  CHECK (receipt_expiry IS NULL OR receipt_expiry<=metadata_expiry),
  CHECK ((verify_state='idle' AND verify_operation IS NULL AND verify_lease IS NULL AND verify_payload_hash IS NULL
    AND verify_verification IS NULL AND verify_started_at IS NULL) OR
    (verify_state<>'idle' AND verify_operation IS NOT NULL AND verify_lease IS NOT NULL AND verify_payload_hash IS NOT NULL
    AND verify_verification IS NOT NULL AND verify_started_at IS NOT NULL))
);
CREATE INDEX public_otp_secret_expiry ON core.public_otp_flow(secret_expiry)
  WHERE phone_cipher IS NOT NULL OR otp_cipher IS NOT NULL;
CREATE INDEX public_otp_receipt_expiry ON core.public_otp_flow(receipt_expiry) WHERE receipt_cipher IS NOT NULL;
CREATE INDEX public_otp_metadata_expiry ON core.public_otp_flow(metadata_expiry);
SELECT core.protect_table('core.public_otp_flow');
REVOKE ALL ON core.public_otp_secret,core.public_otp_flow FROM core_runtime,core_worker,supabase_auth_admin;

CREATE FUNCTION core.public_otp_digest(target_environment text,domain text,value text) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT encode(extensions.hmac(convert_to('agoraweave:public-otp:v1:' || domain || ':' || value,'UTF8'),secret,'sha256'),'hex')
    FROM core.public_otp_secret WHERE environment=target_environment
$$;
CREATE FUNCTION core.public_otp_encrypt(target_environment text,value text) RETURNS bytea
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT extensions.pgp_sym_encrypt(value,core.public_otp_digest(target_environment,'encryption','key'),
    'cipher-algo=aes256,compress-algo=0')
$$;
CREATE FUNCTION core.public_otp_decrypt(target_environment text,value bytea) RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT extensions.pgp_sym_decrypt(value,core.public_otp_digest(target_environment,'encryption','key'))
$$;
CREATE FUNCTION core.public_otp_guard(target_environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  result:=core.policy_context_result(NULL,NULL,target_environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  result:=core.otp_configuration_result(target_environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.public_otp_verification_result(challenge core.otp_challenge,verification jsonb) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb; docs jsonb;
BEGIN
  IF jsonb_typeof(verification) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF challenge.purpose='login' THEN
    IF verification<>'{}'::jsonb THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    RETURN jsonb_build_object('code','OK');
  END IF;
  IF challenge.purpose<>'register' OR verification - ARRAY['document_set_digest','age_declaration','consents']<>'{}'::jsonb
    OR verification->'document_set_digest' IS DISTINCT FROM challenge.binding->'document_set_digest'
    OR verification->'age_declaration' IS DISTINCT FROM challenge.binding->'age_declaration'
    OR jsonb_typeof(verification->'consents') IS DISTINCT FROM 'array' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  result:=core.otp_registration_context_result(challenge.binding,challenge.environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  docs:=core.registration_documents_result(challenge.environment);
  IF docs->>'code'<>'OK' THEN RETURN docs; END IF;
  IF jsonb_array_length(verification->'consents')<>jsonb_array_length(docs->'documents') OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(docs->'documents') required WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(verification->'consents') c WHERE c=jsonb_build_object(
        'release_id',required->'release_id','digest',required->'digest','decision','consented'))
  ) THEN RETURN jsonb_build_object('code','CONSENT_REQUIRED'); END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

-- Only callers holding a completed, exact proof may invoke this private helper.
CREATE FUNCTION core.public_otp_receipt_result(challenge_ref uuid,target_environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE flow core.public_otp_flow; challenge core.otp_challenge; phone text;
BEGIN
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge_ref AND environment=target_environment;
  SELECT * INTO challenge FROM core.otp_challenge WHERE id=challenge_ref;
  IF flow.verify_state IS DISTINCT FROM 'completed' OR flow.receipt_cipher IS NULL
    OR flow.receipt_expiry IS NULL OR flow.receipt_expiry<=clock_timestamp()
    OR flow.metadata_expiry<=clock_timestamp() OR flow.receipt_failures>=5
    OR NOT core.current_identity(challenge.completion_actor,challenge.completion_session) THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  SELECT CASE WHEN u.phone ~ '^[1-9][0-9]{7,14}$' THEN '+' || u.phone ELSE u.phone END INTO phone
    FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id
    WHERE u.id=challenge.completion_actor AND s.id=challenge.completion_session
      AND u.deleted_at IS NULL AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND s.created_at>=challenge.created_at AND s.created_at<=clock_timestamp()
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='otp' AND amr.created_at>=challenge.created_at AND amr.created_at<=clock_timestamp())
    FOR SHARE OF u,s;
  IF phone IS NULL OR core.public_otp_digest(target_environment,'phone',phone) IS DISTINCT FROM challenge.phone_hash THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  RETURN jsonb_build_object('code','OK','action','result','state','completed',
    'data',core.public_otp_decrypt(target_environment,flow.receipt_cipher)::jsonb);
END $$;

CREATE FUNCTION core.reserve_public_otp(phone text,ip text,purpose text,command_ref uuid,context jsonb,environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE phone_digest text; ip_digest text; code_hash text; binding jsonb; result jsonb; previous core.otp_challenge;
  flow core.public_otp_flow; normalized_ip text; deadline timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF phone IS NULL OR phone !~ '^\+[1-9][0-9]{7,14}$' OR ip IS NULL OR char_length(ip) NOT BETWEEN 2 AND 45
    OR ip !~ '^[0-9a-fA-F:.]+$' OR purpose IS NULL OR purpose NOT IN ('login','register') OR command_ref IS NULL
    OR jsonb_typeof(context) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  BEGIN normalized_ip:=host(ip::inet);
  EXCEPTION WHEN invalid_text_representation THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END;
  result:=core.public_otp_guard(environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF purpose='login' THEN
    IF context<>'{}'::jsonb THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    binding:='{}';
  ELSE
    IF context - ARRAY['invitation_ref','age_declaration','document_set_digest']<>'{}'::jsonb
      OR jsonb_typeof(context->'invitation_ref') IS DISTINCT FROM 'string'
      OR char_length(context->>'invitation_ref') NOT BETWEEN 1 AND 256 OR context->>'invitation_ref' ~ '[[:cntrl:]]' THEN
      RETURN jsonb_build_object('code','INVALID_INPUT');
    END IF;
    binding:=(context-'invitation_ref') || jsonb_build_object('invitation_hash',
      encode(sha256(convert_to(context->>'invitation_ref','UTF8')),'hex'));
  END IF;
  phone_digest:=core.public_otp_digest(environment,'phone',phone);
  ip_digest:=core.public_otp_digest(environment,'ip',normalized_ip);
  SELECT * INTO previous FROM core.otp_challenge c WHERE c.phone_hash=phone_digest AND c.command=command_ref FOR UPDATE;
  IF previous.id IS NOT NULL THEN
    SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=previous.id FOR UPDATE;
    IF flow.challenge_id IS NULL OR flow.metadata_expiry<=clock_timestamp() THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    code_hash:=previous.otp_hash;
  ELSE code_hash:=core.public_otp_digest(environment,'placeholder',gen_random_uuid()::text); END IF;
  result:=core.reserve_otp_challenge(phone_digest,ip_digest,purpose,code_hash,command_ref,binding,environment);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF previous.id IS NULL THEN
    deadline:=least((result->>'expires_at')::timestamptz,clock_timestamp()+interval '30 days');
    INSERT INTO core.public_otp_flow(challenge_id,environment,phone_cipher,secret_expiry)
      VALUES ((result->>'challenge_id')::uuid,environment,core.public_otp_encrypt(environment,phone),deadline) RETURNING * INTO flow;
  END IF;
  RETURN result || jsonb_build_object('lease',flow.dispatch_lease,'dispatch_state',flow.dispatch_state);
END $$;

-- The official payload has user.phone and sms.otp. sms.phone is optional; if
-- present it must agree. No environment or challenge id is trusted from the hook.
CREATE FUNCTION core.auth_send_sms_hook(event jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE phone text; sms_phone text; code text; actor uuid; result jsonb; candidate uuid; matches integer;
  flow core.public_otp_flow; challenge core.otp_challenge;
  rejection constant jsonb:='{"error":{"http_code":403,"message":"SMS request is not authorized"}}';
BEGIN
  -- Auth may already hold its user row lock. Never wait for the policy writer
  -- here: completion takes that writer before reading Auth rows.
  IF NOT pg_try_advisory_xact_lock(17013,1) THEN
    RETURN '{"error":{"http_code":503,"message":"SMS request is temporarily unavailable"}}'::jsonb;
  END IF;
  IF jsonb_typeof(event) IS DISTINCT FROM 'object' OR jsonb_typeof(event->'user') IS DISTINCT FROM 'object'
    OR jsonb_typeof(event->'sms') IS DISTINCT FROM 'object' OR jsonb_typeof(event->'sms'->'otp') IS DISTINCT FROM 'string'
    OR jsonb_typeof(event->'user'->'phone') IS DISTINCT FROM 'string' THEN RETURN rejection; END IF;
  phone:=event->'user'->>'phone';
  IF phone ~ '^[1-9][0-9]{7,14}$' THEN phone:='+' || phone; END IF;
  code:=event->'sms'->>'otp';
  IF phone !~ '^\+[1-9][0-9]{7,14}$' OR code !~ '^[0-9]{6}$' THEN RETURN rejection; END IF;
  IF event->'sms' ? 'phone' THEN
    sms_phone:=event->'sms'->>'phone';
    IF sms_phone ~ '^[1-9][0-9]{7,14}$' THEN sms_phone:='+' || sms_phone; END IF;
    IF sms_phone IS DISTINCT FROM phone THEN RETURN rejection; END IF;
  END IF;
  BEGIN actor:=(event->'user'->>'id')::uuid;
  EXCEPTION WHEN invalid_text_representation THEN RETURN rejection; END;
  IF actor IS NULL OR NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id=actor AND u.deleted_at IS NULL
    AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
    AND CASE WHEN u.phone ~ '^[1-9][0-9]{7,14}$' THEN '+' || u.phone ELSE u.phone END=phone) THEN RETURN rejection; END IF;
  SELECT count(*),min(f.challenge_id::text)::uuid INTO matches,candidate
    FROM core.public_otp_flow f JOIN core.otp_challenge c ON c.id=f.challenge_id
    WHERE f.dispatch_state='waiting' AND c.state='pending' AND c.expires_at>clock_timestamp()
      AND f.secret_expiry>clock_timestamp() AND f.metadata_expiry>clock_timestamp()
      AND c.environment=f.environment AND c.phone_hash=core.public_otp_digest(f.environment,'phone',phone);
  IF matches<>1 THEN RETURN rejection; END IF;
  SELECT * INTO challenge FROM core.otp_challenge WHERE id=candidate FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=candidate FOR UPDATE;
  result:=core.public_otp_guard(flow.environment);
  IF result->>'code'<>'OK' THEN RETURN rejection; END IF;
  IF challenge.purpose='register' THEN
    result:=core.otp_registration_context_result(challenge.binding,flow.environment);
    IF result->>'code'<>'OK' THEN RETURN rejection; END IF;
  END IF;
  UPDATE core.otp_challenge SET otp_hash=core.public_otp_digest(flow.environment,'code',candidate::text || ':' || code)
    WHERE id=candidate;
  UPDATE core.public_otp_flow SET hook_user=actor,hooked_at=clock_timestamp(),
    otp_cipher=core.public_otp_encrypt(flow.environment,code),dispatch_state='hooked'
    WHERE challenge_id=candidate;
  RETURN '{}'::jsonb;
END $$;

CREATE FUNCTION core.claim_public_sms(challenge uuid,lease uuid,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c core.otp_challenge; flow core.public_otp_flow; result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  result:=core.public_otp_guard(env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF challenge IS NULL OR lease IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge FOR UPDATE;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.dispatch_lease IS DISTINCT FROM lease THEN
    RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF c.expires_at<=clock_timestamp() OR flow.secret_expiry<=clock_timestamp() OR flow.metadata_expiry<=clock_timestamp() THEN
    RETURN jsonb_build_object('code','OTP_EXPIRED'); END IF;
  IF c.state<>'pending' OR flow.dispatch_state<>'hooked' OR flow.otp_cipher IS NULL OR flow.phone_cipher IS NULL THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF c.purpose='register' THEN
    result:=core.otp_registration_context_result(c.binding,env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  END IF;
  UPDATE core.public_otp_flow SET dispatch_state='sending' WHERE challenge_id=challenge;
  RETURN jsonb_build_object('code','OK','phone',core.public_otp_decrypt(env,flow.phone_cipher),
    'otp',core.public_otp_decrypt(env,flow.otp_cipher),'request_id',challenge,'expires_at',c.expires_at,'auth_issued_at',flow.hooked_at);
END $$;

CREATE FUNCTION core.finish_public_sms(challenge uuid,lease uuid,outcome text,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE flow core.public_otp_flow; c core.otp_challenge; result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF env IS NULL OR env NOT IN ('dev','test','production') OR challenge IS NULL OR lease IS NULL
    OR outcome IS NULL OR outcome NOT IN ('sent','failed','unknown') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge FOR UPDATE;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.dispatch_lease IS DISTINCT FROM lease THEN
    RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF flow.dispatch_state IS DISTINCT FROM outcome AND flow.dispatch_state<>'sending'
    AND NOT (flow.dispatch_state IN ('waiting','hooked') AND outcome IN ('failed','unknown')) THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  -- Record the external fact even if output/configuration was closed in flight.
  UPDATE core.public_otp_flow SET dispatch_state=outcome,otp_cipher=NULL WHERE challenge_id=challenge;
  IF outcome='sent' THEN
    result:=core.public_otp_guard(env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
    IF c.state='expired' OR c.expires_at<=clock_timestamp() OR flow.secret_expiry<=clock_timestamp() THEN
      RETURN jsonb_build_object('code','OTP_EXPIRED'); END IF;
    IF c.state<>'pending' OR flow.metadata_expiry<=clock_timestamp() THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
    IF c.purpose='register' THEN
      result:=core.otp_registration_context_result(c.binding,env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.prepare_public_verify(challenge uuid,otp text,operation uuid,verification jsonb,env text,read_only boolean DEFAULT false) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c core.otp_challenge; flow core.public_otp_flow; result jsonb; code_hash text; payload_hash text; lease_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF challenge IS NULL OR otp IS NULL OR otp !~ '^[0-9]{6}$' OR operation IS NULL
    OR jsonb_typeof(verification) IS DISTINCT FROM 'object' OR read_only IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  result:=core.public_otp_guard(env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge FOR UPDATE;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.metadata_expiry<=clock_timestamp() THEN
    RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  code_hash:=core.public_otp_digest(env,'code',challenge::text || ':' || otp);
  payload_hash:=encode(sha256(convert_to(jsonb_build_array(verification,'Phone OTP',env)::text,'UTF8')),'hex');
  IF flow.verify_state='completed' THEN
    IF flow.receipt_failures>=5 THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
    IF c.otp_hash IS DISTINCT FROM code_hash THEN
      UPDATE core.public_otp_flow SET receipt_failures=least(5,receipt_failures+1) WHERE challenge_id=challenge;
      RETURN jsonb_build_object('code','OTP_INVALID');
    END IF;
    IF flow.verify_operation IS DISTINCT FROM operation OR flow.verify_payload_hash IS DISTINCT FROM payload_hash THEN
      RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN core.public_otp_receipt_result(challenge,env);
  END IF;
  IF flow.verify_operation IS NOT NULL AND (flow.verify_operation IS DISTINCT FROM operation OR flow.verify_payload_hash IS DISTINCT FROM payload_hash) THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF c.state='expired' OR c.state='pending' AND c.expires_at<=clock_timestamp() THEN
    UPDATE core.otp_challenge SET state='expired' WHERE id=challenge AND state='pending';
    RETURN jsonb_build_object('code','OTP_EXPIRED'); END IF;
  IF c.state<>'pending' OR flow.dispatch_state<>'sent' OR flow.secret_expiry<=clock_timestamp() OR flow.phone_cipher IS NULL THEN
    RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  result:=core.public_otp_verification_result(c,verification); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF c.otp_hash IS DISTINCT FROM code_hash THEN
    -- Only the incorrect-code branch delegates consumption; a correct code is
    -- consumed atomically with the real Auth session in finish_public_verify.
    RETURN core.consume_otp_challenge(challenge,code_hash,c.purpose,c.binding);
  END IF;
  IF flow.verify_state='failed' THEN RETURN jsonb_build_object('code',coalesce(flow.verify_failure,'AUTH_FAILED'),'action','result','state','failed'); END IF;
  IF flow.verify_state IN ('pending','unknown') THEN
    IF flow.verify_state='pending' AND flow.verify_started_at<=clock_timestamp()-interval '15 seconds' THEN
      UPDATE core.public_otp_flow SET verify_state='unknown' WHERE challenge_id=challenge;
      flow.verify_state:='unknown';
    END IF;
    RETURN jsonb_build_object('code','AUTH_UNCONFIRMED','action','result','state',flow.verify_state);
  END IF;
  IF read_only THEN RETURN jsonb_build_object('code','AUTH_UNCONFIRMED','action','result','state','idle'); END IF;
  lease_ref:=gen_random_uuid();
  UPDATE core.public_otp_flow SET verify_state='pending',verify_operation=operation,verify_lease=lease_ref,
    verify_payload_hash=payload_hash,verify_verification=verification,verify_started_at=clock_timestamp()
    WHERE challenge_id=challenge;
  RETURN jsonb_build_object('code','OK','action','verify','state','pending','lease',lease_ref,
    'phone',core.public_otp_decrypt(env,flow.phone_cipher),'expires_at',c.expires_at,'auth_issued_at',flow.hooked_at);
END $$;

CREATE FUNCTION core.finish_public_verify(challenge uuid,lease uuid,actor uuid,session uuid,tokens jsonb,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c core.otp_challenge; flow core.public_otp_flow; result jsonb; phone text; deadline timestamptz; token_hash text; data jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  result:=core.public_otp_guard(env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF challenge IS NULL OR lease IS NULL OR actor IS NULL OR session IS NULL OR jsonb_typeof(tokens) IS DISTINCT FROM 'object'
    OR tokens - ARRAY['access_token','refresh_token','expires_at']<>'{}'::jsonb
    OR jsonb_typeof(tokens->'access_token') IS DISTINCT FROM 'string' OR char_length(tokens->>'access_token') NOT BETWEEN 1 AND 16384
    OR jsonb_typeof(tokens->'refresh_token') IS DISTINCT FROM 'string' OR char_length(tokens->>'refresh_token') NOT BETWEEN 1 AND 16384
    OR jsonb_typeof(tokens->'expires_at') IS DISTINCT FROM 'number' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  BEGIN
    IF (tokens->>'expires_at')::numeric<>trunc((tokens->>'expires_at')::numeric) THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    deadline:=to_timestamp((tokens->>'expires_at')::double precision);
  EXCEPTION WHEN datetime_field_overflow OR numeric_value_out_of_range OR invalid_text_representation THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END;
  IF NOT isfinite(deadline) OR deadline<=clock_timestamp() THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge FOR UPDATE;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.verify_lease IS DISTINCT FROM lease
    OR flow.hook_user IS DISTINCT FROM actor THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  token_hash:=encode(sha256(convert_to(tokens::text,'UTF8')),'hex');
  IF flow.verify_state='completed' THEN
    IF c.completion_actor IS DISTINCT FROM actor OR c.completion_session IS DISTINCT FROM session
      OR flow.receipt_token_hash IS DISTINCT FROM token_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN core.public_otp_receipt_result(challenge,env);
  END IF;
  IF flow.verify_state IS DISTINCT FROM 'pending' THEN RETURN jsonb_build_object('code','AUTH_UNCONFIRMED','state',flow.verify_state); END IF;
  IF flow.verify_started_at<=clock_timestamp()-interval '15 seconds' THEN
    UPDATE core.public_otp_flow SET verify_state='unknown' WHERE challenge_id=challenge;
    RETURN jsonb_build_object('code','AUTH_UNCONFIRMED','state','unknown'); END IF;
  IF flow.phone_cipher IS NULL OR flow.secret_expiry<=clock_timestamp() OR flow.metadata_expiry<=clock_timestamp() THEN
    RETURN jsonb_build_object('code','OTP_EXPIRED'); END IF;
  phone:=core.public_otp_decrypt(env,flow.phone_cipher);
  result:=core.complete_otp_authentication_result(challenge,c.otp_hash,c.phone_hash,phone,actor,session,
    flow.verify_operation,'Phone OTP',flow.verify_verification,env);
  IF result->>'code'<>'OK' THEN
    UPDATE core.public_otp_flow SET verify_state='failed',verify_failure=result->>'code',otp_cipher=NULL WHERE challenge_id=challenge;
    RETURN result;
  END IF;
  data:=jsonb_build_object('session',tokens,'account',jsonb_build_object('id',actor,'admitted',true));
  UPDATE core.public_otp_flow SET verify_state='completed',receipt_cipher=core.public_otp_encrypt(env,data::text),
    receipt_expiry=least(deadline,clock_timestamp()+interval '5 minutes',metadata_expiry),receipt_token_hash=token_hash,
    phone_cipher=NULL,otp_cipher=NULL WHERE challenge_id=challenge;
  RETURN jsonb_build_object('code','OK','data',data);
END $$;

CREATE FUNCTION core.fail_public_verify(challenge uuid,lease uuid,unknown boolean,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE flow core.public_otp_flow; c core.otp_challenge; target_state text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF env IS NULL OR env NOT IN ('dev','test','production') OR challenge IS NULL OR lease IS NULL OR unknown IS NULL THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge FOR UPDATE;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge FOR UPDATE;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.verify_lease IS DISTINCT FROM lease THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  target_state:=CASE WHEN unknown THEN 'unknown' ELSE 'failed' END;
  IF flow.verify_state NOT IN ('pending',target_state) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  UPDATE core.public_otp_flow SET verify_state=target_state,verify_failure=CASE WHEN unknown THEN 'AUTH_UNCONFIRMED' ELSE 'AUTH_FAILED' END,
    otp_cipher=NULL WHERE challenge_id=challenge;
  RETURN jsonb_build_object('code',CASE WHEN unknown THEN 'AUTH_UNCONFIRMED' ELSE 'AUTH_FAILED' END,'action','result','state',target_state);
END $$;

CREATE FUNCTION core.expire_public_otp(env text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF env IS NULL OR env NOT IN ('dev','test','production') THEN RETURN; END IF;
  -- Cleanup remains available while output/configuration gates are closed.
  WITH expired AS (
    SELECT challenge_id FROM core.public_otp_flow WHERE environment=env AND (
      (secret_expiry<=clock_timestamp() AND (phone_cipher IS NOT NULL OR otp_cipher IS NOT NULL)) OR
      (receipt_expiry<=clock_timestamp() AND receipt_cipher IS NOT NULL) OR
      (metadata_expiry<=clock_timestamp() AND (phone_cipher IS NOT NULL OR otp_cipher IS NOT NULL OR receipt_cipher IS NOT NULL)))
      ORDER BY least(secret_expiry,coalesce(receipt_expiry,secret_expiry)),challenge_id LIMIT 50 FOR UPDATE SKIP LOCKED
  ) UPDATE core.public_otp_flow f SET
    phone_cipher=CASE WHEN f.secret_expiry<=clock_timestamp() OR f.metadata_expiry<=clock_timestamp() THEN NULL ELSE f.phone_cipher END,
    otp_cipher=CASE WHEN f.secret_expiry<=clock_timestamp() OR f.metadata_expiry<=clock_timestamp() THEN NULL ELSE f.otp_cipher END,
    receipt_cipher=CASE WHEN f.receipt_expiry<=clock_timestamp() OR f.metadata_expiry<=clock_timestamp() THEN NULL ELSE f.receipt_cipher END
    FROM expired WHERE f.challenge_id=expired.challenge_id;
END $$;

-- These final-output readers run under the HTTP output gate's shared policy
-- lock. Mutation/attempt accounting has already happened in reserve/prepare.
CREATE FUNCTION core.read_public_challenge(phone text,ip text,purpose text,command_ref uuid,context jsonb,environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c core.otp_challenge; flow core.public_otp_flow; binding jsonb; result jsonb; normalized_ip text;
BEGIN
  IF phone IS NULL OR phone !~ '^\+[1-9][0-9]{7,14}$' OR ip IS NULL OR char_length(ip) NOT BETWEEN 2 AND 45
    OR ip !~ '^[0-9a-fA-F:.]+$' OR purpose IS NULL OR purpose NOT IN ('login','register') OR command_ref IS NULL
    OR jsonb_typeof(context) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  BEGIN normalized_ip:=host(ip::inet);
  EXCEPTION WHEN invalid_text_representation THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END;
  result:=core.public_otp_guard(environment); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF purpose='login' THEN
    IF context<>'{}'::jsonb THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    binding:='{}';
  ELSE
    IF context - ARRAY['invitation_ref','age_declaration','document_set_digest']<>'{}'::jsonb
      OR jsonb_typeof(context->'invitation_ref') IS DISTINCT FROM 'string'
      OR char_length(context->>'invitation_ref') NOT BETWEEN 1 AND 256 OR context->>'invitation_ref' ~ '[[:cntrl:]]' THEN
      RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    binding:=(context-'invitation_ref') || jsonb_build_object('invitation_hash',encode(sha256(convert_to(context->>'invitation_ref','UTF8')),'hex'));
  END IF;
  SELECT * INTO c FROM core.otp_challenge q WHERE q.phone_hash=core.public_otp_digest(read_public_challenge.environment,'phone',phone) AND q.command=command_ref;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=c.id;
  IF c.id IS NULL OR flow.challenge_id IS NULL OR flow.metadata_expiry<=clock_timestamp() THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF c.environment IS DISTINCT FROM environment OR flow.environment IS DISTINCT FROM environment OR c.purpose IS DISTINCT FROM purpose
    OR c.binding IS DISTINCT FROM binding OR c.ip_hash IS DISTINCT FROM core.public_otp_digest(environment,'ip',normalized_ip) THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF c.state='expired' OR c.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','OTP_EXPIRED'); END IF;
  IF c.state<>'pending' OR flow.secret_expiry<=clock_timestamp() THEN RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  IF flow.dispatch_state<>'sent' THEN RETURN jsonb_build_object('code','AUTH_UNCONFIRMED'); END IF;
  IF purpose='register' THEN
    result:=core.otp_registration_context_result(c.binding,environment); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  END IF;
  RETURN jsonb_build_object('code','OK','challenge_id',c.id,'expires_at',c.expires_at,
    'retry_after',greatest(0,ceil(extract(epoch FROM c.created_at+c.resend_seconds*interval '1 second'-clock_timestamp())))::bigint);
END $$;

CREATE FUNCTION core.read_public_verify(challenge uuid,otp text,operation uuid,verification jsonb,env text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c core.otp_challenge; flow core.public_otp_flow; result jsonb; payload_hash text;
BEGIN
  IF challenge IS NULL OR otp IS NULL OR otp !~ '^[0-9]{6}$' OR operation IS NULL
    OR jsonb_typeof(verification) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  result:=core.public_otp_guard(env); IF result->>'code'<>'OK' THEN RETURN result; END IF;
  SELECT * INTO c FROM core.otp_challenge WHERE id=challenge;
  SELECT * INTO flow FROM core.public_otp_flow WHERE challenge_id=challenge;
  IF c.environment IS DISTINCT FROM env OR flow.environment IS DISTINCT FROM env OR flow.metadata_expiry<=clock_timestamp()
    OR flow.receipt_failures>=5 OR c.otp_hash IS DISTINCT FROM core.public_otp_digest(env,'code',challenge::text || ':' || otp) THEN
    RETURN jsonb_build_object('code','OTP_INVALID'); END IF;
  payload_hash:=encode(sha256(convert_to(jsonb_build_array(verification,'Phone OTP',env)::text,'UTF8')),'hex');
  IF flow.verify_operation IS DISTINCT FROM operation OR flow.verify_payload_hash IS DISTINCT FROM payload_hash THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF flow.verify_state<>'completed' THEN RETURN jsonb_build_object('code','AUTH_UNCONFIRMED'); END IF;
  RETURN core.public_otp_receipt_result(challenge,env);
END $$;

REVOKE ALL ON FUNCTION core.public_otp_digest(text,text,text),core.public_otp_encrypt(text,text),core.public_otp_decrypt(text,bytea),
  core.public_otp_guard(text),core.public_otp_verification_result(core.otp_challenge,jsonb),core.public_otp_receipt_result(uuid,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
REVOKE ALL ON FUNCTION core.reserve_public_otp(text,text,text,uuid,jsonb,text),core.auth_send_sms_hook(jsonb),
  core.claim_public_sms(uuid,uuid,text),core.finish_public_sms(uuid,uuid,text,text),
  core.prepare_public_verify(uuid,text,uuid,jsonb,text,boolean),core.finish_public_verify(uuid,uuid,uuid,uuid,jsonb,text),
  core.fail_public_verify(uuid,uuid,boolean,text),core.expire_public_otp(text),
  core.read_public_challenge(text,text,text,uuid,jsonb,text),core.read_public_verify(uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
GRANT USAGE ON SCHEMA core TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION core.auth_send_sms_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION core.reserve_public_otp(text,text,text,uuid,jsonb,text),core.claim_public_sms(uuid,uuid,text),
  core.finish_public_sms(uuid,uuid,text,text),core.prepare_public_verify(uuid,text,uuid,jsonb,text,boolean),
  core.finish_public_verify(uuid,uuid,uuid,uuid,jsonb,text),core.fail_public_verify(uuid,uuid,boolean,text),
  core.read_public_challenge(text,text,text,uuid,jsonb,text),core.read_public_verify(uuid,text,uuid,jsonb,text) TO core_runtime;
GRANT EXECUTE ON FUNCTION core.expire_public_otp(text) TO core_worker;
