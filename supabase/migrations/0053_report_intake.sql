CREATE TABLE core.report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter uuid NOT NULL REFERENCES core.account(id),
  target_kind text NOT NULL CHECK (target_kind IN ('account','post','comment','message')),
  target_ref uuid NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 2000),
  evidence_refs uuid[] NOT NULL DEFAULT ARRAY[]::uuid[] CHECK (cardinality(evidence_refs)<=9),
  state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','reviewing','processed','not_actionable')),
  handler_id uuid REFERENCES core.account(id),
  public_feedback text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version>0)
);
CREATE UNIQUE INDEX report_open_reporter_target ON core.report(reporter,target_kind,target_ref)
  WHERE state IN ('pending','reviewing');
CREATE INDEX report_own_order ON core.report(reporter,created_at DESC,id DESC);
SELECT core.protect_table('core.report');
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.report
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.create_report_result(
  actor uuid,session_ref uuid,target_environment text,payload jsonb,payload_hash text,reason_length integer
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; target_id uuid; command uuid; kind text;
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
  kind:=payload->>'target_kind';
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
  IF kind='account' THEN
    IF NOT EXISTS (SELECT 1 FROM core.account a WHERE a.id=target_id AND a.status='active')
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  ELSIF kind IN ('post','comment') THEN
    admitted:=core.resource_action_result(actor,session_ref,target_id,'resource.read','read');
    IF admitted->>'code'<>'OK' THEN RETURN admitted; END IF;
    SELECT * INTO resource_row FROM core.resource r WHERE r.id=target_id AND r.kind=kind;
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
  IF EXISTS (SELECT 1 FROM core.report r WHERE r.reporter=actor AND r.target_kind=kind
    AND r.target_ref=target_id AND r.state IN ('pending','reviewing'))
  THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;

  INSERT INTO core.report(reporter,target_kind,target_ref,reason,evidence_refs)
    VALUES (actor,kind,target_id,payload->>'reason',
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

CREATE FUNCTION core.list_own_reports_result(
  actor uuid,session_ref uuid,target_environment text,page_limit integer,
  cursor_id uuid,cursor_created timestamptz
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; entry core.report; items jsonb:='[]'::jsonb;
  item_count integer:=0; more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50
    OR (cursor_id IS NULL)<>(cursor_created IS NULL)
    OR (cursor_created IS NOT NULL AND NOT isfinite(cursor_created))
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT * FROM core.report r WHERE r.reporter=actor
    AND (cursor_id IS NULL OR (r.created_at,r.id)<(cursor_created,cursor_id))
    ORDER BY r.created_at DESC,r.id DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object(
      'id',entry.id,'target_ref',entry.target_ref,'state',entry.state,
      'public_feedback',entry.public_feedback,
      'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    item_count:=item_count+1; last_id:=entry.id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_created_at',CASE WHEN more THEN to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;
REVOKE ALL ON FUNCTION core.list_own_reports_result(uuid,uuid,text,integer,uuid,timestamptz)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_own_reports_result(uuid,uuid,text,integer,uuid,timestamptz)
  TO core_runtime;

-- Extend the current five-argument operation lookup from 0052 so a lost
-- report response can be resolved under a current session.
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
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create');
  IF v_matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF v_matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO v_entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create');
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
  ELSIF v_entry.action IN ('block.put','block.remove','profile.update','report.create') THEN
    IF v_entry.action='report.create' AND NOT EXISTS (SELECT 1 FROM core.report r
      WHERE r.id=v_entry.result_ref AND r.reporter=actor) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  END IF;
  IF v_entry.action IN ('post.create','comment.create','like.put','like.remove',
    'block.put','block.remove','profile.update','report.create') AND v_receipt IS NULL
  THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',v_entry.operation_id,'action',v_entry.action,'state',v_entry.state)
    || CASE WHEN v_receipt IS NOT NULL THEN jsonb_build_object('result',v_receipt) ELSE '{}'::jsonb END);
END $$;
