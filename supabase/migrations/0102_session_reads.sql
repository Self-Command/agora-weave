CREATE FUNCTION core.list_sessions_result(actor uuid, session_ref uuid, target_environment text, client_release text,
  page_limit integer, cursor_position uuid DEFAULT NULL, cursor_version text DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE active_version text; anchor_created timestamptz; entry record;
  items jsonb := '[]'::jsonb; item_count integer := 0; more boolean := false; last_id uuid;
BEGIN
  IF NOT core.current_identity(actor, session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target_environment NOT IN ('dev','test','production') OR page_limit NOT BETWEEN 1 AND 50 THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  SELECT b.version INTO active_version FROM core.config_activation a
    JOIN core.config_bundle b ON b.version = a.active_ptr
    WHERE a.environment = target_environment AND b.state = 'active' AND b.schema_version = 1
      AND b.compat @> jsonb_build_object('mobile',jsonb_build_array(client_release));
  IF active_version IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF cursor_position IS NOT NULL THEN
    IF cursor_version IS DISTINCT FROM active_version THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    SELECT r.created_at INTO anchor_created FROM core.session_registry r WHERE r.id = cursor_position AND r.account_id = actor;
    IF anchor_created IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END IF;
  FOR entry IN SELECT r.id,r.device_label,r.trusted_at,r.created_at,r.row_version,r.session_id = session_ref AS current
    FROM core.session_registry r JOIN auth.sessions s ON s.id = r.session_id AND s.user_id = actor
    WHERE r.account_id = actor AND r.revoked_at IS NULL AND (s.not_after IS NULL OR s.not_after > clock_timestamp())
      AND (cursor_position IS NULL OR (r.created_at,r.id) < (anchor_created,cursor_position))
    ORDER BY r.created_at DESC,r.id DESC LIMIT page_limit + 1
  LOOP
    IF item_count = page_limit THEN more := true; EXIT; END IF;
    items := items || jsonb_build_array(jsonb_build_object('id',entry.id,'device_label',entry.device_label,
      'current',entry.current,'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'trusted_at',CASE WHEN entry.trusted_at IS NULL THEN NULL ELSE to_char(entry.trusted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') END,
      'row_version',entry.row_version));
    item_count := item_count + 1; last_id := entry.id;
  END LOOP;
  RETURN jsonb_build_object('code','OK','config_version',active_version,'items',items,
    'has_more',more,'next_id',CASE WHEN more THEN last_id ELSE NULL END);
END $$;
REVOKE ALL ON FUNCTION core.list_sessions_result(uuid,uuid,text,text,integer,uuid,text) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION core.list_sessions_result(uuid,uuid,text,text,integer,uuid,text) TO core_runtime;
