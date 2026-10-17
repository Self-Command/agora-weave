CREATE OR REPLACE FUNCTION core.effective_config_result(actor uuid,session_ref uuid,target_environment text,consumer text,audience text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE version_ref text;values_out jsonb;bundle jsonb;
BEGIN
  IF target_environment NOT IN ('dev','test','production') OR consumer NOT IN ('api','mobile','share','admin') OR
    audience NOT IN ('authenticated','share-read') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF audience='authenticated' AND NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF audience='share-read' AND actor IS NOT NULL THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT b.version,b.scoped_values INTO version_ref,bundle FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1
      AND b.compat @> jsonb_build_object(consumer,jsonb_build_array('fixture-v1'));
  IF version_ref IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  SELECT coalesce(jsonb_object_agg(d.key,bundle->'global'->d.key),'{}'::jsonb) INTO values_out
    FROM core.config_definition d WHERE d.permissions && ARRAY['config.read']
      AND (audience<>'share-read' OR (d.key LIKE 'ui.%' OR d.key LIKE 'sharing.%' OR d.owner IN ('ui','sharing')))
      AND bundle->'global' ? d.key;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('version',version_ref,'values',coalesce(values_out,'{}'::jsonb)));
END $$;
