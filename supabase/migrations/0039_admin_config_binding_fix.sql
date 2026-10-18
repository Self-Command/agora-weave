-- Qualify every input reference in the configuration commit function so nested
-- publication/step-up/Auth queries cannot resolve it as an outer table column.
CREATE OR REPLACE FUNCTION core.admin_config_commit_result(actor uuid,session_ref uuid,env text,jwt_aal text,preview_ref uuid,preview_digest text,
  stepup_ref uuid,command_ref uuid,kind text,max_lifetime bigint) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_before jsonb; v_preview core.admin_config_preview; v_receipt core.admin_config_publication; v_stepup core.stepup_challenge;
  v_candidate core.config_bundle; v_input text; v_current text; v_version text; v_data jsonb; v_audit uuid; v_now timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  IF admin_config_commit_result.kind IS NULL OR admin_config_commit_result.kind NOT IN ('release','rollback')
    OR admin_config_commit_result.preview_ref IS NULL OR admin_config_commit_result.stepup_ref IS NULL OR admin_config_commit_result.command_ref IS NULL
    OR admin_config_commit_result.preview_digest IS NULL OR admin_config_commit_result.preview_digest !~ '^[a-f0-9]{64}$' THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_result:=core.admin_config_access(admin_config_commit_result.actor,admin_config_commit_result.session_ref,admin_config_commit_result.env,
    admin_config_commit_result.jwt_aal,'config.' || admin_config_commit_result.kind,admin_config_commit_result.max_lifetime,true);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  v_input:=encode(sha256(convert_to(jsonb_build_array(admin_config_commit_result.session_ref,admin_config_commit_result.env,
    admin_config_commit_result.preview_ref,admin_config_commit_result.preview_digest,admin_config_commit_result.stepup_ref,
    admin_config_commit_result.kind,admin_config_commit_result.max_lifetime)::text,'UTF8')),'hex');
  SELECT p.* INTO v_receipt FROM core.admin_config_publication p WHERE p.actor=admin_config_commit_result.actor
    AND p.environment=admin_config_commit_result.env AND p.operation_id=admin_config_commit_result.command_ref;
  IF v_receipt.id IS NOT NULL THEN
    IF v_receipt.input_digest<>v_input THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','data',v_receipt.receipt);
  END IF;
  IF admin_config_commit_result.env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.account a WHERE a.id=admin_config_commit_result.actor AND a.sensitive_until>clock_timestamp()) THEN
    RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN','sensitive_until',
      (SELECT a.sensitive_until FROM core.account a WHERE a.id=admin_config_commit_result.actor)); END IF;
  SELECT p.* INTO v_preview FROM core.admin_config_preview p WHERE p.id=admin_config_commit_result.preview_ref;
  IF v_preview.id IS NULL OR v_preview.actor<>admin_config_commit_result.actor OR v_preview.session_id<>admin_config_commit_result.session_ref
    OR v_preview.environment<>admin_config_commit_result.env OR v_preview.preview_digest IS DISTINCT FROM admin_config_commit_result.preview_digest
    OR v_preview.kind<>admin_config_commit_result.kind THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF v_preview.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
  IF EXISTS (SELECT 1 FROM core.admin_config_publication p WHERE p.preview_id=admin_config_commit_result.preview_ref) THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF v_preview.registry_digest<>core.admin_registry_digest() THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT a.active_ptr INTO v_current FROM core.config_activation a WHERE a.environment=admin_config_commit_result.env FOR UPDATE;
  IF v_current IS DISTINCT FROM v_preview.base_version THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  v_before:=core.otp_configuration_result(admin_config_commit_result.env); IF v_before->>'code'<>'OK' THEN RETURN v_before; END IF;
  SELECT s.* INTO v_stepup FROM core.stepup_challenge s WHERE s.id=admin_config_commit_result.stepup_ref FOR UPDATE;
  IF v_stepup.id IS NULL OR v_stepup.account_id<>admin_config_commit_result.actor OR v_stepup.session_id<>admin_config_commit_result.session_ref
    OR v_stepup.action_digest<>v_preview.action_digest OR v_stepup.aal<>'aal2' OR v_stepup.verified_at>clock_timestamp()
    OR v_stepup.expires_at<=clock_timestamp() OR v_stepup.consumed_at IS NOT NULL
    OR NOT EXISTS (SELECT 1 FROM core.admin_stepup_binding b WHERE b.stepup_id=v_stepup.id AND b.preview_id=admin_config_commit_result.preview_ref
      AND b.environment=admin_config_commit_result.env AND b.actor=admin_config_commit_result.actor
      AND b.session_id=admin_config_commit_result.session_ref AND EXISTS (SELECT 1 FROM auth.sessions s
        JOIN auth.mfa_factors f ON f.id=s.factor_id AND f.user_id=s.user_id WHERE s.id=admin_config_commit_result.session_ref
          AND s.user_id=admin_config_commit_result.actor AND f.id=b.factor_id AND f.status='verified' AND f.factor_type='totp')) THEN
    RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
  IF (v_preview.otp_values->>'auth.otp_lifetime_seconds')::numeric>admin_config_commit_result.max_lifetime THEN
    RETURN jsonb_build_object('code','AUTH_LIFETIME_EXCEEDED'); END IF;
  SELECT b.* INTO v_candidate FROM core.config_bundle b WHERE b.version=v_current;
  v_version:='otp-' || v_preview.id::text; v_now:=clock_timestamp();
  v_candidate.id:=gen_random_uuid(); v_candidate.version:=v_version; v_candidate.scoped_values:=v_preview.scoped_values;
  v_candidate.compat:=v_preview.compat; v_candidate.consumers_ready:=v_preview.consumers_ready; v_candidate.schema_version:=v_preview.schema_version;
  v_candidate.state:='draft'; v_candidate.effective_at:=v_now; v_candidate.preview_digest:=admin_config_commit_result.preview_digest;
  v_result:=core.otp_bundle_values_result(admin_config_commit_result.env,v_candidate); IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  IF v_result->'values' IS DISTINCT FROM v_preview.otp_values THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  v_data:=jsonb_build_object('version',v_version,'previous_version',v_current,'state','active','kind',admin_config_commit_result.kind);
  INSERT INTO core.config_bundle(id,version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready,actor)
    VALUES (v_candidate.id,v_version,v_candidate.scoped_values,v_candidate.schema_version,v_candidate.compat,'draft',v_now,
      admin_config_commit_result.preview_digest,v_candidate.consumers_ready,admin_config_commit_result.actor);
  UPDATE core.config_bundle SET state='validated' WHERE version=v_version;
  UPDATE core.config_bundle SET state='ready' WHERE version=v_version;
  UPDATE core.config_bundle SET state='active' WHERE version=v_version;
  UPDATE core.config_activation SET active_ptr=v_version WHERE environment=admin_config_commit_result.env;
  UPDATE core.stepup_challenge SET consumed_at=clock_timestamp() WHERE id=admin_config_commit_result.stepup_ref;
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES (admin_config_commit_result.actor,admin_config_commit_result.session_ref,admin_config_commit_result.env,
      'config.' || admin_config_commit_result.kind,admin_config_commit_result.command_ref,v_input,v_preview.id,'succeeded');
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,before_digest,after_digest,result,request_id)
    VALUES (admin_config_commit_result.actor,admin_config_commit_result.session_ref,'config.' || admin_config_commit_result.kind,
      v_preview.id,admin_config_commit_result.env,'core',v_preview.reason,encode(sha256(convert_to(v_current,'UTF8')),'hex'),
      admin_config_commit_result.preview_digest,'active',admin_config_commit_result.command_ref) RETURNING id INTO v_audit;
  UPDATE core.config_bundle SET audit_ref=v_audit WHERE version=v_version;
  INSERT INTO core.admin_config_publication(actor,session_id,environment,preview_id,operation_id,version,previous_version,kind,reason,otp_values,before_values,input_digest,receipt,effective_at)
    VALUES (admin_config_commit_result.actor,admin_config_commit_result.session_ref,admin_config_commit_result.env,
      admin_config_commit_result.preview_ref,admin_config_commit_result.command_ref,v_version,v_current,admin_config_commit_result.kind,
      v_preview.reason,v_preview.otp_values,v_before->'values',v_input,v_data,v_now);
  RETURN jsonb_build_object('code','OK','data',v_data);
END $$;
