-- Keep the existing management list aligned with the shared current-revision DTO.
CREATE OR REPLACE FUNCTION core.admin_review_page_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  page_limit integer,after_id uuid) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; items jsonb:='[]'::jsonb; entry record; count_items integer:=0; more boolean:=false; last_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read');
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT v.*,r.id AS target_resource FROM core.content_revision v
    JOIN core.resource r ON r.id=v.resource_id AND r.current_revision_id=v.id
    WHERE v.submitted_at IS NOT NULL
      AND r.deleted_at IS NULL AND r.moderation_ref IS NULL
      AND ((v.review_state='pending' AND r.publication_state='pending')
        OR (v.review_state='approved' AND r.publication_state='published')
        OR (v.review_state='rejected' AND r.publication_state='rejected'))
      AND (after_id IS NULL OR v.id<after_id)
      AND core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read',r.id)->>'code'='OK'
    ORDER BY v.id DESC LIMIT page_limit+1
  LOOP
    IF count_items=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object('id',entry.id,'resource_id',entry.resource_id,
      'revision_no',entry.revision_no,'body',entry.body,'tags',entry.tags,'mentions',entry.mentions,
      'alt_text',CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END,
      'media_refs',coalesce((SELECT jsonb_agg(b.media_id ORDER BY b.position) FROM core.post_image_binding b WHERE b.revision_id=entry.id),'[]'::jsonb),
      'publication_state',CASE entry.review_state WHEN 'pending' THEN 'awaiting_review' WHEN 'approved' THEN 'published' ELSE 'rejected' END,
      'review_state',entry.review_state,'submitted_at',to_char(entry.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    count_items:=count_items+1; last_id:=entry.id;
  END LOOP;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',items,
    'next_cursor',CASE WHEN more THEN last_id::text END,'has_more',more));
END $$;


