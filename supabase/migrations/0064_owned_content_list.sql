-- Author-only current revisions, including accepted posts still awaiting review.
-- The public profile and feed gates remain published-and-approved only.
CREATE FUNCTION core.list_owned_contents_result(actor uuid,session_ref uuid,env text,
  page_limit integer,cursor_position uuid DEFAULT NULL,cursor_created timestamptz DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; entry record; items jsonb:='[]'::jsonb; item_count integer:=0;
  more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50
    OR (cursor_position IS NULL)<>(cursor_created IS NULL)
    OR (cursor_created IS NOT NULL AND NOT isfinite(cursor_created))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT r.id AS resource_id,r.created_at,v.id,v.revision_no,v.body,v.tags,v.mentions,
      v.alt_text,v.review_state,v.submitted_at
    FROM core.resource r JOIN core.content_revision v ON v.id=r.current_revision_id AND v.resource_id=r.id
    WHERE r.author_id=actor AND r.kind='post' AND r.deleted_at IS NULL AND v.submitted_at IS NOT NULL
      AND r.publication_state IN ('pending','published','rejected')
      AND (cursor_position IS NULL OR (r.created_at,r.id)<(cursor_created,cursor_position))
    ORDER BY r.created_at DESC,r.id DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object(
      'id',entry.id,'resource_id',entry.resource_id,'revision_no',entry.revision_no,
      'body',entry.body,'tags',to_jsonb(entry.tags),'mentions',to_jsonb(entry.mentions),
      'alt_text',CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END,
      'media_refs',coalesce((SELECT jsonb_agg(b.media_id ORDER BY b.position)
        FROM core.post_image_binding b WHERE b.resource_id=entry.resource_id AND b.revision_id=entry.id),'[]'::jsonb),
      'review_state',entry.review_state,
      'submitted_at',to_char(entry.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    item_count:=item_count+1; last_id:=entry.resource_id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_created_at',CASE WHEN more THEN to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;
REVOKE ALL ON FUNCTION core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)
  TO core_runtime;
