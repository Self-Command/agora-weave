-- Current administrator identity and the six existing OTP policy consumers.
-- The Auth adapter supplies only a signature-verified JWT assurance claim.
CREATE TABLE core.admin_bootstrap (
  environment text PRIMARY KEY CHECK (environment IN ('dev','test','production')),
  account_id uuid NOT NULL REFERENCES core.account(id),
  grant_id uuid NOT NULL REFERENCES core.admin_grant(id),
  closed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.admin_bootstrap',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_bootstrap FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.admin_config_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor uuid NOT NULL REFERENCES core.account(id), session_id uuid NOT NULL,
  environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  operation_id uuid NOT NULL, base_version text NOT NULL REFERENCES core.config_bundle(version),
  kind text NOT NULL CHECK (kind IN ('release','rollback')), reason text NOT NULL,
  rollback_version text, otp_values jsonb NOT NULL, changes jsonb NOT NULL,
  scoped_values jsonb NOT NULL, compat jsonb NOT NULL, consumers_ready text[] NOT NULL, schema_version integer NOT NULL,
  registry_digest text NOT NULL, input_digest text NOT NULL, preview_digest text NOT NULL, action_digest text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE(actor,environment,operation_id),
  CHECK (expires_at<=created_at+interval '5 minutes')
);
SELECT core.protect_table('core.admin_config_preview',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_config_preview FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.admin_config_publication (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid NOT NULL REFERENCES core.account(id), session_id uuid NOT NULL,
  environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  preview_id uuid NOT NULL UNIQUE REFERENCES core.admin_config_preview(id), operation_id uuid NOT NULL,
  version text NOT NULL UNIQUE REFERENCES core.config_bundle(version), previous_version text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('release','rollback')), reason text NOT NULL, otp_values jsonb NOT NULL, before_values jsonb NOT NULL,
  input_digest text NOT NULL, receipt jsonb NOT NULL, effective_at timestamptz NOT NULL,
  UNIQUE(actor,environment,operation_id)
);
SELECT core.protect_table('core.admin_config_publication',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_config_publication FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.admin_stepup_binding (
  auth_challenge_id uuid PRIMARY KEY, stepup_id uuid NOT NULL UNIQUE REFERENCES core.stepup_challenge(id),
  actor uuid NOT NULL REFERENCES core.account(id), session_id uuid NOT NULL, factor_id uuid NOT NULL,
  preview_id uuid NOT NULL REFERENCES core.admin_config_preview(id), environment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.admin_stepup_binding',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_stepup_binding FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();
REVOKE ALL ON core.admin_bootstrap,core.admin_config_preview,core.admin_config_publication,core.admin_stepup_binding
  FROM core_runtime,core_worker,supabase_auth_admin;

-- Extract the existing complete-registry validation without changing the active
-- consumer's behavior. Candidate bundles receive the very same validation.
CREATE FUNCTION core.otp_bundle_values_result(target_environment text,candidate core.config_bundle) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE layers jsonb; layer jsonb; entry record; definition core.config_definition;
  selected jsonb:='{}'; seen jsonb:='{}'; frozen text[]:=ARRAY[]::text[]; layer_rank integer;
  applicable boolean; layer_key text; number numeric; spec jsonb; result jsonb:='{}'; key_ref text;
  otp_keys constant text[]:=ARRAY['auth.otp_lifetime_seconds','auth.otp_resend_seconds','auth.otp_max_failures',
    'auth.otp_phone_hourly','auth.otp_phone_daily','auth.otp_ip_hourly'];
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  IF candidate.id IS NULL OR length(candidate.version) NOT BETWEEN 1 AND 2048
    OR jsonb_typeof(candidate.compat) IS DISTINCT FROM 'object'
    OR jsonb_typeof(candidate.compat->'sql') IS DISTINCT FROM 'array'
    OR NOT (candidate.compat->'sql' @> '["0.0.0"]'::jsonb) THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(candidate.compat->'sql') release
      WHERE jsonb_typeof(release) IS DISTINCT FROM 'string')
    OR array_position(candidate.consumers_ready,NULL) IS NOT NULL THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  -- Match the canonical resolver's complete-registry contract, including values
  -- this SQL consumer does not expose. An invalid branch cannot yield partial OTP policy.
  IF NOT EXISTS (SELECT 1 FROM core.config_definition) THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  FOR definition IN SELECT * FROM core.config_definition LOOP
    IF definition.key !~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'
      OR length(definition.key) NOT BETWEEN 1 AND 2048
      OR length(definition.owner) NOT BETWEEN 1 AND 2048
      OR length(definition.description) NOT BETWEEN 1 AND 2048
      OR jsonb_typeof(definition.schema) IS DISTINCT FROM 'object'
      OR definition.status NOT IN ('confirmed','engineering','provisional')
      OR cardinality(definition.scopes)=0
      OR EXISTS (SELECT 1 FROM unnest(definition.scopes) scope WHERE scope IS NULL
        OR scope NOT IN ('global','environment','module','plugin','user_group'))
      OR array_position(definition.dependencies,NULL) IS NOT NULL
      OR array_position(definition.conflicts,NULL) IS NOT NULL
      OR length(definition.read_permission) NOT BETWEEN 1 AND 2048
      OR length(definition.write_permission) NOT BETWEEN 1 AND 2048
      OR definition.effect_mode NOT IN ('immediate','reload')
      OR cardinality(definition.consumer_ids)=0 OR array_position(definition.consumer_ids,NULL) IS NOT NULL
      OR length(definition.existing_policy) NOT BETWEEN 1 AND 2048
      OR cardinality(definition.evidence_refs)=0 OR array_position(definition.evidence_refs,NULL) IS NOT NULL
      OR definition.effect_mode='reload' AND NOT definition.consumer_ids<@candidate.consumers_ready THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    IF NOT extensions.jsonschema_is_valid(definition.schema::json) THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    IF NOT core.otp_configuration_schema_supported(definition.schema) THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    IF NOT extensions.jsonb_matches_schema(definition.schema::json,definition.default_value) THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
  END LOOP;
  IF jsonb_typeof(candidate.scoped_values)='array' THEN layers:=candidate.scoped_values;
  ELSIF jsonb_typeof(candidate.scoped_values)='object' AND candidate.scoped_values ? 'global'
    AND (SELECT count(*) FROM jsonb_object_keys(candidate.scoped_values))=1 THEN
    layers:=jsonb_build_array(jsonb_build_object('scope','global','values',candidate.scoped_values->'global'));
  ELSE RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;

  FOR layer IN SELECT value FROM jsonb_array_elements(layers) LOOP
    IF jsonb_typeof(layer) IS DISTINCT FROM 'object' OR jsonb_typeof(layer->'scope') IS DISTINCT FROM 'string'
      OR layer->>'scope' NOT IN ('global','environment','module','plugin','user_group')
      OR jsonb_typeof(layer->'values') IS DISTINCT FROM 'object' THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    layer_rank:=CASE layer->>'scope' WHEN 'global' THEN 0 WHEN 'environment' THEN 1 WHEN 'user_group' THEN 3 ELSE 2 END;
    IF layer_rank>0 AND (jsonb_typeof(layer->'environment') IS DISTINCT FROM 'string'
        OR layer->>'environment' NOT IN ('dev','test','production'))
      OR layer_rank>1 AND (jsonb_typeof(layer->'owner') IS DISTINCT FROM 'string' OR length(layer->>'owner') NOT BETWEEN 1 AND 2048)
      OR layer_rank=3 AND (jsonb_typeof(layer->'group') IS DISTINCT FROM 'string' OR length(layer->>'group') NOT BETWEEN 1 AND 2048
        OR jsonb_typeof(layer->'priority') IS DISTINCT FROM 'number') THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    IF layer_rank=3 AND ((layer->>'priority')::numeric<>trunc((layer->>'priority')::numeric)
      OR abs((layer->>'priority')::numeric)>9007199254740991) THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    applicable:=(layer_rank=0 OR layer->>'environment'=target_environment)
      AND (layer_rank<2 OR layer->>'owner'='core') AND layer_rank<3;
    FOR entry IN SELECT key,value FROM jsonb_each(layer->'values') LOOP
      SELECT * INTO definition FROM core.config_definition WHERE key=entry.key;
      IF definition.id IS NULL OR NOT (layer->>'scope'=ANY(definition.scopes)) THEN
        RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
      END IF;
      IF NOT extensions.jsonb_matches_schema(definition.schema::json,entry.value) THEN
        RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
      END IF;
      IF layer_rank=0 THEN frozen:=array_append(frozen,entry.key); END IF;
      IF entry.key=ANY(otp_keys) THEN
        IF definition.owner<>'auth' OR NOT ('sql'=ANY(definition.consumer_ids))
          OR definition.sensitive OR definition.read_permission<>'config.read'
          OR definition.schema->>'type' IS DISTINCT FROM 'integer'
          OR jsonb_typeof(definition.range) IS DISTINCT FROM 'object'
          OR definition.range->>'type' IS DISTINCT FROM 'integer' THEN
          RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
        END IF;
        spec:=definition.range;
        IF NOT extensions.jsonschema_is_valid(spec::json) THEN
          RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
        END IF;
        IF NOT core.otp_configuration_schema_supported(spec) THEN
          RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
        END IF;
        IF NOT extensions.jsonb_matches_schema(spec::json,definition.default_value)
          OR NOT extensions.jsonb_matches_schema(spec::json,entry.value) THEN
          RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
        END IF;
        number:=entry.value::text::numeric;
        IF number<>trunc(number) OR number<1 OR number>9007199254740991
          OR definition.default_value::text::numeric<>trunc(definition.default_value::text::numeric)
          OR definition.default_value::text::numeric<1 OR definition.default_value::text::numeric>9007199254740991 THEN
          RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
        END IF;
      END IF;
      IF NOT applicable THEN CONTINUE; END IF;
      layer_key:=entry.key || ':' || layer_rank;
      IF seen ? layer_key AND seen->layer_key IS DISTINCT FROM entry.value THEN
        RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
      END IF;
      seen:=seen || jsonb_build_object(layer_key,entry.value);
      IF NOT selected ? entry.key OR layer_rank>(selected->entry.key->>'rank')::integer THEN
        selected:=selected || jsonb_build_object(entry.key,jsonb_build_object('rank',layer_rank,'value',entry.value));
      END IF;
    END LOOP;
  END LOOP;
  -- Defaults and dependencies are frozen bundle facts, never registry fallback.
  IF EXISTS (SELECT 1 FROM core.config_definition d WHERE NOT d.key=ANY(frozen)
    OR EXISTS (SELECT 1 FROM unnest(d.dependencies) dep WHERE NOT EXISTS
      (SELECT 1 FROM core.config_definition dependency WHERE dependency.key=dep AND dependency.key=ANY(frozen)))
    OR EXISTS (SELECT 1 FROM unnest(d.conflicts) conflict WHERE selected ? conflict)) THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  FOREACH key_ref IN ARRAY otp_keys LOOP
    SELECT * INTO definition FROM core.config_definition WHERE key=key_ref;
    IF definition.id IS NULL OR NOT selected ? key_ref THEN
      RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
    END IF;
    result:=result || jsonb_build_object(key_ref,selected->key_ref->'value');
  END LOOP;
  RETURN jsonb_build_object('code','OK','version',candidate.version,'values',result);
EXCEPTION WHEN data_exception THEN
  RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
END $$;
CREATE OR REPLACE FUNCTION core.otp_configuration_result(target_environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_bundle core.config_bundle;
BEGIN
  SELECT b.* INTO v_bundle FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1 AND b.effective_at<=clock_timestamp();
  RETURN core.otp_bundle_values_result(target_environment,v_bundle);
END $$;
REVOKE ALL ON FUNCTION core.otp_bundle_values_result(text,core.config_bundle),core.otp_configuration_result(text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;

CREATE FUNCTION core.admin_phone_mask(phone text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
  SELECT CASE WHEN phone ~ '^\+?[1-9][0-9]{7,14}$' THEN '+' || left(ltrim(phone,'+'),3) || '****' || right(phone,4) ELSE NULL END
$$;

CREATE FUNCTION core.admin_has_permission(v_actor uuid,v_env text,v_action text,v_resource uuid DEFAULT NULL) RETURNS boolean
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=v_actor AND g.environment=v_env
    AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())
    AND v_action=ANY(g.operation_scopes)
    AND (g.role='super_admin' AND v_action IN ('admin.accounts.read','config.read','auth.config.write','config.release','config.rollback')
      OR g.role='auditor' AND v_action='config.read')
    AND (g.resource_scope IS NULL OR v_resource IS NOT NULL AND v_resource=ANY(g.resource_scope)))
$$;

CREATE FUNCTION core.admin_identity_context(v_actor uuid,v_session uuid,v_env text,v_jwt_aal text,v_require_mfa boolean) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_phone text; v_verified boolean; v_enrolled boolean; v_roles jsonb; v_permissions jsonb;
BEGIN
  IF v_actor IS NULL OR v_session IS NULL OR v_env IS NULL OR v_env NOT IN ('dev','test','production')
    OR v_jwt_aal IS NULL OR v_jwt_aal NOT IN ('aal1','aal2') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_result:=core.policy_context_result(v_actor,v_session,v_env);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  SELECT u.phone INTO v_phone FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id
    WHERE u.id=v_actor AND s.id=v_session AND u.phone ~ '^\+?[1-9][0-9]{7,14}$'
      AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp())
      AND u.phone_confirmed_at<=clock_timestamp() AND s.created_at<=clock_timestamp()
      AND EXISTS (SELECT 1 FROM core.admission a WHERE a.account_id=u.id)
      AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='otp'
        AND amr.created_at>=s.created_at AND amr.created_at<=clock_timestamp()) FOR SHARE OF u,s;
  IF v_phone IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT coalesce(jsonb_agg(role ORDER BY role),'[]') INTO v_roles FROM (
    SELECT DISTINCT g.role FROM core.admin_grant g WHERE g.account_id=v_actor AND g.environment=v_env
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) roles;
  IF jsonb_array_length(v_roles)=0 THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT EXISTS (SELECT 1 FROM auth.mfa_factors f WHERE f.user_id=v_actor AND f.factor_type='totp' AND f.status='verified'
    AND f.created_at<=clock_timestamp()) INTO v_enrolled;
  SELECT v_jwt_aal='aal2' AND EXISTS (SELECT 1 FROM auth.sessions s JOIN auth.mfa_factors f ON f.id=s.factor_id AND f.user_id=s.user_id
    WHERE s.id=v_session AND s.user_id=v_actor AND s.aal='aal2' AND f.factor_type='totp' AND f.status='verified'
      AND f.created_at<=clock_timestamp() AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='totp' AND amr.updated_at>=s.created_at AND amr.updated_at<=clock_timestamp())) INTO v_verified;
  IF v_require_mfa AND NOT v_verified THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
  SELECT coalesce(jsonb_agg(action ORDER BY action),'[]') INTO v_permissions FROM
    unnest(ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback']) action
    WHERE v_verified AND (core.admin_has_permission(v_actor,v_env,action) OR action='admin.accounts.read' AND EXISTS (
      SELECT 1 FROM core.admin_grant g WHERE g.account_id=v_actor AND g.environment=v_env AND g.role='super_admin'
        AND action=ANY(g.operation_scopes) AND cardinality(g.resource_scope)>0 AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())));
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('account',jsonb_build_object('id',v_actor,'phone_masked',core.admin_phone_mask(v_phone)),
    'environment',v_env,'roles',v_roles,'permissions',v_permissions,'mfa',jsonb_build_object('aal',v_jwt_aal,'enrolled',v_enrolled,'verified',v_verified),
    'sensitive_until',(SELECT a.sensitive_until FROM core.account a WHERE a.id=v_actor)));
END $$;

CREATE FUNCTION core.bootstrap_admin_identity(actor uuid,env text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_grant uuid; v_result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF actor IS NULL OR env IS NULL OR env NOT IN ('dev','test','production') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_bootstrap b WHERE b.environment=env) OR EXISTS (
    SELECT 1 FROM core.admin_grant g WHERE g.environment=env AND g.role='super_admin' AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) THEN RETURN jsonb_build_object('code','BOOTSTRAP_CLOSED'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.account a JOIN core.admission admitted ON admitted.account_id=a.id JOIN auth.users u ON u.id=a.id
    WHERE a.id=actor AND a.status='active' AND u.deleted_at IS NULL AND u.phone ~ '^\+?[1-9][0-9]{7,14}$'
      AND u.phone_confirmed_at<=clock_timestamp() AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (a.sensitive_until IS NULL OR a.sensitive_until<=clock_timestamp())) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment) VALUES
    (actor,'super_admin',ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback'],env) RETURNING id INTO v_grant;
  INSERT INTO core.admin_bootstrap(environment,account_id,grant_id) VALUES (env,actor,v_grant);
  INSERT INTO core.audit_event(actor,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,'admin.bootstrap',v_grant,env,'core','Protected deployment-owner initialization','closed',gen_random_uuid());
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.admin_session_result(actor uuid,session_ref uuid,env text,jwt_aal text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  RETURN core.admin_identity_context(actor,session_ref,env,jwt_aal,false);
END $$;

-- Auth v2.196.0's official TOTP enrollment rejects an empty AccountName for
-- phone-only users. This internal, non-deliverable label only supplies that
-- name: it does not confirm email, add an identity, enable email login, create
-- a factor, or supply TOTP/session evidence. Existing nonempty email is kept.
CREATE FUNCTION core.admin_prepare_totp_result(actor uuid,session_ref uuid,env text,jwt_aal text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_label text; v_changed integer;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,false); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  v_label:=actor::text || '@totp-label.invalid';
  UPDATE auth.users u SET email=v_label,updated_at=clock_timestamp() WHERE u.id=actor AND (u.email IS NULL OR u.email='');
  GET DIAGNOSTICS v_changed=ROW_COUNT;
  IF v_changed>0 THEN
    INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,after_digest,result,request_id)
      VALUES (actor,session_ref,'admin.mfa.prepare',actor,env,'core','Official TOTP AccountName compatibility for a phone-only Auth user',
        encode(sha256(convert_to(v_label,'UTF8')),'hex'),'prepared',gen_random_uuid());
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('prepared',true));
END $$;

CREATE FUNCTION core.admin_factors_result(actor uuid,session_ref uuid,env text,jwt_aal text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_items jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,false); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',f.id,'factor_type',f.factor_type,'friendly_name',f.friendly_name,'status',f.status,
    'created_at',f.created_at) ORDER BY f.created_at,f.id),'[]') INTO v_items FROM auth.mfa_factors f WHERE f.user_id=actor AND f.factor_type='totp';
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',v_items));
END $$;

CREATE FUNCTION core.admin_factor_result(actor uuid,session_ref uuid,env text,jwt_aal text,factor_ref uuid,require_verified boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_factor jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,false); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF factor_ref IS NULL OR require_verified IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT jsonb_build_object('id',f.id,'factor_type',f.factor_type,'friendly_name',f.friendly_name,'status',f.status,'created_at',f.created_at)
    INTO v_factor FROM auth.mfa_factors f WHERE f.id=factor_ref AND f.user_id=actor AND f.factor_type='totp'
      AND (NOT require_verified OR f.status='verified') FOR SHARE;
  IF v_factor IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',v_factor);
END $$;

CREATE FUNCTION core.admin_accounts_result(actor uuid,session_ref uuid,env text,jwt_aal text,page_limit integer,after_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_items jsonb; v_more boolean; v_cursor uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF NOT (v_result->'data'->'permissions' ? 'admin.accounts.read') THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  WITH page AS (SELECT a.id,a.status,a.registered_at,core.admin_phone_mask(u.phone) AS phone_masked,
    (SELECT coalesce(jsonb_agg(role ORDER BY role),'[]') FROM (SELECT DISTINCT g.role FROM core.admin_grant g WHERE g.account_id=a.id
      AND g.environment=env AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) roles) AS roles
    FROM core.account a JOIN auth.users u ON u.id=a.id WHERE (after_id IS NULL OR a.id>after_id)
      AND core.admin_has_permission(actor,env,'admin.accounts.read',a.id) ORDER BY a.id LIMIT page_limit+1),
    numbered AS (SELECT *,row_number() OVER (ORDER BY id) AS n FROM page)
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'status',status,'phone_masked',phone_masked,'registered_at',registered_at,'roles',roles)
    ORDER BY id) FILTER (WHERE n<=page_limit),'[]'),count(*)>page_limit,
    (array_agg(id ORDER BY id DESC) FILTER (WHERE n<=page_limit))[1] INTO v_items,v_more,v_cursor FROM numbered;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',v_items,'has_more',v_more,'next_cursor',CASE WHEN v_more THEN v_cursor END));
END $$;

CREATE FUNCTION core.admin_registry_digest() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT encode(sha256(convert_to(coalesce(jsonb_agg(to_jsonb(d) ORDER BY d.key),'[]')::text,'UTF8')),'hex') FROM core.config_definition d
$$;

CREATE FUNCTION core.admin_otp_keys() RETURNS text[] LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
  SELECT ARRAY['auth.otp_lifetime_seconds','auth.otp_resend_seconds','auth.otp_max_failures','auth.otp_phone_hourly','auth.otp_phone_daily','auth.otp_ip_hourly']::text[]
$$;

CREATE FUNCTION core.admin_config_access(v_actor uuid,v_session uuid,v_env text,v_aal text,v_action text,v_max bigint,v_write boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb;
BEGIN
  v_result:=core.admin_identity_context(v_actor,v_session,v_env,v_aal,true); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF v_max IS NULL OR v_max NOT BETWEEN 1 AND 9007199254740991 THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF NOT core.admin_has_permission(v_actor,v_env,v_action) OR NOT core.admin_has_permission(v_actor,v_env,'config.read') OR EXISTS (
    SELECT 1 FROM core.config_definition d WHERE d.key=ANY(core.admin_otp_keys()) AND (
      NOT core.admin_has_permission(v_actor,v_env,d.read_permission) OR v_write AND NOT core.admin_has_permission(v_actor,v_env,d.write_permission)))
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF (SELECT count(*) FROM core.config_definition d WHERE d.key=ANY(core.admin_otp_keys()))<>6 THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.admin_config_definitions_result(actor uuid,session_ref uuid,env text,jwt_aal text,max_lifetime bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_policy jsonb; v_definitions jsonb; v_history jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  v_result:=core.admin_config_access(actor,session_ref,env,jwt_aal,'config.read',max_lifetime,false); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  v_policy:=core.otp_configuration_result(env); IF v_policy->>'code'<>'OK' THEN RETURN v_policy; END IF;
  SELECT jsonb_agg(jsonb_build_object('key',d.key,'description',d.description,'default_value',d.default_value,'value',v_policy->'values'->d.key,
    'range',d.range,'read_permission',d.read_permission,'write_permission',d.write_permission,'effect_mode',d.effect_mode,'existing_policy',d.existing_policy)
    ORDER BY d.key) INTO v_definitions FROM core.config_definition d WHERE d.key=ANY(core.admin_otp_keys());
  SELECT coalesce(jsonb_agg(jsonb_build_object('version',version,'effective_at',effective_at,'reason',reason,'kind',kind) ORDER BY effective_at DESC,version),'[]')
    INTO v_history FROM (SELECT version,effective_at,reason,kind FROM (
      SELECT p.version,p.effective_at,p.reason,p.kind FROM core.admin_config_publication p WHERE p.environment=env
      UNION ALL
      SELECT baseline.version,baseline.effective_at,'首次受控发布前的配置快照'::text AS reason,'baseline'::text AS kind FROM (
        SELECT DISTINCT ON (p.previous_version) p.previous_version AS version,b.effective_at
          FROM core.admin_config_publication p JOIN core.config_bundle b ON b.version=p.previous_version WHERE p.environment=env
            AND NOT EXISTS (SELECT 1 FROM core.admin_config_publication own WHERE own.environment=env AND own.version=p.previous_version)
          ORDER BY p.previous_version,p.effective_at,p.id
      ) baseline
    ) evidence ORDER BY effective_at DESC,version LIMIT 20) history;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('base_version',v_policy->>'version','environment',env,'definitions',v_definitions,
    'deployment_max_lifetime_seconds',max_lifetime,'history',v_history));
END $$;

CREATE FUNCTION core.admin_preview_data(v_preview core.admin_config_preview) RETURNS jsonb
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
  SELECT jsonb_build_object('preview_id',v_preview.id,'preview_digest',v_preview.preview_digest,'action_digest',v_preview.action_digest,
    'base_version',v_preview.base_version,'expires_at',v_preview.expires_at,'values',v_preview.otp_values,'changes',v_preview.changes,
    'existing_object_impacts',jsonb_build_array('既有验证码的有效期、重发截止和错误次数上限保持创建时的值。',
      '保留已有手机号/IP发送记录；新请求按当前配额核验。','回滚会发布新版本，不重新开放已消费或终止的业务事实。'))
$$;

CREATE FUNCTION core.admin_config_preview_result(actor uuid,session_ref uuid,env text,jwt_aal text,base_version text,values_in jsonb,
  rollback_version text,reason text,command_ref uuid,max_lifetime bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_current jsonb; v_values jsonb; v_before jsonb; v_base core.config_bundle; v_candidate core.config_bundle;
  v_preview core.admin_config_preview; v_kind text; v_input_hash text; v_registry text; v_layers jsonb; v_layer jsonb; v_scopes jsonb:='[]';
  v_found boolean:=false; v_key text; v_definition core.config_definition; v_changes jsonb; v_id uuid:=gen_random_uuid(); v_digest text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  v_kind:=CASE WHEN rollback_version IS NULL THEN 'release' ELSE 'rollback' END;
  v_result:=core.admin_config_access(actor,session_ref,env,jwt_aal,'config.' || v_kind,max_lifetime,true);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF command_ref IS NULL OR base_version IS NULL OR length(base_version) NOT BETWEEN 1 AND 2048 OR reason IS NULL
    OR length(reason) NOT BETWEEN 1 AND 2048 OR length(btrim(reason))=0 OR reason ~ '[[:cntrl:]]'
    OR rollback_version IS NOT NULL AND (values_in IS NOT NULL OR length(rollback_version) NOT BETWEEN 1 AND 2048)
    OR rollback_version IS NULL AND jsonb_typeof(values_in) IS DISTINCT FROM 'object' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_input_hash:=encode(sha256(convert_to(jsonb_build_array(session_ref,env,base_version,values_in,rollback_version,reason,max_lifetime)::text,'UTF8')),'hex');
  SELECT * INTO v_preview FROM core.admin_config_preview p WHERE p.actor=admin_config_preview_result.actor AND p.environment=env AND p.operation_id=command_ref;
  IF v_preview.id IS NOT NULL THEN
    IF v_preview.input_digest<>v_input_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF v_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
    IF v_preview.registry_digest<>core.admin_registry_digest() OR NOT EXISTS (SELECT 1 FROM core.config_activation a
      WHERE a.environment=env AND a.active_ptr=v_preview.base_version) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','data',core.admin_preview_data(v_preview));
  END IF;
  v_current:=core.otp_configuration_result(env); IF v_current->>'code'<>'OK' THEN RETURN v_current; END IF;
  IF v_current->>'version' IS DISTINCT FROM base_version THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  v_before:=v_current->'values';
  SELECT * INTO v_base FROM core.config_bundle b WHERE b.version=base_version FOR SHARE;
  IF rollback_version IS NOT NULL THEN
    SELECT p.otp_values INTO v_values FROM core.admin_config_publication p WHERE p.environment=env AND p.version=rollback_version;
    IF v_values IS NULL THEN
      SELECT p.before_values INTO v_values FROM core.admin_config_publication p WHERE p.environment=env AND p.previous_version=rollback_version
        ORDER BY p.effective_at,p.id LIMIT 1;
    END IF;
    IF v_values IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  ELSE v_values:=values_in; END IF;
  IF NOT v_values ?& core.admin_otp_keys() OR (SELECT count(*) FROM jsonb_object_keys(v_values))<>6 THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOREACH v_key IN ARRAY core.admin_otp_keys() LOOP
    SELECT * INTO v_definition FROM core.config_definition d WHERE d.key=v_key;
    IF NOT extensions.jsonb_matches_schema(v_definition.schema::json,v_values->v_key)
      OR NOT extensions.jsonb_matches_schema(v_definition.range::json,v_values->v_key)
      OR jsonb_typeof(v_values->v_key) IS DISTINCT FROM 'number' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    IF (v_values->>v_key)::numeric<>trunc((v_values->>v_key)::numeric)
      OR (v_values->>v_key)::numeric NOT BETWEEN 1 AND 9007199254740991 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END LOOP;
  IF (v_values->>'auth.otp_lifetime_seconds')::numeric>max_lifetime THEN RETURN jsonb_build_object('code','AUTH_LIFETIME_EXCEEDED'); END IF;
  IF jsonb_typeof(v_base.scoped_values)='array' THEN v_layers:=v_base.scoped_values;
  ELSE v_layers:=jsonb_build_array(jsonb_build_object('scope','global','values',v_base.scoped_values->'global')); END IF;
  FOR v_layer IN SELECT value FROM jsonb_array_elements(v_layers) LOOP
    IF v_layer->>'scope'='module' AND v_layer->>'environment'=env AND v_layer->>'owner'='core' THEN
      v_layer:=jsonb_set(v_layer,'{values}',(v_layer->'values') || v_values); v_found:=true;
    END IF;
    v_scopes:=v_scopes || jsonb_build_array(v_layer);
  END LOOP;
  IF NOT v_found THEN v_scopes:=v_scopes || jsonb_build_array(jsonb_build_object('scope','module','environment',env,'owner','core','values',v_values)); END IF;
  v_candidate:=v_base; v_candidate.id:=v_id; v_candidate.version:='otp-' || v_id::text; v_candidate.scoped_values:=v_scopes;
  v_candidate.state:='draft'; v_candidate.effective_at:=clock_timestamp();
  v_result:=core.otp_bundle_values_result(env,v_candidate); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF v_result->'values' IS DISTINCT FROM v_values THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('key',k,'before',v_before->k,'after',v_values->k) ORDER BY k),'[]') INTO v_changes
    FROM unnest(core.admin_otp_keys()) k WHERE v_before->k IS DISTINCT FROM v_values->k;
  v_registry:=core.admin_registry_digest();
  v_digest:=encode(sha256(convert_to(jsonb_build_array(v_id,actor,session_ref,env,base_version,v_values,v_scopes,v_base.compat,
    v_base.consumers_ready,v_base.schema_version,v_registry,v_kind,rollback_version,reason,command_ref)::text,'UTF8')),'hex');
  INSERT INTO core.admin_config_preview(id,actor,session_id,environment,operation_id,base_version,kind,reason,rollback_version,otp_values,changes,
    scoped_values,compat,consumers_ready,schema_version,registry_digest,input_digest,preview_digest,action_digest)
    VALUES (v_id,actor,session_ref,env,command_ref,base_version,v_kind,reason,rollback_version,v_values,v_changes,v_scopes,v_base.compat,
      v_base.consumers_ready,v_base.schema_version,v_registry,v_input_hash,v_digest,
      encode(sha256(convert_to('config.' || v_kind || ':' || v_digest,'UTF8')),'hex')) RETURNING * INTO v_preview;
  RETURN jsonb_build_object('code','OK','data',core.admin_preview_data(v_preview));
EXCEPTION WHEN data_exception THEN RETURN jsonb_build_object('code','INVALID_INPUT');
END $$;

CREATE FUNCTION core.admin_stepup_target_result(actor uuid,session_ref uuid,env text,jwt_aal text,action_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_preview core.admin_config_preview; v_result jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  v_result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF action_digest IS NULL OR action_digest !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO v_preview FROM core.admin_config_preview p WHERE p.actor=admin_stepup_target_result.actor AND p.session_id=session_ref
    AND p.environment=env AND p.action_digest=admin_stepup_target_result.action_digest;
  IF v_preview.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  -- Preview details cross the final output gate only with the complete current
  -- read/write authorization, including every definition's registered policy.
  v_result:=core.admin_config_access(actor,session_ref,env,jwt_aal,'config.' || v_preview.kind,9007199254740991,true);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF v_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
  IF v_preview.registry_digest<>core.admin_registry_digest() OR NOT EXISTS (SELECT 1 FROM core.config_activation a
    WHERE a.environment=env AND a.active_ptr=v_preview.base_version) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',v_preview.id,'action_digest',v_preview.action_digest,'expires_at',v_preview.expires_at));
END $$;

CREATE FUNCTION core.admin_stepup_result(actor uuid,session_ref uuid,env text,jwt_aal text,factor_ref uuid,auth_challenge_ref uuid,action_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_target jsonb; v_preview core.admin_config_preview; v_auth auth.mfa_challenges; v_binding core.admin_stepup_binding;
  v_stepup core.stepup_challenge;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  v_target:=core.admin_stepup_target_result(actor,session_ref,env,jwt_aal,action_digest); IF v_target->>'code'<>'OK' THEN RETURN v_target; END IF;
  IF factor_ref IS NULL OR auth_challenge_ref IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO v_preview FROM core.admin_config_preview p WHERE p.id=(v_target->'data'->>'preview_id')::uuid;
  SELECT * INTO v_binding FROM core.admin_stepup_binding b WHERE b.auth_challenge_id=auth_challenge_ref;
  IF v_binding.auth_challenge_id IS NOT NULL THEN
    IF v_binding.actor<>actor OR v_binding.session_id<>session_ref OR v_binding.environment<>env OR v_binding.factor_id<>factor_ref
      OR v_binding.preview_id<>v_preview.id THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT * INTO v_stepup FROM core.stepup_challenge s WHERE s.id=v_binding.stepup_id;
    IF v_stepup.consumed_at IS NOT NULL OR v_stepup.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
  ELSE
    SELECT c.* INTO v_auth FROM auth.mfa_challenges c JOIN auth.mfa_factors f ON f.id=c.factor_id
      JOIN auth.sessions s ON s.factor_id=f.id AND s.user_id=f.user_id
      WHERE c.id=auth_challenge_ref AND f.id=factor_ref AND f.user_id=actor AND f.factor_type='totp' AND f.status='verified'
        AND s.id=session_ref AND s.aal='aal2' AND c.created_at>=v_preview.created_at AND c.created_at<=c.verified_at
        AND c.verified_at>=v_preview.created_at AND c.verified_at<=clock_timestamp() AND c.verified_at>clock_timestamp()-interval '5 minutes'
        AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='totp'
          AND amr.updated_at>=c.verified_at AND amr.updated_at<=clock_timestamp()) FOR SHARE OF c,f,s;
    IF v_auth.id IS NULL THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
    INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at)
      VALUES (actor,session_ref,action_digest,'aal2',v_auth.verified_at,least(v_auth.verified_at+interval '5 minutes',v_preview.expires_at)) RETURNING * INTO v_stepup;
    INSERT INTO core.admin_stepup_binding(auth_challenge_id,stepup_id,actor,session_id,factor_id,preview_id,environment)
      VALUES (auth_challenge_ref,v_stepup.id,actor,session_ref,factor_ref,v_preview.id,env);
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('stepup_id',v_stepup.id,'action_digest',v_stepup.action_digest,'expires_at',v_stepup.expires_at));
END $$;

CREATE FUNCTION core.admin_config_commit_result(actor uuid,session_ref uuid,env text,jwt_aal text,preview_ref uuid,preview_digest text,
  stepup_ref uuid,command_ref uuid,kind text,max_lifetime bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_before jsonb; v_preview core.admin_config_preview; v_receipt core.admin_config_publication; v_stepup core.stepup_challenge;
  v_candidate core.config_bundle; v_input text; v_current text; v_version text; v_data jsonb; v_audit uuid; v_now timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF kind IS NULL OR kind NOT IN ('release','rollback') OR preview_ref IS NULL OR stepup_ref IS NULL OR command_ref IS NULL
    OR preview_digest IS NULL OR preview_digest !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_result:=core.admin_config_access(actor,session_ref,env,jwt_aal,'config.' || kind,max_lifetime,true); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  v_input:=encode(sha256(convert_to(jsonb_build_array(session_ref,env,preview_ref,preview_digest,stepup_ref,kind,max_lifetime)::text,'UTF8')),'hex');
  SELECT * INTO v_receipt FROM core.admin_config_publication p WHERE p.actor=admin_config_commit_result.actor AND p.environment=env AND p.operation_id=command_ref;
  IF v_receipt.id IS NOT NULL THEN
    IF v_receipt.input_digest<>v_input THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','data',v_receipt.receipt);
  END IF;
  IF env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.account a WHERE a.id=actor AND a.sensitive_until>clock_timestamp()) THEN
    RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN','sensitive_until',(SELECT a.sensitive_until FROM core.account a WHERE a.id=actor)); END IF;
  SELECT * INTO v_preview FROM core.admin_config_preview p WHERE p.id=preview_ref;
  IF v_preview.id IS NULL OR v_preview.actor<>actor OR v_preview.session_id<>session_ref OR v_preview.environment<>env
    OR v_preview.preview_digest IS DISTINCT FROM preview_digest OR v_preview.kind<>kind THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF v_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_config_publication p WHERE p.preview_id=preview_ref) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF v_preview.registry_digest<>core.admin_registry_digest() THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT a.active_ptr INTO v_current FROM core.config_activation a WHERE a.environment=env FOR UPDATE;
  IF v_current IS DISTINCT FROM v_preview.base_version THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  v_before:=core.otp_configuration_result(env); IF v_before->>'code'<>'OK' THEN RETURN v_before; END IF;
  SELECT * INTO v_stepup FROM core.stepup_challenge s WHERE s.id=stepup_ref FOR UPDATE;
  IF v_stepup.id IS NULL OR v_stepup.account_id<>actor OR v_stepup.session_id<>session_ref OR v_stepup.action_digest<>v_preview.action_digest
    OR v_stepup.aal<>'aal2' OR v_stepup.verified_at>clock_timestamp() OR v_stepup.expires_at<=clock_timestamp() OR v_stepup.consumed_at IS NOT NULL
    OR NOT EXISTS (SELECT 1 FROM core.admin_stepup_binding b WHERE b.stepup_id=v_stepup.id AND b.preview_id=preview_ref AND b.environment=env
      AND b.actor=admin_config_commit_result.actor AND b.session_id=session_ref AND EXISTS (SELECT 1 FROM auth.sessions s
        JOIN auth.mfa_factors f ON f.id=s.factor_id AND f.user_id=s.user_id WHERE s.id=session_ref AND s.user_id=actor
        AND f.id=b.factor_id AND f.status='verified' AND f.factor_type='totp')) THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
  IF (v_preview.otp_values->>'auth.otp_lifetime_seconds')::numeric>max_lifetime THEN RETURN jsonb_build_object('code','AUTH_LIFETIME_EXCEEDED'); END IF;
  SELECT b.* INTO v_candidate FROM core.config_bundle b WHERE b.version=v_current;
  v_version:='otp-' || v_preview.id::text; v_now:=clock_timestamp();
  v_candidate.id:=gen_random_uuid(); v_candidate.version:=v_version; v_candidate.scoped_values:=v_preview.scoped_values;
  v_candidate.compat:=v_preview.compat; v_candidate.consumers_ready:=v_preview.consumers_ready; v_candidate.schema_version:=v_preview.schema_version;
  v_candidate.state:='draft'; v_candidate.effective_at:=v_now; v_candidate.preview_digest:=preview_digest;
  v_result:=core.otp_bundle_values_result(env,v_candidate); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF v_result->'values' IS DISTINCT FROM v_preview.otp_values THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  v_data:=jsonb_build_object('version',v_version,'previous_version',v_current,'state','active','kind',kind);
  INSERT INTO core.config_bundle(id,version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready,actor)
    VALUES (v_candidate.id,v_version,v_candidate.scoped_values,v_candidate.schema_version,v_candidate.compat,'draft',v_now,preview_digest,v_candidate.consumers_ready,actor);
  UPDATE core.config_bundle SET state='validated' WHERE version=v_version;
  UPDATE core.config_bundle SET state='ready' WHERE version=v_version;
  UPDATE core.config_bundle SET state='active' WHERE version=v_version;
  UPDATE core.config_activation SET active_ptr=v_version WHERE environment=env;
  UPDATE core.stepup_challenge SET consumed_at=clock_timestamp() WHERE id=stepup_ref;
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,env,'config.' || kind,command_ref,v_input,v_preview.id,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,before_digest,after_digest,result,request_id)
    VALUES (actor,session_ref,'config.' || kind,v_preview.id,env,'core',v_preview.reason,
      encode(sha256(convert_to(v_current,'UTF8')),'hex'),preview_digest,'active',command_ref) RETURNING id INTO v_audit;
  UPDATE core.config_bundle SET audit_ref=v_audit WHERE version=v_version;
  INSERT INTO core.admin_config_publication(actor,session_id,environment,preview_id,operation_id,version,previous_version,kind,reason,otp_values,before_values,input_digest,receipt,effective_at)
    VALUES (actor,session_ref,env,preview_ref,command_ref,v_version,v_current,kind,v_preview.reason,v_preview.otp_values,v_before->'values',v_input,v_data,v_now);
  RETURN jsonb_build_object('code','OK','data',v_data);
END $$;

-- A legacy four-argument caller has no signed JWT assurance evidence. Preserve
-- its four existing actions; configuration receipts require the five-arg entry.
CREATE FUNCTION core.account_operation_result(actor uuid,session_ref uuid,command_ref uuid,target_environment text,jwt_aal text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_entry core.operation; v_matches integer; v_result jsonb; v_receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO v_matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request','config.release','config.rollback');
  IF v_matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF v_matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO v_entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request','config.release','config.rollback');
  IF v_entry.action IN ('config.release','config.rollback') THEN
    IF jwt_aal IS NULL THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
    v_result:=core.admin_identity_context(actor,session_ref,target_environment,jwt_aal,true);
    IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
    IF NOT core.admin_has_permission(actor,target_environment,v_entry.action) OR NOT core.admin_has_permission(actor,target_environment,'config.read') THEN
      RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
    SELECT p.receipt INTO v_receipt FROM core.admin_config_publication p WHERE p.actor=account_operation_result.actor
      AND p.environment=target_environment AND p.operation_id=command_ref AND 'config.' || p.kind=v_entry.action;
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('operation_id',v_entry.operation_id,'action',v_entry.action,'state',v_entry.state)
    || CASE WHEN v_receipt IS NOT NULL THEN jsonb_build_object('result',v_receipt) ELSE '{}'::jsonb END);
END $$;

CREATE OR REPLACE FUNCTION core.account_operation_result(actor uuid,session_ref uuid,command_ref uuid,target_environment text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT core.account_operation_result(actor,session_ref,command_ref,target_environment,NULL)
$$;

REVOKE ALL ON FUNCTION core.admin_phone_mask(text),core.admin_has_permission(uuid,text,text,uuid),
  core.admin_identity_context(uuid,uuid,text,text,boolean),core.bootstrap_admin_identity(uuid,text),core.admin_registry_digest(),core.admin_otp_keys(),
  core.admin_config_access(uuid,uuid,text,text,text,bigint,boolean),core.admin_preview_data(core.admin_config_preview)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
REVOKE ALL ON FUNCTION core.admin_session_result(uuid,uuid,text,text),core.admin_prepare_totp_result(uuid,uuid,text,text),core.admin_factors_result(uuid,uuid,text,text),
  core.admin_factor_result(uuid,uuid,text,text,uuid,boolean),core.admin_accounts_result(uuid,uuid,text,text,integer,uuid),
  core.admin_config_definitions_result(uuid,uuid,text,text,bigint),core.admin_config_preview_result(uuid,uuid,text,text,text,jsonb,text,text,uuid,bigint),
  core.admin_stepup_target_result(uuid,uuid,text,text,text),core.admin_stepup_result(uuid,uuid,text,text,uuid,uuid,text),
  core.admin_config_commit_result(uuid,uuid,text,text,uuid,text,uuid,uuid,text,bigint),core.account_operation_result(uuid,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
GRANT EXECUTE ON FUNCTION core.admin_session_result(uuid,uuid,text,text),core.admin_prepare_totp_result(uuid,uuid,text,text),core.admin_factors_result(uuid,uuid,text,text),
  core.admin_factor_result(uuid,uuid,text,text,uuid,boolean),core.admin_accounts_result(uuid,uuid,text,text,integer,uuid),
  core.admin_config_definitions_result(uuid,uuid,text,text,bigint),core.admin_config_preview_result(uuid,uuid,text,text,text,jsonb,text,text,uuid,bigint),
  core.admin_stepup_target_result(uuid,uuid,text,text,text),core.admin_stepup_result(uuid,uuid,text,text,uuid,uuid,text),
  core.admin_config_commit_result(uuid,uuid,text,text,uuid,text,uuid,uuid,text,bigint),core.account_operation_result(uuid,uuid,uuid,text,text) TO core_runtime;

