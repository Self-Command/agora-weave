-- Extend the installed foundation without rewriting previously applied migrations.
ALTER TABLE core.admin_grant ADD CONSTRAINT registered_role CHECK
  (role IN ('super_admin','content_moderator','community_operator','ai_operator','auditor'));
ALTER TABLE core.admin_grant ADD CONSTRAINT grant_environment CHECK (environment IN ('dev','test','production'));
ALTER TABLE core.admin_grant ADD CONSTRAINT grant_scope_present CHECK (cardinality(operation_scopes)>0);
ALTER TABLE core.stepup_challenge ADD CONSTRAINT stepup_binding CHECK
  (action_digest ~ '^[a-f0-9]{64}$' AND expires_at <= verified_at+interval '5 minutes'
    AND (consumed_at IS NULL OR consumed_at >= verified_at));
CREATE FUNCTION core.check_stepup_owner() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM core.session_registry WHERE session_id=NEW.session_id AND account_id=NEW.account_id) THEN
    RAISE EXCEPTION 'Step-up session owner mismatch' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER stepup_owner BEFORE INSERT OR UPDATE ON core.stepup_challenge FOR EACH ROW EXECUTE FUNCTION core.check_stepup_owner();
ALTER TABLE core.user_preferences ADD CONSTRAINT dm_policy_registered CHECK (dm_policy IN ('everyone','following','none'));
ALTER TABLE core.block ADD CONSTRAINT block_clock CHECK ((active AND revoked_at IS NULL) OR NOT active);
ALTER TABLE core.resource ADD CONSTRAINT publication_state_registered CHECK (publication_state IN ('draft','pending','published','rejected'));
ALTER TABLE core.content_revision ADD CONSTRAINT review_state_registered CHECK (review_state IN ('pending','approved','rejected'));
ALTER TABLE core.media_derivative ADD COLUMN object_internal_key text;
ALTER TABLE core.media_object ADD CONSTRAINT bound_media_resource CHECK (state<>'bound' OR bound_resource IS NOT NULL);
ALTER TABLE core.media_object ADD CONSTRAINT media_digest CHECK (sha256 IS NULL OR sha256 ~ '^[a-f0-9]{64}$');
ALTER TABLE core.media_derivative ADD CONSTRAINT derivative_digest CHECK (hash ~ '^[a-f0-9]{64}$');
ALTER TABLE core.media_derivative ADD CONSTRAINT derivative_state CHECK (state IN ('pending','ready','failed','cleaned'));
CREATE INDEX ON core.media_object(bound_resource,state);
CREATE INDEX ON core.media_derivative(parent_media,state);
CREATE INDEX ON core.outbox(lease_until,created_at) WHERE result IS NULL;

-- These are shared authority facts; management workflows remain in their stories.
CREATE TABLE core.plugin_installation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), plugin text NOT NULL, environment text NOT NULL
    CHECK (environment IN ('dev','test','production')), current_version text, target_version text,
  state text NOT NULL CHECK (state IN ('enabled','draining','disabled','uninstalled','failed')),
  lifecycle_epoch bigint NOT NULL DEFAULT 1 CHECK (lifecycle_epoch>0), grants text[] NOT NULL DEFAULT ARRAY[]::text[],
  health text NOT NULL DEFAULT 'unknown', history_projection text NOT NULL DEFAULT 'unavailable',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1,UNIQUE(environment,plugin)
);
CREATE TABLE core.sanction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),subject uuid REFERENCES core.account(id),target uuid REFERENCES core.resource(id),
  type text NOT NULL CHECK (type IN ('temporary','permanent','function')),functions text[] NOT NULL,
  starts_at timestamptz NOT NULL,ends_at timestamptz,reason text NOT NULL,
  original_decider uuid REFERENCES core.account(id),state text NOT NULL CHECK (state IN ('active','revoked','expired')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1,CHECK (subject IS NOT NULL OR target IS NOT NULL),
  CHECK (ends_at IS NULL OR ends_at>starts_at)
);
CREATE INDEX ON core.sanction(subject,state,starts_at);
CREATE INDEX ON core.sanction(target,state,starts_at);
CREATE TABLE core.restore_gate (
  environment text PRIMARY KEY CHECK (environment IN ('dev','test','production')),state text NOT NULL CHECK (state IN ('open','closed')),
  required_watermark bigint NOT NULL DEFAULT 0,replayed_seq bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
INSERT INTO core.restore_gate(environment,state) VALUES ('dev','open'),('test','open'),('production','closed');
SELECT core.protect_table('core.plugin_installation');
SELECT core.protect_table('core.sanction');
SELECT core.protect_table('core.restore_gate',false);
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.plugin_installation
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.sanction
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.restore_gate
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.media_object
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.media_derivative
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.policy_context_result(actor uuid,session_ref uuid,target_environment text,plugin_ref text DEFAULT 'core',installation_epoch bigint DEFAULT 1)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE grants jsonb;
BEGIN
  IF target_environment NOT IN ('dev','test','production') OR NOT EXISTS (SELECT 1 FROM core.restore_gate
    WHERE environment=target_environment AND state='open' AND replayed_seq>=required_watermark) THEN
    RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE');
  END IF;
  IF actor IS NOT NULL AND NOT core.current_identity(actor,session_ref) OR actor IS NULL AND session_ref IS NOT NULL THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  IF plugin_ref<>'core' AND NOT EXISTS (SELECT 1 FROM core.plugin_installation WHERE plugin=plugin_ref
    AND environment=target_environment AND state='enabled' AND lifecycle_epoch=installation_epoch) THEN
    RETURN jsonb_build_object('code','FORBIDDEN');
  END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('role',role,'actions',operation_scopes,'resources',resource_scope)),'[]'::jsonb)
    INTO grants FROM core.admin_grant WHERE account_id=actor AND environment=target_environment AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at>clock_timestamp());
  RETURN jsonb_build_object('code','OK','grants',grants,'sensitive_until',(SELECT sensitive_until FROM core.account WHERE id=actor),
    'identity_epoch',(SELECT identity_epoch FROM core.account WHERE id=actor),
    'session_epoch',(SELECT epoch FROM core.session_registry WHERE session_id=session_ref));
END $$;
REVOKE ALL ON FUNCTION core.policy_context_result(uuid,uuid,text,text,bigint) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.policy_context_result(uuid,uuid,text,text,bigint) TO core_runtime;

CREATE FUNCTION core.resource_action_result(actor uuid,session_ref uuid,target uuid,action_name text,purpose text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF action_name NOT IN ('resource.read','media.read','event.read') OR purpose<>'read' THEN
    RETURN jsonb_build_object('code','FORBIDDEN');
  END IF;
  IF EXISTS (SELECT 1 FROM core.sanction WHERE state='active' AND starts_at<=clock_timestamp()
    AND (ends_at IS NULL OR ends_at>clock_timestamp()) AND (subject=actor OR sanction.target=resource_action_result.target)
    AND ('read'=ANY(functions) OR action_name=ANY(functions))) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  result:=core.read_resource_result(actor,session_ref,target);
  RETURN result;
END $$;
REVOKE ALL ON FUNCTION core.resource_action_result(uuid,uuid,uuid,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.resource_action_result(uuid,uuid,uuid,text,text) TO core_runtime;
