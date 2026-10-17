CREATE TABLE core.config_definition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), key text NOT NULL UNIQUE, owner text NOT NULL,
  schema jsonb NOT NULL, default_value jsonb NOT NULL, range jsonb NOT NULL, scopes text[] NOT NULL,
  priority integer NOT NULL, permissions text[] NOT NULL, dependencies text[] NOT NULL,
  effect_mode text NOT NULL, existing_policy text NOT NULL, evidence_refs text[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.config_bundle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version text NOT NULL UNIQUE, scoped_values jsonb NOT NULL,
  schema_version integer NOT NULL CHECK (schema_version > 0), compat jsonb NOT NULL,
  state text NOT NULL CHECK (state IN ('draft','validated','ready','active','rejected')),
  effective_at timestamptz, preview_digest text NOT NULL, actor uuid REFERENCES core.account(id), audit_ref uuid REFERENCES core.audit_event(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE FUNCTION core.check_bundle_binding() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF ROW(NEW.version,NEW.scoped_values,NEW.schema_version,NEW.compat,NEW.preview_digest)
    IS DISTINCT FROM ROW(OLD.version,OLD.scoped_values,OLD.schema_version,OLD.compat,OLD.preview_digest) THEN
    RAISE EXCEPTION 'Configuration bundle contents are immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_binding BEFORE UPDATE ON core.config_bundle FOR EACH ROW EXECUTE FUNCTION core.check_bundle_binding();
CREATE TABLE core.config_activation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), environment text NOT NULL UNIQUE,
  active_ptr text NOT NULL REFERENCES core.config_bundle(version),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
SELECT core.protect_table('core.config_definition');
SELECT core.protect_table('core.config_bundle');
SELECT core.protect_table('core.config_activation');
