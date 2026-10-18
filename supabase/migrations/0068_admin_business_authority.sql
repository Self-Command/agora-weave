-- Shared current authority and one-use, official TOTP proofs for business commands.
ALTER TABLE core.admin_grant ADD COLUMN constraints jsonb NOT NULL DEFAULT '{}'::jsonb
  CHECK (jsonb_typeof(constraints)='object');

CREATE FUNCTION core.admin_business_role_allows(p_role text,p_action text) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
 SELECT p_action=ANY(ARRAY['admin.accounts.read','admin.overview.read','admin.media.read','admin.audit.read','admin.health.read',
 'moderation.contents.read','moderation.revisions.decide','moderation.cases.read','moderation.cases.decide',
 'moderation.evidence.read','moderation.sanctions.create','moderation.sanctions.revoke','moderation.appeals.read','moderation.appeals.decide',
 'roles.preview','roles.grant','roles.revoke','invitations.create','invitations.revoke','mfa.recovery.read','mfa.recovery.decide',
 'documents.list','documents.create','documents.revisions.list','documents.revisions.create','documents.revisions.patch',
 'documents.revisions.ready','documents.release.preview','documents.release.publish','documents.release.withdraw',
 'retention.read','retention.extend','purge.retry','backups.read','backups.create','restores.preview','restores.create','restores.read',
 'config.read','auth.config.write','config.release','config.rollback']) AND
 (p_role='super_admin' OR
  p_role='content_moderator' AND (p_action LIKE 'moderation.%' OR p_action IN ('admin.overview.read','admin.media.read')) OR
  p_role='community_operator' AND p_action IN ('invitations.create','invitations.revoke','admin.overview.read') OR
  p_role='auditor' AND p_action IN ('admin.audit.read','admin.health.read','retention.read','backups.read','restores.read'))
$$;

CREATE FUNCTION core.admin_business_target_version(p_action text,p_target uuid) RETURNS bigint
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v bigint;
BEGIN
 IF p_target IS NULL THEN RETURN 1; END IF;
 IF p_action LIKE 'documents.revisions.%' AND p_action NOT IN ('documents.revisions.create','documents.revisions.list') THEN
  SELECT row_version INTO v FROM core.document_revision WHERE id=p_target;
 ELSIF p_action='documents.release.withdraw' THEN
  SELECT d.row_version INTO v FROM core.managed_document d JOIN core.document_release r ON r.document_id=d.id WHERE r.id=p_target;
 ELSIF p_action LIKE 'documents.%' THEN SELECT row_version INTO v FROM core.managed_document WHERE id=p_target;
 ELSIF p_action LIKE 'moderation.cases.%' OR p_action='moderation.evidence.read' THEN SELECT row_version INTO v FROM core.report WHERE id=p_target;
 ELSIF p_action LIKE 'moderation.appeals.%' THEN SELECT row_version INTO v FROM core.appeal WHERE id=p_target;
 ELSIF p_action='moderation.sanctions.revoke' THEN SELECT row_version INTO v FROM core.sanction WHERE id=p_target;
 ELSIF p_action='roles.revoke' THEN SELECT row_version INTO v FROM core.admin_grant WHERE id=p_target;
 ELSIF p_action='invitations.revoke' THEN SELECT row_version INTO v FROM core.invitation WHERE id=p_target;
 ELSE
  SELECT row_version INTO v FROM core.resource WHERE id=p_target;
  IF v IS NULL THEN SELECT row_version INTO v FROM core.account WHERE id=p_target; END IF;
 END IF;
 RETURN v;
END $$;

CREATE FUNCTION core.admin_business_access(p_actor uuid,p_session uuid,p_env text,p_aal text,p_action text,p_target uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb; scope_target uuid:=p_target;
BEGIN
 c:=core.admin_identity_context(p_actor,p_session,p_env,p_aal,true);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 IF p_action LIKE 'documents.revisions.%' AND p_action NOT IN ('documents.revisions.create','documents.revisions.list') THEN
  SELECT document_id INTO scope_target FROM core.document_revision WHERE id=p_target;
 ELSIF p_action='documents.release.withdraw' THEN SELECT document_id INTO scope_target FROM core.document_release WHERE id=p_target;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=p_actor AND g.environment=p_env
  AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())
  AND p_action=ANY(g.operation_scopes) AND core.admin_business_role_allows(g.role,p_action)
  AND (g.resource_scope IS NULL OR scope_target IS NOT NULL AND scope_target=ANY(g.resource_scope)
    OR p_target IS NULL AND p_action IN ('documents.list','moderation.appeals.read','admin.media.read','admin.audit.read')))
 THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
 RETURN jsonb_build_object('code','OK');
END $$;

ALTER FUNCTION core.admin_identity_context(uuid,uuid,text,text,boolean) RENAME TO admin_legacy_identity_context;
CREATE FUNCTION core.admin_identity_context(v_actor uuid,v_session uuid,v_env text,v_jwt_aal text,v_require_mfa boolean)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb; permissions jsonb;
BEGIN
 c:=core.admin_legacy_identity_context(v_actor,v_session,v_env,v_jwt_aal,v_require_mfa);
 IF c->>'code'<>'OK' OR c->'data'->'mfa'->>'verified'<>'true' THEN RETURN c; END IF;
 SELECT coalesce(jsonb_agg(DISTINCT action ORDER BY action),'[]'::jsonb) INTO permissions FROM (
  SELECT DISTINCT unnest(g.operation_scopes) AS action,g.role FROM core.admin_grant g
  WHERE g.account_id=v_actor AND g.environment=v_env AND g.revoked_at IS NULL
  AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())
 ) grants WHERE core.admin_business_role_allows(role,action);
 RETURN jsonb_set(c,'{data,permissions}',permissions);
END $$;

CREATE TABLE core.admin_business_preview (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor uuid NOT NULL REFERENCES core.account(id),session_id uuid NOT NULL,
 environment text NOT NULL CHECK(environment IN ('dev','test','production')),action text NOT NULL,target uuid,
 operation_id uuid NOT NULL,payload jsonb NOT NULL,input_digest text NOT NULL,preview_digest text NOT NULL,
 action_digest text NOT NULL UNIQUE,base_version bigint NOT NULL,created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes',UNIQUE(actor,environment,operation_id),
 CHECK(expires_at<=created_at+interval '5 minutes'));
SELECT core.protect_table('core.admin_business_preview',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_business_preview FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();
CREATE TABLE core.admin_business_stepup_binding (
 auth_challenge_id uuid PRIMARY KEY,stepup_id uuid NOT NULL UNIQUE REFERENCES core.stepup_challenge(id),
 actor uuid NOT NULL REFERENCES core.account(id),session_id uuid NOT NULL,factor_id uuid NOT NULL,
 preview_id uuid NOT NULL REFERENCES core.admin_business_preview(id),environment text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp());
SELECT core.protect_table('core.admin_business_stepup_binding',false);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admin_business_stepup_binding FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE FUNCTION core.admin_business_payload(p_payload jsonb) RETURNS jsonb LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
 SELECT p_payload-ARRAY['stepup_id','preview_id','preview_digest']::text[]
$$;

CREATE FUNCTION core.admin_document_constraints_result(p_actor uuid,p_session uuid,p_env text,p_aal text,p_action text,p_target uuid,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb;doc core.managed_document;doc_ref uuid:=p_target;kind_in text;surfaces_in jsonb;purposes_in jsonb;
BEGIN
 c:=core.admin_business_access(p_actor,p_session,p_env,p_aal,p_action,p_target);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 IF p_action LIKE 'documents.revisions.%' AND p_action NOT IN ('documents.revisions.create','documents.revisions.list') THEN
  SELECT document_id INTO doc_ref FROM core.document_revision WHERE id=p_target;
 ELSIF p_action='documents.release.withdraw' THEN SELECT document_id INTO doc_ref FROM core.document_release WHERE id=p_target; END IF;
 IF p_action='documents.create' THEN
  kind_in:=p_payload->>'kind';surfaces_in:=p_payload->'public_surfaces';purposes_in:='[]'::jsonb;
 ELSE
  SELECT * INTO doc FROM core.managed_document WHERE id=doc_ref;
  IF doc.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  kind_in:=doc.kind;surfaces_in:=coalesce(p_payload->'scope'->'surfaces',to_jsonb(doc.public_surfaces));
  purposes_in:=coalesce(nullif(p_payload->'scope'->'purposes','null'::jsonb),'[]'::jsonb);
 END IF;
 IF NOT EXISTS(SELECT 1 FROM core.admin_grant g WHERE g.account_id=p_actor AND g.environment=p_env
  AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp()) AND p_action=ANY(g.operation_scopes)
  AND core.admin_business_role_allows(g.role,p_action) AND (g.resource_scope IS NULL OR doc_ref=ANY(g.resource_scope))
  AND (NOT g.constraints ? 'document_kinds' OR g.constraints->'document_kinds' @> jsonb_build_array(kind_in))
  AND (NOT g.constraints ? 'document_surfaces' OR g.constraints->'document_surfaces' @> surfaces_in)
  AND (NOT g.constraints ? 'document_purposes' OR g.constraints->'document_purposes' @> purposes_in))
 THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
 RETURN jsonb_build_object('code','OK');
END $$;
CREATE FUNCTION core.admin_business_preview_result(p_actor uuid,p_session uuid,p_env text,p_aal text,p_action text,p_target uuid,p_operation uuid,p_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb; p core.admin_business_preview; normalized jsonb; digest text; version bigint;
BEGIN
 PERFORM pg_advisory_xact_lock(17013,1);
 c:=core.admin_business_access(p_actor,p_session,p_env,p_aal,p_action,p_target);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 IF p_env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
 IF EXISTS(SELECT 1 FROM core.account WHERE id=p_actor AND sensitive_until>clock_timestamp()) THEN RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN'); END IF;
 IF p_operation IS NULL OR jsonb_typeof(p_payload) IS DISTINCT FROM 'object' OR p_payload->>'operation_id' IS DISTINCT FROM p_operation::text
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
 normalized:=core.admin_business_payload(p_payload);
 digest:=encode(sha256(convert_to(jsonb_build_array(p_action,p_target,normalized)::text,'UTF8')),'hex');
 SELECT * INTO p FROM core.admin_business_preview WHERE actor=p_actor AND environment=p_env AND operation_id=p_operation;
 version:=core.admin_business_target_version(p_action,p_target);
 IF version IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
 IF p.id IS NOT NULL THEN
  IF p.input_digest<>digest OR p.session_id<>p_session OR p.base_version<>version THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF p.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
 ELSE
  IF EXISTS(SELECT 1 FROM core.operation WHERE actor=p_actor AND operation_id=p_operation) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  INSERT INTO core.admin_business_preview(actor,session_id,environment,action,target,operation_id,payload,input_digest,preview_digest,action_digest,base_version)
   VALUES(p_actor,p_session,p_env,p_action,p_target,p_operation,normalized,digest,
    encode(sha256(convert_to(jsonb_build_array(p_actor,p_session,p_env,digest,version)::text,'UTF8')),'hex'),
    encode(sha256(convert_to(jsonb_build_array('admin.business',p_actor,p_session,p_env,digest,version)::text,'UTF8')),'hex'),version)
   RETURNING * INTO p;
 END IF;
 RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',p.id,'preview_digest',p.preview_digest,
  'action_digest',p.action_digest,'expires_at',p.expires_at,'base_version',p.base_version,
  'affected_refs',CASE WHEN p_target IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(p_target) END,
  'impacts',jsonb_build_array('按当前权限与版本执行 '||p_action,'仅本次操作的一次性 TOTP 证明有效')));
END $$;

CREATE FUNCTION core.admin_business_proof_result(p_actor uuid,p_session uuid,p_env text,p_aal text,p_action text,p_target uuid,p_operation uuid,p_payload jsonb,p_stepup uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb;p core.admin_business_preview;s core.stepup_challenge;digest text;
BEGIN
 PERFORM pg_advisory_xact_lock(17013,1);
 c:=core.admin_business_access(p_actor,p_session,p_env,p_aal,p_action,p_target);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 IF p_env='production' THEN RETURN jsonb_build_object('code','PRODUCTION_CONFIRMATION_REQUIRED'); END IF;
 IF EXISTS(SELECT 1 FROM core.account WHERE id=p_actor AND sensitive_until>clock_timestamp()) THEN RETURN jsonb_build_object('code','SENSITIVE_COOLDOWN'); END IF;
 digest:=encode(sha256(convert_to(jsonb_build_array(p_action,p_target,core.admin_business_payload(p_payload))::text,'UTF8')),'hex');
 SELECT * INTO p FROM core.admin_business_preview WHERE actor=p_actor AND environment=p_env AND operation_id=p_operation;
 IF p.id IS NULL OR p.session_id<>p_session OR p.input_digest<>digest OR p.base_version IS DISTINCT FROM core.admin_business_target_version(p_action,p_target)
  OR p_payload->>'operation_id' IS DISTINCT FROM p_operation::text OR p_payload ? 'preview_digest' AND p_payload->>'preview_digest' IS DISTINCT FROM p.preview_digest
  THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
 IF p.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
 SELECT * INTO s FROM core.stepup_challenge WHERE id=p_stepup FOR UPDATE;
 IF s.id IS NULL OR s.account_id<>p_actor OR s.session_id<>p_session OR s.action_digest<>p.action_digest
  OR s.consumed_at IS NOT NULL OR s.expires_at<=clock_timestamp() OR NOT EXISTS(
   SELECT 1 FROM core.admin_business_stepup_binding b JOIN auth.mfa_factors f ON f.id=b.factor_id AND f.user_id=p_actor
   AND f.factor_type='totp' AND f.status='verified' WHERE b.stepup_id=p_stepup AND b.preview_id=p.id
   AND b.actor=p_actor AND b.session_id=p_session AND b.environment=p_env)
  THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
 UPDATE core.stepup_challenge SET consumed_at=clock_timestamp() WHERE id=p_stepup;
 RETURN jsonb_build_object('code','OK');
END $$;

ALTER FUNCTION core.admin_stepup_target_result(uuid,uuid,text,text,text) RENAME TO admin_legacy_stepup_target_result;
ALTER FUNCTION core.admin_stepup_result(uuid,uuid,text,text,uuid,uuid,text) RENAME TO admin_legacy_stepup_result;
CREATE FUNCTION core.admin_stepup_target_result(actor uuid,session_ref uuid,env text,jwt_aal text,action_digest text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p core.admin_business_preview;c jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock_shared(17013,1);
 SELECT * INTO p FROM core.admin_business_preview b WHERE b.actor=admin_stepup_target_result.actor
  AND b.session_id=session_ref AND b.environment=env AND b.action_digest=admin_stepup_target_result.action_digest;
 IF p.id IS NULL THEN RETURN core.admin_legacy_stepup_target_result(actor,session_ref,env,jwt_aal,action_digest); END IF;
 c:=core.admin_business_access(actor,session_ref,env,jwt_aal,p.action,p.target);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 IF p.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','PREVIEW_EXPIRED'); END IF;
 IF p.base_version IS DISTINCT FROM core.admin_business_target_version(p.action,p.target) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
 RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',p.id,'action_digest',p.action_digest,'expires_at',p.expires_at));
END $$;
CREATE FUNCTION core.admin_stepup_result(actor uuid,session_ref uuid,env text,jwt_aal text,factor_ref uuid,auth_challenge_ref uuid,action_digest text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c jsonb;p core.admin_business_preview;b core.admin_business_stepup_binding;s core.stepup_challenge;auth_row auth.mfa_challenges;
BEGIN
 PERFORM pg_advisory_xact_lock(17013,1);
 c:=core.admin_stepup_target_result(actor,session_ref,env,jwt_aal,action_digest);
 IF c->>'code'<>'OK' THEN RETURN c; END IF;
 SELECT * INTO p FROM core.admin_business_preview WHERE id=(c->'data'->>'preview_id')::uuid;
 IF p.id IS NULL THEN
  IF EXISTS(SELECT 1 FROM core.admin_business_stepup_binding WHERE auth_challenge_id=auth_challenge_ref) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  RETURN core.admin_legacy_stepup_result(actor,session_ref,env,jwt_aal,factor_ref,auth_challenge_ref,action_digest);
 END IF;
 IF factor_ref IS NULL OR auth_challenge_ref IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
 SELECT * INTO b FROM core.admin_business_stepup_binding WHERE auth_challenge_id=auth_challenge_ref;
 IF b.auth_challenge_id IS NOT NULL THEN
  IF b.actor<>actor OR b.session_id<>session_ref OR b.environment<>env OR b.factor_id<>factor_ref OR b.preview_id<>p.id THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO s FROM core.stepup_challenge WHERE id=b.stepup_id;
  IF s.consumed_at IS NOT NULL OR s.expires_at<=clock_timestamp() THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
 ELSE
  IF EXISTS(SELECT 1 FROM core.admin_stepup_binding WHERE auth_challenge_id=auth_challenge_ref) OR EXISTS(
   SELECT 1 FROM core.admin_review_stepup_binding WHERE auth_challenge_id=auth_challenge_ref) THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT m.* INTO auth_row FROM auth.mfa_challenges m JOIN auth.mfa_factors f ON f.id=m.factor_id
   JOIN auth.sessions a ON a.factor_id=f.id AND a.user_id=f.user_id
   WHERE m.id=auth_challenge_ref AND f.id=factor_ref AND f.user_id=actor AND f.factor_type='totp' AND f.status='verified'
   AND a.id=session_ref AND a.aal='aal2' AND m.created_at>=p.created_at AND m.created_at<=m.verified_at
   AND m.verified_at>=p.created_at AND m.verified_at<=clock_timestamp() AND m.verified_at>clock_timestamp()-interval '5 minutes'
   AND EXISTS(SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=a.id AND amr.authentication_method='totp'
    AND amr.updated_at>=m.verified_at AND amr.updated_at<=clock_timestamp()) FOR SHARE OF m,f,a;
  IF auth_row.id IS NULL THEN RETURN jsonb_build_object('code','STEPUP_REQUIRED'); END IF;
  INSERT INTO core.stepup_challenge(account_id,session_id,action_digest,aal,verified_at,expires_at)
   VALUES(actor,session_ref,action_digest,'aal2',auth_row.verified_at,least(auth_row.verified_at+interval '5 minutes',p.expires_at)) RETURNING * INTO s;
  INSERT INTO core.admin_business_stepup_binding(auth_challenge_id,stepup_id,actor,session_id,factor_id,preview_id,environment)
   VALUES(auth_challenge_ref,s.id,actor,session_ref,factor_ref,p.id,env);
 END IF;
 RETURN jsonb_build_object('code','OK','data',jsonb_build_object('stepup_id',s.id,'action_digest',s.action_digest,'expires_at',s.expires_at));
END $$;

REVOKE ALL ON core.admin_business_preview,core.admin_business_stepup_binding FROM core_runtime,core_worker,supabase_auth_admin;
REVOKE ALL ON FUNCTION core.admin_legacy_identity_context(uuid,uuid,text,text,boolean),
 core.admin_legacy_stepup_target_result(uuid,uuid,text,text,text),core.admin_legacy_stepup_result(uuid,uuid,text,text,uuid,uuid,text)
 FROM PUBLIC,anon,authenticated,service_role,core_worker,core_runtime;
REVOKE ALL ON FUNCTION core.admin_business_access(uuid,uuid,text,text,text,uuid),core.admin_business_target_version(text,uuid),
 core.admin_business_preview_result(uuid,uuid,text,text,text,uuid,uuid,jsonb),
 core.admin_business_proof_result(uuid,uuid,text,text,text,uuid,uuid,jsonb,uuid),core.admin_business_role_allows(text,text),core.admin_business_payload(jsonb)
 FROM PUBLIC,anon,authenticated,service_role,core_worker,core_runtime;
REVOKE ALL ON FUNCTION core.admin_document_constraints_result(uuid,uuid,text,text,text,uuid,jsonb)
 FROM PUBLIC,anon,authenticated,service_role,core_worker,core_runtime;
GRANT EXECUTE ON FUNCTION core.admin_business_preview_result(uuid,uuid,text,text,text,uuid,uuid,jsonb),
 core.admin_identity_context(uuid,uuid,text,text,boolean),core.admin_stepup_target_result(uuid,uuid,text,text,text),
 core.admin_stepup_result(uuid,uuid,text,text,uuid,uuid,text) TO core_runtime;

-- Preserve legacy preview logic under its new implicit PL/pgSQL label.
CREATE OR REPLACE FUNCTION core.admin_legacy_stepup_target_result(actor uuid,session_ref uuid,env text,jwt_aal text,action_digest text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE config_preview core.admin_config_preview; review_preview core.admin_review_preview;
  result jsonb; revision_row core.content_revision; resource_row core.resource;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  result:=core.admin_identity_context(actor,session_ref,env,jwt_aal,true);
  IF result->>'code'<>'OK' THEN RETURN result; END IF;
  IF action_digest IS NULL OR action_digest !~ '^[a-f0-9]{64}$' THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO config_preview FROM core.admin_config_preview p WHERE p.actor=admin_legacy_stepup_target_result.actor
    AND p.session_id=session_ref AND p.environment=env AND p.action_digest=admin_legacy_stepup_target_result.action_digest;
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
  SELECT * INTO review_preview FROM core.admin_review_preview p WHERE p.actor=admin_legacy_stepup_target_result.actor
    AND p.session_id=session_ref AND p.environment=env AND p.action_digest=admin_legacy_stepup_target_result.action_digest;
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
