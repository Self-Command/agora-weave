-- Challenge deadlines and failure budgets are fixed at reservation; quotas use current policy.
CREATE EXTENSION IF NOT EXISTS pg_jsonschema WITH SCHEMA extensions;

ALTER TABLE core.otp_challenge
  DROP CONSTRAINT otp_challenge_attempts_check,
  ALTER COLUMN attempts TYPE bigint,
  ADD CONSTRAINT otp_challenge_attempts_check CHECK (attempts BETWEEN 0 AND 9007199254740991),
  ADD COLUMN resend_seconds bigint NOT NULL DEFAULT 60 CHECK (resend_seconds BETWEEN 1 AND 9007199254740991),
  ADD COLUMN max_failures bigint NOT NULL DEFAULT 5 CHECK (max_failures BETWEEN 1 AND 9007199254740991),
  ADD COLUMN config_version text;

-- Bound this consumer to the registry's supported schema vocabulary. pg_jsonschema
-- validates schemas and values; this guard rejects extensions Ajv strict mode would
-- otherwise reject, rather than silently ignoring them. const/enum are business data.
CREATE FUNCTION core.otp_configuration_schema_supported(spec jsonb) RETURNS boolean
LANGUAGE plpgsql IMMUTABLE SET search_path=pg_catalog AS $$
DECLARE types jsonb:='[]'; nested jsonb; property_ref text;
BEGIN
  IF jsonb_typeof(spec)='boolean' THEN RETURN true; END IF;
  IF jsonb_typeof(spec) IS DISTINCT FROM 'object' OR spec - ARRAY['type','const','enum','minimum','maximum',
    'uniqueItems','additionalProperties','required','properties','items'] <> '{}'::jsonb THEN RETURN false; END IF;
  IF spec ? 'type' THEN
    IF jsonb_typeof(spec->'type')='string' THEN types:=jsonb_build_array(spec->'type');
    ELSIF jsonb_typeof(spec->'type')='array' THEN types:=spec->'type';
    ELSE RETURN false; END IF;
    IF jsonb_array_length(types)=0 OR EXISTS (SELECT 1 FROM jsonb_array_elements(types) value
      WHERE jsonb_typeof(value)<>'string' OR value#>>'{}' NOT IN ('null','boolean','object','array','number','integer','string'))
      OR (SELECT count(*) FROM jsonb_array_elements(types) value WHERE value<>'"null"'::jsonb)>1 THEN RETURN false; END IF;
  END IF;
  IF spec ?| ARRAY['minimum','maximum'] AND NOT (types ?| ARRAY['integer','number'])
    OR spec ?| ARRAY['properties','required','additionalProperties'] AND NOT types ? 'object'
    OR spec ?| ARRAY['items','uniqueItems'] AND NOT types ? 'array' THEN RETURN false; END IF;
  IF spec ? 'properties' THEN
    IF jsonb_typeof(spec->'properties') IS DISTINCT FROM 'object' THEN RETURN false; END IF;
    FOR nested IN SELECT value FROM jsonb_each(spec->'properties') LOOP
      IF NOT core.otp_configuration_schema_supported(nested) THEN RETURN false; END IF;
    END LOOP;
  END IF;
  IF spec ? 'required' THEN
    IF jsonb_typeof(spec->'required') IS DISTINCT FROM 'array' THEN RETURN false; END IF;
    FOR property_ref IN SELECT value FROM jsonb_array_elements_text(spec->'required') LOOP
      IF NOT coalesce(spec->'properties' ? property_ref,false) THEN RETURN false; END IF;
    END LOOP;
  END IF;
  FOREACH property_ref IN ARRAY ARRAY['items','additionalProperties'] LOOP
    IF spec ? property_ref AND NOT core.otp_configuration_schema_supported(spec->property_ref) THEN RETURN false; END IF;
  END LOOP;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION core.otp_configuration_schema_supported(jsonb) FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker;

-- Private SQL consumer: owner=core, no groups, release 0.0.0. Anonymous ingress
-- cannot obtain a configuration snapshot or read the configuration tables.
CREATE FUNCTION core.otp_configuration_result(target_environment text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE active core.config_bundle; layers jsonb; layer jsonb; entry record; definition core.config_definition;
  selected jsonb:='{}'; seen jsonb:='{}'; frozen text[]:=ARRAY[]::text[]; layer_rank integer;
  applicable boolean; layer_key text; number numeric; spec jsonb; result jsonb:='{}'; key_ref text;
  otp_keys constant text[]:=ARRAY['auth.otp_lifetime_seconds','auth.otp_resend_seconds','auth.otp_max_failures',
    'auth.otp_phone_hourly','auth.otp_phone_daily','auth.otp_ip_hourly'];
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  SELECT b.* INTO active FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1
      AND b.effective_at<=clock_timestamp();
  IF active.id IS NULL OR length(active.version) NOT BETWEEN 1 AND 2048
    OR jsonb_typeof(active.compat) IS DISTINCT FROM 'object'
    OR jsonb_typeof(active.compat->'sql') IS DISTINCT FROM 'array'
    OR NOT (active.compat->'sql' @> '["0.0.0"]'::jsonb) THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(active.compat->'sql') release
      WHERE jsonb_typeof(release) IS DISTINCT FROM 'string')
    OR array_position(active.consumers_ready,NULL) IS NOT NULL THEN
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
      OR definition.effect_mode='reload' AND NOT definition.consumer_ids<@active.consumers_ready THEN
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
  IF jsonb_typeof(active.scoped_values)='array' THEN layers:=active.scoped_values;
  ELSIF jsonb_typeof(active.scoped_values)='object' AND active.scoped_values ? 'global'
    AND (SELECT count(*) FROM jsonb_object_keys(active.scoped_values))=1 THEN
    layers:=jsonb_build_array(jsonb_build_object('scope','global','values',active.scoped_values->'global'));
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
  RETURN jsonb_build_object('code','OK','version',active.version,'values',result);
EXCEPTION WHEN data_exception THEN
  RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
END $$;
REVOKE ALL ON FUNCTION core.otp_configuration_result(text) FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker;

CREATE OR REPLACE FUNCTION core.reserve_otp_challenge(phone_digest text,ip_digest text,challenge_purpose text,
  code_digest text,command_ref uuid,context jsonb,target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE previous core.otp_challenge; reserved core.otp_challenge; qualification jsonb; wait_seconds bigint;
  configuration jsonb; values_in jsonb; lifetime bigint; resend bigint; failures bigint; reserved_at timestamptz;
  expiry timestamptz;
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
    qualification:=core.otp_registration_context_result(context,target_environment);
    IF qualification->>'code'<>'OK' THEN RETURN qualification; END IF;
  END IF;
  configuration:=core.otp_configuration_result(target_environment);
  IF configuration->>'code'<>'OK' THEN RETURN configuration; END IF;
  IF previous.id IS NOT NULL THEN
    wait_seconds:=greatest(0,ceil(extract(epoch FROM previous.created_at+
      previous.resend_seconds*interval '1 second'-clock_timestamp())))::bigint;
    RETURN jsonb_build_object('code','OK','challenge_id',previous.id,'expires_at',previous.expires_at,'retry_after',wait_seconds,'reused',true);
  END IF;
  values_in:=configuration->'values';
  lifetime:=(values_in->>'auth.otp_lifetime_seconds')::bigint;
  resend:=(values_in->>'auth.otp_resend_seconds')::bigint;
  failures:=(values_in->>'auth.otp_max_failures')::bigint;
  -- Existing cooldowns survive configuration changes, including rollback.
  SELECT greatest(0,ceil(extract(epoch FROM max(created_at+resend_seconds*interval '1 second')-clock_timestamp())))::bigint
    INTO wait_seconds FROM core.otp_challenge WHERE phone_hash=phone_digest;
  IF wait_seconds>0 THEN RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',wait_seconds); END IF;
  IF (SELECT count(*) FROM core.otp_challenge WHERE phone_hash=phone_digest AND created_at>clock_timestamp()-interval '1 hour') >=
      (values_in->>'auth.otp_phone_hourly')::bigint OR
    (SELECT count(*) FROM core.otp_challenge WHERE phone_hash=phone_digest AND created_at>clock_timestamp()-interval '1 day') >=
      (values_in->>'auth.otp_phone_daily')::bigint OR
    (SELECT count(*) FROM core.otp_challenge WHERE ip_hash=ip_digest AND created_at>clock_timestamp()-interval '1 hour') >=
      (values_in->>'auth.otp_ip_hourly')::bigint THEN
    RETURN jsonb_build_object('code','RATE_LIMITED','retry_after',3600);
  END IF;
  reserved_at:=clock_timestamp();
  BEGIN
    expiry:=reserved_at+lifetime*interval '1 second';
    PERFORM reserved_at+resend*interval '1 second';
  EXCEPTION WHEN datetime_field_overflow OR interval_field_overflow OR numeric_value_out_of_range THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END;
  UPDATE core.otp_challenge SET state='superseded' WHERE phone_hash=phone_digest AND purpose=challenge_purpose AND state='pending';
  INSERT INTO core.otp_challenge(phone_hash,ip_hash,purpose,otp_hash,command,binding,environment,created_at,expires_at,
    resend_seconds,max_failures,config_version)
    VALUES(phone_digest,ip_digest,challenge_purpose,code_digest,command_ref,context,target_environment,reserved_at,expiry,
      resend,failures,configuration->>'version') RETURNING * INTO reserved;
  RETURN jsonb_build_object('code','OK','challenge_id',reserved.id,'expires_at',reserved.expires_at,'retry_after',resend,'reused',false);
END $$;

CREATE OR REPLACE FUNCTION core.consume_otp_challenge(challenge_ref uuid,candidate_hash text,expected_purpose text,expected_context jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE challenge core.otp_challenge; qualification jsonb; configuration jsonb;
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
    qualification:=core.otp_registration_context_result(challenge.binding,challenge.environment);
    IF qualification->>'code'<>'OK' THEN RETURN qualification; END IF;
  END IF;
  configuration:=core.otp_configuration_result(challenge.environment);
  IF configuration->>'code'<>'OK' THEN RETURN configuration; END IF;
  IF challenge.attempts>=challenge.max_failures THEN
    UPDATE core.otp_challenge SET state='locked' WHERE id=challenge_ref;
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  IF challenge.otp_hash<>candidate_hash THEN
    UPDATE core.otp_challenge SET attempts=attempts+1,
      state=CASE WHEN attempts+1>=max_failures THEN 'locked' ELSE 'pending' END WHERE id=challenge_ref;
    RETURN jsonb_build_object('code','OTP_INVALID');
  END IF;
  UPDATE core.otp_challenge SET state='consumed',consumed_at=clock_timestamp() WHERE id=challenge_ref;
  RETURN jsonb_build_object('code','OK');
END $$;
