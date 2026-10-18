-- Private, one-object-per-image upload sessions. A post can bind up to nine sessions.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('post-images-private','post-images-private',false,10000000,ARRAY['application/octet-stream']);

CREATE ROLE core_upload NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
GRANT core_upload TO authenticator;
GRANT USAGE ON SCHEMA storage TO core_upload;
GRANT SELECT,INSERT ON storage.objects TO core_upload;
CREATE POLICY core_upload_exact_read ON storage.objects FOR SELECT TO core_upload USING
  (bucket_id='post-images-private' AND bucket_id=auth.jwt()->>'bucket' AND name=auth.jwt()->>'object_key');
CREATE POLICY core_upload_exact_insert ON storage.objects FOR INSERT TO core_upload WITH CHECK
  (bucket_id='post-images-private' AND bucket_id=auth.jwt()->>'bucket' AND name=auth.jwt()->>'object_key');

CREATE TABLE core.image_upload_session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), media_id uuid NOT NULL UNIQUE REFERENCES core.media_object(id),
  owner uuid NOT NULL REFERENCES core.account(id), environment text NOT NULL CHECK (environment IN ('dev','test','production')),
  allocation_operation uuid NOT NULL, completion_operation uuid, expected_size integer NOT NULL CHECK (expected_size BETWEEN 1 AND 10000000),
  expected_sha256 text NOT NULL CHECK (expected_sha256 ~ '^[a-f0-9]{64}$'),
  part_operation uuid, uploaded_sha256 text CHECK (uploaded_sha256 ~ '^[a-f0-9]{64}$'),
  detected_mime text CHECK (detected_mime IN ('image/png','image/jpeg')),
  expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '24 hours',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  row_version bigint NOT NULL DEFAULT 1 CHECK (row_version>0),
  UNIQUE(owner,environment,allocation_operation), UNIQUE(owner,environment,part_operation),
  UNIQUE(owner,environment,completion_operation)
);
SELECT core.protect_table('core.image_upload_session');
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.image_upload_session
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.image_upload_access(actor uuid,session_ref uuid,env text,target uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; entry core.image_upload_session;
BEGIN
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor AND s.state='active'
    AND s.starts_at<=clock_timestamp() AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  IF target IS NOT NULL THEN
    SELECT * INTO entry FROM core.image_upload_session u WHERE u.id=target;
    IF entry.id IS NULL OR entry.owner<>actor OR entry.environment<>env THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  END IF;
  RETURN jsonb_build_object('code','OK');
END $$;

CREATE FUNCTION core.create_image_upload_result(actor uuid,session_ref uuid,env text,command_ref uuid,
  expected_size integer,expected_hash text,image_byte_limit integer,config_version text) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media_ref uuid:=gen_random_uuid(); upload_ref uuid:=gen_random_uuid();
  receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR expected_size IS NULL OR expected_size NOT BETWEEN 1 AND 10000000
    OR expected_hash IS NULL OR expected_hash !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session u WHERE u.owner=actor AND u.environment=env
    AND u.allocation_operation=command_ref;
  IF entry.id IS NOT NULL THEN
    IF entry.expected_size<>expected_size OR entry.expected_sha256<>expected_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=actor AND op.environment=env AND op.action='upload.create' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF config_version IS NULL OR core.response_config_version(env) IS DISTINCT FROM config_version
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF image_byte_limit IS NULL OR image_byte_limit NOT BETWEEN 1 AND 10000000
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  IF expected_size>image_byte_limit THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=create_image_upload_result.actor
    AND op.environment=env AND op.operation_id=command_ref)
    THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,sha256,size_bytes,state,data_class)
    VALUES(media_ref,actor,'core','post-images-private',media_ref::text || '/original',expected_hash,expected_size,'allocated','content');
  INSERT INTO core.image_upload_session(id,media_id,owner,environment,allocation_operation,expected_size,expected_sha256)
    VALUES(upload_ref,media_ref,actor,env,command_ref,expected_size,expected_hash) RETURNING * INTO entry;
  receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','allocated',
    'uploaded_parts','[]'::jsonb,'expires_at',entry.expires_at,'reusable_refs','[]'::jsonb);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'upload.create',command_ref,
      encode(sha256(convert_to(jsonb_build_array('post','image',expected_size,expected_hash)::text,'UTF8')),'hex'),media_ref,'succeeded')
    RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'upload.allocate',media_ref,env,'core','Private image upload allocated','allocated',command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;

CREATE FUNCTION core.image_upload_probe(actor uuid,session_ref uuid,env text,upload_ref uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media core.media_object;
BEGIN
  access:=core.image_upload_access(actor,session_ref,env,upload_ref);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  SELECT * INTO entry FROM core.image_upload_session WHERE id=upload_ref;
  SELECT * INTO media FROM core.media_object WHERE id=entry.media_id;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('id',entry.id,'media_id',entry.media_id,
    'owner',entry.owner,'size_bytes',entry.expected_size,'sha256',entry.expected_sha256,
    'part_operation',entry.part_operation,'completion_operation',entry.completion_operation,
    'uploaded_sha256',entry.uploaded_sha256,'detected_mime',entry.detected_mime,
    'expires_at',entry.expires_at,'state',media.state,'bucket',media.bucket,'key',media.object_internal_key));
END $$;

CREATE FUNCTION core.image_upload_part_result(actor uuid,session_ref uuid,env text,upload_ref uuid,
  command_ref uuid,actual_hash text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media core.media_object; receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env,upload_ref);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR actual_hash IS NULL OR actual_hash !~ '^[a-f0-9]{64}$'
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session WHERE id=upload_ref FOR UPDATE;
  SELECT * INTO media FROM core.media_object WHERE id=entry.media_id FOR UPDATE;
  IF entry.expected_sha256<>actual_hash THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF entry.part_operation IS NOT NULL THEN
    IF entry.part_operation<>command_ref OR entry.uploaded_sha256<>actual_hash THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=actor AND op.environment=env AND op.action='upload.part' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  ELSE
    IF entry.expires_at<=clock_timestamp() OR media.state NOT IN ('allocated','uploading')
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=image_upload_part_result.actor
      AND op.environment=env AND op.operation_id=command_ref)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    UPDATE core.media_object SET state='uploading' WHERE id=entry.media_id;
    UPDATE core.media_object SET state='uploaded' WHERE id=entry.media_id;
    UPDATE core.image_upload_session SET part_operation=command_ref,uploaded_sha256=actual_hash WHERE id=upload_ref;
    receipt:=jsonb_build_object('upload_id',upload_ref,'part',0,'uploaded_parts','[0]'::jsonb);
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
      VALUES(actor,session_ref,env,'upload.part',command_ref,
        encode(sha256(convert_to(jsonb_build_array(upload_ref,0,actual_hash)::text,'UTF8')),'hex'),entry.media_id,'succeeded')
      RETURNING id INTO operation_ref;
    INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('upload_id',upload_ref,'part',0,'uploaded_parts','[0]'::jsonb));
END $$;

CREATE FUNCTION core.complete_image_upload_result(actor uuid,session_ref uuid,env text,upload_ref uuid,
  command_ref uuid,actual_hash text,detected_type text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.image_upload_session; media core.media_object; receipt jsonb; operation_ref uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  access:=core.image_upload_access(actor,session_ref,env,upload_ref);
  IF access->>'code'<>'OK' THEN RETURN access; END IF;
  IF command_ref IS NULL OR actual_hash IS NULL OR actual_hash !~ '^[a-f0-9]{64}$'
    OR detected_type IS NULL OR detected_type NOT IN ('image/png','image/jpeg')
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT * INTO entry FROM core.image_upload_session WHERE id=upload_ref FOR UPDATE;
  SELECT * INTO media FROM core.media_object WHERE id=entry.media_id FOR UPDATE;
  IF entry.expected_sha256<>actual_hash OR entry.uploaded_sha256<>actual_hash THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  IF entry.completion_operation IS NOT NULL THEN
    IF entry.completion_operation<>command_ref OR entry.detected_mime<>detected_type THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation op JOIN core.operation_receipt r ON r.operation_ref=op.id
      WHERE op.actor=actor AND op.environment=env AND op.action='upload.complete' AND op.operation_id=command_ref;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  ELSE
    IF entry.expires_at<=clock_timestamp() OR entry.uploaded_sha256 IS NULL OR media.state<>'uploaded'
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF EXISTS(SELECT 1 FROM core.operation op WHERE op.actor=complete_image_upload_result.actor
      AND op.environment=env AND op.operation_id=command_ref)
      THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    UPDATE core.media_object SET state='validated',detected_mime=detected_type,codec=CASE WHEN detected_type='image/png' THEN 'png' ELSE 'jpeg' END
      WHERE id=entry.media_id;
    UPDATE core.image_upload_session SET completion_operation=command_ref,detected_mime=detected_type WHERE id=upload_ref;
    receipt:=jsonb_build_object('id',entry.id,'media_id',entry.media_id,'state','validated',
      'uploaded_parts','[0]'::jsonb,'expires_at',entry.expires_at,'reusable_refs',jsonb_build_array(entry.media_id));
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
      VALUES(actor,session_ref,env,'upload.complete',command_ref,
        encode(sha256(convert_to(jsonb_build_array(upload_ref,actual_hash,detected_type)::text,'UTF8')),'hex'),entry.media_id,'succeeded')
      RETURNING id INTO operation_ref;
    INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('id',entry.id,'media_id',entry.media_id,
    'state','validated','uploaded_parts','[0]'::jsonb,'expires_at',entry.expires_at,'reusable_refs',jsonb_build_array(entry.media_id)));
END $$;

REVOKE ALL ON FUNCTION core.image_upload_access(uuid,uuid,text,uuid),
  core.create_image_upload_result(uuid,uuid,text,uuid,integer,text,integer,text),core.image_upload_probe(uuid,uuid,text,uuid),
  core.image_upload_part_result(uuid,uuid,text,uuid,uuid,text),
  core.complete_image_upload_result(uuid,uuid,text,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.image_upload_access(uuid,uuid,text,uuid),
  core.create_image_upload_result(uuid,uuid,text,uuid,integer,text,integer,text),core.image_upload_probe(uuid,uuid,text,uuid),
  core.image_upload_part_result(uuid,uuid,text,uuid,uuid,text),
  core.complete_image_upload_result(uuid,uuid,text,uuid,uuid,text,text) TO core_runtime;

CREATE TABLE core.post_image_binding (
  revision_id uuid NOT NULL REFERENCES core.content_revision(id),
  resource_id uuid NOT NULL REFERENCES core.resource(id),
  media_id uuid NOT NULL UNIQUE REFERENCES core.media_object(id),
  position integer NOT NULL CHECK (position BETWEEN 0 AND 8),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(revision_id,position),
  FOREIGN KEY(resource_id,revision_id) REFERENCES core.content_revision(resource_id,id)
);
SELECT core.protect_table('core.post_image_binding',false);
CREATE TRIGGER policy_admission BEFORE INSERT OR UPDATE OR DELETE ON core.post_image_binding
  FOR EACH STATEMENT EXECUTE FUNCTION core.policy_write_lock();

CREATE FUNCTION core.create_image_post_result(actor uuid,session_ref uuid,env text,payload jsonb,
  payload_hash text,visible_count integer,body_limit integer,image_limit integer,image_byte_limit integer,config_version text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; previous core.operation; target core.resource; media core.media_object;
  revision_ref uuid:=gen_random_uuid(); operation_ref uuid; command_ref uuid; receipt jsonb;
  media_ref_text text; ordinal integer:=0; media_count integer;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  context:=core.policy_context_result(actor,session_ref,env);
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF actor IS NULL OR session_ref IS NULL THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF payload IS NULL OR jsonb_typeof(payload)<>'object' OR payload_hash IS NULL OR payload_hash !~ '^[a-f0-9]{64}$'
    OR NOT (payload ?& ARRAY['operation_id','type','body','visibility','reply_scope','indexing_mode','tags','mentions','media_refs']::text[])
    OR (SELECT count(*) FROM jsonb_object_keys(payload))<>9
    OR payload->>'operation_id' IS NULL
    OR payload->>'operation_id' !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$'
    OR payload->>'type' IS DISTINCT FROM 'images' OR jsonb_typeof(payload->'body') IS DISTINCT FROM 'string'
    OR payload->>'visibility' IS NULL OR payload->>'visibility' NOT IN ('public','followers','self')
    OR payload->>'reply_scope' IS DISTINCT FROM 'all_readers'
    OR payload->>'indexing_mode' IS DISTINCT FROM 'inherit'
    OR payload->'tags' IS DISTINCT FROM '[]'::jsonb OR payload->'mentions' IS DISTINCT FROM '[]'::jsonb
    OR jsonb_typeof(payload->'media_refs') IS DISTINCT FROM 'array'
    OR visible_count IS NULL OR visible_count<0 OR visible_count>char_length(payload->>'body')
    OR octet_length(payload->>'body')>65536
    OR body_limit IS NULL OR body_limit NOT BETWEEN 1 AND 10000
    OR image_limit IS NULL OR image_limit NOT BETWEEN 1 AND 9
    OR image_byte_limit IS NULL OR image_byte_limit NOT BETWEEN 1 AND 10000000
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  media_count:=jsonb_array_length(payload->'media_refs');
  IF media_count NOT BETWEEN 1 AND image_limit OR visible_count>body_limit
    OR EXISTS (SELECT 1 FROM jsonb_array_elements(payload->'media_refs') j(value) WHERE jsonb_typeof(j.value)<>'string')
    OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(payload->'media_refs') j(value)
      WHERE j.value !~ '^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$')
    OR (SELECT count(DISTINCT value) FROM jsonb_array_elements_text(payload->'media_refs'))<>media_count
    THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  command_ref:=(payload->>'operation_id')::uuid;
  IF EXISTS (SELECT 1 FROM core.sanction s WHERE s.subject=actor AND s.state='active'
    AND s.starts_at<=clock_timestamp() AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
    AND s.functions && ARRAY['post.create','content.create','publish','write','all']::text[])
    THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO previous FROM core.operation op WHERE op.actor=create_image_post_result.actor
    AND op.action='post.create' AND op.operation_id=command_ref;
  IF previous.id IS NOT NULL THEN
    IF previous.payload_hash<>payload_hash OR previous.environment<>env THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
    IF NOT EXISTS(SELECT 1 FROM core.resource r WHERE r.id=previous.result_ref AND r.author_id=actor)
      THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT p.receipt INTO receipt FROM core.operation_receipt p WHERE p.operation_ref=previous.id;
    RETURN CASE WHEN receipt IS NULL THEN jsonb_build_object('code','SERVICE_UNAVAILABLE')
      ELSE jsonb_build_object('code','OK','data',receipt) END;
  END IF;
  IF config_version IS NULL OR core.response_config_version(env) IS DISTINCT FROM config_version
    THEN RETURN jsonb_build_object('code','CONFIG_UNAVAILABLE'); END IF;
  -- Lock every exact media row before the post insert. No foreign or unvalidated object can bind.
  FOR media_ref_text IN SELECT value FROM jsonb_array_elements_text(payload->'media_refs') LOOP
    SELECT * INTO media FROM core.media_object m WHERE m.id=media_ref_text::uuid FOR UPDATE;
    IF media.id IS NULL OR media.owner<>actor OR media.state<>'validated' OR media.bound_resource IS NOT NULL
      OR media.plugin<>'core' OR media.bucket<>'post-images-private' OR media.detected_mime NOT IN ('image/png','image/jpeg')
      OR media.size_bytes NOT BETWEEN 1 AND image_byte_limit
      OR NOT EXISTS(SELECT 1 FROM core.image_upload_session u WHERE u.media_id=media.id AND u.owner=actor
        AND u.environment=env AND u.detected_mime=media.detected_mime AND u.expires_at>clock_timestamp())
      THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  END LOOP;
  INSERT INTO core.resource(author_id,kind,visibility,publication_state)
    VALUES(actor,'post',payload->>'visibility','pending') RETURNING * INTO target;
  INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
    VALUES(revision_ref,target.id,1,payload->>'body',actor,'pending',clock_timestamp());
  UPDATE core.resource SET current_revision_id=revision_ref WHERE id=target.id RETURNING * INTO target;
  INSERT INTO core.reply_policy(post_id,scope) VALUES(target.id,'all_readers');
  FOR media_ref_text IN SELECT value FROM jsonb_array_elements_text(payload->'media_refs') LOOP
    UPDATE core.media_object SET state='reviewed' WHERE id=media_ref_text::uuid;
    UPDATE core.media_object SET state='bound',bound_resource=target.id WHERE id=media_ref_text::uuid;
    INSERT INTO core.post_image_binding(revision_id,resource_id,media_id,position)
      VALUES(revision_ref,target.id,media_ref_text::uuid,ordinal);
    ordinal:=ordinal+1;
  END LOOP;
  receipt:=jsonb_build_object('resource_id',target.id,'revision_id',revision_ref,
    'operation_id',command_ref,'review_state','pending','publication_state','awaiting_review',
    'row_version',target.row_version);
  INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,result_ref,state)
    VALUES(actor,session_ref,env,'post.create',command_ref,payload_hash,target.id,'succeeded') RETURNING id INTO operation_ref;
  INSERT INTO core.operation_receipt(operation_ref,receipt) VALUES(operation_ref,receipt);
  INSERT INTO core.audit_event(actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
    VALUES(actor,session_ref,'post.create',target.id,env,'core','Submitted image post for review','awaiting_review',command_ref);
  RETURN jsonb_build_object('code','OK','data',receipt);
END $$;
REVOKE ALL ON FUNCTION core.create_image_post_result(uuid,uuid,text,jsonb,text,integer,integer,integer,integer,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.create_image_post_result(uuid,uuid,text,jsonb,text,integer,integer,integer,integer,text) TO core_runtime;

-- An unapproved image has no public read path. An AAL2 content reviewer can
-- inspect the current pending, approved or rejected revision for its scope.
CREATE FUNCTION core.media_review_read_result(actor uuid,session_ref uuid,env text,jwt_aal text,target uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE access jsonb; entry core.media_object; resource_row core.resource; revision_row core.content_revision;
BEGIN
  access:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read');
  IF access->>'code'<>'OK' THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT m.* INTO entry FROM core.media_object m WHERE m.id=target AND m.state='bound';
  IF entry.id IS NULL OR entry.bound_resource IS NULL OR entry.bucket<>'post-images-private'
    OR entry.detected_mime NOT IN ('image/png','image/jpeg')
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT * INTO resource_row FROM core.resource r WHERE r.id=entry.bound_resource;
  IF resource_row.id IS NULL OR resource_row.kind<>'post' OR resource_row.deleted_at IS NOT NULL OR resource_row.moderation_ref IS NOT NULL
    OR resource_row.publication_state NOT IN ('pending','published','rejected') OR resource_row.current_revision_id IS NULL
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT * INTO revision_row FROM core.content_revision v WHERE v.id=resource_row.current_revision_id;
  IF revision_row.id IS NULL OR NOT ((revision_row.review_state='pending' AND resource_row.publication_state='pending')
    OR (revision_row.review_state='approved' AND resource_row.publication_state='published')
    OR (revision_row.review_state='rejected' AND resource_row.publication_state='rejected')) OR
    NOT EXISTS (SELECT 1 FROM core.post_image_binding b WHERE b.resource_id=resource_row.id
      AND b.revision_id=revision_row.id AND b.media_id=entry.id)
    THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  access:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read',resource_row.id);
  IF access->>'code'<>'OK' THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('media_id',entry.id,'mime',entry.detected_mime,
    'codec',entry.codec,'size_bytes',entry.size_bytes,'duration_ms',entry.duration_ms,'variant','original','hash',entry.sha256),
    'source',jsonb_build_object('bucket',entry.bucket,'key',entry.object_internal_key));
END $$;
REVOKE ALL ON FUNCTION core.media_review_read_result(uuid,uuid,text,text,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.media_review_read_result(uuid,uuid,text,text,uuid) TO core_runtime;

-- RevisionPage now carries media IDs so the management client can request the
-- scoped gateway preview without a direct Storage URL.
CREATE OR REPLACE FUNCTION core.admin_review_page_result(actor uuid,session_ref uuid,env text,jwt_aal text,
  page_limit integer,after_id uuid) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE context jsonb; items jsonb:='[]'::jsonb; entry record; count_items integer:=0; more boolean:=false; last_id uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  context:=core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read');
  IF context->>'code'<>'OK' THEN RETURN context; END IF;
  IF page_limit IS NULL OR page_limit NOT BETWEEN 1 AND 50 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT v.*,r.id AS target_resource FROM core.content_revision v
    JOIN core.resource r ON r.id=v.resource_id AND r.current_revision_id=v.id
    WHERE v.submitted_at IS NOT NULL AND r.deleted_at IS NULL AND r.moderation_ref IS NULL
      AND ((v.review_state='pending' AND r.publication_state='pending')
        OR (v.review_state='approved' AND r.publication_state='published')
        OR (v.review_state='rejected' AND r.publication_state='rejected'))
      AND (after_id IS NULL OR v.id<after_id)
      AND core.admin_review_access(actor,session_ref,env,jwt_aal,'moderation.contents.read',r.id)->>'code'='OK'
    ORDER BY v.id DESC LIMIT page_limit+1
  LOOP
    IF count_items=page_limit THEN more:=true; EXIT; END IF;
    items:=items || jsonb_build_array(jsonb_build_object('id',entry.id,'resource_id',entry.resource_id,
      'revision_no',entry.revision_no,'body',entry.body,'tags',entry.tags,'mentions',entry.mentions,
      'alt_text',CASE WHEN entry.alt_text IS NULL THEN '[]'::jsonb ELSE jsonb_build_array(entry.alt_text) END,
      'media_refs',coalesce((SELECT jsonb_agg(b.media_id ORDER BY b.position) FROM core.post_image_binding b
        WHERE b.revision_id=entry.id),'[]'::jsonb),
      'review_state',entry.review_state,'submitted_at',to_char(entry.submitted_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')));
    count_items:=count_items+1; last_id:=entry.id;
  END LOOP;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',items,
    'next_cursor',CASE WHEN more THEN last_id::text END,'has_more',more));
END $$;

-- Extend the existing resolver without renaming its function: installed
-- references use account_operation_result.actor as a PL/pgSQL parameter qualifier.
CREATE OR REPLACE FUNCTION core.account_operation_result(actor uuid,session_ref uuid,command_ref uuid,
  target_environment text,jwt_aal text) RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.operation; matches integer; result jsonb; receipt jsonb; review_resource uuid;
  upload core.image_upload_session;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF command_ref IS NULL OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  SELECT count(*) INTO matches FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide',
      'upload.create','upload.part','upload.complete');
  IF matches=0 THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF matches>1 THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
  SELECT * INTO entry FROM core.operation op WHERE op.actor=account_operation_result.actor
    AND op.environment=target_environment AND op.operation_id=command_ref
    AND op.action IN ('auth.register','session.revoke','auth.logout','recovery.request',
      'config.release','config.rollback','post.create','comment.create','like.put','like.remove',
      'block.put','block.remove','profile.update','report.create','moderation.revisions.decide',
      'upload.create','upload.part','upload.complete');
  IF entry.action IN ('config.release','config.rollback') THEN
    IF jwt_aal IS NULL THEN RETURN jsonb_build_object('code','MFA_REQUIRED'); END IF;
    result:=core.admin_identity_context(actor,session_ref,target_environment,jwt_aal,true);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    IF NOT core.admin_has_permission(actor,target_environment,entry.action)
      OR NOT core.admin_has_permission(actor,target_environment,'config.read') THEN
      RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
    SELECT p.receipt INTO receipt FROM core.admin_config_publication p
      WHERE p.actor=account_operation_result.actor AND p.environment=target_environment
        AND p.operation_id=command_ref AND 'config.' || p.kind=entry.action;
  ELSIF entry.action='moderation.revisions.decide' THEN
    SELECT d.resource_id INTO review_resource FROM core.admin_review_decision d
      WHERE d.actor=account_operation_result.actor AND d.environment=target_environment AND d.operation_id=command_ref;
    result:=core.admin_review_access(actor,session_ref,target_environment,jwt_aal,
      'moderation.revisions.decide',review_resource);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('post.create','comment.create') THEN
    IF NOT EXISTS (SELECT 1 FROM core.resource r WHERE r.id=entry.result_ref
      AND r.author_id=actor AND r.deleted_at IS NULL) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('like.put','like.remove') THEN
    result:=core.resource_action_result(actor,session_ref,entry.result_ref,'resource.read','read');
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('block.put','block.remove','profile.update','report.create') THEN
    IF entry.action='report.create' AND NOT EXISTS (SELECT 1 FROM core.report r
      WHERE r.id=entry.result_ref AND r.reporter=actor) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  ELSIF entry.action IN ('upload.create','upload.part','upload.complete') THEN
    SELECT * INTO upload FROM core.image_upload_session u WHERE u.media_id=entry.result_ref
      AND u.owner=actor AND u.environment=target_environment;
    IF upload.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
    result:=core.image_upload_access(actor,session_ref,target_environment,upload.id);
    IF result->>'code'<>'OK' THEN RETURN result; END IF;
    SELECT r.receipt INTO receipt FROM core.operation_receipt r WHERE r.operation_ref=entry.id;
  END IF;
  IF entry.action IN ('post.create','comment.create','like.put','like.remove','block.put','block.remove',
    'profile.update','report.create','moderation.revisions.decide','upload.create','upload.part','upload.complete')
    AND receipt IS NULL THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object(
    'operation_id',entry.operation_id,'action',entry.action,'state',entry.state)
    || CASE WHEN receipt IS NOT NULL THEN jsonb_build_object('result',receipt) ELSE '{}'::jsonb END);
END $$;
REVOKE ALL ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text,text)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.account_operation_result(uuid,uuid,uuid,text,text) TO core_runtime;

-- Preserve the installed read admission and extend only post projections with
-- current revision image IDs. Media bytes still have their own current gate.
CREATE OR REPLACE FUNCTION core.read_resource_result(actor uuid,session_ref uuid,target uuid)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE output jsonb; refs jsonb;
BEGIN
  IF actor IS NOT NULL AND NOT core.current_identity(actor,session_ref) OR actor IS NULL AND session_ref IS NOT NULL
    THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF EXISTS (
    WITH RECURSIVE closure(id) AS (
      SELECT target UNION SELECT d.source FROM core.resource_dependency d JOIN closure c ON d.dependent=c.id
    )
    SELECT 1 FROM closure c LEFT JOIN core.resource r ON r.id=c.id
    LEFT JOIN core.content_revision v ON v.id=r.current_revision_id AND v.resource_id=r.id
    WHERE r.id IS NULL OR r.deleted_at IS NOT NULL OR r.moderation_ref IS NOT NULL
      OR r.publication_state<>'published' OR v.id IS NULL OR v.review_state<>'approved'
      OR NOT EXISTS(SELECT 1 FROM core.account author WHERE author.id=r.author_id AND author.status='active')
      OR (actor IS NOT NULL AND EXISTS(SELECT 1 FROM core.block b WHERE b.active AND b.revoked_at IS NULL
        AND ((b.blocker_id=actor AND b.blocked_id=r.author_id) OR (b.blocker_id=r.author_id AND b.blocked_id=actor))))
      OR NOT coalesce((r.visibility='public' OR r.author_id=actor OR
        (r.visibility='followers' AND EXISTS(SELECT 1 FROM core.follow f
          WHERE f.follower_id=actor AND f.followed_id=r.author_id AND f.state='effective'))),false)
  ) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  SELECT coalesce(jsonb_agg(b.media_id ORDER BY b.position),'[]'::jsonb) INTO refs
    FROM core.post_image_binding b WHERE b.resource_id=target
      AND b.revision_id=(SELECT current_revision_id FROM core.resource WHERE id=target);
  SELECT jsonb_build_object('id',r.id,'author_id',r.author_id,'visibility',r.visibility,
    'revision_id',v.id,'body',v.body,'row_version',r.row_version) ||
    CASE WHEN r.kind='post' THEN jsonb_build_object('type',CASE WHEN jsonb_array_length(refs)>0 THEN 'images' ELSE 'text' END,
      'media_refs',refs) ELSE '{}'::jsonb END
  INTO output FROM core.resource r JOIN core.content_revision v ON v.id=r.current_revision_id AND v.resource_id=r.id
  WHERE r.id=target;
  RETURN CASE WHEN output IS NULL THEN jsonb_build_object('code','NOT_FOUND')
    ELSE jsonb_build_object('code','OK','data',output) END;
END $$;
REVOKE ALL ON FUNCTION core.read_resource_result(uuid,uuid,uuid)
  FROM PUBLIC,anon,authenticated,service_role,core_worker;
GRANT EXECUTE ON FUNCTION core.read_resource_result(uuid,uuid,uuid) TO core_runtime;
