ALTER TABLE core.config_definition
  ADD COLUMN description text NOT NULL DEFAULT 'Legacy registered configuration',
  ADD COLUMN status text NOT NULL DEFAULT 'engineering' CHECK(status IN ('confirmed','engineering','provisional')),
  ADD COLUMN conflicts text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN read_permission text NOT NULL DEFAULT 'config.read',
  ADD COLUMN write_permission text NOT NULL DEFAULT 'config.write',
  ADD COLUMN sensitive boolean NOT NULL DEFAULT true,
  ADD COLUMN consumer_ids text[] NOT NULL DEFAULT ARRAY['api']::text[];
ALTER TABLE core.config_bundle ADD COLUMN consumers_ready text[] NOT NULL DEFAULT ARRAY[]::text[];
CREATE TABLE core.config_group_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),subject uuid NOT NULL REFERENCES core.account(id),group_key text NOT NULL,
  environment text NOT NULL CHECK(environment IN ('dev','test','production')),owner text NOT NULL,active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1,UNIQUE(subject,group_key,environment,owner)
);
SELECT core.protect_table('core.config_group_membership');
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.config_group_membership
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER config_read_admission BEFORE INSERT OR UPDATE OR DELETE ON core.config_activation
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER config_read_admission BEFORE INSERT OR UPDATE OR DELETE ON core.config_definition
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.configuration_snapshot(actor uuid,session_ref uuid,target_environment text,consumer text,audience text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE active core.config_bundle;registry jsonb;layers jsonb;groups jsonb;current_context jsonb;
BEGIN
  IF consumer NOT IN ('api','mobile','admin','share','sql','media','worker','ai','mcp','plugins') OR audience NOT IN ('authenticated','share-read')
    OR (audience='share-read' AND consumer<>'share') OR (audience='authenticated' AND (actor IS NULL OR consumer='share')) THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  current_context:=core.policy_context_result(actor,session_ref,target_environment);
  IF current_context->>'code'<>'OK' THEN RETURN current_context; END IF;
  SELECT b.* INTO active FROM core.config_activation a JOIN core.config_bundle b ON b.version=a.active_ptr
    WHERE a.environment=target_environment AND b.state='active' AND b.effective_at<=clock_timestamp();
  IF active.id IS NULL THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  SELECT jsonb_agg(jsonb_build_object('key',d.key,'owner',d.owner,'description',d.description,'schema',d.schema,
    'default_value',d.default_value,'status',d.status,'scopes',d.scopes,'dependencies',d.dependencies,'conflicts',d.conflicts,
    'read_permission',d.read_permission,'write_permission',d.write_permission,'sensitive',d.sensitive,'effect_mode',d.effect_mode,
    'consumer_ids',d.consumer_ids,'existing_object_policy',d.existing_policy,'validation_refs',d.evidence_refs) ORDER BY d.key) INTO registry FROM core.config_definition d;
  IF jsonb_typeof(active.scoped_values)='array' THEN layers:=active.scoped_values;
  ELSIF jsonb_typeof(active.scoped_values)='object' AND active.scoped_values ? 'global' AND (SELECT count(*) FROM jsonb_object_keys(active.scoped_values))=1 THEN
    layers:=jsonb_build_array(jsonb_build_object('scope','global','values',active.scoped_values->'global'));
  ELSE RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  SELECT coalesce(jsonb_agg(m.group_key),'[]'::jsonb) INTO groups FROM core.config_group_membership m
    WHERE m.subject=actor AND m.environment=target_environment AND m.owner='core' AND m.active;
  RETURN jsonb_build_object('code','OK','input',jsonb_build_object('environment',target_environment,'owner','core','consumer',consumer,
    'audience',audience,'permissions',jsonb_build_array('config.read'),'groups',groups,'definitions',coalesce(registry,'[]'::jsonb),
    'bundle',jsonb_build_object('version',active.version,'schema_version',active.schema_version,'state',active.state,
      'scope_values',layers,'compat_matrix',active.compat,'consumers_ready',active.consumers_ready)));
END $$;
REVOKE ALL ON FUNCTION core.configuration_snapshot(uuid,uuid,text,text,text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION core.configuration_snapshot(uuid,uuid,text,text,text) TO core_runtime;
