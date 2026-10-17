-- A published pointer cannot make a future release readable before its server clock.
CREATE OR REPLACE FUNCTION core.document_read_result(target_environment text,stable_key text,document_kind text,document_locale text,surface text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    document_kind IS NULL OR document_kind NOT IN ('community_rules','privacy','terms','processing_notice','help') OR
    document_locale IS NULL OR document_locale !~ '^[a-z]{2,8}(-[A-Z]{2,8})?$' OR
    surface IS NULL OR surface NOT IN ('app','share','admin') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT jsonb_build_object('release_id',r.id,'stable_key',d.stable_key,'kind',d.kind,'locale',d.locale,'title',v.title,
    'body',v.body,'digest',r.content_digest,'state',r.state,'published_at',r.published_at) INTO result
    FROM core.managed_document d JOIN core.document_release r ON r.id=d.active_release_id AND r.document_id=d.id AND r.state='published'
    JOIN core.document_revision v ON v.id=r.revision_ref AND v.document_id=d.id AND v.state='ready' AND v.content_digest=r.content_digest
    WHERE d.stable_key=document_read_result.stable_key AND d.kind=document_kind AND d.locale=document_locale AND surface=ANY(d.public_surfaces)
      AND r.scope->>'environment'=target_environment AND r.scope->'surfaces' ? surface
      AND r.published_at<=clock_timestamp();
  IF result IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',result);
END $$;
