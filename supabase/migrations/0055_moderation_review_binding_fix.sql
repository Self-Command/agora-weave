-- Qualify the actor in the MFA proof join to avoid PL/pgSQL column ambiguity.
CREATE OR REPLACE FUNCTION core.admin_review_decision_result(actor uuid,session_ref uuid,env text,jwt_aal text,
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
      JOIN auth.mfa_factors f ON f.id=b.factor_id AND f.user_id=admin_review_decision_result.actor AND f.factor_type='totp' AND f.status='verified'
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

