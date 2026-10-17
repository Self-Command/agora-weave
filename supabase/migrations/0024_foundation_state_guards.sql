CREATE FUNCTION core.check_obligation_clock() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF TG_TABLE_NAME='deletion' THEN
    IF ROW(NEW.target,NEW.actor,NEW.kind,NEW.deleted_at) IS DISTINCT FROM ROW(OLD.target,OLD.actor,OLD.kind,OLD.deleted_at)
      OR OLD.state='physical_removed' AND NEW.state<>'physical_removed' THEN
      RAISE EXCEPTION 'Deletion origin and physical removal are irreversible' USING ERRCODE='23514';
    END IF;
  ELSIF ROW(NEW.target,NEW.storage_ref,NEW.class,NEW.owner_plugin,NEW.trigger_at)
    IS DISTINCT FROM ROW(OLD.target,OLD.storage_ref,OLD.class,OLD.owner_plugin,OLD.trigger_at) THEN
    RAISE EXCEPTION 'Retention origin cannot be reset' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER obligation_clock BEFORE UPDATE ON core.deletion FOR EACH ROW EXECUTE FUNCTION core.check_obligation_clock();
CREATE TRIGGER obligation_clock BEFORE UPDATE ON core.retention_record FOR EACH ROW EXECUTE FUNCTION core.check_obligation_clock();

CREATE FUNCTION core.check_media_state() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE next_states text[];
BEGIN
  IF NEW.state=OLD.state THEN RETURN NEW; END IF;
  next_states:=CASE OLD.state
    WHEN 'allocated' THEN ARRAY['uploading','failed','orphan','cleaned']
    WHEN 'uploading' THEN ARRAY['uploaded','failed','orphan','cleaned']
    WHEN 'uploaded' THEN ARRAY['validated','failed','quarantined','orphan','cleaned']
    WHEN 'validated' THEN ARRAY['reviewed','failed','quarantined','orphan','cleaned']
    WHEN 'reviewed' THEN ARRAY['bound','quarantined','orphan','cleaned']
    WHEN 'bound' THEN ARRAY['quarantined','orphan','cleaned']
    WHEN 'failed' THEN ARRAY['uploading','orphan','cleaned']
    WHEN 'quarantined' THEN ARRAY['uploaded','orphan','cleaned']
    WHEN 'orphan' THEN ARRAY['uploaded','cleaned'] ELSE ARRAY[]::text[] END;
  IF NOT NEW.state=ANY(next_states) THEN RAISE EXCEPTION 'Invalid media state transition' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER media_state BEFORE UPDATE ON core.media_object FOR EACH ROW EXECUTE FUNCTION core.check_media_state();

CREATE FUNCTION core.check_config_state() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.state<>OLD.state AND NOT (
    OLD.state='draft' AND NEW.state IN ('validated','rejected') OR
    OLD.state='validated' AND NEW.state IN ('ready','rejected') OR
    OLD.state='ready' AND NEW.state IN ('active','rejected')) THEN
    RAISE EXCEPTION 'Invalid configuration state transition' USING ERRCODE='23514';
  END IF;
  IF OLD.state='active' AND ROW(NEW.effective_at,NEW.consumers_ready) IS DISTINCT FROM ROW(OLD.effective_at,OLD.consumers_ready) THEN
    RAISE EXCEPTION 'Active configuration readiness is immutable' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER config_state BEFORE UPDATE ON core.config_bundle FOR EACH ROW EXECUTE FUNCTION core.check_config_state();

CREATE FUNCTION core.check_document_release_state() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.state<>OLD.state AND NOT (
    OLD.state='prepared' AND NEW.state IN ('published','withdrawn') OR
    OLD.state='published' AND NEW.state IN ('superseded','withdrawn')) THEN
    RAISE EXCEPTION 'A terminal document release requires a new publication record' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER release_state BEFORE UPDATE ON core.document_release FOR EACH ROW EXECUTE FUNCTION core.check_document_release_state();
