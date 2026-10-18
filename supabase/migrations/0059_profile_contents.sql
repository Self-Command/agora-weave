-- Current, approved profile posts. Each item is admitted again at read time;
-- pending revisions and private management data have no profile listing path.
CREATE FUNCTION core.profile_contents_result(actor uuid,session_ref uuid,target_environment text,
  target_account uuid,content_type text,client_release text,page_limit integer,
  cursor_position uuid DEFAULT NULL,cursor_created timestamptz DEFAULT NULL,cursor_version text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; active_version text; entry record; checked jsonb; item jsonb; image_list jsonb;
  items jsonb:='[]'::jsonb; item_count integer:=0; more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF target_account IS NULL OR content_type NOT IN ('posts','media') OR page_limit IS NULL
    OR page_limit NOT BETWEEN 1 AND 50 OR client_release IS NULL
    OR client_release !~ '^[A-Za-z0-9_.-]{1,128}$'
    OR (cursor_position IS NULL)<>(cursor_created IS NULL)
    OR (cursor_position IS NULL)<>(cursor_version IS NULL)
    OR (cursor_created IS NOT NULL AND NOT isfinite(cursor_created))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  checked:=core.read_profile_result(actor,session_ref,target_account,target_environment);
  IF checked->>'code'<>'OK' THEN RETURN checked; END IF;
  SELECT b.version INTO active_version FROM core.config_activation a
    JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1
      AND b.effective_at<=clock_timestamp() AND b.compat @> jsonb_build_object('mobile',jsonb_build_array(client_release));
  IF active_version IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF cursor_position IS NOT NULL AND cursor_version IS DISTINCT FROM active_version
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN
    WITH candidates AS MATERIALIZED (
      SELECT r.id,r.created_at,r.current_revision_id,
        core.resource_action_result(actor,session_ref,r.id,'resource.read','read') AS admitted
      FROM core.resource r WHERE r.author_id=target_account AND r.kind='post'
        AND r.publication_state='published' AND r.deleted_at IS NULL
        AND (content_type='posts' OR EXISTS(
          SELECT 1 FROM core.post_image_binding b WHERE b.resource_id=r.id AND b.revision_id=r.current_revision_id))
    )
    SELECT c.id,c.created_at,c.current_revision_id FROM candidates c
      WHERE c.admitted->>'code'='OK'
        AND (cursor_position IS NULL OR (c.created_at,c.id)<(cursor_created,cursor_position))
      ORDER BY c.created_at DESC,c.id DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true; EXIT; END IF;
    checked:=core.resource_action_result(actor,session_ref,entry.id,'resource.read','read');
    IF checked->>'code'<>'OK' THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    SELECT coalesce(jsonb_agg(jsonb_build_object('media_id',m.id,'position',b.position,
      'alt_text','','kind','image','mime',m.detected_mime,'size_bytes',m.size_bytes) ORDER BY b.position),'[]'::jsonb)
      INTO image_list FROM core.post_image_binding b JOIN core.media_object m ON m.id=b.media_id
      WHERE b.resource_id=entry.id AND b.revision_id=entry.current_revision_id
        AND m.state='bound' AND m.bound_resource=entry.id;
    IF jsonb_array_length(checked->'data'->'media_refs')<>jsonb_array_length(image_list)
      THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    item:=(checked->'data') - 'media_refs' ||
      jsonb_build_object('tags','[]'::jsonb,'mentions','[]'::jsonb,'media',image_list,
        'reply_scope',coalesce((SELECT p.scope FROM core.reply_policy p WHERE p.post_id=entry.id),'all_readers'),
        'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
        'allowed_actions','[]'::jsonb);
    items:=items || jsonb_build_array(item);
    item_count:=item_count+1; last_id:=entry.id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,'next_created_at',CASE WHEN more THEN
      to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
    'config_version',active_version);
END $$;
REVOKE ALL ON FUNCTION core.profile_contents_result(uuid,uuid,text,uuid,text,text,integer,uuid,timestamptz,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.profile_contents_result(uuid,uuid,text,uuid,text,text,integer,uuid,timestamptz,text)
  TO core_runtime;
