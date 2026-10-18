-- A like toggle must read the current user's reaction before choosing PUT or DELETE.
-- Keep the read behind the same current resource gate as writes.
CREATE FUNCTION core.read_resource_like_result(actor uuid,session_ref uuid,target_environment text,target_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; admission jsonb; active_now boolean; visible_count bigint;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target_id IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  admission:=core.resource_action_result(actor,session_ref,target_id,'resource.read','read');
  IF admission->>'code'<>'OK' THEN RETURN admission; END IF;
  SELECT EXISTS(SELECT 1 FROM core.reaction r WHERE r.actor=actor AND r.target=target_id
      AND r.kind='like' AND r.active) INTO active_now;
  SELECT count(*) INTO visible_count FROM core.reaction r JOIN core.account a ON a.id=r.actor
    WHERE r.target=target_id AND r.kind='like' AND r.active AND a.status='active';
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'target_id',target_id,'active',active_now,'count',visible_count));
END $$;
REVOKE ALL ON FUNCTION core.read_resource_like_result(uuid,uuid,text,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.read_resource_like_result(uuid,uuid,text,uuid) TO core_runtime;
