-- The archive worker can close output after an integrity/I/O failure, never reopen it.
CREATE FUNCTION core.worker_close_output(target_environment text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF target_environment NOT IN ('dev','test','production') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
  PERFORM pg_advisory_xact_lock(17013,1);
  UPDATE core.restore_gate SET state='closed',updated_at=clock_timestamp() WHERE environment=target_environment;
END $$;
REVOKE ALL ON FUNCTION core.worker_close_output(text) FROM PUBLIC,anon,authenticated,service_role,core_runtime;
GRANT EXECUTE ON FUNCTION core.worker_close_output(text) TO core_worker,postgres;
