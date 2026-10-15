CREATE TABLE core.audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid REFERENCES core.account(id), session_id uuid,
  operation text NOT NULL, object_ref uuid, environment text NOT NULL, plugin text NOT NULL,
  reason text NOT NULL, before_digest text, after_digest text, result text NOT NULL, request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX ON core.audit_event(actor, created_at, id);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.audit_event FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();
CREATE TABLE core.operation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid NOT NULL REFERENCES core.account(id), session_id uuid NOT NULL,
  environment text NOT NULL, action text NOT NULL, operation_id uuid NOT NULL,
  payload_hash text NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'), result_ref uuid,
  state text NOT NULL CHECK (state IN ('pending','succeeded','failed','unknown')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (actor, action, operation_id)
);
CREATE TABLE core.outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid NOT NULL UNIQUE, aggregate_id uuid NOT NULL,
  aggregate_version bigint NOT NULL CHECK (aggregate_version > 0), owner_plugin text NOT NULL,
  lifecycle_epoch bigint NOT NULL CHECK (lifecycle_epoch > 0), effect_key text NOT NULL UNIQUE,
  lease uuid, lease_until timestamptz, attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0), result text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), consumer text NOT NULL, effect_key text NOT NULL,
  event_id uuid NOT NULL, result text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (consumer, effect_key)
);
SELECT core.protect_table('core.audit_event', false);
SELECT core.protect_table('core.operation');
SELECT core.protect_table('core.outbox');
SELECT core.protect_table('core.inbox');
