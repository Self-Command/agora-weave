-- Deployment-controlled username aliases use the existing official phone Auth
-- identity. These private functions are reachable only after the core verifies
-- the configured BFF request proof; no password or alias is written to audit.
CREATE TABLE core.admin_password_identity (
  environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  username text NOT NULL CHECK (username ~ '^[a-z0-9][a-z0-9_.-]{2,63}$'),
  account_id uuid NOT NULL REFERENCES core.account(id),
  credential_version bigint NOT NULL DEFAULT 1 CHECK (credential_version>0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(environment,username), UNIQUE(environment,account_id)
);
CREATE TABLE core.admin_password_captcha (
  id uuid PRIMARY KEY, environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  source_digest text NOT NULL CHECK (source_digest ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz NOT NULL, consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (expires_at>created_at AND expires_at<=created_at+interval '3 minutes')
);
CREATE INDEX ON core.admin_password_captcha(environment,source_digest,created_at);
CREATE TABLE core.admin_password_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), environment text NOT NULL,
  username_digest text NOT NULL, source_digest text NOT NULL,
  account_id uuid REFERENCES core.account(id), credential_version bigint,
  captcha_id uuid NOT NULL UNIQUE REFERENCES core.admin_password_captcha(id),
  operation_id uuid NOT NULL, purpose text NOT NULL CHECK (purpose IN ('login','forgot')),
  state text NOT NULL CHECK (state IN ('prepared','failed','completed','accepted')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(environment,operation_id)
);
CREATE INDEX ON core.admin_password_attempt(environment,username_digest,created_at);
CREATE INDEX ON core.admin_password_attempt(environment,source_digest,created_at);
CREATE TABLE core.admin_password_session (
  session_id uuid PRIMARY KEY REFERENCES core.session_registry(session_id),
  account_id uuid NOT NULL REFERENCES core.account(id), environment text NOT NULL,
  credential_version bigint NOT NULL, attempt_id uuid NOT NULL UNIQUE REFERENCES core.admin_password_attempt(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.admin_password_identity',false);
SELECT core.protect_table('core.admin_password_captcha',false);
SELECT core.protect_table('core.admin_password_attempt',false);
SELECT core.protect_table('core.admin_password_session',false);
REVOKE ALL ON core.admin_password_identity,core.admin_password_captcha,core.admin_password_attempt,core.admin_password_session
  FROM core_runtime,core_worker,supabase_auth_admin;

CREATE FUNCTION core.admin_password_session_proof(actor uuid,session_ref uuid,env text) RETURNS boolean
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM core.admin_password_session p JOIN core.admin_password_identity i
    ON i.environment=p.environment AND i.account_id=p.account_id AND i.credential_version=p.credential_version
    JOIN auth.sessions s ON s.id=p.session_id AND s.user_id=p.account_id
    WHERE p.account_id=actor AND p.session_id=session_ref AND p.environment=env
      AND s.created_at<=p.created_at AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='password' AND amr.created_at>=s.created_at AND amr.created_at<=p.created_at))
$$;

CREATE FUNCTION core.admin_password_captcha_result(captcha_ref uuid,env text,expires_at timestamptz,source_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF captcha_ref IS NULL OR env IS NULL OR env NOT IN ('dev','test','production') OR source_digest IS NULL
    OR source_digest !~ '^[a-f0-9]{64}$' OR expires_at IS NULL OR expires_at<=clock_timestamp()
    OR expires_at>clock_timestamp()+interval '3 minutes' THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('admin-password:' || env || ':' || source_digest,0));
  IF (SELECT count(*) FROM core.admin_password_captcha c WHERE c.environment=env AND c.source_digest=admin_password_captcha_result.source_digest
    AND c.created_at>clock_timestamp()-interval '1 minute')>=20 OR
    (SELECT count(*) FROM core.admin_password_captcha c WHERE c.environment=env AND c.source_digest=admin_password_captcha_result.source_digest
      AND c.created_at>clock_timestamp()-interval '1 hour')>=100 THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  INSERT INTO core.admin_password_captcha(id,environment,source_digest,expires_at)
    VALUES (captcha_ref,env,source_digest,expires_at) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.admin_password_target_result(username text,captcha_ref uuid,env text,source_digest text,command_ref uuid,purpose text DEFAULT 'login') RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_captcha core.admin_password_captcha; v_alias core.admin_password_identity; v_phone text; v_attempt uuid; v_digest text; v_blocked boolean;
BEGIN
  IF username IS NULL OR username !~ '^[a-z0-9][a-z0-9_.-]{2,63}$' OR captcha_ref IS NULL OR command_ref IS NULL
    OR env IS NULL OR env NOT IN ('dev','test','production') OR source_digest IS NULL OR source_digest !~ '^[a-f0-9]{64}$'
    OR purpose IS NULL OR purpose NOT IN ('login','forgot') THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  PERFORM pg_advisory_xact_lock(17013,1);
  SELECT * INTO v_captcha FROM core.admin_password_captcha c WHERE c.id=captcha_ref FOR UPDATE;
  IF v_captcha.id IS NULL OR v_captcha.environment<>env OR v_captcha.source_digest<>source_digest
    OR v_captcha.consumed_at IS NOT NULL OR v_captcha.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  UPDATE core.admin_password_captcha SET consumed_at=clock_timestamp() WHERE id=captcha_ref;
  v_digest:=encode(sha256(convert_to(username,'UTF8')),'hex');
  v_blocked:=(SELECT count(*) FROM core.admin_password_attempt a WHERE a.environment=env AND a.username_digest=v_digest
      AND a.created_at>clock_timestamp()-interval '15 minutes')>=10 OR
    (SELECT count(*) FROM core.admin_password_attempt a WHERE a.environment=env AND a.source_digest=admin_password_target_result.source_digest
      AND a.created_at>clock_timestamp()-interval '15 minutes')>=40;
  IF EXISTS (SELECT 1 FROM core.admin_password_attempt a WHERE a.environment=env AND a.operation_id=command_ref) THEN
    RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  SELECT * INTO v_alias FROM core.admin_password_identity i WHERE i.environment=env AND i.username=admin_password_target_result.username;
  SELECT u.phone INTO v_phone FROM auth.users u JOIN core.account a ON a.id=u.id
    JOIN core.admission admitted ON admitted.account_id=a.id WHERE u.id=v_alias.account_id AND a.status='active'
      AND u.deleted_at IS NULL AND u.phone ~ '^\+?[1-9][0-9]{7,14}$' AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (a.sensitive_until IS NULL OR a.sensitive_until<=clock_timestamp())
      AND EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=a.id AND g.environment=env AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()));
  INSERT INTO core.admin_password_attempt(environment,username_digest,source_digest,account_id,credential_version,captcha_id,operation_id,purpose,state)
    VALUES (env,v_digest,source_digest,v_alias.account_id,v_alias.credential_version,captcha_ref,command_ref,purpose,
      CASE WHEN purpose='forgot' THEN 'accepted' WHEN v_blocked OR v_phone IS NULL THEN 'failed' ELSE 'prepared' END) RETURNING id INTO v_attempt;
  INSERT INTO core.audit_event(operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES ('admin.auth.password.' || purpose,v_attempt,env,'core','Password fallback attempt',
      CASE WHEN purpose='forgot' THEN 'accepted' WHEN v_blocked OR v_phone IS NULL THEN 'failed' ELSE 'prepared' END,command_ref);
  IF purpose='forgot' THEN RETURN jsonb_build_object('code','OK','accepted',true); END IF;
  IF v_blocked OR v_phone IS NULL THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  RETURN jsonb_build_object('code','OK','attempt_id',v_attempt,'account_id',v_alias.account_id,'phone',ltrim(v_phone,'+'));
END $$;

CREATE FUNCTION core.admin_password_finish_result(attempt_ref uuid,actor uuid,session_ref uuid,env text,command_ref uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_attempt core.admin_password_attempt; v_phone text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  SELECT * INTO v_attempt FROM core.admin_password_attempt a WHERE a.id=attempt_ref FOR UPDATE;
  IF v_attempt.id IS NULL OR v_attempt.environment IS DISTINCT FROM env OR v_attempt.account_id IS DISTINCT FROM actor
    OR v_attempt.operation_id IS DISTINCT FROM command_ref OR v_attempt.purpose<>'login' OR v_attempt.state<>'prepared'
    OR v_attempt.created_at<clock_timestamp()-interval '3 minutes' OR session_ref IS NULL THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  SELECT u.phone INTO v_phone FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id JOIN core.account a ON a.id=u.id
    JOIN core.admission admitted ON admitted.account_id=a.id JOIN core.admin_password_identity i ON i.account_id=a.id AND i.environment=env
    WHERE u.id=actor AND s.id=session_ref AND i.credential_version=v_attempt.credential_version AND a.status='active'
      AND u.deleted_at IS NULL AND u.phone ~ '^\+?[1-9][0-9]{7,14}$' AND u.phone_confirmed_at<=clock_timestamp()
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (a.sensitive_until IS NULL OR a.sensitive_until<=clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp()) AND s.created_at>=v_attempt.created_at AND s.created_at<=clock_timestamp()
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='password'
        AND amr.created_at>=s.created_at AND amr.created_at<=clock_timestamp())
      AND EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=a.id AND g.environment=env AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) FOR SHARE OF u,s,a,i;
  IF v_phone IS NULL OR EXISTS (SELECT 1 FROM core.session_registry r WHERE r.session_id=session_ref)
    THEN RETURN jsonb_build_object('code','AUTH_FAILED'); END IF;
  INSERT INTO core.session_registry(session_id,account_id,device_label) VALUES (session_ref,actor,'Administrator password login');
  INSERT INTO core.admin_password_session(session_id,account_id,environment,credential_version,attempt_id)
    VALUES (session_ref,actor,env,v_attempt.credential_version,attempt_ref);
  UPDATE core.admin_password_attempt SET state='completed' WHERE id=attempt_ref;
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'admin.auth.password',attempt_ref,env,'core','Official Auth password session verified','admitted',command_ref);
  RETURN jsonb_build_object('code','OK','admitted',true);
END $$;

CREATE FUNCTION core.admin_password_failure_result(attempt_ref uuid,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_attempt core.admin_password_attempt;
BEGIN
  UPDATE core.admin_password_attempt a SET state='failed' WHERE a.id=attempt_ref AND a.environment=env AND a.state='prepared' RETURNING * INTO v_attempt;
  IF v_attempt.id IS NOT NULL THEN
    INSERT INTO core.audit_event(operation,object_ref,environment,plugin,reason,result,request_id)
      VALUES ('admin.auth.password',attempt_ref,env,'core','Official Auth password attempt rejected','failed',v_attempt.operation_id);
  END IF;
  RETURN jsonb_build_object('code','AUTH_FAILED');
END $$;

-- Only a protected deployment-owner call can provision; even that call must
-- present a current full administrator session with real official TOTP evidence.
CREATE FUNCTION core.provision_admin_password_identity(actor uuid,session_ref uuid,env text,jwt_aal text,target_account uuid,username text,password text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF NOT EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=actor AND g.environment=env AND g.role='super_admin'
    AND g.resource_scope IS NULL AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()))
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF username IS NULL OR username !~ '^[a-z0-9][a-z0-9_.-]{2,63}$' OR password IS NULL OR octet_length(password) NOT BETWEEN 14 AND 72
    OR target_account IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.account a JOIN core.admission admitted ON admitted.account_id=a.id JOIN auth.users u ON u.id=a.id
    WHERE a.id=target_account AND a.status='active' AND u.deleted_at IS NULL AND u.phone ~ '^\+?[1-9][0-9]{7,14}$'
      AND u.phone_confirmed_at<=clock_timestamp() AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (a.sensitive_until IS NULL OR a.sensitive_until<=clock_timestamp())
      AND EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=a.id AND g.environment=env AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()))) THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_password_identity i WHERE i.environment=env AND
    (i.username=provision_admin_password_identity.username AND i.account_id<>target_account OR i.account_id=target_account AND i.username<>provision_admin_password_identity.username))
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  INSERT INTO core.admin_password_identity(environment,username,account_id) VALUES (env,username,target_account)
    ON CONFLICT ON CONSTRAINT admin_password_identity_pkey DO UPDATE SET credential_version=core.admin_password_identity.credential_version+1;
  UPDATE auth.users u SET encrypted_password=extensions.crypt(password,extensions.gen_salt('bf',12)),updated_at=clock_timestamp() WHERE u.id=target_account;
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'admin.auth.password.provision',target_account,env,'core','Protected administrator password provisioning','provisioned',gen_random_uuid());
  RETURN jsonb_build_object('code','OK');
END $$;

REVOKE ALL ON FUNCTION core.admin_password_session_proof(uuid,uuid,text),
  core.provision_admin_password_identity(uuid,uuid,text,text,uuid,text,text),
  core.admin_password_captcha_result(uuid,text,timestamptz,text),core.admin_password_target_result(text,uuid,text,text,uuid,text),
  core.admin_password_finish_result(uuid,uuid,uuid,text,uuid),core.admin_password_failure_result(uuid,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
GRANT EXECUTE ON FUNCTION core.admin_password_captcha_result(uuid,text,timestamptz,text),
  core.admin_password_target_result(text,uuid,text,text,uuid,text),core.admin_password_finish_result(uuid,uuid,uuid,text,uuid),
  core.admin_password_failure_result(uuid,text) TO core_runtime;
