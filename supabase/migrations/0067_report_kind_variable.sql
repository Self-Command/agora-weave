-- Local PL/pgSQL variables require a named block or a non-colliding identifier.
CREATE OR REPLACE FUNCTION core.create_report_result(
  actor uuid,session_ref uuid,target_environment text,payload jsonb,payload_hash text,reason_length integer
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; target_id uuid; command uuid; v_target_kind text;
  resource_row core.resource; report_row core.report; receipt jsonb; operation_ref uuid; admitted jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$'
    OR reason_length IS NULL OR reason_length NOT BETWEEN 1 AND 2000
    OR NOT (payload ?& ARRAY['operation_id','target_kind','target_id','reason']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload)) NOT BETWEEN 4 AND 5
    OR EXISTS (SELECT 1 FROM jsonb_object_keys(payload) AS k(key)
      WHERE k.key NOT IN ('operation_id','target_kind','target_id','reason','evidence_refs'))
    OR jsonb_typeof(payload->'operation_id')<>'string'
    OR jsonb_typeof(payload->'target_id')<>'string'
    OR jsonb_typeof(payload->'target_kind')<>'string'
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'target_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'target_kind' NOT IN ('account','post','comment','message')
    OR jsonb_typeof(payload->'reason')<>'string' OR char_length(payload->>'reason') NOT BETWEEN 1 AND 2000
    OR btrim(payload->>'reason',E' \t\n\r')=''
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF payload ? 'evidence_refs' THEN
    IF jsonb_typeof(payload->'evidence_refs')<>'array' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    IF jsonb_array_length(payload->'evidence_refs')>9
      OR EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'evidence_refs') AS e(value)
        WHERE jsonb_typeof(e.value)<>'string')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(payload->'evidence_refs') AS e(ref)
      WHERE e.ref !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    IF (SELECT count(*) FROM jsonb_array_elements_text(payload->'evidence_refs')) <>
      (SELECT count(DISTINCT e.ref) FROM jsonb_array_elements_text(payload->'evidence_refs') AS e(ref))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END IF;
  command:=(payload->>'operation_id')::uuid;
  target_id:=(payload->>'target_id')::uuid;
  v_target_kind:=payload->>'target_kind';
  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_report_result.actor
    AND op.action='report.create' AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.environment<>target_environment OR previous.payload_hash<>payload_hash
      OR previous.result_ref IS NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=create_report_result.actor
    AND op.operation_id=command) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF v_target_kind='account' THEN
    IF NOT EXISTS (SELECT 1 FROM core.account a WHERE a.id=target_id AND a.status='active')
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  ELSIF v_target_kind IN ('post','comment') THEN
    admitted:=core.resource_action_result(actor,session_ref,target_id,'resource.read','read');
    IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
    SELECT * INTO resource_row FROM core.resource r WHERE r.id=target_id AND r.kind=v_target_kind;
    IF resource_row.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  ELSE
    -- Direct-message storage is not yet in the first release schema.
    RETURN jsonb_build_object('code','NOT_FOUND');
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(coalesce(payload->'evidence_refs','[]'::jsonb)) AS e(ref)
    WHERE NOT EXISTS (SELECT 1 FROM core.media_object m WHERE m.id=e.ref::uuid AND m.owner=actor
      AND m.state='bound' AND m.sha256 IS NOT NULL AND m.size_bytes>0
      AND core.media_read_result(actor,session_ref,m.id,'original')->>'code'='OK'))
  THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM core.report r WHERE r.reporter=actor AND r.target_kind=v_target_kind
    AND r.target_ref=target_id AND r.state IN ('pending','reviewing'))
  THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;

  INSERT INTO core.report(reporter,target_kind,target_ref,reason,evidence_refs)
    VALUES (actor,v_target_kind,target_id,payload->>'reason',
      ARRAY(SELECT e.ref::uuid FROM jsonb_array_elements_text(coalesce(payload->'evidence_refs','[]'::jsonb)) AS e(ref)))
    RETURNING * INTO report_row;
  receipt:=jsonb_build_object('id',report_row.id,'target_ref',report_row.target_ref,
    'state',report_row.state,'public_feedback',report_row.public_feedback,
    'created_at',to_char(report_row.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'report.create',command,payload_hash,report_row.id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'report.create',report_row.id,target_environment,'core',
      'Actor submitted report','pending',command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.create_report_result(uuid,uuid,text,jsonb,text,integer)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.create_report_result(uuid,uuid,text,jsonb,text,integer) TO core_runtime;


