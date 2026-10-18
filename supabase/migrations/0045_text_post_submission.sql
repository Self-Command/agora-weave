-- First public-content write slice. Accepted content stays private to the review
-- workflow until a separate, authorized decision publishes the exact revision.
CREATE TABLE core.reply_policy (
  post_id uuid PRIMARY KEY REFERENCES core.resource(id),
  scope text NOT NULL CHECK (scope IN ('all_readers','author_follows','mentioned','closed')),
  epoch bigint NOT NULL DEFAULT 1 CHECK (epoch > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
SELECT core.protect_table('core.reply_policy');

-- Immutable operation output permits safe resolution after a response is lost.
CREATE TABLE core.operation_receipt (
  operation_ref uuid PRIMARY KEY REFERENCES core.operation(id),
  receipt jsonb NOT NULL CHECK (jsonb_typeof(receipt) = 'object'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.operation_receipt',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.operation_receipt
  FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE FUNCTION core.create_text_post_result(
  actor uuid, session_ref uuid, target_environment text, payload jsonb,
  payload_hash text, visible_count integer, body_limit integer, config_version text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE
  context jsonb;
  previous core.operation;
  v_resource core.resource;
  v_revision_id uuid := gen_random_uuid();
  v_operation_id uuid;
  v_operation_ref uuid;
  v_receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context := core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR payload_hash IS NULL
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','type','body','visibility','reply_scope',
      'indexing_mode','tags','mentions','media_refs']::text[])
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'type'<>'text' OR jsonb_typeof(payload->'body')<>'string'
    OR payload->>'visibility' NOT IN ('public','followers','self')
    OR payload->>'reply_scope'<>'all_readers' OR payload->>'indexing_mode'<>'inherit'
    OR payload->'tags'<>'[]'::jsonb OR payload->'mentions'<>'[]'::jsonb
    OR payload->'media_refs'<>'[]'::jsonb
    OR payload ? 'poll' OR payload ? 'source_id'
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>9
    OR visible_count IS NULL OR visible_count<1 OR visible_count>char_length(payload->>'body')
    OR octet_length(payload->>'body')>65536
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_operation_id := (payload->>'operation_id')::uuid;

  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor AND s.state='active'
    AND s.starts_at<=clock_timestamp() AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
  THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;

  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_text_post_result.actor
    AND op.action='post.create' AND op.operation_id=v_operation_id;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>target_environment THEN
      RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=previous.result_ref AND r.author_id=actor)
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=previous.id;
    IF v_receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',v_receipt);
  END IF;

  IF config_version IS NULL OR core.response_config_version(target_environment) IS DISTINCT FROM config_version
    OR body_limit IS NULL OR body_limit<1 OR body_limit>10000 THEN
    RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE');
  END IF;
  IF visible_count>body_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;

  INSERT INTO core.resource(author_id,kind,visibility,publication_state)
    VALUES (actor,'post',payload->>'visibility','pending') RETURNING * INTO v_resource;
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
    VALUES (v_revision_id,v_resource.id,1,payload->>'body',actor,'pending',clock_timestamp());
  UPDATE core.resource SET current_revision_id=v_revision_id WHERE id=v_resource.id RETURNING * INTO v_resource;
  INSERT INTO core.reply_policy(post_id,scope) VALUES (v_resource.id,'all_readers');
  v_receipt := jsonb_build_object('resource_id',v_resource.id,'revision_id',v_revision_id,
    'operation_id',v_operation_id,'review_state','pending','publication_state','awaiting_review',
    'row_version',v_resource.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,target_environment,'post.create',v_operation_id,payload_hash,v_resource.id,'succeeded')
    RETURNING id INTO v_operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (v_operation_ref,v_receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES (actor,session_ref,'post.create',v_resource.id,target_environment,'core','Submitted text post for review',
      'awaiting_review',v_operation_id);
  RETURN jsonb_build_object('code','OK','data',v_receipt);
END $$;
REVOKE ALL ON FUNCTION core.create_text_post_result(uuid,uuid,text,jsonb,text,integer,integer,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.create_text_post_result(uuid,uuid,text,jsonb,text,integer,integer,text)
  TO core_runtime;

-- Keep the existing admin configuration receipt and its AAL2 guard, extending the
-- actor-scoped operation lookup only for accepted content commands.
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
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove');
  IF v_matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF v_matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO v_entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove');
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
  END IF;
  IF v_entry.action IN ('post.create','comment.create','like.put','like.remove') AND v_receipt IS NULL THEN
    RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',v_entry.operation_id,'action',v_entry.action,'state',v_entry.state)
    || CASE WHEN v_receipt IS NOT NULL THEN jsonb_build_object('result',v_receipt) ELSE '{}'::jsonb END);
END $$;
