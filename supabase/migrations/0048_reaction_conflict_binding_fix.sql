-- Use the concrete unique constraint to avoid PL/pgSQL actor parameter ambiguity.
CREATE OR REPLACE FUNCTION core.set_resource_like_result(
  actor uuid,session_ref uuid,target_environment text,target_id uuid,command uuid,
  payload_hash text,desired_active boolean
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; admitted jsonb; previous core.operation; target core.resource;
  reaction_row core.reaction; operation_ref uuid; receipt jsonb; like_count bigint;
  action_name text;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target_id IS NULL OR command IS NULL OR desired_active IS NULL OR payload_hash IS NULL
    OR payload_hash !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  action_name:=CASE WHEN desired_active THEN 'like.put' ELSE 'like.remove' END;
  admitted:=core.resource_action_result(actor,session_ref,target_id,'resource.read','read');
  IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
  SELECT * INTO target FROM core.resource r WHERE r.id=target_id AND r.kind IN ('post','comment');
  IF target.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=target_id)
    AND s.functions && ARRAY['like','like.put','like.remove','interact','write','all']::text[])
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO previous FROM core.operation op WHERE op.actor=set_resource_like_result.actor
    AND op.action=action_name AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment
      OR previous.result_ref<>target_id THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  INSERT INTO core.reaction(actor,target,kind,active) VALUES (actor,target_id,'like',desired_active)
    ON CONFLICT ON CONSTRAINT reaction_actor_target_kind_key DO UPDATE SET active=EXCLUDED.active RETURNING * INTO reaction_row;
  SELECT count(*) INTO like_count FROM core.reaction r JOIN core.account a ON a.id=r.actor
    WHERE r.target=target_id AND r.kind='like' AND r.active AND a.status='active';
  receipt:=jsonb_build_object('target_id',target_id,'active',desired_active,'count',like_count);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,action_name,command,payload_hash,target_id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,action_name,target_id,target_environment,'core','Actor changed resource like',
      CASE WHEN desired_active THEN 'active' ELSE 'removed' END,command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.set_resource_like_result(uuid,uuid,text,uuid,uuid,text,boolean)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.set_resource_like_result(uuid,uuid,text,uuid,uuid,text,boolean)
  TO core_runtime;

