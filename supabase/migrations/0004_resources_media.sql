CREATE TABLE core.resource (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), author_id uuid NOT NULL REFERENCES core.account(id),
  kind text NOT NULL CHECK (kind IN ('post','comment','repost','quote')),
  visibility text NOT NULL CHECK (visibility IN ('public','followers','self')), current_revision_id uuid,
  policy_epoch bigint NOT NULL DEFAULT 1 CHECK (policy_epoch > 0), publication_state text NOT NULL DEFAULT 'draft',
  deleted_at timestamptz, moderation_ref uuid, data_class text NOT NULL DEFAULT 'content',
  root_post uuid REFERENCES core.resource(id), thread_id uuid, source_id uuid REFERENCES core.resource(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE INDEX ON core.resource(author_id, created_at, id);
-- The current-revision binding requires this authority before story-level editing.
CREATE TABLE core.content_revision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), resource_id uuid NOT NULL REFERENCES core.resource(id),
  revision_no bigint NOT NULL CHECK (revision_no > 0), body text NOT NULL,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[], mentions uuid[] NOT NULL DEFAULT ARRAY[]::uuid[], alt_text text,
  author uuid NOT NULL REFERENCES core.account(id), review_state text NOT NULL DEFAULT 'pending', submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (resource_id, revision_no), UNIQUE (resource_id, id)
);
ALTER TABLE core.resource ADD CONSTRAINT current_revision_belongs_to_resource
  FOREIGN KEY (id, current_revision_id) REFERENCES core.content_revision(resource_id, id);
CREATE TABLE core.resource_dependency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), dependent uuid NOT NULL REFERENCES core.resource(id),
  source uuid NOT NULL REFERENCES core.resource(id), CHECK (dependent <> source),
  kind text NOT NULL CHECK (kind IN ('quote','thread_head','comment_post','media','ai')),
  source_revision uuid, purposes text[] NOT NULL,
  FOREIGN KEY (source, source_revision) REFERENCES core.content_revision(resource_id, id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (dependent, source, kind)
);
CREATE INDEX ON core.resource_dependency(source, dependent);
CREATE FUNCTION core.reject_dependency_cycle() RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  -- Serialize edge mutations before traversing their current transitive closure.
  PERFORM pg_advisory_xact_lock(17012, 1);
  IF EXISTS (WITH RECURSIVE closure(node) AS (
    SELECT NEW.source UNION SELECT d.source FROM core.resource_dependency d JOIN closure c ON d.dependent = c.node
    WHERE d.id <> NEW.id
  ) SELECT 1 FROM closure WHERE node = NEW.dependent) THEN
    RAISE EXCEPTION 'Resource dependency is cyclic' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER dependency_cycle BEFORE INSERT OR UPDATE ON core.resource_dependency
  FOR EACH ROW EXECUTE FUNCTION core.reject_dependency_cycle();
CREATE TABLE core.media_object (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner uuid NOT NULL REFERENCES core.account(id), plugin text NOT NULL,
  bucket text NOT NULL, object_internal_key text NOT NULL, sha256 text, detected_mime text, codec text,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0), duration_ms bigint CHECK (duration_ms >= 0),
  state text NOT NULL CHECK (state IN ('allocated','uploading','uploaded','validated','reviewed','bound','failed','quarantined','orphan','cleaned')),
  data_class text NOT NULL, bound_resource uuid REFERENCES core.resource(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0), UNIQUE (bucket, object_internal_key)
);
CREATE TABLE core.media_derivative (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), parent_media uuid NOT NULL REFERENCES core.media_object(id),
  kind text NOT NULL CHECK (kind IN ('thumbnail','preview','segment')), hash text NOT NULL,
  size bigint NOT NULL CHECK (size >= 0), state text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
SELECT core.protect_table('core.resource');
SELECT core.protect_table('core.content_revision');
SELECT core.protect_table('core.resource_dependency');
SELECT core.protect_table('core.media_object');
SELECT core.protect_table('core.media_derivative');
