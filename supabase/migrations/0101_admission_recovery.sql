CREATE TABLE core.invitation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  creator_id uuid NOT NULL REFERENCES core.account(id), expires_at timestamptz NOT NULL,
  state text NOT NULL DEFAULT 'unused' CHECK (state IN ('unused','used','revoked','expired')),
  used_account_id uuid REFERENCES core.account(id), used_at timestamptz, revoke_reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  CHECK ((state = 'used' AND used_account_id IS NOT NULL AND used_at IS NOT NULL AND used_at < expires_at)
    OR (state <> 'used' AND used_account_id IS NULL AND used_at IS NULL)),
  CHECK (state <> 'revoked' OR coalesce(length(btrim(revoke_reason)) > 0,false))
);
CREATE INDEX ON core.invitation(expires_at) WHERE state = 'unused';

CREATE FUNCTION core.check_invitation_transition() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF ROW(NEW.id,NEW.token_hash,NEW.creator_id,NEW.expires_at)
      IS DISTINCT FROM ROW(OLD.id,OLD.token_hash,OLD.creator_id,OLD.expires_at) THEN
      RAISE EXCEPTION 'Invitation binding is immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.state <> 'unused' AND ROW(NEW.state,NEW.used_account_id,NEW.used_at,NEW.revoke_reason)
      IS DISTINCT FROM ROW(OLD.state,OLD.used_account_id,OLD.used_at,OLD.revoke_reason) THEN
      RAISE EXCEPTION 'Invitation terminal state is immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.state = 'used' THEN RETURN NEW; END IF;
  END IF;
  IF NEW.state = 'used' AND (NEW.expires_at <= clock_timestamp() OR NEW.used_at > clock_timestamp()) THEN
    RAISE EXCEPTION 'Invitation is not currently usable' USING ERRCODE = '23514';
  END IF;
  IF NEW.state = 'expired' AND NEW.expires_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Invitation expiry is authoritative' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER invitation_transition BEFORE INSERT OR UPDATE ON core.invitation
FOR EACH ROW EXECUTE FUNCTION core.check_invitation_transition();

CREATE TABLE core.admission (
  account_id uuid PRIMARY KEY REFERENCES core.account(id), invitation_id uuid NOT NULL UNIQUE REFERENCES core.invitation(id),
  phone_verified_at timestamptz NOT NULL, age_declaration jsonb NOT NULL,
  terms_version uuid NOT NULL REFERENCES core.document_release(id),
  terms_receipt_id uuid NOT NULL UNIQUE REFERENCES core.document_receipt(id),
  admitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (phone_verified_at <= admitted_at),
  CHECK (coalesce(jsonb_typeof(age_declaration) = 'object'
    AND age_declaration ?& ARRAY['version','declared']
    AND age_declaration - ARRAY['version','declared'] = '{}'::jsonb
    AND age_declaration->'declared' = 'true'::jsonb
    AND jsonb_typeof(age_declaration->'version') = 'string'
    AND length(btrim(age_declaration->>'version')) BETWEEN 1 AND 128,false))
);
CREATE FUNCTION core.check_admission_facts() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE invitation core.invitation;
BEGIN
  IF NEW.admitted_at > clock_timestamp() OR NEW.phone_verified_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Admission times must be current verified facts' USING ERRCODE = '23514';
  END IF;
  SELECT * INTO invitation FROM core.invitation WHERE id = NEW.invitation_id FOR UPDATE;
  IF invitation.state IS DISTINCT FROM 'used' OR invitation.used_account_id IS DISTINCT FROM NEW.account_id
    OR invitation.used_at > NEW.admitted_at OR invitation.expires_at <= NEW.admitted_at THEN
    RAISE EXCEPTION 'Admission requires its single consumed invitation' USING ERRCODE = '23514';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM core.document_receipt receipt
    JOIN core.document_release release ON release.id = receipt.release_id
    JOIN core.managed_document document ON document.id = release.document_id
    JOIN core.document_revision revision ON revision.id = release.revision_ref AND revision.document_id = document.id
    WHERE receipt.id = NEW.terms_receipt_id AND receipt.subject = NEW.account_id
      AND receipt.release_id = NEW.terms_version AND receipt.decision = 'consented' AND receipt.purpose = 'register'
      AND receipt.revision_digest = release.content_digest AND revision.content_digest = release.content_digest
      AND release.state = 'published' AND release.published_at IS NOT NULL AND release.published_at <= clock_timestamp()
      AND revision.state = 'ready' AND document.kind = 'terms' AND document.active_release_id = release.id
      AND 'app' = ANY(document.public_surfaces)
      AND release.scope @> '{"surfaces":["app"],"purposes":["register"]}'::jsonb
  ) THEN
    RAISE EXCEPTION 'Admission requires matching current published terms consent' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER admission_facts BEFORE INSERT ON core.admission FOR EACH ROW EXECUTE FUNCTION core.check_admission_facts();
CREATE TRIGGER immutable_fact BEFORE UPDATE OR DELETE ON core.admission FOR EACH ROW EXECUTE FUNCTION core.reject_mutation();

CREATE TABLE core.recovery_case (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_ref uuid REFERENCES core.account(id),
  mode text NOT NULL CHECK (mode IN ('trusted','manual','mfa_emergency')),
  state text NOT NULL DEFAULT 'received' CHECK (state IN ('received','reviewing','approved','rejected','need_evidence')),
  minimal_evidence_ref uuid, reviewer uuid REFERENCES core.account(id), result text,
  audit_ref uuid REFERENCES core.audit_event(id), executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  CHECK (state NOT IN ('approved','rejected') OR (reviewer IS NOT NULL AND audit_ref IS NOT NULL
    AND minimal_evidence_ref IS NOT NULL AND coalesce(length(btrim(result)) > 0,false))),
  CHECK (executed_at IS NULL OR state = 'approved')
);
CREATE INDEX ON core.recovery_case(account_ref,created_at,id);
CREATE INDEX ON core.recovery_case(state,created_at,id) WHERE state IN ('received','reviewing','need_evidence');

CREATE FUNCTION core.check_recovery_transition() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'received' OR NEW.executed_at IS NOT NULL THEN
      RAISE EXCEPTION 'Recovery starts with a request' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF ROW(NEW.account_ref,NEW.mode) IS DISTINCT FROM ROW(OLD.account_ref,OLD.mode) THEN
      RAISE EXCEPTION 'Recovery subject and mode are immutable' USING ERRCODE = '23514';
    END IF;
    IF NEW.state <> OLD.state AND NOT ((OLD.state IN ('received','need_evidence') AND NEW.state = 'reviewing')
      OR (OLD.state = 'reviewing' AND NEW.state IN ('approved','rejected','need_evidence'))) THEN
      RAISE EXCEPTION 'Recovery state transition refused' USING ERRCODE = '23514';
    END IF;
    IF OLD.state IN ('approved','rejected') AND ROW(NEW.minimal_evidence_ref,NEW.reviewer,NEW.result,NEW.audit_ref)
      IS DISTINCT FROM ROW(OLD.minimal_evidence_ref,OLD.reviewer,OLD.result,OLD.audit_ref) THEN
      RAISE EXCEPTION 'Recovery decision is immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.executed_at IS NOT NULL AND NEW.executed_at IS DISTINCT FROM OLD.executed_at THEN
      RAISE EXCEPTION 'Recovery may execute once' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW.executed_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Recovery execution time must be current' USING ERRCODE = '23514';
  END IF;
  IF NEW.state IN ('approved','rejected') AND NOT EXISTS (
    SELECT 1 FROM core.audit_event audit WHERE audit.id = NEW.audit_ref AND audit.actor = NEW.reviewer
      AND audit.object_ref = NEW.id AND audit.operation = 'recovery.review' AND audit.result = NEW.state
  ) THEN
    RAISE EXCEPTION 'Recovery decision requires its matching review audit' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER recovery_transition BEFORE INSERT OR UPDATE ON core.recovery_case
FOR EACH ROW EXECUTE FUNCTION core.check_recovery_transition();
SELECT core.protect_table('core.invitation');
SELECT core.protect_table('core.admission',false);
SELECT core.protect_table('core.recovery_case');
REVOKE ALL ON FUNCTION core.check_invitation_transition(), core.check_admission_facts(), core.check_recovery_transition()
FROM PUBLIC, anon, authenticated, service_role, core_runtime;
