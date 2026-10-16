CREATE FUNCTION core.account_operation_result(actor uuid, session_ref uuid, command_ref uuid, target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE entry core.operation;
BEGIN
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT');
  END IF;
  SELECT * INTO entry FROM core.operation op WHERE op.actor = account_operation_result.actor
    AND op.environment = target_environment AND op.operation_id = command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout') ORDER BY op.id LIMIT 1;
  IF entry.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',entry.operation_id,'action',entry.action,'state',entry.state));
END $$;
REVOKE ALL ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text) TO core_runtime;
