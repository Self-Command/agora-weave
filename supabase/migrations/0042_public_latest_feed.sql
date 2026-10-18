-- Creation-time ordering uses the installed resource model; no publication clock is inferred.
CREATE FUNCTION core.latest_public_feed_result(actor uuid,session_ref uuid,target_environment text,client_release text,
  page_limit integer,cursor_position uuid DEFAULT NULL,cursor_created timestamptz DEFAULT NULL,cursor_version text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; active_version text; entry record; checked jsonb;
  items jsonb:='[]'::jsonb; item_count integer:=0; more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 OR client_release IS NULL OR
      client_release !~ '^[A-Za-z0-9_.-]{1,128}$' OR
      (cursor_position IS NULL)<>(cursor_created IS NULL) OR
      (cursor_position IS NULL)<>(cursor_version IS NULL) OR
      (cursor_created IS NOT NULL AND NOT isfinite(cursor_created)) THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  SELECT b.version INTO active_version FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.schema_version=1 AND b.effective_at<=clock_timestamp()
      AND b.compat @> jsonb_build_object('mobile',jsonb_build_array(client_release));
  IF active_version IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF cursor_position IS NOT NULL AND cursor_version IS DISTINCT FROM active_version THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  -- Public qualification includes every transitive source. A signed-in caller can
  -- lose items to blocking/sanctions but cannot gain followers/self-only sources.
  FOR entry IN
    WITH public_candidates AS MATERIALIZED (
      SELECT r.id,r.created_at,core.resource_action_result(NULL,NULL,r.id,'resource.read','read') AS admitted
      FROM core.resource r WHERE r.kind='post' AND r.visibility='public'
    ), eligible AS MATERIALIZED (
      SELECT p.id,p.created_at FROM public_candidates p WHERE p.admitted->>'code'='OK'
        AND (actor IS NULL OR core.resource_action_result(actor,session_ref,p.id,'resource.read','read')->>'code'='OK')
    )
    SELECT e.id,e.created_at FROM eligible e
      WHERE cursor_position IS NULL OR (e.created_at,e.id)<(cursor_created,cursor_position)
      ORDER BY e.created_at DESC,e.id DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true; EXIT; END IF;
    -- Recheck current output eligibility after selecting the page, while admission is held.
    checked:=core.resource_action_result(NULL,NULL,entry.id,'resource.read','read');
    IF checked->>'code'<>'OK' THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    IF actor IS NOT NULL THEN
      checked:=core.resource_action_result(actor,session_ref,entry.id,'resource.read','read');
      IF checked->>'code'<>'OK' THEN RETURN jsonb_build_object('code',CASE WHEN checked->>'code'='SESSION_INVALID'
        THEN 'SESSION_INVALID' ELSE 'SERVICE_UNAVAILABLE' END); END IF;
    END IF;
    items:=items || jsonb_build_array((checked->'data') || jsonb_build_object('created_at',
      to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    item_count:=item_count+1; last_id:=entry.id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','config_version',active_version,'items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,'next_created_at',CASE WHEN more THEN
      to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;
REVOKE ALL ON FUNCTION core.latest_public_feed_result(uuid,uuid,text,text,integer,uuid,timestamptz,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.latest_public_feed_result(uuid,uuid,text,text,integer,uuid,timestamptz,text) TO core_runtime;
