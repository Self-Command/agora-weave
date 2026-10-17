CREATE FUNCTION core.policy_write_lock() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  -- Statement locks precede row locks; dependency-edge locking follows this gate.
  PERFORM pg_advisory_xact_lock(17013,1);
  RETURN NULL;
END $$;
DO $$
DECLARE name text;
BEGIN
  FOREACH name IN ARRAY ARRAY['account','session_registry','admin_grant','follow','block','resource','content_revision','resource_dependency','deletion','dependency_hide'] LOOP
    EXECUTE format('CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.%I FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock()', name);
  END LOOP;
END $$;
CREATE TRIGGER core_policy_admission BEFORE INSERT OR UPDATE OR DELETE ON auth.sessions
FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER core_policy_admission BEFORE UPDATE OR DELETE ON auth.users
FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
