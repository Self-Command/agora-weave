-- Correct the escaped phone pattern introduced in 0041; assurance and grant checks remain intact.
-- Password fallback is only a first-factor guide. Business reads and writes
-- still require the signed aal2 session and current verified TOTP evidence.
CREATE OR REPLACE FUNCTION core.admin_identity_context(v_actor uuid,v_session uuid,v_env text,v_jwt_aal text,v_require_mfa boolean) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_result jsonb; v_phone text; v_verified boolean; v_enrolled boolean; v_roles jsonb; v_permissions jsonb;
BEGIN
  IF v_actor IS NULL OR v_session IS NULL OR v_env IS NULL OR v_env NOT IN ('dev','test','production')
    OR v_jwt_aal IS NULL OR v_jwt_aal NOT IN ('aal1','aal2') THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  v_result:=core.policy_context_result(v_actor,v_session,v_env);
  IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
  SELECT u.phone INTO v_phone FROM auth.users u JOIN auth.sessions s ON s.user_id=u.id
    WHERE u.id=v_actor AND s.id=v_session AND u.phone ~ '^\+?[1-9][0-9]{7,14}$'
      AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())
      AND (s.not_after IS NULL OR s.not_after>clock_timestamp()) AND u.phone_confirmed_at<=clock_timestamp()
      AND s.created_at<=clock_timestamp() AND EXISTS (SELECT 1 FROM core.admission a WHERE a.account_id=u.id)
      AND (EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id AND amr.authentication_method='otp'
        AND amr.created_at>=s.created_at AND amr.created_at<=clock_timestamp()) OR core.admin_password_session_proof(v_actor,v_session,v_env)) FOR SHARE OF u,s;
  IF v_phone IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  SELECT coalesce(jsonb_agg(role ORDER BY role),'[]') INTO v_roles FROM (
    SELECT DISTINCT g.role FROM core.admin_grant g WHERE g.account_id=v_actor AND g.environment=v_env
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())) roles;
  IF jsonb_array_length(v_roles)=0 THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT EXISTS (SELECT 1 FROM auth.mfa_factors f WHERE f.user_id=v_actor AND f.factor_type='totp' AND f.status='verified'
    AND f.created_at<=clock_timestamp()) INTO v_enrolled;
  SELECT v_jwt_aal='aal2' AND EXISTS (SELECT 1 FROM auth.sessions s JOIN auth.mfa_factors f ON f.id=s.factor_id AND f.user_id=s.user_id
    WHERE s.id=v_session AND s.user_id=v_actor AND s.aal='aal2' AND f.factor_type='totp' AND f.status='verified'
      AND f.created_at<=clock_timestamp() AND EXISTS (SELECT 1 FROM auth.mfa_amr_claims amr WHERE amr.session_id=s.id
        AND amr.authentication_method='totp' AND amr.updated_at>=s.created_at AND amr.updated_at<=clock_timestamp())) INTO v_verified;
  IF v_require_mfa AND NOT v_verified THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
  SELECT coalesce(jsonb_agg(action ORDER BY action),'[]') INTO v_permissions FROM
    unnest(ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback']) action
    WHERE v_verified AND (core.admin_has_permission(v_actor,v_env,action) OR action='admin.accounts.read' AND EXISTS (
      SELECT 1 FROM core.admin_grant g WHERE g.account_id=v_actor AND g.environment=v_env AND g.role='super_admin'
        AND action=ANY(g.operation_scopes) AND cardinality(g.resource_scope)>0 AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>clock_timestamp())));
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('account',jsonb_build_object('id',v_actor,'phone_masked',core.admin_phone_mask(v_phone)),
    'environment',v_env,'roles',v_roles,'permissions',v_permissions,'mfa',jsonb_build_object('aal',v_jwt_aal,'enrolled',v_enrolled,'verified',v_verified),
    'sensitive_until',(SELECT a.sensitive_until FROM core.account a WHERE a.id=v_actor)));
END $$;
