-- Profile facts are separate from content authorization and authentication data.
CREATE TABLE core.profile (
  account_id uuid PRIMARY KEY REFERENCES core.account(id),
  nickname text NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 80),
  username text NOT NULL CHECK (username ~ '^[a-z0-9][a-z0-9_.-]{0,29}$'),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 1000),
  avatar_media_ref uuid REFERENCES core.media_object(id),
  background_media_ref uuid REFERENCES core.media_object(id),
  username_changed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0)
);
CREATE UNIQUE INDEX profile_username_unique ON core.profile(username);
CREATE TABLE core.username_reservation (
  normalized_name text PRIMARY KEY CHECK (normalized_name ~ '^[a-z0-9][a-z0-9_.-]{0,29}$'),
  account_id uuid NOT NULL REFERENCES core.account(id),
  current boolean NOT NULL,
  reserved_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version > 0),
  CHECK ((current AND reserved_until IS NULL) OR (NOT current AND reserved_until IS NOT NULL))
);
CREATE UNIQUE INDEX username_current_owner ON core.username_reservation(account_id) WHERE current;
SELECT core.protect_table('core.profile');
SELECT core.protect_table('core.username_reservation');
CREATE TRIGGER profile_policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.profile
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();
CREATE TRIGGER username_policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.username_reservation
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

-- Deployment registry owns reserved names; the active bundle may override them.
INSERT INTO core.config_definition(key,owner,schema,default_value,range,scopes,priority,
  permissions,dependencies,effect_mode,existing_policy,evidence_refs,description,status,
  conflicts,read_permission,write_permission,sensitive,consumer_ids)
VALUES ('profile.reserved_usernames','profile',
  '{"type":"array","items":{"type":"string"},"uniqueItems":true}'::jsonb,
  '["admin","administrator","moderator","official","root","support","system"]'::jsonb,
  '{"type":"array","items":{"type":"string"},"uniqueItems":true}'::jsonb,ARRAY['global','environment']::text[],0,
  ARRAY['config.read','profile.config.write']::text[],ARRAY[]::text[],'immediate','new_operations',
  ARRAY['profile.FR-011']::text[],'Reserved public usernames.','engineering',ARRAY[]::text[],
  'config.read','profile.config.write',false,ARRAY['api','mobile','admin','sql']::text[])
ON CONFLICT(key) DO NOTHING;

CREATE FUNCTION core.profile_projection(target uuid, viewer uuid) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
  SELECT jsonb_build_object('account_id',p.account_id,'nickname',p.nickname,'username',p.username,
    'bio',p.bio,'avatar_media_ref',p.avatar_media_ref,'background_media_ref',p.background_media_ref,
    'registered_at',a.registered_at,
    'followers_count',(SELECT count(*) FROM core.follow f WHERE f.followed_id=target AND f.state='effective'),
    'following_count',(SELECT count(*) FROM core.follow f WHERE f.follower_id=target AND f.state='effective'),
    'row_version',p.row_version,
    'allowed_actions',CASE WHEN viewer=target THEN jsonb_build_array('profile.update') ELSE '[]'::jsonb END)
  FROM core.profile p JOIN core.account a ON a.id=p.account_id WHERE p.account_id=target
$$;
REVOKE ALL ON FUNCTION core.profile_projection(uuid,uuid) FROM PUBLIC,anon,authenticated,service_role,core_worker;

CREATE FUNCTION core.read_profile_result(actor uuid,session_ref uuid,target uuid,target_environment text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; profile_data jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF target IS NULL THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF NOT EXISTS (SELECT 1 FROM core.account a JOIN auth.users u ON u.id=a.id
      WHERE a.id=target AND a.status='active' AND u.deleted_at IS NULL
      AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp()))
    OR actor IS NOT NULL AND EXISTS (SELECT 1 FROM core.block b WHERE b.active AND b.revoked_at IS NULL
      AND ((b.blocker_id=actor AND b.blocked_id=target) OR (b.blocker_id=target AND b.blocked_id=actor))) THEN
    RETURN jsonb_build_object('code','NOT_FOUND');
  END IF;
  profile_data:=core.profile_projection(target,actor);
  IF profile_data IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',profile_data);
END $$;
REVOKE ALL ON FUNCTION core.read_profile_result(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.read_profile_result(uuid,uuid,uuid,text) TO core_runtime;

CREATE FUNCTION core.update_profile_result(actor uuid,session_ref uuid,target_environment text,
  payload jsonb,payload_hash text,minimum_length integer,maximum_length integer,
  change_seconds bigint,hold_seconds bigint,reserved_names jsonb)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; prior core.operation; profile_row core.profile; claimed core.username_reservation;
  command uuid; operation_ref uuid; receipt jsonb; new_name text; now_at timestamptz:=clock_timestamp();
  has_name boolean; has_avatar boolean; has_background boolean; next_avatar uuid; next_background uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,target_environment);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR payload_hash IS NULL
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','base_version']::text[])
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR jsonb_typeof(payload->'base_version')<>'number'
    OR (payload->>'base_version') !~ '^[1-9][0-9]{0,17}$'
    OR EXISTS (SELECT 1 FROM jsonb_object_keys(payload) key
      WHERE key NOT IN ('operation_id','base_version','nickname','username','bio','avatar_media_ref','background_media_ref'))
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<3
    OR minimum_length IS NULL OR maximum_length IS NULL OR change_seconds IS NULL OR hold_seconds IS NULL
    OR minimum_length NOT BETWEEN 1 AND 30 OR maximum_length NOT BETWEEN minimum_length AND 30
    OR change_seconds NOT BETWEEN 1 AND 315360000 OR hold_seconds NOT BETWEEN 1 AND 315360000
    OR jsonb_typeof(reserved_names)<>'array'
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF jsonb_array_length(reserved_names)>1000
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(reserved_names) name WHERE jsonb_typeof(name)<>'string'
      OR name #>> '{}' !~ '^[a-z0-9][a-z0-9_.-]{0,29}$')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command:=(payload->>'operation_id')::uuid;
  SELECT * INTO prior FROM core.operation op WHERE op.actor=update_profile_result.actor
    AND op.action='profile.update' AND op.operation_id=command;
  IF prior.id IS NOT NULL THEN
    IF prior.payload_hash<>payload_hash OR prior.environment<>target_environment THEN
      RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=prior.id;
    IF receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
    RETURN jsonb_build_object('code','OK','data',receipt);
  END IF;
  IF EXISTS (SELECT 1 FROM core.operation op WHERE op.actor=update_profile_result.actor AND op.operation_id=command)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO profile_row FROM core.profile p WHERE p.account_id=actor FOR UPDATE;
  -- An account without a profile starts at the contract's first version (1).
  IF (profile_row.account_id IS NULL AND (payload->>'base_version')::bigint<>1)
    OR (profile_row.account_id IS NOT NULL AND profile_row.row_version<>(payload->>'base_version')::bigint)
  THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF payload ? 'nickname' AND (jsonb_typeof(payload->'nickname')<>'string'
    OR char_length(btrim(payload->>'nickname')) NOT BETWEEN 1 AND 80)
    OR payload ? 'bio' AND (jsonb_typeof(payload->'bio')<>'string' OR char_length(payload->>'bio')>1000)
    OR payload ? 'username' AND jsonb_typeof(payload->'username')<>'string'
  THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  has_name:=payload ? 'username';
  IF has_name THEN
    IF payload->>'username' !~ '^[A-Za-z0-9][A-Za-z0-9_.-]*$'
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    new_name:=lower(payload->>'username');
    IF new_name !~ '^[a-z0-9][a-z0-9_.-]*$' OR char_length(new_name) NOT BETWEEN minimum_length AND maximum_length
      OR char_length(new_name)>30 OR reserved_names ? new_name THEN
      RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END IF;
  IF profile_row.account_id IS NULL AND (NOT has_name OR NOT payload ? 'nickname')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  has_avatar:=payload ? 'avatar_media_ref'; has_background:=payload ? 'background_media_ref';
  IF has_avatar THEN
    IF jsonb_typeof(payload->'avatar_media_ref')<>'string' OR payload->>'avatar_media_ref' !~
      '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    next_avatar:=(payload->>'avatar_media_ref')::uuid;
    IF NOT EXISTS (SELECT 1 FROM core.media_object m WHERE m.id=next_avatar AND m.owner=actor
      AND m.state='reviewed' AND m.bound_resource IS NULL AND m.detected_mime LIKE 'image/%')
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END IF;
  IF has_background THEN
    IF jsonb_typeof(payload->'background_media_ref')<>'string' OR payload->>'background_media_ref' !~
      '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    next_background:=(payload->>'background_media_ref')::uuid;
    IF NOT EXISTS (SELECT 1 FROM core.media_object m WHERE m.id=next_background AND m.owner=actor
      AND m.state='reviewed' AND m.bound_resource IS NULL AND m.detected_mime LIKE 'image/%')
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END IF;
  IF profile_row.account_id IS NULL OR has_name AND new_name<>profile_row.username THEN
    IF profile_row.account_id IS NOT NULL AND now_at<profile_row.username_changed_at+make_interval(secs=>change_seconds)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT * INTO claimed FROM core.username_reservation r WHERE r.normalized_name=new_name FOR UPDATE;
    IF claimed.normalized_name IS NOT NULL AND (claimed.current OR claimed.reserved_until>now_at)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF profile_row.account_id IS NOT NULL THEN
      UPDATE core.username_reservation SET current=false,reserved_until=now_at+make_interval(secs=>hold_seconds)
        WHERE normalized_name=profile_row.username AND account_id=actor AND current;
    END IF;
    INSERT INTO core.username_reservation(normalized_name,account_id,current,reserved_until)
      VALUES(new_name,actor,true,NULL)
      ON CONFLICT(normalized_name) DO UPDATE SET account_id=EXCLUDED.account_id,current=true,reserved_until=NULL;
  END IF;
  IF profile_row.account_id IS NULL THEN
    INSERT INTO core.profile(account_id,nickname,username,bio,avatar_media_ref,background_media_ref)
      VALUES(actor,btrim(payload->>'nickname'),new_name,coalesce(payload->>'bio',''),next_avatar,next_background);
  ELSE
    UPDATE core.profile SET nickname=CASE WHEN payload ? 'nickname' THEN btrim(payload->>'nickname') ELSE nickname END,
      username=CASE WHEN has_name THEN new_name ELSE username END,
      bio=CASE WHEN payload ? 'bio' THEN payload->>'bio' ELSE bio END,
      avatar_media_ref=CASE WHEN has_avatar THEN next_avatar ELSE avatar_media_ref END,
      background_media_ref=CASE WHEN has_background THEN next_background ELSE background_media_ref END,
      username_changed_at=CASE WHEN has_name AND new_name<>username THEN now_at ELSE username_changed_at END
      WHERE account_id=actor;
  END IF;
  receipt:=core.profile_projection(actor,actor);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,target_environment,'profile.update',command,payload_hash,actor,'succeeded') RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'profile.update',actor,target_environment,'core','Actor updated own profile','succeeded',command);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.update_profile_result(uuid,uuid,text,jsonb,text,integer,integer,bigint,bigint,jsonb)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.update_profile_result(uuid,uuid,text,jsonb,text,integer,integer,bigint,bigint,jsonb)
  TO core_runtime;

-- Include profile writes in the original-operation resolution path.
CREATE OR REPLACE FUNCTION core.account_operation_result(
  actor uuid,session_ref uuid,command_ref uuid,target_environment text,jwt_aal text
) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE v_entry core.operation; v_matches integer; v_result jsonb; v_receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO v_matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove','block.put','block.remove','profile.update');
  IF v_matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF v_matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO v_entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove','block.put','block.remove','profile.update');
  IF v_entry.action IN ('config.release','config.rollback') THEN
    IF jwt_aal IS NULL THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
    v_result:=core.admin_identity_context(actor,session_ref,target_environment,jwt_aal,true);
    IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
    IF NOT core.admin_has_permission(actor,target_environment,v_entry.action)
      OR NOT core.admin_has_permission(actor,target_environment,'config.read') THEN
      RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
    SELECT p.receipt INTO v_receipt FROM core.admin_config_publication p
      WHERE p.actor=account_operation_result.actor AND p.environment=target_environment
        AND p.operation_id=command_ref AND 'config.' || p.kind=v_entry.action;
  ELSIF v_entry.action IN ('post.create','comment.create') THEN
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=v_entry.result_ref
      AND r.author_id=actor AND r.deleted_at IS NULL) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  ELSIF v_entry.action IN ('like.put','like.remove') THEN
    v_result:=core.resource_action_result(actor,session_ref,v_entry.result_ref,'resource.read','read');
    IF v_result->>'code'<>'OK' THEN RETURN v_result; END IF;
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  ELSIF v_entry.action IN ('block.put','block.remove','profile.update') THEN
    -- The actor's current session was checked above. Profile receipts contain
    -- only that actor's own saved public profile projection.
    SELECT receipt INTO v_receipt FROM core.operation_receipt WHERE operation_ref=v_entry.id;
  END IF;
  IF v_entry.action IN ('post.create','comment.create','like.put','like.remove','block.put','block.remove','profile.update')
    AND v_receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',v_entry.operation_id,'action',v_entry.action,'state',v_entry.state)
    || CASE WHEN v_receipt IS NOT NULL THEN jsonb_build_object('result',v_receipt) ELSE '{}'::jsonb END);
END $$;
