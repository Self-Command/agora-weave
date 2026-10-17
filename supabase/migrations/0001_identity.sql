CREATE SCHEMA core;
REVOKE ALL ON SCHEMA core FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA core REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA core REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated, service_role;

CREATE FUNCTION core.advance_row_version() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  NEW.row_version := OLD.row_version + 1;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END $$;

CREATE FUNCTION core.reject_mutation() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  RAISE EXCEPTION 'The stored fact is immutable' USING ERRCODE = '23514';
END $$;

-- Application roles have neither schema access nor table grants. Infrastructure
-- migrations retain an explicit policy even when FORCE ROW LEVEL SECURITY applies.
CREATE FUNCTION core.protect_table(target regclass, mutable boolean DEFAULT true) RETURNS void
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', target);
  EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', target);
  EXECUTE format('REVOKE ALL ON TABLE %s FROM PUBLIC, anon, authenticated, service_role', target);
  EXECUTE format('CREATE POLICY infrastructure_owner ON %s TO postgres USING (true) WITH CHECK (true)', target);
  IF mutable THEN
    EXECUTE format('CREATE TRIGGER advance_row_version BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION core.advance_row_version()', target);
  END IF;
END $$;

CREATE TABLE core.account (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled')),
  phone_changed_at timestamptz, sensitive_until timestamptz,
  identity_epoch bigint NOT NULL DEFAULT 1 CHECK (identity_epoch > 0),
  registered_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.session_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL UNIQUE REFERENCES auth.sessions(id),
  account_id uuid NOT NULL REFERENCES core.account(id), device_label text NOT NULL DEFAULT '',
  trusted_at timestamptz, revoked_at timestamptz, epoch bigint NOT NULL DEFAULT 1 CHECK (epoch > 0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE FUNCTION core.check_session_owner() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.sessions WHERE id = NEW.session_id AND user_id = NEW.account_id) THEN
    RAISE EXCEPTION 'Session ownership does not match' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER session_owner BEFORE INSERT OR UPDATE ON core.session_registry
FOR EACH ROW EXECUTE FUNCTION core.check_session_owner();
CREATE INDEX ON core.session_registry(account_id, created_at, id);
CREATE TABLE core.admin_grant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL REFERENCES core.account(id),
  role text NOT NULL, operation_scopes text[] NOT NULL, resource_scope uuid[], environment text NOT NULL,
  expires_at timestamptz, revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE INDEX ON core.admin_grant(account_id, environment);
CREATE TABLE core.stepup_challenge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_id uuid NOT NULL REFERENCES core.account(id),
  session_id uuid NOT NULL REFERENCES core.session_registry(session_id), action_digest text NOT NULL,
  aal text NOT NULL CHECK (aal = 'aal2'), verified_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL CHECK (expires_at > verified_at), consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
SELECT core.protect_table('core.account');
SELECT core.protect_table('core.session_registry');
SELECT core.protect_table('core.admin_grant');
SELECT core.protect_table('core.stepup_challenge');
