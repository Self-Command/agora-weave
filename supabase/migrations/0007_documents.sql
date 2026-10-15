CREATE TABLE core.managed_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), stable_key text NOT NULL, kind text NOT NULL
    CHECK (kind IN ('community_rules','privacy','terms','processing_notice','help')),
  locale text NOT NULL, owner uuid NOT NULL REFERENCES core.account(id), public_surfaces text[] NOT NULL, active_release_id uuid,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (stable_key, locale)
);
CREATE TABLE core.document_revision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid NOT NULL REFERENCES core.managed_document(id),
  version bigint NOT NULL CHECK (version > 0), title text NOT NULL, body text NOT NULL, content_digest text NOT NULL,
  linked_release_refs uuid[] NOT NULL DEFAULT ARRAY[]::uuid[], state text NOT NULL CHECK (state IN ('draft','ready')),
  editor uuid NOT NULL REFERENCES core.account(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (document_id, version), UNIQUE (document_id, id, content_digest)
);
CREATE FUNCTION core.check_ready_document() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF OLD.state = 'ready' THEN
    RAISE EXCEPTION 'Ready document revisions are immutable' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_ready BEFORE UPDATE OR DELETE ON core.document_revision FOR EACH ROW EXECUTE FUNCTION core.check_ready_document();
CREATE TABLE core.document_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid NOT NULL REFERENCES core.managed_document(id),
  revision_ref uuid NOT NULL, content_digest text NOT NULL, scope jsonb NOT NULL,
  state text NOT NULL CHECK (state IN ('prepared','published','superseded','withdrawn')),
  publisher uuid NOT NULL REFERENCES core.account(id), published_at timestamptz, confirmation_ref uuid,
  audit_ref uuid REFERENCES core.audit_event(id),
  FOREIGN KEY (document_id, revision_ref, content_digest) REFERENCES core.document_revision(document_id, id, content_digest),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (document_id, id)
);
ALTER TABLE core.managed_document ADD CONSTRAINT active_release_belongs_to_document
  FOREIGN KEY (id, active_release_id) REFERENCES core.document_release(document_id, id);
CREATE FUNCTION core.check_release_binding() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF ROW(NEW.document_id,NEW.revision_ref,NEW.content_digest,NEW.scope)
    IS DISTINCT FROM ROW(OLD.document_id,OLD.revision_ref,OLD.content_digest,OLD.scope) THEN
    RAISE EXCEPTION 'Document release binding is immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER immutable_binding BEFORE UPDATE ON core.document_release FOR EACH ROW EXECUTE FUNCTION core.check_release_binding();
CREATE TABLE core.document_receipt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), subject uuid NOT NULL, release_id uuid NOT NULL REFERENCES core.document_release(id),
  revision_digest text NOT NULL, presentation_ref uuid NOT NULL, purpose text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('presented','acknowledged','consented','declined')),
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(), request_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.managed_document');
SELECT core.protect_table('core.document_revision');
SELECT core.protect_table('core.document_release');
SELECT core.protect_table('core.document_receipt', false);
