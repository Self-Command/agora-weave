CREATE OR REPLACE FUNCTION core.policy_context_result(actor uuid,session_ref uuid,target_environment text,plugin_ref text DEFAULT 'core',installation_epoch bigint DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE grants jsonb;
BEGIN
  IF target_environment NOT IN ('dev','test','production') OR NOT core.archive_ready() OR NOT EXISTS (SELECT 1 FROM core.restore_gate
    WHERE environment=target_environment AND state='open' AND replayed_seq>=required_watermark) THEN
    RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE');
  END IF;
  IF actor IS NOT NULL AND NOT core.current_identity(actor,session_ref) OR actor IS NULL AND session_ref IS NOT NULL THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  IF plugin_ref<>'core' AND NOT EXISTS (SELECT 1 FROM core.plugin_installation WHERE plugin=plugin_ref
    AND environment=target_environment AND state='enabled' AND lifecycle_epoch=installation_epoch) THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('role',role,'actions',operation_scopes,'resources',resource_scope)),'[]'::jsonb)
    INTO grants FROM core.admin_grant WHERE account_id=actor AND environment=target_environment AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at>clock_timestamp());
  RETURN jsonb_build_object('code','OK','grants',grants,'sensitive_until',(SELECT sensitive_until FROM core.account WHERE id=actor),
    'identity_epoch',(SELECT identity_epoch FROM core.account WHERE id=actor),'session_epoch',(SELECT epoch FROM core.session_registry WHERE session_id=session_ref));
END $$;
