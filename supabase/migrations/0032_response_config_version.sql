-- Success envelopes identify the actual active configuration without table access.
CREATE FUNCTION core.response_config_version(target_environment text) RETURNS text
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT b.version FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND target_environment IN ('dev','test','production')
      AND b.state='active' AND b.schema_version=1 AND b.effective_at<=clock_timestamp()
$$;
REVOKE ALL ON FUNCTION core.response_config_version(text) FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.response_config_version(text) TO core_runtime;
