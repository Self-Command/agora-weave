-- A block is a current policy fact. The existing block_relationships trigger removes
-- effective follows in both directions in the same transaction as a new block.
CREATE FUNCTION core.set_account_block_result(
  actor uuid, session_ref uuid, target_environment text, target_id uuid,
  command uuid, payload_hash text, desired_active boolean
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; target core.account;
  existing core.block; operation_ref uuid; receipt jsonb; action_name text;
BEGIN
  -- Serialize with policy reads, relationship writes, and other block commands.
  PERFORM pg_advisory_xact_lock(17013,1);
  context := core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target_id IS NULL OR target_id=actor OR command IS NULL OR desired_active IS NULL
    OR payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  action_name := CASE WHEN desired_active THEN 'block.put' ELSE 'block.remove' END;
  SELECT * INTO previous FROM core.operation op
    WHERE op.actor=set_account_block_result.actor AND op.action=action_name AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment
      OR previous.result_ref<>target_id THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  SELECT * INTO target FROM core.account a WHERE a.id=target_id;
  IF target.id IS NULL OR desired_active AND target.status<>'active' THEN
    RETURN jsonb_build_object('code','NOT_FOUND');
  END IF;
  -- The operation lookup endpoint is actor/ID scoped; a second action with the
  -- same ID would make an unknown-outcome lookup ambiguous.
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=set_account_block_result.actor
    AND op.operation_id=command) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;

  SELECT * INTO existing FROM core.block b WHERE b.blocker_id=actor AND b.blocked_id=target_id AND b.active;
  IF desired_active AND existing.id IS NULL THEN
    INSERT INTO core.block(blocker_id,blocked_id) VALUES (actor,target_id);
    -- INSERT triggers the durable deny journal and removes both effective follows.
  ELSIF NOT desired_active AND existing.id IS NOT NULL THEN
    UPDATE core.block SET active=false,revoked_at=clock_timestamp() WHERE id=existing.id;
    -- Revoking the fact never restores either follow direction.
  END IF;

  receipt := jsonb_build_object('operation_id',command,'state','succeeded',
    'target_ref',target_id,'allowed_actions','[]'::jsonb);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,action_name,command,payload_hash,target_id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,action_name,target_id,target_environment,'core',
      'Actor changed account block',CASE WHEN desired_active THEN 'active' ELSE 'removed' END,command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.set_account_block_result(uuid,uuid,text,uuid,uuid,text,boolean)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.set_account_block_result(uuid,uuid,text,uuid,uuid,text,boolean)
  TO core_runtime;

-- Keep unknown-outcome lookup available for these commands. This is the
-- five-argument app lookup; the older four-argument overload remains unchanged.
CREATE OR REPLACE FUNCTION core.account_operation_result(
  actor uuid,session_ref uuid,command_ref uuid,target_environment text,jwt_aal text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_entry core.operation; v_matches integer; v_result jsonb; v_receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO v_matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove','block.put','block.remove');
  IF v_matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF v_matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO v_entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove','block.put','block.remove');
  IF v_entry.action IN ('config.release','config.rollback') THEN
    IF jwt_aal IS NULL THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
    v_result:=core.admin_identity_context(actor,session_ref,target_environment,jwt_aal,true);
    IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
    IF NOT core.admin_has_permission(actor,target_environment,v_entry.action)
      OR NOT core.admin_has_permission(actor,target_environment,'config.read') THEN
      RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
    SELECT p.receipt INTO v_receipt FROM core.admin_config_publication p
      WHERE p.actor=account_operation_result.actor AND p.environment=target_environment
        AND p.operation_id=command_ref AND 'config.' || p.kind=v_entry.action;
  ELSIF v_entry.action IN ('post.create','comment.create') THEN
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=v_entry.result_ref
      AND r.author_id=actor AND r.deleted_at IS NULL) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  ELSIF v_entry.action IN ('like.put','like.remove') THEN
    v_result:=core.resource_action_result(actor,session_ref,v_entry.result_ref,'resource.read','read');
    IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  ELSIF v_entry.action IN ('block.put','block.remove') THEN
    -- A block receipt contains only the target ID, never the target profile or
    -- reciprocal block state. The actor's current session was checked above.
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  END IF;
  IF v_entry.action IN ('post.create','comment.create','like.put','like.remove','block.put','block.remove')
    AND v_receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',v_entry.operation_id,'action',v_entry.action,'state',v_entry.state)
    || CASE WHEN v_receipt IS NOT NULL THEN jsonb_build_object('result',v_receipt) ELSE '{}'::jsonb END);
END $$;
