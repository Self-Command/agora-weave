CREATE FUNCTION core.effective_config_result(actor uuid,session_ref uuid,target_environment text,consumer text,audience text) RETURNS jsonb
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
    FROM core.config_definition d WHERE d.sensitive=false AND d.permissions && ARRAY['config.read']
      AND (audience<>'share-read' OR (d.key LIKE 'ui.%' OR d.key LIKE 'sharing.%' OR d.owner IN ('ui','sharing')))
      AND d.consumer_ids @> ARRAY[consumer] AND bundle->'global' ? d.key;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('version',version_ref,'values',coalesce(values_out,'{}'::jsonb)));
END $$;

CREATE FUNCTION core.document_read_result(target_environment text,stable_key text,document_kind text,document_locale text,surface text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF target_environment NOT IN ('dev','test','production') OR document_kind NOT IN ('community_rules','privacy','terms','processing_notice','help') OR
    document_locale !~ '^[a-z]{2,8}(-[A-Z]{2,8})?$' OR surface NOT IN ('app','share','admin') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT jsonb_build_object('release_id',r.id,'stable_key',d.stable_key,'kind',d.kind,'locale',d.locale,'title',v.title,
    'body',v.body,'digest',r.content_digest,'state',r.state,'published_at',r.published_at) INTO result
    FROM core.managed_document d JOIN core.document_release r ON r.id=d.active_release_id AND r.state='published'
    JOIN core.document_revision v ON v.id=r.revision_ref AND v.state='ready' AND v.content_digest=r.content_digest
    WHERE d.stable_key=stable_key AND d.kind=document_kind AND d.locale=document_locale AND surface=ANY(d.public_surfaces)
      AND r.scope->>'environment'=target_environment AND r.scope->'surfaces' ? surface;
  IF result IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',result);
END $$;

CREATE FUNCTION core.media_read_result(actor uuid,session_ref uuid,target uuid,variant text DEFAULT 'original') RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry record;permission jsonb;
BEGIN
  IF variant NOT IN ('original','thumbnail','preview','segment') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF actor IS NULL OR NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT m.*,r.bound_resource INTO entry FROM core.media_object m LEFT JOIN core.resource r ON r.id=m.bound_resource WHERE m.id=target;
  IF entry.id IS NULL OR entry.state NOT IN ('validated','reviewed','bound') OR entry.bound_resource IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  permission:=core.read_resource_result(actor,session_ref,entry.bound_resource);
  IF permission->>'code'<>'OK' THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF variant='original' THEN RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,'mime',entry.detected_mime,
    'codec',entry.codec,'size_bytes',entry.size_bytes,'duration_ms',entry.duration_ms,'variant','original'));
  END IF;
  IF NOT EXISTS(SELECT 1 FROM core.media_derivative d WHERE d.parent_media=entry.id AND d.kind=variant AND d.state='ready') THEN
    RETURN jsonb_build_object('code','NOT_FOUND');
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,'mime',entry.detected_mime,'variant',variant));
END $$;

REVOKE ALL ON FUNCTION core.effective_config_result(uuid,uuid,text,text,text),core.document_read_result(text,text,text,text,text),core.media_read_result(uuid,uuid,uuid,text)
  FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.effective_config_result(uuid,uuid,text,text,text),core.document_read_result(text,text,text,text,text),core.media_read_result(uuid,uuid,uuid,text) TO core_runtime;
