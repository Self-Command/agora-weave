CREATE TABLE core.deletion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target uuid NOT NULL, actor uuid NOT NULL REFERENCES core.account(id),
  kind text NOT NULL CHECK (kind IN ('user','moderation','account')), deleted_at timestamptz NOT NULL,
  undo_until timestamptz, restore_until timestamptz, state text NOT NULL,
  epoch bigint NOT NULL DEFAULT 1 CHECK (epoch > 0),
  CHECK (undo_until >= deleted_at AND restore_until >= undo_until),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.dependency_hide (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), cause_deletion uuid NOT NULL REFERENCES core.deletion(id),
  affected_resource uuid NOT NULL REFERENCES core.resource(id), previous_validity boolean NOT NULL,
  hidden_at timestamptz NOT NULL DEFAULT clock_timestamp(), UNIQUE (cause_deletion, affected_resource),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE TABLE core.retention_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target uuid NOT NULL, storage_ref uuid, class text NOT NULL,
  owner_plugin text NOT NULL, trigger_at timestamptz NOT NULL, due_at timestamptz NOT NULL CHECK (due_at >= trigger_at),
  rule_version text NOT NULL, purge_state text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE INDEX ON core.retention_record(due_at, purge_state);
CREATE TABLE core.retention_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), target uuid NOT NULL, subject uuid REFERENCES core.account(id),
  purpose text NOT NULL, allowed_scope text[] NOT NULL, expires_at timestamptz NOT NULL,
  reason text NOT NULL, grant_ref uuid, audit_ref uuid REFERENCES core.audit_event(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
-- This local projection cannot open recovery; the independent journal supplies its watermark.
CREATE TABLE core.security_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), seq bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  deny_intent_id uuid NOT NULL, target uuid NOT NULL, subject uuid, action text NOT NULL,
  policy_epoch bigint NOT NULL CHECK (policy_epoch > 0), committed_result text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT clock_timestamp(), hash_chain text NOT NULL
);
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.security_journal FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();
SELECT core.protect_table('core.deletion');
SELECT core.protect_table('core.dependency_hide');
SELECT core.protect_table('core.retention_record');
SELECT core.protect_table('core.retention_interest');
SELECT core.protect_table('core.security_journal', false);
