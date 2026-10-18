-- A review decision is bound to one immutable preview, current revision and TOTP proof.
CREATE TABLE core.admin_review_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid NOT NULL REFERENCES core.account(id),
  session_id uuid NOT NULL, environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  operation_id uuid NOT NULL, revision_id uuid NOT NULL REFERENCES core.content_revision(id),
  resource_id uuid NOT NULL REFERENCES core.resource(id), base_version bigint NOT NULL CHECK (base_version>0),
  decision text NOT NULL CHECK (decision IN ('approve','reject')), reason text NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 1000),
  input_digest text NOT NULL CHECK (input_digest ~ '^[a-f0-9]{64}$'),
  preview_digest text NOT NULL CHECK (preview_digest ~ '^[a-f0-9]{64}$'),
  action_digest text NOT NULL UNIQUE CHECK (action_digest ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes',
  UNIQUE(actor,environment,operation_id), CHECK (expires_at<=created_at+interval '5 minutes')
);
SELECT core.protect_table('core.admin_review_preview',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_review_preview
  FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.admin_review_stepup_binding (
  auth_challenge_id uuid PRIMARY KEY, stepup_id uuid NOT NULL UNIQUE REFERENCES core.stepup_challenge(id),
  actor uuid NOT NULL REFERENCES core.account(id), session_id uuid NOT NULL, factor_id uuid NOT NULL,
  preview_id uuid NOT NULL REFERENCES core.admin_review_preview(id), environment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.admin_review_stepup_binding',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_review_stepup_binding
  FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.admin_review_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid NOT NULL REFERENCES core.account(id),
  session_id uuid NOT NULL, environment text NOT NULL, operation_id uuid NOT NULL,
  preview_id uuid NOT NULL UNIQUE REFERENCES core.admin_review_preview(id),
  revision_id uuid NOT NULL REFERENCES core.content_revision(id), resource_id uuid NOT NULL REFERENCES core.resource(id),
  input_digest text NOT NULL, decision text NOT NULL CHECK (decision IN ('approve','reject')),
  reason text NOT NULL, receipt jsonb NOT NULL, decided_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE(actor,environment,operation_id)
);
SELECT core.protect_table('core.admin_review_decision',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_review_decision
  FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE FUNCTION core.admin_review_access(actor uuid,session_ref uuid,env text,jwt_aal text,
  action_name text,target uuid DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;
BEGIN
  context:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF action_name NOT IN ('moderation.contents.read','moderation.revisions.decide','moderation.cases.read') THEN
    RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=actor AND g.environment=env
    AND g.role IN ('super_admin','content_moderator') AND g.revoked_at IS NULL
    AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())
    AND action_name=ANY(g.operation_scopes)
    AND (g.resource_scope IS NULL OR target IS NULL OR target=ANY(g.resource_scope))) THEN
    RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

-- The existing five-argument operation lookup also resolves lost review decisions.
CREATE OR REPLACE FUNCTION core.account_operation_result(
  actor uuid,session_ref uuid,command_ref uuid,target_environment text,jwt_aal text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.operation; matches integer; result jsonb; receipt jsonb; review_resource uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide');
  IF matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide');
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
  END IF;
  IF entry.action IN ('post.create','comment.create','like.put','like.remove','block.put','block.remove',
    'profile.update','report.create','moderation.revisions.decide') AND receipt IS NULL
    THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',entry.operation_id,'action',entry.action,'state',entry.state)
    || CASE WHEN receipt IS NOT NULL THEN jsonb_build_object('result',receipt) ELSE '{}'::jsonb END);
END $$;

CREATE FUNCTION core.admin_review_page_result(actor uuid,session_ref uuid,env text,jwt_aal text,
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
      'review_state',entry.review_state,'submitted_at',to_char(entry.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    count_items:=count_items+1; last_id:=entry.id;
  END LOOP;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',items,
    'next_cursor',CASE WHEN more THEN last_id::text END,'has_more',more));
END $$;

CREATE FUNCTION core.admin_cases_page_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  page_limit integer,after_id uuid) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; items jsonb:='[]'::jsonb; entry core.report;
  count_items integer:=0; more boolean:=false; last_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.cases.read');
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT r.* FROM core.report r WHERE (after_id IS NULL OR r.id<after_id)
    AND core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.cases.read',r.target_ref)->>'code'='OK'
    ORDER BY r.id DESC LIMIT page_limit+1
  LOOP
    IF count_items=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object('id',entry.id,'target_ref',entry.target_ref,
      'state',entry.state,'handler_id',entry.handler_id,
      'created_at',to_char(entry.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'row_version',entry.row_version,'allowed_actions','[]'::jsonb));
    count_items:=count_items+1; last_id:=entry.id;
  END LOOP;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',items,
    'next_cursor',CASE WHEN more THEN last_id::text END,'has_more',more));
END $$;

CREATE FUNCTION core.admin_review_preview_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  revision_ref uuid,command_ref uuid,decision_in text,reason_in text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; revision_row core.content_revision; resource_row core.resource;
  existing core.admin_review_preview; input_hash text; preview_hash text; action_hash text; made core.admin_review_preview;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide');
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF revision_ref IS NULL OR command_ref IS NULL OR decision_in NOT IN ('approve','reject')
    OR reason_in IS NULL OR char_length(reason_in) NOT BETWEEN 1 AND 1000 OR btrim(reason_in)=''
    OR reason_in ~ '[[:cntrl:]]' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.account a WHERE a.id=actor AND a.sensitive_until>clock_timestamp()) THEN
    RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN'); END IF;
  input_hash:=encode(sha256(convert_to(jsonb_build_array(revision_ref,command_ref,decision_in,reason_in)::text,'UTF8')),'hex');
  SELECT * INTO existing FROM core.admin_review_preview p WHERE p.actor=admin_review_preview_result.actor
    AND p.environment=env AND p.operation_id=command_ref;
  IF existing.id IS NOT NULL THEN
    IF existing.input_digest<>input_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF existing.session_id<>session_ref THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF existing.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
    context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide',existing.resource_id);
    IF context->>'code'<>'OK' THEN RETURN context; END IF;
    RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',existing.id,
      'preview_digest',existing.preview_digest,'action_digest',existing.action_digest,
      'revision_id',existing.revision_id,'base_version',existing.base_version,
      'expires_at',to_char(existing.expires_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
  END IF;
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=admin_review_preview_result.actor AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO revision_row FROM core.content_revision v WHERE v.id=revision_ref;
  IF revision_row.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT * INTO resource_row FROM core.resource r WHERE r.id=revision_row.resource_id;
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide',resource_row.id);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF resource_row.current_revision_id IS DISTINCT FROM revision_ref OR revision_row.review_state IS DISTINCT FROM 'pending'
    OR resource_row.publication_state IS DISTINCT FROM 'pending' OR resource_row.deleted_at IS NOT NULL
    OR resource_row.moderation_ref IS NOT NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  preview_hash:=encode(sha256(convert_to(jsonb_build_array(actor,session_ref,env,revision_ref,
    revision_row.row_version,decision_in,reason_in,command_ref)::text,'UTF8')),'hex');
  action_hash:=encode(sha256(convert_to('moderation.review:'||preview_hash,'UTF8')),'hex');
  INSERT INTO core.admin_review_preview(actor,session_id,environment,operation_id,revision_id,resource_id,
    base_version,decision,reason,input_digest,preview_digest,action_digest)
    VALUES (actor,session_ref,env,command_ref,revision_ref,resource_row.id,revision_row.row_version,
      decision_in,reason_in,input_hash,preview_hash,action_hash) RETURNING * INTO made;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',made.id,
    'preview_digest',made.preview_digest,'action_digest',made.action_digest,
    'revision_id',made.revision_id,'base_version',made.base_version,
    'expires_at',to_char(made.expires_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
END $$;

CREATE FUNCTION core.admin_review_decision_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  revision_ref uuid,command_ref uuid,decision_in text,reason_in text,base_version_in bigint,
  preview_ref uuid,preview_hash text,stepup_ref uuid) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; existing core.admin_review_decision; preview_row core.admin_review_preview;
  revision_row core.content_revision; resource_row core.resource; proof core.stepup_challenge;
  receipt jsonb; input_hash text; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide');
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF revision_ref IS NULL OR command_ref IS NULL OR decision_in NOT IN ('approve','reject')
    OR reason_in IS NULL OR char_length(reason_in) NOT BETWEEN 1 AND 1000 OR btrim(reason_in)=''
    OR reason_in ~ '[[:cntrl:]]' OR base_version_in IS NULL OR base_version_in<1
    OR preview_ref IS NULL OR preview_hash IS NULL OR preview_hash !~ '^[a-f0-9]{64}$'
    OR stepup_ref IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  input_hash:=encode(sha256(convert_to(jsonb_build_array(revision_ref,command_ref,decision_in,
    reason_in,base_version_in,preview_ref,preview_hash,stepup_ref)::text,'UTF8')),'hex');
  SELECT * INTO existing FROM core.admin_review_decision d WHERE d.actor=admin_review_decision_result.actor
    AND d.environment=env AND d.operation_id=command_ref;
  IF existing.id IS NOT NULL THEN
    IF existing.input_digest<>input_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide',existing.resource_id);
    IF context->>'code'<>'OK' THEN RETURN context; END IF;
    RETURN jsonb_build_object('code','OK','data',existing.receipt);
  END IF;
  IF env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.account a WHERE a.id=actor AND a.sensitive_until>clock_timestamp()) THEN
    RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN'); END IF;
  SELECT * INTO preview_row FROM core.admin_review_preview p WHERE p.id=preview_ref;
  IF preview_row.id IS NULL OR preview_row.actor<>actor OR preview_row.session_id<>session_ref
    OR preview_row.environment<>env OR preview_row.operation_id<>command_ref OR preview_row.revision_id<>revision_ref
    OR preview_row.decision<>decision_in OR preview_row.reason<>reason_in OR preview_row.base_version<>base_version_in
    OR preview_row.preview_digest<>preview_hash OR preview_row.expires_at<=clock_timestamp()
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_review_decision d WHERE d.preview_id=preview_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide',preview_row.resource_id);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  SELECT * INTO proof FROM core.stepup_challenge s WHERE s.id=stepup_ref FOR UPDATE;
  IF proof.id IS NULL OR proof.account_id<>actor OR proof.session_id<>session_ref OR proof.aal<>'aal2'
    OR proof.action_digest<>preview_row.action_digest OR proof.expires_at<=clock_timestamp()
    OR proof.consumed_at IS NOT NULL OR NOT EXISTS (SELECT 1 FROM core.admin_review_stepup_binding b
      JOIN auth.mfa_factors f ON f.id=b.factor_id AND f.user_id=actor AND f.factor_type='totp' AND f.status='verified'
      WHERE b.stepup_id=stepup_ref AND b.preview_id=preview_ref AND b.actor=admin_review_decision_result.actor
        AND b.session_id=session_ref AND b.environment=env) THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
  SELECT * INTO revision_row FROM core.content_revision v WHERE v.id=revision_ref FOR UPDATE;
  SELECT * INTO resource_row FROM core.resource r WHERE r.id=preview_row.resource_id FOR UPDATE;
  IF revision_row.id IS NULL OR resource_row.id IS NULL OR resource_row.current_revision_id IS DISTINCT FROM revision_ref
    OR revision_row.resource_id<>resource_row.id OR revision_row.row_version<>base_version_in
    OR revision_row.review_state IS DISTINCT FROM 'pending' OR resource_row.publication_state IS DISTINCT FROM 'pending'
    OR resource_row.deleted_at IS NOT NULL OR resource_row.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  UPDATE core.content_revision SET review_state=CASE WHEN decision_in='approve' THEN 'approved' ELSE 'rejected' END
    WHERE id=revision_ref;
  UPDATE core.resource SET publication_state=CASE WHEN decision_in='approve' THEN 'published' ELSE 'rejected' END
    WHERE id=resource_row.id RETURNING * INTO resource_row;
  UPDATE core.stepup_challenge SET consumed_at=clock_timestamp() WHERE id=stepup_ref;
  receipt:=jsonb_build_object('resource_id',resource_row.id,'revision_id',revision_ref,'operation_id',command_ref,
    'review_state',CASE WHEN decision_in='approve' THEN 'approved' ELSE 'rejected' END,
    'publication_state',CASE WHEN decision_in='approve' THEN 'published' ELSE 'rejected' END,
    'row_version',resource_row.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (actor,session_ref,env,'moderation.revisions.decide',command_ref,input_hash,resource_row.id,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES (operation_ref,receipt);
  INSERT INTO core.admin_review_decision(actor,session_id,environment,operation_id,preview_id,revision_id,resource_id,
    input_digest,decision,reason,receipt) VALUES (actor,session_ref,env,command_ref,preview_ref,revision_ref,
    resource_row.id,input_hash,decision_in,reason_in,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,
    before_digest,after_digest,result,request_id)
    VALUES (actor,session_ref,'moderation.revisions.decide',revision_ref,env,'core',reason_in,
      preview_hash,encode(sha256(convert_to(receipt::text,'UTF8')),'hex'),decision_in,command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;

REVOKE ALL ON core.admin_review_preview,core.admin_review_stepup_binding,core.admin_review_decision FROM core_runtime,core_worker,supabase_auth_admin;
REVOKE ALL ON FUNCTION core.admin_review_access(uuid,uuid,text,text,text,uuid),
  core.admin_review_page_result(uuid,uuid,text,text,integer,uuid),
  core.admin_cases_page_result(uuid,uuid,text,text,integer,uuid),
  core.admin_review_preview_result(uuid,uuid,text,text,uuid,uuid,text,text),
  core.admin_review_decision_result(uuid,uuid,text,text,uuid,uuid,text,text,bigint,uuid,text,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.admin_review_page_result(uuid,uuid,text,text,integer,uuid),
  core.admin_cases_page_result(uuid,uuid,text,text,integer,uuid),
  core.admin_review_preview_result(uuid,uuid,text,text,uuid,uuid,text,text),
  core.admin_review_decision_result(uuid,uuid,text,text,uuid,uuid,text,text,bigint,uuid,text,uuid) TO core_runtime;

-- Extend the existing TOTP step-up endpoint. Configuration previews keep their
-- original branch; review previews bind the proof to decision and reason.
CREATE OR REPLACE FUNCTION core.admin_stepup_target_result(actor uuid,session_ref uuid,env text,jwt_aal text,action_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE config_preview core.admin_config_preview; review_preview core.admin_review_preview;
  result jsonb; revision_row core.content_revision; resource_row core.resource;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF action_digest IS NULL OR action_digest !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO config_preview FROM core.admin_config_preview p WHERE p.actor=admin_stepup_target_result.actor
    AND p.session_id=session_ref AND p.environment=env AND p.action_digest=admin_stepup_target_result.action_digest;
  IF config_preview.id IS NOT NULL THEN
    result:=core.admin_config_access(actor,session_ref,env,jwt_aal,'config.' || config_preview.kind,9007199254740991,true);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    IF config_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
    IF config_preview.registry_digest<>core.admin_registry_digest() OR NOT EXISTS
      (SELECT 1 FROM core.config_activation a WHERE a.environment=env AND a.active_ptr=config_preview.base_version)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',config_preview.id,
      'action_digest',config_preview.action_digest,'expires_at',config_preview.expires_at));
  END IF;
  SELECT * INTO review_preview FROM core.admin_review_preview p WHERE p.actor=admin_stepup_target_result.actor
    AND p.session_id=session_ref AND p.environment=env AND p.action_digest=admin_stepup_target_result.action_digest;
  IF review_preview.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  result:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.revisions.decide',review_preview.resource_id);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF review_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
  SELECT * INTO revision_row FROM core.content_revision v WHERE v.id=review_preview.revision_id;
  SELECT * INTO resource_row FROM core.resource r WHERE r.id=review_preview.resource_id;
  IF revision_row.id IS NULL OR resource_row.id IS NULL OR revision_row.row_version IS DISTINCT FROM review_preview.base_version
    OR revision_row.review_state IS DISTINCT FROM 'pending' OR resource_row.current_revision_id IS DISTINCT FROM revision_row.id
    OR resource_row.publication_state IS DISTINCT FROM 'pending' OR resource_row.deleted_at IS NOT NULL OR resource_row.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',review_preview.id,
    'action_digest',review_preview.action_digest,'expires_at',review_preview.expires_at));
END $$;

CREATE OR REPLACE FUNCTION core.admin_stepup_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  factor_ref uuid,auth_challenge_ref uuid,action_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE target_result jsonb; config_preview core.admin_config_preview; review_preview core.admin_review_preview;
  auth_row auth.mfa_challenges; config_binding core.admin_stepup_binding;
  review_binding core.admin_review_stepup_binding; proof core.stepup_challenge;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  target_result:=core.admin_stepup_target_result(actor,session_ref,env,jwt_aal,action_digest);
  IF target_result->>'code'<>'OK' THEN RETURN target_result; END IF;
  IF factor_ref IS NULL OR auth_challenge_ref IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO config_preview FROM core.admin_config_preview p WHERE p.id=(target_result->'data'->>'preview_id')::uuid;
  IF config_preview.id IS NOT NULL THEN
    SELECT * INTO config_binding FROM core.admin_stepup_binding b WHERE b.auth_challenge_id=auth_challenge_ref;
    IF config_binding.auth_challenge_id IS NOT NULL THEN
      IF config_binding.actor<>actor OR config_binding.session_id<>session_ref OR config_binding.environment<>env
        OR config_binding.factor_id<>factor_ref OR config_binding.preview_id<>config_preview.id
        THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
      SELECT * INTO proof FROM core.stepup_challenge s WHERE s.id=config_binding.stepup_id;
      IF proof.consumed_at IS NOT NULL OR proof.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
    ELSE
      IF EXISTS (SELECT 1 FROM core.admin_review_stepup_binding b WHERE b.auth_challenge_id=auth_challenge_ref)
        THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
      SELECT c.* INTO auth_row FROM auth.mfa_challenges c JOIN auth.mfa_factors f ON f.id=c.factor_id
        JOIN auth.sessions s ON s.factor_id=f.id AND s.user_id=f.user_id
        WHERE c.id=auth_challenge_ref AND f.id=factor_ref AND f.user_id=actor AND f.factor_type='totp' AND f.status='verified'
          AND s.id=session_ref AND s.aal='aal2' AND c.created_at>=config_preview.created_at AND c.created_at<=c.verified_at
          AND c.verified_at>=config_preview.created_at AND c.verified_at<=clock_timestamp()
          AND c.verified_at>clock_timestamp()-interval '5 minutes'
          AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='totp'
            AND amr.updated_at>=c.verified_at AND amr.updated_at<=clock_timestamp()) FOR SHARE OF c,f,s;
      IF auth_row.id IS NULL THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
      INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at)
        VALUES (actor,session_ref,action_digest,'aal2',auth_row.verified_at,
          least(auth_row.verified_at+interval '5 minutes',config_preview.expires_at)) RETURNING * INTO proof;
      INSERT INTO core.admin_stepup_binding(auth_challenge_id,stepup_id,actor,session_id,factor_id,preview_id,environment)
        VALUES (auth_challenge_ref,proof.id,actor,session_ref,factor_ref,config_preview.id,env);
    END IF;
  ELSE
    SELECT * INTO review_preview FROM core.admin_review_preview p WHERE p.id=(target_result->'data'->>'preview_id')::uuid;
    SELECT * INTO review_binding FROM core.admin_review_stepup_binding b WHERE b.auth_challenge_id=auth_challenge_ref;
    IF review_binding.auth_challenge_id IS NOT NULL THEN
      IF review_binding.actor<>actor OR review_binding.session_id<>session_ref OR review_binding.environment<>env
        OR review_binding.factor_id<>factor_ref OR review_binding.preview_id<>review_preview.id
        THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
      SELECT * INTO proof FROM core.stepup_challenge s WHERE s.id=review_binding.stepup_id;
      IF proof.consumed_at IS NOT NULL OR proof.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
    ELSE
      -- A challenge cannot be rebound across the configuration and review domains.
      IF EXISTS (SELECT 1 FROM core.admin_stepup_binding b WHERE b.auth_challenge_id=auth_challenge_ref)
        THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
      SELECT c.* INTO auth_row FROM auth.mfa_challenges c JOIN auth.mfa_factors f ON f.id=c.factor_id
        JOIN auth.sessions s ON s.factor_id=f.id AND s.user_id=f.user_id
        WHERE c.id=auth_challenge_ref AND f.id=factor_ref AND f.user_id=actor AND f.factor_type='totp' AND f.status='verified'
          AND s.id=session_ref AND s.aal='aal2' AND c.created_at>=review_preview.created_at AND c.created_at<=c.verified_at
          AND c.verified_at>=review_preview.created_at AND c.verified_at<=clock_timestamp()
          AND c.verified_at>clock_timestamp()-interval '5 minutes'
          AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='totp'
            AND amr.updated_at>=c.verified_at AND amr.updated_at<=clock_timestamp()) FOR SHARE OF c,f,s;
      IF auth_row.id IS NULL THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
      INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at)
        VALUES (actor,session_ref,action_digest,'aal2',auth_row.verified_at,
          least(auth_row.verified_at+interval '5 minutes',review_preview.expires_at)) RETURNING * INTO proof;
      INSERT INTO core.admin_review_stepup_binding(auth_challenge_id,stepup_id,actor,session_id,factor_id,preview_id,environment)
        VALUES (auth_challenge_ref,proof.id,actor,session_ref,factor_ref,review_preview.id,env);
    END IF;
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('stepup_id',proof.id,
    'action_digest',proof.action_digest,'expires_at',proof.expires_at));
END $$;
