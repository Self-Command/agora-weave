-- Public document reads use current publication and audience scopes, including for history.
CREATE FUNCTION core.document_release_read_result(target_environment text,target_key text,target_release uuid,
  target_kind text,target_locale text,target_surface text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    target_key IS NULL OR char_length(target_key) NOT BETWEEN 2 AND 128 OR
    target_kind IS NOT NULL AND target_kind NOT IN ('community_rules','privacy','terms','processing_notice','help') OR
    target_locale IS NULL OR target_locale !~ '^[a-z]{2,8}(-[A-Z]{2,8})?$' OR
    target_surface IS NULL OR target_surface NOT IN ('app','share') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  SELECT jsonb_build_object('document_id',d.id,'release_id',r.id,'stable_key',d.stable_key,'kind',d.kind,'locale',d.locale,
      'title',v.title,'body',v.body,'digest',r.content_digest,'state',r.state,'published_at',r.published_at,
      'is_current',r.id=d.active_release_id AND r.state='published',
      'scope',jsonb_strip_nulls(jsonb_build_object('environment',target_environment,'surfaces',jsonb_build_array(target_surface),
        'purposes',CASE WHEN jsonb_typeof(r.scope->'purposes')='array' THEN
          (SELECT jsonb_agg(p.value) FROM jsonb_array_elements(r.scope->'purposes') p WHERE jsonb_typeof(p.value)='string') END)))
    INTO result
    FROM core.managed_document d JOIN core.document_release r ON r.document_id=d.id
    JOIN core.document_revision v ON v.id=r.revision_ref AND v.document_id=d.id AND v.state='ready' AND v.content_digest=r.content_digest
    WHERE CASE WHEN target_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        THEN d.id::text=lower(target_key) ELSE d.stable_key=target_key END
      AND (target_kind IS NULL OR d.kind=target_kind) AND d.locale=target_locale AND target_surface=ANY(d.public_surfaces)
      AND r.scope @> jsonb_build_object('environment',target_environment,'surfaces',jsonb_build_array(target_surface))
      AND r.published_at<=clock_timestamp()
      AND (target_release IS NULL AND r.id=d.active_release_id AND r.state='published' OR
        target_release IS NOT NULL AND r.id=target_release AND
          (r.state='superseded' OR r.state='published' AND r.id=d.active_release_id));
  IF result IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',result);
END $$;

CREATE FUNCTION core.document_current_set_result(target_environment text,target_key text,target_kind text,
  target_locale text,target_surface text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE documents jsonb; set_digest text; document_count integer;
BEGIN
  IF target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    target_key IS NOT NULL AND (char_length(target_key) NOT BETWEEN 2 AND 128 OR target_key !~ '^[a-zA-Z][a-zA-Z0-9_.-]+$') OR
    target_kind IS NULL OR target_kind NOT IN ('community_rules','privacy','terms','processing_notice','help') OR
    target_locale IS NULL OR target_locale !~ '^[a-z]{2,8}(-[A-Z]{2,8})?$' OR
    target_surface IS NULL OR target_surface NOT IN ('app','share') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  SELECT jsonb_agg(item ORDER BY stable_key,locale,release_id),
    encode(sha256(convert_to(string_agg(release_id || ':' || digest,',' ORDER BY stable_key,locale,release_id),'UTF8')),'hex'),count(*)
    INTO documents,set_digest,document_count FROM (
      SELECT result->'data' AS item,d.stable_key,d.locale,result->'data'->>'release_id' AS release_id,result->'data'->>'digest' AS digest
      FROM core.managed_document d
      CROSS JOIN LATERAL (SELECT core.document_release_read_result(target_environment,d.id::text,NULL::uuid,
        target_kind,target_locale,target_surface) AS result) published
      WHERE d.kind=target_kind AND d.locale=target_locale AND (target_key IS NULL OR d.stable_key=target_key)
        AND target_surface=ANY(d.public_surfaces) AND result->>'code'='OK'
      ORDER BY d.stable_key,d.locale,d.id LIMIT 51
    ) current_documents;
  IF document_count=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  -- Never return a partial set with a digest that could be mistaken for the complete set.
  IF document_count>50 THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('documents',documents,'document_set_digest',set_digest));
END $$;

-- Keep the existing stable-key current reader on the same publication rules.
CREATE OR REPLACE FUNCTION core.document_read_result(target_environment text,stable_key text,document_kind text,
  document_locale text,surface text) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT core.document_release_read_result(target_environment,stable_key,NULL::uuid,document_kind,document_locale,surface)
$$;
REVOKE ALL ON FUNCTION core.document_release_read_result(text,text,uuid,text,text,text),
  core.document_current_set_result(text,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION core.document_release_read_result(text,text,uuid,text,text,text),
  core.document_current_set_result(text,text,text,text,text) TO core_runtime;
