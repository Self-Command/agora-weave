-- TEMPORARY HANDOFF ONLY. Main copies/reviews into its reserved migration and removes this file.
-- This SQL is additive after the already-applied 0067 and main's governance proof migration.
ALTER TABLE core.resource ADD COLUMN approved_revision_id uuid;
ALTER TABLE core.resource ADD CONSTRAINT approved_revision_belongs_to_resource
  FOREIGN KEY(id,approved_revision_id) REFERENCES core.content_revision(resource_id,id);
UPDATE core.resource r SET approved_revision_id=r.current_revision_id
  FROM core.content_revision v WHERE v.id=r.current_revision_id AND v.resource_id=r.id
    AND r.publication_state='published' AND v.review_state='approved';
CREATE INDEX resource_approved_revision_idx ON core.resource(approved_revision_id)
  WHERE approved_revision_id IS NOT NULL;
CREATE UNIQUE INDEX deletion_active_user_target_idx ON core.deletion(target)
  WHERE kind='user' AND state='deleted';

-- Reuse unchanged media in immutable revisions without changing media_object.bound_resource.
ALTER TABLE core.post_image_binding DROP CONSTRAINT post_image_binding_media_id_key;
CREATE UNIQUE INDEX post_image_binding_revision_media_idx
  ON core.post_image_binding(revision_id,media_id);
CREATE TABLE core.revision_media_alt (
  revision_id uuid NOT NULL REFERENCES core.content_revision(id),
  position integer NOT NULL CHECK(position BETWEEN 0 AND 8),
  alt_text text NOT NULL CHECK(octet_length(alt_text)<=8000),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK(row_version>0),
  PRIMARY KEY(revision_id,position)
);
SELECT core.protect_table('core.revision_media_alt');
CREATE TABLE core.visibility_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor uuid NOT NULL REFERENCES core.account(id),
  session_id uuid NOT NULL, environment text NOT NULL, operation_id uuid NOT NULL,
  target uuid NOT NULL REFERENCES core.resource(id), base_version bigint NOT NULL,
  old_visibility text NOT NULL,new_visibility text NOT NULL,policy_epoch bigint NOT NULL,
  input_digest text NOT NULL,preview_digest text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT(clock_timestamp()+interval '2 minutes'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK(row_version>0),
  UNIQUE(actor,environment,operation_id)
);
SELECT core.protect_table('core.visibility_preview');

CREATE FUNCTION core.bind_approved_revision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.publication_state='published' AND NEW.current_revision_id IS NOT NULL
    AND EXISTS(SELECT 1 FROM core.content_revision v WHERE v.id=NEW.current_revision_id
      AND v.resource_id=NEW.id AND v.review_state='approved') THEN
    NEW.approved_revision_id:=NEW.current_revision_id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bind_approved_revision BEFORE UPDATE OF current_revision_id,publication_state
  ON core.resource FOR EACH ROW EXECUTE FUNCTION core.bind_approved_revision();

CREATE FUNCTION core.lifecycle_prior_operation(actor uuid,env text,action_name text,
  command_ref uuid,input_hash text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE existing core.operation; receipt jsonb;
BEGIN
  SELECT * INTO existing FROM core.operation op WHERE op.actor=lifecycle_prior_operation.actor
    AND op.action=action_name AND op.operation_id=command_ref;
  IF existing.id IS NULL THEN RETURN NULL; END IF;
  IF existing.environment<>env OR existing.payload_hash<>input_hash
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=existing.id;
  RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
    ELSE jsonb_build_object('code','OK','data',receipt) END;
END $$;
CREATE FUNCTION core.lifecycle_save_operation(actor uuid,session_ref uuid,env text,
  action_name text,command_ref uuid,input_hash text,target uuid,receipt jsonb,reason_in text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE operation_ref uuid;
BEGIN
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,action_name,command_ref,input_hash,target,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,action_name,target,env,'core',reason_in,'succeeded',command_ref);
END $$;
REVOKE ALL ON FUNCTION core.lifecycle_prior_operation(uuid,text,text,uuid,text),
  core.lifecycle_save_operation(uuid,uuid,text,text,uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker;

-- Rewrite exact previously deployed function bodies rather than maintaining copies of platform logic.
-- Every replacement is assertion checked; an upstream drift aborts the migration.
CREATE FUNCTION core.lifecycle_replace_function(signature text,needle text,replacement text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE definition text;existing regprocedure;
BEGIN
  existing:=to_regprocedure(signature);
  IF existing IS NULL THEN RAISE EXCEPTION 'Missing lifecycle prerequisite function: %',signature; END IF;
  definition:=pg_get_functiondef(existing);
  IF strpos(definition,needle)=0 THEN RAISE EXCEPTION 'Lifecycle source drift: %',signature; END IF;
  EXECUTE replace(definition,needle,replacement);
END $$;
REVOKE ALL ON FUNCTION core.lifecycle_replace_function(text,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_runtime,core_worker;

SELECT core.lifecycle_replace_function('core.read_resource_result(uuid,uuid,uuid)',
  'current_revision_id','approved_revision_id');
SELECT core.lifecycle_replace_function('core.profile_contents_result(uuid,uuid,text,uuid,text,text,integer,uuid,timestamptz,text)',
  'current_revision_id','approved_revision_id');
SELECT core.lifecycle_replace_function('core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)',
  'CASE WHEN entry.publication_state=''pending'' THEN ''awaiting_review'' ELSE entry.publication_state END',
  'CASE WHEN entry.moderation_ref IS NOT NULL THEN ''restricted'' WHEN entry.review_state=''pending'' THEN ''awaiting_review'' WHEN entry.review_state=''approved'' THEN ''published'' ELSE ''rejected'' END');
SELECT core.lifecycle_replace_function('core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)',
  'r.created_at,r.publication_state,v.id','r.created_at,r.publication_state,r.row_version,r.visibility,r.moderation_ref,v.id');
SELECT core.lifecycle_replace_function('core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)',
  '''body'',entry.body','''row_version'',entry.row_version,''visibility'',entry.visibility,''reply_scope'',coalesce((SELECT p.scope FROM core.reply_policy p WHERE p.post_id=entry.resource_id),''all_readers''),''body'',entry.body');
SELECT core.lifecycle_replace_function('core.admin_review_preview_result(uuid,uuid,text,text,uuid,uuid,text,text)',
  'resource_row.publication_state IS DISTINCT FROM ''pending''',
  'resource_row.publication_state NOT IN (''pending'',''published'')');
SELECT core.lifecycle_replace_function('core.admin_review_decision_result(uuid,uuid,text,text,uuid,uuid,text,text,bigint,uuid,text,uuid)',
  'resource_row.publication_state IS DISTINCT FROM ''pending''',
  'resource_row.publication_state NOT IN (''pending'',''published'')');
SELECT core.lifecycle_replace_function('core.admin_review_decision_result(uuid,uuid,text,text,uuid,uuid,text,text,bigint,uuid,text,uuid)',
  'UPDATE core.resource SET publication_state=CASE WHEN decision_in=''approve'' THEN ''published'' ELSE ''rejected'' END',
  'UPDATE core.resource SET publication_state=CASE WHEN decision_in=''approve'' OR approved_revision_id IS NOT NULL THEN ''published'' ELSE ''rejected'' END, approved_revision_id=CASE WHEN decision_in=''approve'' THEN revision_ref ELSE approved_revision_id END');
SELECT core.lifecycle_replace_function('core.admin_review_page_result(uuid,uuid,text,text,integer,uuid)',
  '(v.review_state=''pending'' AND r.publication_state=''pending'')',
  '(v.review_state=''pending'' AND r.publication_state IN (''pending'',''published''))');
SELECT core.lifecycle_replace_function('core.admin_review_page_result(uuid,uuid,text,text,integer,uuid)',
  '(v.review_state=''rejected'' AND r.publication_state=''rejected'')',
  '(v.review_state=''rejected'' AND r.publication_state IN (''rejected'',''published''))');
SELECT core.lifecycle_replace_function('core.admin_review_page_result(uuid,uuid,text,text,integer,uuid)',
  'v.*,r.id AS target_resource','v.*,r.id AS target_resource,r.row_version AS resource_row_version,r.visibility AS resource_visibility');
SELECT core.lifecycle_replace_function('core.admin_review_page_result(uuid,uuid,text,text,integer,uuid)',
  '''body'',entry.body','''row_version'',entry.resource_row_version,''visibility'',entry.resource_visibility,''reply_scope'',coalesce((SELECT p.scope FROM core.reply_policy p WHERE p.post_id=entry.resource_id),''all_readers''),''body'',entry.body');
SELECT core.lifecycle_replace_function('core.admin_legacy_stepup_target_result(uuid,uuid,text,text,text)',
  'resource_row.publication_state IS DISTINCT FROM ''pending''',
  'resource_row.publication_state NOT IN (''pending'',''published'')');
-- A media id bound to an old revision remains valid only when the approved binding still cites it.
SELECT core.lifecycle_replace_function('core.media_read_result(uuid,uuid,uuid,text)',
  'IF entry.id IS NULL OR entry.bound_resource IS NULL THEN',
  'IF entry.id IS NULL OR entry.bound_resource IS NULL OR NOT EXISTS(SELECT 1 FROM core.resource r JOIN core.post_image_binding b ON b.resource_id=r.id AND b.revision_id=r.approved_revision_id AND b.media_id=entry.id WHERE r.id=entry.bound_resource) THEN');
SELECT core.lifecycle_replace_function('core.media_review_read_result(uuid,uuid,text,text,uuid)',
  $src$(revision_row.review_state='pending' AND resource_row.publication_state='pending')$src$,
  $dst$(revision_row.review_state='pending' AND resource_row.publication_state IN ('pending','published'))$dst$);
SELECT core.lifecycle_replace_function('core.media_review_read_result(uuid,uuid,text,text,uuid)',
  $src$(revision_row.review_state='rejected' AND resource_row.publication_state='rejected')$src$,
  $dst$(revision_row.review_state='rejected' AND resource_row.publication_state IN ('rejected','published'))$dst$);
SELECT core.lifecycle_replace_function('core.profile_contents_result(uuid,uuid,text,uuid,text,text,integer,uuid,timestamptz,text)',
  $src$'alt_text',''$src$,
  $dst$'alt_text',coalesce((SELECT a.alt_text FROM core.revision_media_alt a WHERE a.revision_id=b.revision_id AND a.position=b.position),'')$dst$);
SELECT core.lifecycle_replace_function('core.list_owned_contents_result(uuid,uuid,text,integer,uuid,timestamptz)',
  $src$CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END$src$,
  $dst$coalesce((SELECT jsonb_agg(a.alt_text ORDER BY a.position) FROM core.revision_media_alt a WHERE a.revision_id=entry.id),CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END)$dst$);
SELECT core.lifecycle_replace_function('core.admin_review_page_result(uuid,uuid,text,text,integer,uuid)',
  $src$CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END$src$,
  $dst$coalesce((SELECT jsonb_agg(a.alt_text ORDER BY a.position) FROM core.revision_media_alt a WHERE a.revision_id=entry.id),CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END)$dst$);
-- Reply scope is checked against the currently approved post, never a pending edit.
SELECT core.lifecycle_replace_function('core.create_text_comment_result(uuid,uuid,text,uuid,jsonb,text,integer,integer,text)',
  $src$IF NOT EXISTS (SELECT 1 FROM core.reply_policy p WHERE p.post_id=create_text_comment_result.post_id AND p.scope='all_readers')$src$,
  $dst$IF NOT EXISTS (SELECT 1 FROM core.reply_policy p WHERE p.post_id=create_text_comment_result.post_id
    AND (p.scope='all_readers' OR p.scope='author_follows' AND EXISTS(
      SELECT 1 FROM core.follow f WHERE f.follower_id=post.author_id AND f.followed_id=actor AND f.state='effective')
      OR p.scope='mentioned' AND EXISTS(SELECT 1 FROM core.content_revision v
        WHERE v.id=post.approved_revision_id AND actor=ANY(v.mentions))))$dst$);
-- Lost-response lookup must know each newly recorded author action.
SELECT core.lifecycle_replace_function('core.account_operation_result(uuid,uuid,uuid,text,text)',
  $src$'post.create','comment.create','like.put'$src$,
  $dst$'post.create','comment.create','post.edit','comment.edit','post.visibility','post.reply_policy','resource.delete','comment.delete','resource.restore','like.put'$dst$);
SELECT core.lifecycle_replace_function('core.account_operation_result(uuid,uuid,uuid,text,text)',
  $src$ELSIF entry.action IN ('post.create','comment.create') THEN$src$,
  $dst$ELSIF entry.action IN ('post.edit','comment.edit','post.visibility','post.reply_policy',
    'resource.delete','comment.delete','resource.restore') THEN
    IF NOT EXISTS(SELECT 1 FROM core.resource r WHERE r.id=entry.result_ref AND r.author_id=actor)
      THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('post.create','comment.create') THEN$dst$);

CREATE FUNCTION core.patch_content_result(actor uuid,session_ref uuid,env text,target uuid,
  resource_kind text,payload jsonb,payload_hash text,visible_count integer,body_limit integer,
  config_version text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry core.resource;prior core.content_revision;revision_ref uuid:=gen_random_uuid();
  command_ref uuid;action_name text;previous jsonb;receipt jsonb;new_body text;new_tags text[];
  media_count integer;auto_publish boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR resource_kind NOT IN ('post','comment') OR payload IS NULL
    OR jsonb_typeof(payload)<>'object' OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT(payload ?& ARRAY['operation_id','base_version']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload)) NOT BETWEEN 3 AND 5
    OR EXISTS(SELECT 1 FROM jsonb_object_keys(payload) k
      WHERE k NOT IN ('operation_id','base_version','body','tags','alt_text'))
    OR NOT(payload ? 'body' OR payload ? 'tags' OR payload ? 'alt_text')
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    OR (payload ? 'body' AND jsonb_typeof(payload->'body')<>'string')
    OR (payload ? 'tags' AND jsonb_typeof(payload->'tags')<>'array')
    OR (payload ? 'alt_text' AND jsonb_typeof(payload->'alt_text')<>'array')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  action_name:=resource_kind||'.edit';
  SELECT * INTO entry FROM core.resource r WHERE r.id=target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor OR entry.kind<>resource_kind
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.deleted_at IS NOT NULL OR entry.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF EXISTS(SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=target)
    AND s.functions && ARRAY[action_name,'content.create','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  previous:=core.lifecycle_prior_operation(actor,env,action_name,command_ref,payload_hash);
  IF previous IS NOT NULL THEN RETURN previous; END IF;
  IF entry.row_version<>(payload->>'base_version')::bigint THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF config_version IS NULL OR config_version IS DISTINCT FROM core.response_config_version(env)
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  SELECT * INTO prior FROM core.content_revision v WHERE v.id=entry.current_revision_id AND v.resource_id=target;
  IF prior.id IS NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  new_body:=CASE WHEN payload ? 'body' THEN payload->>'body' ELSE prior.body END;
  IF payload ? 'body' AND (body_limit IS NULL OR body_limit NOT BETWEEN 1 AND 65536
    OR visible_count IS NULL OR visible_count<0 OR visible_count>char_length(new_body)
    OR visible_count>body_limit OR octet_length(new_body)>65536
    OR (resource_kind='comment' AND visible_count<1))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF resource_kind='comment' AND (payload ? 'tags' OR payload ? 'alt_text')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF payload ? 'tags' THEN
    IF jsonb_array_length(payload->'tags')>20 OR EXISTS(SELECT 1 FROM jsonb_array_elements(payload->'tags') t(v)
      WHERE jsonb_typeof(t.v)<>'string' OR char_length(t.v#>>'{}') NOT BETWEEN 1 AND 100)
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
    SELECT coalesce(array_agg(t.v),ARRAY[]::text[]) INTO new_tags
      FROM jsonb_array_elements_text(payload->'tags') t(v);
  ELSE new_tags:=prior.tags; END IF;
  SELECT count(*) INTO media_count FROM core.post_image_binding b WHERE b.revision_id=prior.id;
  IF resource_kind='post' AND media_count=0 AND (btrim(new_body,E' \t\n\r')='' OR new_body ~ '^[[:space:]]*$')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF payload ? 'alt_text' AND (jsonb_array_length(payload->'alt_text')<>media_count OR EXISTS(
    SELECT 1 FROM jsonb_array_elements(payload->'alt_text') a(v)
      WHERE jsonb_typeof(a.v)<>'string' OR octet_length(a.v#>>'{}')>8000))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  auto_publish:=core.dev_trusted_publisher_active(actor,env);
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,tags,mentions,alt_text,
    author,review_state,submitted_at)
    VALUES(revision_ref,target,prior.revision_no+1,new_body,new_tags,prior.mentions,
      CASE WHEN media_count=1 AND payload ? 'alt_text' THEN payload->'alt_text'->>0 ELSE prior.alt_text END,
      actor,CASE WHEN auto_publish THEN 'approved' ELSE 'pending' END,clock_timestamp());
  INSERT INTO core.post_image_binding(revision_id,resource_id,media_id,position)
    SELECT revision_ref,b.resource_id,b.media_id,b.position FROM core.post_image_binding b WHERE b.revision_id=prior.id;
  IF payload ? 'alt_text' THEN
    INSERT INTO core.revision_media_alt(revision_id,position,alt_text)
      SELECT revision_ref,(a.ordinality-1)::integer,a.value
        FROM jsonb_array_elements_text(payload->'alt_text') WITH ORDINALITY a(value,ordinality);
  ELSE
    INSERT INTO core.revision_media_alt(revision_id,position,alt_text)
      SELECT revision_ref,a.position,a.alt_text FROM core.revision_media_alt a WHERE a.revision_id=prior.id;
  END IF;
  UPDATE core.resource SET current_revision_id=revision_ref,
    publication_state=CASE WHEN auto_publish OR approved_revision_id IS NOT NULL THEN 'published' ELSE 'pending' END
    WHERE id=target RETURNING * INTO entry;
  receipt:=jsonb_build_object('resource_id',target,'revision_id',revision_ref,'operation_id',command_ref,
    'review_state',CASE WHEN auto_publish THEN 'approved' ELSE 'pending' END,
    'publication_state',CASE WHEN auto_publish THEN 'published' ELSE 'awaiting_review' END,
    'row_version',entry.row_version);
  PERFORM core.lifecycle_save_operation(actor,session_ref,env,action_name,command_ref,payload_hash,
    target,receipt,'Author submitted content edit');
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.patch_content_result(uuid,uuid,text,uuid,text,jsonb,text,integer,integer,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.patch_content_result(uuid,uuid,text,uuid,text,jsonb,text,integer,integer,text)
  TO core_runtime;

CREATE FUNCTION core.list_post_revisions_result(actor uuid,session_ref uuid,env text,target uuid,
  page_limit integer,cursor_revision_no bigint DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry record;items jsonb:='[]'::jsonb;item_count integer:=0;
  more boolean:=false;last_no bigint;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50
    OR cursor_revision_no IS NOT NULL AND cursor_revision_no<1
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF NOT EXISTS(SELECT 1 FROM core.resource r WHERE r.id=target AND r.kind='post'
    AND r.author_id=actor AND r.deleted_at IS NULL AND r.moderation_ref IS NULL)
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  FOR entry IN SELECT v.* FROM core.content_revision v WHERE v.resource_id=target
    AND v.submitted_at IS NOT NULL AND (cursor_revision_no IS NULL OR v.revision_no<cursor_revision_no)
    ORDER BY v.revision_no DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true;EXIT;END IF;
    items:=items||jsonb_build_array(jsonb_build_object('id',entry.id,'resource_id',entry.resource_id,
      'revision_no',entry.revision_no,'row_version',(SELECT r.row_version FROM core.resource r WHERE r.id=target),
      'visibility',(SELECT r.visibility FROM core.resource r WHERE r.id=target),
      'reply_scope',coalesce((SELECT p.scope FROM core.reply_policy p WHERE p.post_id=target),'all_readers'),
      'body',entry.body,'tags',to_jsonb(entry.tags),
      'mentions',to_jsonb(entry.mentions),'alt_text',coalesce((SELECT jsonb_agg(a.alt_text ORDER BY a.position)
        FROM core.revision_media_alt a WHERE a.revision_id=entry.id),
        CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END),
      'media_refs',coalesce((SELECT jsonb_agg(b.media_id ORDER BY b.position) FROM core.post_image_binding b
        WHERE b.revision_id=entry.id),'[]'::jsonb),'review_state',entry.review_state,
      'publication_state',CASE entry.review_state WHEN 'pending' THEN 'awaiting_review'
        WHEN 'approved' THEN 'published' ELSE 'rejected' END,
      'submitted_at',to_char(entry.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    item_count:=item_count+1;last_no:=entry.revision_no;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_revision_no',CASE WHEN more THEN last_no END);
END $$;
REVOKE ALL ON FUNCTION core.list_post_revisions_result(uuid,uuid,text,uuid,integer,bigint)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_post_revisions_result(uuid,uuid,text,uuid,integer,bigint)
  TO core_runtime;

CREATE FUNCTION core.preview_post_visibility_result(actor uuid,session_ref uuid,env text,
  target uuid,payload jsonb,payload_hash text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry core.resource;command_ref uuid;existing core.visibility_preview;
  preview_hash text;made core.visibility_preview;impacts jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT(payload ?& ARRAY['operation_id','base_version','visibility']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>3
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    OR payload->>'visibility' NOT IN ('public','followers','self')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  SELECT * INTO entry FROM core.resource r WHERE r.id=target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor OR entry.kind<>'post'
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.deleted_at IS NOT NULL OR entry.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF entry.row_version<>(payload->>'base_version')::bigint OR entry.thread_id IS NOT NULL
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=preview_post_visibility_result.actor
    AND op.action='post.visibility' AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO existing FROM core.visibility_preview p WHERE p.actor=preview_post_visibility_result.actor
    AND p.environment=env AND p.operation_id=command_ref;
  IF existing.id IS NOT NULL THEN
    IF existing.session_id<>session_ref OR existing.target<>target OR existing.input_digest<>payload_hash
      OR existing.expires_at<=clock_timestamp() OR existing.base_version<>entry.row_version
      OR existing.policy_epoch<>entry.policy_epoch
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',existing.id,
      'preview_digest',existing.preview_digest,'expires_at',to_char(existing.expires_at AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'affected_refs',jsonb_build_array(target),
      'impacts',CASE WHEN existing.old_visibility=existing.new_visibility THEN '[]'::jsonb
        WHEN existing.new_visibility='public' OR existing.old_visibility='self' THEN jsonb_build_array('audience_widens')
        ELSE jsonb_build_array('audience_changes') END,'base_version',entry.row_version));
  END IF;
  preview_hash:=encode(sha256(convert_to(jsonb_build_array(actor,session_ref,env,command_ref,target,
    entry.row_version,entry.visibility,payload->>'visibility',entry.policy_epoch)::text,'UTF8')),'hex');
  INSERT INTO core.visibility_preview(actor,session_id,environment,operation_id,target,base_version,
    old_visibility,new_visibility,policy_epoch,input_digest,preview_digest)
    VALUES(actor,session_ref,env,command_ref,target,entry.row_version,entry.visibility,
      payload->>'visibility',entry.policy_epoch,payload_hash,preview_hash) RETURNING * INTO made;
  impacts:=CASE WHEN entry.visibility=payload->>'visibility' THEN '[]'::jsonb
    WHEN entry.visibility='self' OR payload->>'visibility'='public' THEN jsonb_build_array('audience_widens')
    ELSE jsonb_build_array('audience_changes') END;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('preview_id',made.id,
    'preview_digest',preview_hash,'expires_at',to_char(made.expires_at AT TIME ZONE 'UTC',
    'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),'affected_refs',jsonb_build_array(target),
    'impacts',impacts,'base_version',entry.row_version));
END $$;
REVOKE ALL ON FUNCTION core.preview_post_visibility_result(uuid,uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.preview_post_visibility_result(uuid,uuid,text,uuid,jsonb,text)
  TO core_runtime;

CREATE FUNCTION core.patch_visibility_result(actor uuid,session_ref uuid,env text,target uuid,
  payload jsonb,payload_hash text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry core.resource;command_ref uuid;previous jsonb;receipt jsonb;
  old_rank integer;new_rank integer;preview_row core.visibility_preview;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT(payload ?& ARRAY['operation_id','base_version','visibility']::text[])
    OR EXISTS(SELECT 1 FROM jsonb_object_keys(payload) k
      WHERE k NOT IN ('operation_id','base_version','visibility','preview_digest'))
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    OR payload->>'visibility' NOT IN ('public','followers','self')
    OR payload ? 'preview_digest' AND payload->>'preview_digest' !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  SELECT * INTO entry FROM core.resource r WHERE r.id=target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor OR entry.kind<>'post'
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.deleted_at IS NOT NULL OR entry.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  previous:=core.lifecycle_prior_operation(actor,env,'post.visibility',command_ref,payload_hash);
  IF previous IS NOT NULL THEN RETURN previous; END IF;
  IF EXISTS(SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=target)
    AND s.functions && ARRAY['post.visibility','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF entry.row_version<>(payload->>'base_version')::bigint THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  -- Thread scope is an atomic whole-thread operation; no single-item widening or tightening.
  IF entry.thread_id IS NOT NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  old_rank:=CASE entry.visibility WHEN 'self' THEN 1 WHEN 'followers' THEN 2 ELSE 3 END;
  new_rank:=CASE payload->>'visibility' WHEN 'self' THEN 1 WHEN 'followers' THEN 2 ELSE 3 END;
  IF new_rank>old_rank THEN
    IF EXISTS(SELECT 1 FROM core.post_image_binding b LEFT JOIN core.media_object m ON m.id=b.media_id
      WHERE b.resource_id=target AND b.revision_id=entry.approved_revision_id
      AND (m.id IS NULL OR m.state<>'bound' OR m.owner<>actor OR m.bound_resource IS DISTINCT FROM target))
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT * INTO preview_row FROM core.visibility_preview p WHERE p.actor=patch_visibility_result.actor
      AND p.environment=env AND p.operation_id=command_ref;
    IF preview_row.id IS NULL OR preview_row.session_id<>session_ref OR preview_row.target<>target
      OR preview_row.base_version<>entry.row_version OR preview_row.old_visibility<>entry.visibility
      OR preview_row.new_visibility<>payload->>'visibility' OR preview_row.policy_epoch<>entry.policy_epoch
      OR preview_row.expires_at<=clock_timestamp()
      OR payload->>'preview_digest' IS DISTINCT FROM preview_row.preview_digest
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF entry.approved_revision_id IS NULL OR entry.publication_state<>'published'
      OR EXISTS(SELECT 1 FROM core.resource_dependency d WHERE d.dependent=target
        AND core.resource_action_result(actor,session_ref,d.source,'resource.read','read')->>'code'<>'OK')
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  END IF;
  IF new_rank<>old_rank THEN
    UPDATE core.resource SET visibility=payload->>'visibility',policy_epoch=policy_epoch+1
      WHERE id=target RETURNING * INTO entry;
  END IF;
  receipt:=jsonb_build_object('operation_id',command_ref,'state','succeeded','target_ref',target,
    'allowed_actions','[]'::jsonb);
  PERFORM core.lifecycle_save_operation(actor,session_ref,env,'post.visibility',command_ref,
    payload_hash,target,receipt,'Author changed post visibility');
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.patch_visibility_result(uuid,uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.patch_visibility_result(uuid,uuid,text,uuid,jsonb,text) TO core_runtime;

CREATE FUNCTION core.patch_reply_policy_result(actor uuid,session_ref uuid,env text,target uuid,
  payload jsonb,payload_hash text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry core.resource;policy_row core.reply_policy;
  command_ref uuid;previous jsonb;receipt jsonb;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT(payload ?& ARRAY['operation_id','base_version','scope']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>3
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    OR payload->>'scope' NOT IN ('all_readers','author_follows','mentioned','closed')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  SELECT * INTO entry FROM core.resource r WHERE r.id=target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor OR entry.kind<>'post'
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.deleted_at IS NOT NULL OR entry.moderation_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO policy_row FROM core.reply_policy p WHERE p.post_id=target FOR UPDATE;
  IF policy_row.post_id IS NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  previous:=core.lifecycle_prior_operation(actor,env,'post.reply_policy',command_ref,payload_hash);
  IF previous IS NOT NULL THEN RETURN previous; END IF;
  IF EXISTS(SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
    AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp()) AND (s.subject=actor OR s.target=target)
    AND s.functions && ARRAY['post.reply_policy','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF entry.row_version<>(payload->>'base_version')::bigint THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF policy_row.scope IS DISTINCT FROM payload->>'scope' THEN
    UPDATE core.reply_policy SET scope=payload->>'scope',epoch=epoch+1 WHERE post_id=target;
    UPDATE core.resource SET policy_epoch=policy_epoch+1 WHERE id=target;
  END IF;
  receipt:=jsonb_build_object('operation_id',command_ref,'state','succeeded','target_ref',target,
    'allowed_actions','[]'::jsonb);
  PERFORM core.lifecycle_save_operation(actor,session_ref,env,'post.reply_policy',command_ref,
    payload_hash,target,receipt,'Author changed reply policy');
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.patch_reply_policy_result(uuid,uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.patch_reply_policy_result(uuid,uuid,text,uuid,jsonb,text) TO core_runtime;

CREATE FUNCTION core.delete_resource_result(actor uuid,session_ref uuid,env text,target uuid,
  resource_kind text,payload jsonb,payload_hash text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry core.resource;previous jsonb;command_ref uuid;action_name text;
  deletion_row core.deletion;receipt jsonb;now_at timestamptz:=clock_timestamp();
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF target IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR resource_kind IS NOT NULL AND resource_kind<>'comment'
    OR NOT(payload ? 'operation_id')
    OR (resource_kind IS NULL AND (NOT(payload ? 'base_version')
      OR (SELECT count(*) FROM jsonb_object_keys(payload))<>2))
    OR (resource_kind='comment' AND (NOT(payload ? 'base_version')
      OR (SELECT count(*) FROM jsonb_object_keys(payload))<>2))
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  action_name:=CASE WHEN resource_kind='comment' THEN 'comment.delete' ELSE 'resource.delete' END;
  SELECT * INTO entry FROM core.resource r WHERE r.id=target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor OR resource_kind IS NOT NULL AND entry.kind<>resource_kind
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  previous:=core.lifecycle_prior_operation(actor,env,action_name,command_ref,payload_hash);
  IF previous IS NOT NULL THEN RETURN previous; END IF;
  IF entry.deleted_at IS NOT NULL OR entry.moderation_ref IS NOT NULL
    OR EXISTS(SELECT 1 FROM core.deletion d WHERE d.target=target AND d.kind<>'user'
      AND d.state IN ('deleted','physical_removed'))
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF entry.row_version<>(payload->>'base_version')::bigint
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS(SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=now_at
    AND (s.ends_at IS NULL OR s.ends_at>now_at) AND (s.subject=actor OR s.target=target)
    AND s.functions && ARRAY['resource.delete','comment.delete','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  INSERT INTO core.deletion(target,actor,kind,deleted_at,undo_until,restore_until,state)
    VALUES(target,actor,'user',now_at,now_at+interval '10 seconds',now_at+interval '30 days','deleted')
    RETURNING * INTO deletion_row;
  INSERT INTO core.dependency_hide(cause_deletion,affected_resource,previous_validity)
    WITH RECURSIVE affected(id) AS (
      SELECT d.dependent FROM core.resource_dependency d WHERE d.source=target
      UNION SELECT d.dependent FROM core.resource_dependency d JOIN affected a ON d.source=a.id
    )
    SELECT deletion_row.id,a.id,true FROM affected a JOIN core.resource r ON r.id=a.id
      WHERE r.deleted_at IS NULL AND r.moderation_ref IS NULL;
  UPDATE core.resource SET deleted_at=now_at,policy_epoch=policy_epoch+1 WHERE id=target;
  INSERT INTO core.retention_record(target,class,owner_plugin,trigger_at,due_at,rule_version,purge_state)
    VALUES(target,'user-content','core',now_at,deletion_row.restore_until,
      'content-restore-30d-v1','pending');
  IF resource_kind='comment' THEN
    receipt:=jsonb_build_object('operation_id',command_ref,'state','succeeded','target_ref',target,
      'allowed_actions','[]'::jsonb);
  ELSE
    receipt:=jsonb_build_object('id',deletion_row.id,'target_id',target,'state','deleted',
      'deleted_at',to_char(deletion_row.deleted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'undo_until',to_char(deletion_row.undo_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'restore_until',to_char(deletion_row.restore_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'purge_state','pending','allowed_actions',jsonb_build_array('undo','restore'),
      'row_version',deletion_row.row_version);
  END IF;
  PERFORM core.lifecycle_save_operation(actor,session_ref,env,action_name,command_ref,
    payload_hash,target,receipt,'Author deleted own resource');
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.delete_resource_result(uuid,uuid,text,uuid,text,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.delete_resource_result(uuid,uuid,text,uuid,text,jsonb,text) TO core_runtime;

CREATE FUNCTION core.list_recently_deleted_result(actor uuid,session_ref uuid,env text,
  page_limit integer,cursor_deleted_at timestamptz DEFAULT NULL,cursor_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;entry record;items jsonb:='[]'::jsonb;item_count integer:=0;
  more boolean:=false;last_id uuid;last_deleted_at timestamptz;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50
    OR (cursor_id IS NULL)<>(cursor_deleted_at IS NULL)
    OR (cursor_deleted_at IS NOT NULL AND NOT isfinite(cursor_deleted_at))
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT d.* FROM core.deletion d JOIN core.resource r ON r.id=d.target
    WHERE d.actor=actor AND d.kind='user' AND d.state='deleted'
      AND d.restore_until>clock_timestamp() AND r.author_id=actor
      AND r.deleted_at IS NOT NULL AND r.moderation_ref IS NULL
      AND (cursor_id IS NULL OR (d.deleted_at,d.id)<(cursor_deleted_at,cursor_id))
    ORDER BY d.deleted_at DESC,d.id DESC LIMIT page_limit+1
  LOOP
    IF item_count=page_limit THEN more:=true;EXIT;END IF;
    items:=items||jsonb_build_array(jsonb_build_object('id',entry.id,'target_id',entry.target,
      'state',entry.state,'deleted_at',to_char(entry.deleted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'undo_until',to_char(entry.undo_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'restore_until',to_char(entry.restore_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
      'purge_state',coalesce((SELECT rr.purge_state FROM core.retention_record rr
        WHERE rr.target=entry.target AND rr.class='user-content' AND rr.trigger_at=entry.deleted_at
        ORDER BY rr.id DESC LIMIT 1),'pending'),
      'allowed_actions',CASE WHEN clock_timestamp()<entry.undo_until
        THEN jsonb_build_array('undo','restore') ELSE jsonb_build_array('restore') END,
      'row_version',entry.row_version));
    item_count:=item_count+1;last_id:=entry.id;last_deleted_at:=entry.deleted_at;
  END LOOP;
  RETURN jsonb_build_object('code','OK','items',items,'has_more',more,
    'next_id',CASE WHEN more THEN last_id END,
    'next_deleted_at',CASE WHEN more THEN to_char(last_deleted_at AT TIME ZONE 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') END);
END $$;
REVOKE ALL ON FUNCTION core.list_recently_deleted_result(uuid,uuid,text,integer,timestamptz,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.list_recently_deleted_result(uuid,uuid,text,integer,timestamptz,uuid)
  TO core_runtime;

CREATE FUNCTION core.restore_resource_result(actor uuid,session_ref uuid,env text,
  deletion_ref uuid,payload jsonb,payload_hash text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb;deletion_row core.deletion;entry core.resource;previous jsonb;
  command_ref uuid;receipt jsonb;now_at timestamptz:=clock_timestamp();
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF deletion_ref IS NULL OR payload IS NULL OR jsonb_typeof(payload)<>'object'
    OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT(payload ?& ARRAY['operation_id','base_version']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>2
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'base_version' !~ '^[1-9][0-9]*$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  SELECT * INTO deletion_row FROM core.deletion d WHERE d.id=deletion_ref FOR UPDATE;
  IF deletion_row.id IS NULL OR deletion_row.actor<>actor OR deletion_row.kind<>'user'
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT * INTO entry FROM core.resource r WHERE r.id=deletion_row.target FOR UPDATE;
  IF entry.id IS NULL OR entry.author_id<>actor THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  previous:=core.lifecycle_prior_operation(actor,env,'resource.restore',command_ref,payload_hash);
  IF previous IS NOT NULL THEN RETURN previous; END IF;
  IF deletion_row.row_version<>(payload->>'base_version')::bigint
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF deletion_row.state<>'deleted' OR deletion_row.restore_until<=now_at
    OR entry.deleted_at IS NULL OR entry.deleted_at IS DISTINCT FROM deletion_row.deleted_at
    OR entry.moderation_ref IS NOT NULL
    OR EXISTS(SELECT 1 FROM core.deletion d WHERE d.target=entry.id AND d.kind<>'user'
      AND d.state IN ('deleted','physical_removed'))
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS(SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=now_at
    AND (s.ends_at IS NULL OR s.ends_at>now_at) AND (s.subject=actor OR s.target=entry.id)
    AND s.functions && ARRAY['resource.restore','publish','write','read','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF EXISTS(SELECT 1 FROM core.resource_dependency d WHERE d.dependent=entry.id
    AND core.resource_action_result(actor,session_ref,d.source,'resource.read','read')->>'code'<>'OK')
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF EXISTS(SELECT 1 FROM core.post_image_binding b LEFT JOIN core.media_object m ON m.id=b.media_id
    WHERE b.resource_id=entry.id AND b.revision_id=coalesce(entry.approved_revision_id,entry.current_revision_id)
    AND (m.id IS NULL OR m.state<>'bound' OR m.owner<>actor OR m.bound_resource IS DISTINCT FROM entry.id))
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  UPDATE core.resource SET deleted_at=NULL,policy_epoch=policy_epoch+1 WHERE id=entry.id;
  UPDATE core.deletion SET state='restored',epoch=epoch+1 WHERE id=deletion_ref
    RETURNING * INTO deletion_row;
  UPDATE core.retention_record SET purge_state='cancelled' WHERE target=entry.id
    AND class='user-content' AND trigger_at=deletion_row.deleted_at
    AND purge_state IN ('pending','failed');
  receipt:=jsonb_build_object('id',deletion_row.id,'target_id',entry.id,'state','restored',
    'deleted_at',to_char(deletion_row.deleted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'undo_until',to_char(deletion_row.undo_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'restore_until',to_char(deletion_row.restore_until AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'purge_state','cancelled','allowed_actions','[]'::jsonb,
    'row_version',deletion_row.row_version);
  PERFORM core.lifecycle_save_operation(actor,session_ref,env,'resource.restore',command_ref,
    payload_hash,entry.id,receipt,'Author restored own resource after current-policy check');
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.restore_resource_result(uuid,uuid,text,uuid,jsonb,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.restore_resource_result(uuid,uuid,text,uuid,jsonb,text) TO core_runtime;

SELECT core.lifecycle_replace_function('core.create_text_post_result(uuid,uuid,text,jsonb,text,integer,integer,text)',
 $src$payload->>'reply_scope' IS DISTINCT FROM 'all_readers'$src$,
 $dst$(payload->>'reply_scope' IS NULL OR payload->>'reply_scope' NOT IN ('all_readers','closed'))$dst$);
SELECT core.lifecycle_replace_function('core.create_image_post_result(uuid,uuid,text,jsonb,text,integer,integer,integer,integer,text)',
 $src$payload->>'reply_scope' IS DISTINCT FROM 'all_readers'$src$,
 $dst$(payload->>'reply_scope' IS NULL OR payload->>'reply_scope' NOT IN ('all_readers','closed'))$dst$);
SELECT core.lifecycle_replace_function('core.create_text_post_result(uuid,uuid,text,jsonb,text,integer,integer,text)',
 $src$VALUES (v_resource.id,'all_readers')$src$,$dst$VALUES (v_resource.id,payload->>'reply_scope')$dst$);
SELECT core.lifecycle_replace_function('core.create_image_post_result(uuid,uuid,text,jsonb,text,integer,integer,integer,integer,text)',
 $src$VALUES(target.id,'all_readers')$src$,$dst$VALUES(target.id,payload->>'reply_scope')$dst$);
DROP FUNCTION core.lifecycle_replace_function(text,text,text);
