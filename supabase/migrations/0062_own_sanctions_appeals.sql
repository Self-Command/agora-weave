-- An appeal is an independent case. Intake does not decide or remove a sanction.
CREATE TABLE core.appeal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sanction_id uuid NOT NULL REFERENCES core.sanction(id),
  appellant uuid NOT NULL REFERENCES core.account(id),
  statement text NOT NULL CHECK (char_length(statement) BETWEEN 1 AND 10000),
  media_refs uuid[] NOT NULL DEFAULT ARRAY[]::uuid[] CHECK (cardinality(media_refs)<=9),
  state text NOT NULL DEFAULT 'awaiting_independent_review'
    CHECK (state IN ('awaiting_independent_review','reviewing','decided')),
  decision text CHECK (decision IN ('uphold','overturn')),
  execution_state text NOT NULL DEFAULT 'pending' CHECK (execution_state IN ('pending','succeeded','failed')),
  reviewer uuid REFERENCES core.account(id),
  decision_reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version>0),
  UNIQUE(sanction_id,appellant),
  CHECK ((state='decided')=(decision IS NOT NULL))
);
CREATE INDEX appeal_own_order ON core.appeal(appellant,created_at DESC,id DESC);
SELECT core.protect_table('core.appeal');
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.appeal
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.list_own_sanctions_result(actor uuid,session_ref uuid,target_environment text,
  page_limit integer,after_created_at timestamptz,after_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; items jsonb:='[]'::jsonb; entry core.sanction;
  count_items integer:=0; more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 OR
    (after_id IS NULL)<>(after_created_at IS NULL) THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT s.* FROM core.sanction s WHERE
    (s.subject=actor OR EXISTS (SELECT 1 FROM core.resource r WHERE r.id=s.target AND r.author_id=actor))
    AND (after_id IS NULL OR (s.created_at,s.id)<(after_created_at,after_id))
    ORDER BY s.created_at DESC,s.id DESC LIMIT page_limit+1
  LOOP
    IF count_items=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object(
      'id',entry.id,'subject_id',entry.subject,'target_id',entry.target,'type',entry.type,
      'functions',to_jsonb(entry.functions),'starts_at',to_char(entry.starts_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'ends_at',CASE WHEN entry.ends_at IS NULL THEN NULL ELSE to_char(entry.ends_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END,
      'reason',entry.reason,
      'state',CASE WHEN entry.state='active' AND entry.ends_at<=clock_timestamp() THEN 'expired' ELSE entry.state END,
      'allowed_actions',CASE WHEN EXISTS (SELECT 1 FROM core.appeal a WHERE a.sanction_id=entry.id AND a.appellant=actor)
        THEN '[]'::jsonb ELSE '["appeal"]'::jsonb END));
    count_items:=count_items+1; last_id:=entry.id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_created_at',CASE WHEN more THEN to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;

CREATE FUNCTION core.create_appeal_result(actor uuid,session_ref uuid,target_environment text,
  payload jsonb,payload_hash text,statement_length integer)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; sanction_row core.sanction; appeal_row core.appeal;
  command uuid; sanction_ref uuid; receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR
    NOT payload ?& ARRAY['operation_id','sanction_id','statement','media_refs']::text[] OR
    (SELECT count(*) FROM jsonb_object_keys(payload))<>4 OR
    EXISTS (SELECT 1 FROM jsonb_object_keys(payload) AS k(key)
      WHERE k.key NOT IN ('operation_id','sanction_id','statement','media_refs')) OR
    payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$' OR
    statement_length IS NULL OR statement_length NOT BETWEEN 1 AND 10000 OR
    jsonb_typeof(payload->'operation_id')<>'string' OR
    jsonb_typeof(payload->'sanction_id')<>'string' OR
    jsonb_typeof(payload->'statement')<>'string' OR
    payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$' OR
    payload->>'sanction_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$' OR
    char_length(payload->>'statement') NOT BETWEEN 1 AND 10000 OR
    btrim(payload->>'statement',E' \t\n\r')='' OR
    jsonb_typeof(payload->'media_refs')<>'array' OR
    jsonb_array_length(payload->'media_refs')>9 OR
    EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'media_refs') AS e(value)
      WHERE jsonb_typeof(e.value)<>'string') OR
    EXISTS (SELECT 1 FROM jsonb_array_elements_text(payload->'media_refs') AS e(ref)
      WHERE e.ref !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$') OR
    (SELECT count(*) FROM jsonb_array_elements_text(payload->'media_refs'))<>
      (SELECT count(DISTINCT e.ref) FROM jsonb_array_elements_text(payload->'media_refs') AS e(ref))
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command:=(payload->>'operation_id')::uuid;
  sanction_ref:=(payload->>'sanction_id')::uuid;
  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_appeal_result.actor
    AND op.action='appeal.create' AND op.operation_id=command;
  IF previous.id IS NOT NULL THEN
    IF previous.environment<>target_environment OR previous.payload_hash<>payload_hash OR previous.result_ref IS NULL
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=previous.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=create_appeal_result.actor AND op.operation_id=command)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO sanction_row FROM core.sanction s WHERE s.id=sanction_ref FOR UPDATE;
  IF sanction_row.id IS NULL OR NOT (sanction_row.subject=actor OR EXISTS
    (SELECT 1 FROM core.resource r WHERE r.id=sanction_row.target AND r.author_id=actor))
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF EXISTS (SELECT 1 FROM core.appeal a WHERE a.sanction_id=sanction_ref AND a.appellant=actor)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements_text(payload->'media_refs') AS e(ref)
    WHERE NOT EXISTS (SELECT 1 FROM core.media_object m WHERE m.id=e.ref::uuid AND m.owner=actor
      AND m.state='bound' AND m.sha256 IS NOT NULL AND m.size_bytes>0
      AND core.media_read_result(actor,session_ref,m.id,'original')->>'code'='OK'))
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  INSERT INTO core.appeal(sanction_id,appellant,statement,media_refs)
    VALUES (sanction_ref,actor,payload->>'statement',
      ARRAY(SELECT e.ref::uuid FROM jsonb_array_elements_text(payload->'media_refs') AS e(ref)))
    RETURNING * INTO appeal_row;
  receipt:=jsonb_build_object('id',appeal_row.id,'sanction_id',appeal_row.sanction_id,
    'statement',appeal_row.statement,'state',appeal_row.state,'decision',appeal_row.decision,
    'execution_state',appeal_row.execution_state,
    'created_at',to_char(appeal_row.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'allowed_actions','[]'::jsonb);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'appeal.create',command,payload_hash,appeal_row.id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'appeal.create',appeal_row.id,target_environment,'core','appeal intake','succeeded',command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;

CREATE FUNCTION core.list_own_appeals_result(actor uuid,session_ref uuid,target_environment text,
  page_limit integer,after_created_at timestamptz,after_id uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; items jsonb:='[]'::jsonb; entry core.appeal;
  count_items integer:=0; more boolean:=false; last_id uuid; last_created timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 OR
    (after_id IS NULL)<>(after_created_at IS NULL) THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT a.* FROM core.appeal a WHERE a.appellant=actor
    AND (after_id IS NULL OR (a.created_at,a.id)<(after_created_at,after_id))
    ORDER BY a.created_at DESC,a.id DESC LIMIT page_limit+1
  LOOP
    IF count_items=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object('id',entry.id,'sanction_id',entry.sanction_id,
      'statement',entry.statement,'state',entry.state,'decision',entry.decision,
      'execution_state',entry.execution_state,
      'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'allowed_actions','[]'::jsonb));
    count_items:=count_items+1; last_id:=entry.id; last_created:=entry.created_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_created_at',CASE WHEN more THEN to_char(last_created AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;

REVOKE ALL ON TABLE core.appeal FROM PUBLIC,anon,authenticated,service_role,core_worker;
REVOKE ALL ON FUNCTION core.list_own_sanctions_result(uuid,uuid,text,integer,timestamptz,uuid),
  core.create_appeal_result(uuid,uuid,text,jsonb,text,integer),
  core.list_own_appeals_result(uuid,uuid,text,integer,timestamptz,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_own_sanctions_result(uuid,uuid,text,integer,timestamptz,uuid),
  core.create_appeal_result(uuid,uuid,text,jsonb,text,integer),
  core.list_own_appeals_result(uuid,uuid,text,integer,timestamptz,uuid) TO core_runtime;

CREATE OR REPLACE FUNCTION core.account_operation_result(actor uuid,session_ref uuid,command_ref uuid,
  target_environment text,jwt_aal text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.operation; matches integer; result jsonb; receipt jsonb; review_resource uuid;
  upload core.image_upload_session;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide',
      'upload.create','upload.part','upload.complete','appeal.create');
  IF matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide',
      'upload.create','upload.part','upload.complete','appeal.create');
  IF entry.action IN ('config.release','config.rollback') THEN
    IF jwt_aal IS NULL THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
    result:=core.admin_identity_context(actor,session_ref,target_environment,jwt_aal,true);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    IF NOT core.admin_has_permission(actor,target_environment,entry.action)
      OR NOT core.admin_has_permission(actor,target_environment,'config.read') THEN
      RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
    SELECT p.receipt INTO receipt FROM core.admin_config_publication p
      WHERE p.actor=account_operation_result.actor AND p.environment=target_environment
        AND p.operation_id=command_ref AND 'config.' || p.kind=entry.action;
  ELSIF entry.action='moderation.revisions.decide' THEN
    SELECT d.resource_id INTO review_resource FROM core.admin_review_decision d
      WHERE d.actor=account_operation_result.actor AND d.environment=target_environment AND d.operation_id=command_ref;
    result:=core.admin_review_access(actor,session_ref,target_environment,jwt_aal,
      'moderation.revisions.decide',review_resource);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action='appeal.create' THEN
    IF NOT EXISTS (SELECT 1 FROM core.appeal a WHERE a.id=entry.result_ref AND a.appellant=actor)
      THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('post.create','comment.create') THEN
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=entry.result_ref
      AND r.author_id=actor AND r.deleted_at IS NULL) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('like.put','like.remove') THEN
    result:=core.resource_action_result(actor,session_ref,entry.result_ref,'resource.read','read');
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('block.put','block.remove','profile.update','report.create') THEN
    IF entry.action='report.create' AND NOT EXISTS (SELECT 1 FROM core.report r
      WHERE r.id=entry.result_ref AND r.reporter=actor) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('upload.create','upload.part','upload.complete','appeal.create') THEN
    SELECT * INTO upload FROM core.image_upload_session u WHERE u.media_id=entry.result_ref
      AND u.owner=actor AND u.environment=target_environment;
    IF upload.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    result:=core.image_upload_access(actor,session_ref,target_environment,upload.id);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  END IF;
  IF entry.action IN ('post.create','comment.create','like.put','like.remove','block.put','block.remove',
    'profile.update','report.create','moderation.revisions.decide','upload.create','upload.part','upload.complete','appeal.create')
    AND receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',entry.operation_id,'action',entry.action,'state',entry.state)
    || CASE WHEN receipt IS NOT NULL THEN jsonb_build_object('result',receipt) ELSE '{}'::jsonb END);
END $$;
REVOKE ALL ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text,text) TO core_runtime;

