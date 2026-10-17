-- Correct installed read functions through an additive migration.
CREATE OR REPLACE FUNCTION core.document_read_result(target_environment text,stable_key text,document_kind text,document_locale text,surface text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF target_environment NOT IN ('dev','test','production') OR document_kind NOT IN ('community_rules','privacy','terms','processing_notice','help') OR
    document_locale !~ '^[a-z]{2,8}(-[A-Z]{2,8})?$' OR surface NOT IN ('app','share','admin') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT jsonb_build_object('release_id',r.id,'stable_key',d.stable_key,'kind',d.kind,'locale',d.locale,'title',v.title,
    'body',v.body,'digest',r.content_digest,'state',r.state,'published_at',r.published_at) INTO result
    FROM core.managed_document d JOIN core.document_release r ON r.id=d.active_release_id AND r.document_id=d.id AND r.state='published'
    JOIN core.document_revision v ON v.id=r.revision_ref AND v.document_id=d.id AND v.state='ready' AND v.content_digest=r.content_digest
    WHERE d.stable_key=document_read_result.stable_key AND d.kind=document_kind AND d.locale=document_locale AND surface=ANY(d.public_surfaces)
      AND r.scope->>'environment'=target_environment AND r.scope->'surfaces' ? surface;
  IF result IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',result);
END $$;

CREATE OR REPLACE FUNCTION core.media_read_result(actor uuid,session_ref uuid,target uuid,variant text DEFAULT 'original') RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.media_object;derivative core.media_derivative;permission jsonb;
BEGIN
  IF variant NOT IN ('original','thumbnail','preview','segment') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF actor IS NOT NULL AND NOT core.current_identity(actor,session_ref) OR actor IS NULL AND session_ref IS NOT NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT * INTO entry FROM core.media_object m WHERE m.id=target AND m.state='bound';
  IF entry.id IS NULL OR entry.bound_resource IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  permission:=core.resource_action_result(actor,session_ref,entry.bound_resource,'media.read','read');
  IF permission->>'code'<>'OK' THEN RETURN jsonb_build_object('code',permission->>'code'); END IF;
  IF variant='original' THEN RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,'mime',entry.detected_mime,
    'codec',entry.codec,'size_bytes',entry.size_bytes,'duration_ms',entry.duration_ms,'variant','original','hash',entry.sha256),
    'source',jsonb_build_object('bucket',entry.bucket,'key',entry.object_internal_key)); END IF;
  SELECT * INTO derivative FROM core.media_derivative d WHERE d.parent_media=entry.id AND d.kind=variant AND d.state='ready' ORDER BY d.id LIMIT 1;
  IF derivative.id IS NULL OR derivative.object_internal_key IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,'mime',entry.detected_mime,'variant',variant,'size_bytes',derivative.size,'hash',derivative.hash),
    'source',jsonb_build_object('bucket',entry.bucket,'key',derivative.object_internal_key));
END $$;

-- Storage is reachable only inside the service network. This role can read the
-- exact object requested by the gateway, while the gateway holds read admission.
CREATE ROLE core_media NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT core_media TO authenticator;
GRANT USAGE ON SCHEMA storage TO core_media;
GRANT SELECT ON storage.objects TO core_media;
CREATE POLICY core_gateway_read ON storage.objects FOR SELECT TO core_media USING
  (bucket_id=auth.jwt()->>'bucket' AND name=auth.jwt()->>'object_key');
