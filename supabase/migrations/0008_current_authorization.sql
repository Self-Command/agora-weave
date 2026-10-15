CREATE ROLE core_runtime LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE core_runtime SET statement_timeout = '5s';
ALTER ROLE core_runtime SET lock_timeout = '3s';
ALTER ROLE core_runtime SET idle_in_transaction_session_timeout = '5s';
GRANT USAGE ON SCHEMA core TO core_runtime;

CREATE FUNCTION core.current_identity(actor uuid, session_ref uuid) RETURNS boolean
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = pg_catalog AS $$
  SELECT EXISTS (
    SELECT 1 FROM core.account a
    JOIN core.session_registry r ON r.account_id = a.id
    JOIN auth.sessions s ON s.id = r.session_id AND s.user_id = a.id
    JOIN auth.users u ON u.id = a.id
    WHERE a.id = actor AND s.id = session_ref AND a.status = 'active'
      AND r.revoked_at IS NULL AND (s.not_after IS NULL OR s.not_after > clock_timestamp())
      AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until <= clock_timestamp())
  )
$$;
REVOKE ALL ON FUNCTION core.current_identity(uuid,uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION core.current_identity(uuid,uuid) TO core_runtime;

CREATE FUNCTION core.read_resource_result(actor uuid, session_ref uuid, target uuid) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = pg_catalog AS $$
DECLARE output jsonb;
BEGIN
  IF actor IS NOT NULL AND NOT core.current_identity(actor, session_ref) THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  IF actor IS NULL AND session_ref IS NOT NULL THEN
    RETURN jsonb_build_object('code','SESSION_INVALID');
  END IF;
  -- Every transitive source participates in the same current read decision.
  IF EXISTS (
    WITH RECURSIVE closure(id) AS (
      SELECT target UNION SELECT d.source FROM core.resource_dependency d JOIN closure c ON d.dependent = c.id
    )
    SELECT 1 FROM closure c LEFT JOIN core.resource r ON r.id = c.id
    LEFT JOIN core.content_revision v ON v.id = r.current_revision_id AND v.resource_id = r.id
    WHERE r.id IS NULL OR r.deleted_at IS NOT NULL OR r.moderation_ref IS NOT NULL
      OR r.publication_state <> 'published' OR v.id IS NULL OR v.review_state <> 'approved'
      OR NOT EXISTS (SELECT 1 FROM core.account author WHERE author.id = r.author_id AND author.status = 'active')
      OR (actor IS NOT NULL AND EXISTS (
        SELECT 1 FROM core.block b WHERE b.active AND b.revoked_at IS NULL AND
          ((b.blocker_id = actor AND b.blocked_id = r.author_id) OR (b.blocker_id = r.author_id AND b.blocked_id = actor))
      ))
      OR NOT coalesce((r.visibility = 'public' OR r.author_id = actor OR
        (r.visibility = 'followers' AND EXISTS (SELECT 1 FROM core.follow f
          WHERE f.follower_id = actor AND f.followed_id = r.author_id AND f.state = 'effective'))), false)
  ) THEN
    RETURN jsonb_build_object('code','NOT_FOUND');
  END IF;
  SELECT jsonb_build_object('id',r.id,'author_id',r.author_id,'visibility',r.visibility,
    'revision_id',v.id,'body',v.body,'row_version',r.row_version)
  INTO output FROM core.resource r JOIN core.content_revision v ON v.id = r.current_revision_id AND v.resource_id = r.id
  WHERE r.id = target;
  RETURN CASE WHEN output IS NULL THEN jsonb_build_object('code','NOT_FOUND')
    ELSE jsonb_build_object('code','OK','data',output) END;
END $$;
REVOKE ALL ON FUNCTION core.read_resource_result(uuid,uuid,uuid) FROM PUBLIC, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION core.read_resource_result(uuid,uuid,uuid) TO core_runtime;
