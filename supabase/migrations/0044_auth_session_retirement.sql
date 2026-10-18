-- Official Auth v2.196.0 MFA retires other AAL1 sessions in its transaction
-- (internal/api/mfa.go: InvalidateSessionsWithAALLessThan). Keep durable core
-- facts while allowing that official lifecycle; missing Auth rows never grant access.
ALTER TABLE core.session_registry DROP CONSTRAINT session_registry_session_id_fkey;

CREATE OR REPLACE FUNCTION core.check_session_owner() RETURNS trigger
LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF TG_OP='UPDATE' AND (NEW.session_id IS DISTINCT FROM OLD.session_id
    OR NEW.account_id IS DISTINCT FROM OLD.account_id) THEN
    RAISE EXCEPTION 'Session binding is immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' AND OLD.revoked_at IS NOT NULL THEN
    IF NEW.revoked_at IS NULL OR NEW.revoked_at<OLD.revoked_at OR NEW.epoch<OLD.epoch THEN
      RAISE EXCEPTION 'Retired session cannot be reactivated' USING ERRCODE='23514';
    END IF;
    RETURN NEW;
  END IF;
  -- Replace the removed FK's insert/delete synchronization with the same row lock.
  PERFORM 1 FROM auth.sessions s WHERE s.id=NEW.session_id AND s.user_id=NEW.account_id FOR KEY SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session ownership does not match' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION core.retire_auth_session() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  -- Existing auth.sessions statement admission and core durable journal triggers
  -- remain active. A journal failure must roll back the Auth deletion as well.
  UPDATE core.session_registry r SET revoked_at=clock_timestamp(),epoch=r.epoch+1
    WHERE r.session_id=OLD.id AND r.account_id=OLD.user_id AND r.revoked_at IS NULL;
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION core.retire_auth_session() FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker,supabase_auth_admin;
CREATE TRIGGER retire_core_session BEFORE DELETE ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION core.retire_auth_session();
