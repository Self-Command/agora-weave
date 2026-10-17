-- A separate database is not included in business-database restores. Its append-only
-- ledger is also archived by the worker outside business backups before restore opening.
CREATE EXTENSION IF NOT EXISTS dblink WITH SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname='agoraweave_security') THEN
    PERFORM extensions.dblink_exec('dbname=postgres user=supabase_admin','CREATE DATABASE agoraweave_security OWNER supabase_admin');
  END IF;
END $$;
CREATE SERVER IF NOT EXISTS core_security FOREIGN DATA WRAPPER dblink_fdw OPTIONS(dbname 'agoraweave_security');
CREATE USER MAPPING IF NOT EXISTS FOR supabase_admin SERVER core_security OPTIONS(user 'supabase_admin');
REVOKE ALL ON FOREIGN SERVER core_security FROM PUBLIC,anon,authenticated,service_role,core_runtime;
SELECT extensions.dblink_exec('core_security',$remote$
  CREATE SCHEMA IF NOT EXISTS journal;
  REVOKE ALL ON SCHEMA journal FROM PUBLIC;
  CREATE TABLE IF NOT EXISTS journal.ledger (
    seq bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,intent_id uuid NOT NULL,kind text NOT NULL,
    transaction_ref text NOT NULL,target uuid NOT NULL,subject uuid,action text NOT NULL,policy_epoch bigint NOT NULL,
    payload jsonb NOT NULL,occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),previous_hash text NOT NULL,hash_chain text NOT NULL,
    UNIQUE(intent_id,kind),CHECK(kind IN ('intent','committed','aborted'))
  );
  CREATE OR REPLACE FUNCTION journal.immutable() RETURNS trigger LANGUAGE plpgsql AS $f$
    BEGIN RAISE EXCEPTION 'Security archive is append-only'; END $f$;
  DO $t$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='journal.ledger'::regclass AND tgname='immutable') THEN CREATE TRIGGER immutable BEFORE UPDATE OR DELETE ON journal.ledger FOR EACH ROW EXECUTE FUNCTION journal.immutable(); END IF; END $t$;
  CREATE OR REPLACE FUNCTION journal.append(i uuid,k text,x text,t uuid,s uuid,a text,e bigint,p jsonb) RETURNS jsonb
  LANGUAGE plpgsql SET search_path=pg_catalog AS $f$
  DECLARE previous text; entry journal.ledger; canonical text;
  BEGIN
    PERFORM pg_advisory_xact_lock(17014,1);
    SELECT * INTO entry FROM journal.ledger WHERE intent_id=i AND kind=k;
    IF entry.seq IS NOT NULL THEN
      IF ROW(entry.transaction_ref,entry.target,entry.subject,entry.action,entry.policy_epoch,entry.payload)
        IS DISTINCT FROM ROW(x,t,s,a,e,p) THEN RAISE EXCEPTION 'Journal idempotency conflict'; END IF;
      RETURN to_jsonb(entry);
    END IF;
    SELECT hash_chain INTO previous FROM journal.ledger ORDER BY seq DESC LIMIT 1;
    canonical:=jsonb_build_object('intent_id',i,'kind',k,'transaction_ref',x,'target',t,'subject',s,'action',a,'policy_epoch',e,'payload',p)::text;
    INSERT INTO journal.ledger(intent_id,kind,transaction_ref,target,subject,action,policy_epoch,payload,previous_hash,hash_chain)
      VALUES(i,k,x,t,s,a,e,p,coalesce(previous,''),encode(sha256(convert_to(coalesce(previous,'')||canonical,'UTF8')),'hex')) RETURNING * INTO entry;
    RETURN to_jsonb(entry);
  END $f$;
  REVOKE ALL ON ALL TABLES IN SCHEMA journal FROM PUBLIC;
  REVOKE ALL ON ALL FUNCTIONS IN SCHEMA journal FROM PUBLIC;
$remote$);
ALTER TABLE core.security_journal ADD COLUMN archive_seq bigint UNIQUE;
CREATE TABLE core.security_checkpoint(id boolean PRIMARY KEY DEFAULT true CHECK(id),seq bigint NOT NULL,hash_chain text NOT NULL);
INSERT INTO core.security_checkpoint(id,seq,hash_chain) VALUES(true,0,'');
SELECT core.protect_table('core.security_checkpoint',false);

CREATE FUNCTION core.archive_append(i uuid,k text,x text,t uuid,s uuid,a text,e bigint,p jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  SELECT data INTO result FROM extensions.dblink('core_security',format(
    'SELECT journal.append(%L::uuid,%L,%L,%L::uuid,%L::uuid,%L,%L::bigint,%L::jsonb)',i,k,x,t,s,a,e,p)) AS q(data jsonb);
  RETURN result;
END $$;
CREATE FUNCTION core.archive_head() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  SELECT data INTO result FROM extensions.dblink('core_security',
    'SELECT coalesce((SELECT jsonb_build_object(''seq'',seq,''hash_chain'',hash_chain) FROM journal.ledger ORDER BY seq DESC LIMIT 1),''{"seq":0,"hash_chain":""}''::jsonb)') AS q(data jsonb);
  RETURN result;
END $$;
CREATE FUNCTION core.archive_ready() RETURNS boolean LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE head jsonb;
BEGIN
  head:=core.archive_head();
  RETURN EXISTS(SELECT 1 FROM core.security_checkpoint WHERE seq=(head->>'seq')::bigint AND hash_chain=head->>'hash_chain');
EXCEPTION WHEN OTHERS THEN RETURN false;
END $$;

CREATE FUNCTION core.archive_policy_restriction() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE old_row jsonb:=to_jsonb(OLD);new_row jsonb:=CASE WHEN TG_OP='DELETE' THEN '{}'::jsonb ELSE to_jsonb(NEW) END;
  entry jsonb;target_ref uuid;subject_ref uuid;intent uuid:=gen_random_uuid();epoch bigint;restriction boolean:=false;changes jsonb;
BEGIN
  IF TG_TABLE_NAME='account' THEN restriction:=TG_OP='DELETE' OR new_row->>'status'='cancelled'; changes:=jsonb_build_object('status',new_row->>'status');
  ELSIF TG_TABLE_NAME='session_registry' THEN restriction:=TG_OP='DELETE' OR new_row->>'revoked_at' IS NOT NULL;changes:=jsonb_build_object('revoked_at',new_row->>'revoked_at');
  ELSIF TG_TABLE_NAME='admin_grant' THEN restriction:=true;changes:=new_row-ARRAY['created_at','updated_at'];
  ELSIF TG_TABLE_NAME='follow' THEN restriction:=TG_OP='DELETE' OR new_row->>'state'<>'effective';changes:=jsonb_build_object('state',new_row->>'state');
  ELSIF TG_TABLE_NAME='block' THEN restriction:=TG_OP<>'DELETE' AND new_row->>'active'='true';changes:=jsonb_build_object('active',true);
  ELSIF TG_TABLE_NAME='resource' THEN restriction:=TG_OP='DELETE' OR new_row->>'deleted_at' IS NOT NULL OR new_row->>'moderation_ref' IS NOT NULL
    OR new_row->>'publication_state'<>'published' OR new_row->>'visibility' IS DISTINCT FROM old_row->>'visibility';
    changes:=new_row-ARRAY['created_at','updated_at','data_class','root_post','source_id','thread_id'];
  ELSIF TG_TABLE_NAME IN ('sanction','plugin_installation','resource_dependency','media_object','media_derivative') THEN restriction:=true;
    changes:=new_row-ARRAY['created_at','updated_at','object_internal_key','bucket'];
  END IF;
  IF NOT restriction OR TG_OP='UPDATE' AND old_row=new_row THEN RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END; END IF;
  target_ref:=coalesce((old_row->>'id')::uuid,(new_row->>'id')::uuid);
  subject_ref:=coalesce((new_row->>'account_id')::uuid,(new_row->>'author_id')::uuid,(new_row->>'follower_id')::uuid,(new_row->>'subject')::uuid);
  epoch:=coalesce((new_row->>'policy_epoch')::bigint,(new_row->>'epoch')::bigint,(new_row->>'identity_epoch')::bigint,(new_row->>'row_version')::bigint,1);
  entry:=core.archive_append(intent,'intent',pg_current_xact_id()::text,target_ref,subject_ref,TG_TABLE_NAME||'.'||lower(TG_OP),epoch,
    jsonb_build_object('table',TG_TABLE_NAME,'mutation',TG_OP,'fields',changes));
  INSERT INTO core.security_journal(deny_intent_id,target,subject,action,policy_epoch,committed_result,hash_chain,archive_seq)
    VALUES(intent,target_ref,subject_ref,TG_TABLE_NAME||'.'||lower(TG_OP),epoch,'pending',entry->>'hash_chain',(entry->>'seq')::bigint);
  UPDATE core.security_checkpoint SET seq=(entry->>'seq')::bigint,hash_chain=entry->>'hash_chain';
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END $$;
DO $$ DECLARE name text; BEGIN
  FOREACH name IN ARRAY ARRAY['account','session_registry','admin_grant','follow','block','resource','resource_dependency','sanction','plugin_installation','media_object','media_derivative'] LOOP
    EXECUTE format('CREATE TRIGGER durable_restriction BEFORE UPDATE OR DELETE ON core.%I FOR EACH ROW EXECUTE FUNCTION core.archive_policy_restriction()',name);
  END LOOP;
END $$;

CREATE FUNCTION core.archive_records(after_seq bigint,max_rows integer DEFAULT 50) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF after_seq<0 OR max_rows NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid journal bounds'; END IF;
  SELECT data INTO result FROM extensions.dblink('core_security',format(
    'SELECT coalesce(jsonb_agg(q ORDER BY seq),''[]''::jsonb) FROM (SELECT * FROM journal.ledger WHERE seq>%L ORDER BY seq LIMIT %L) q',after_seq,max_rows)) AS q(data jsonb);
  RETURN result;
END $$;
CREATE FUNCTION core.reconcile_security_journal() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry jsonb;record_state text;head jsonb;records jsonb;resolved integer:=0;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  SELECT data INTO records FROM extensions.dblink('core_security',
    'SELECT coalesce(jsonb_agg(q),''[]''::jsonb) FROM (SELECT i.* FROM journal.ledger i WHERE kind=''intent'' AND NOT EXISTS
      (SELECT 1 FROM journal.ledger r WHERE r.intent_id=i.intent_id AND r.kind<>''intent'') ORDER BY seq LIMIT 100) q') AS q(data jsonb);
  FOR entry IN SELECT * FROM jsonb_array_elements(records) LOOP
    record_state:=pg_xact_status((entry->>'transaction_ref')::xid8);
    IF record_state='in progress' THEN CONTINUE; END IF;
    IF record_state='committed' AND NOT EXISTS(SELECT 1 FROM core.security_journal WHERE archive_seq=(entry->>'seq')::bigint) THEN
      UPDATE core.restore_gate SET state='closed'; RETURN jsonb_build_object('code','JOURNAL_GAP');
    END IF;
    PERFORM core.archive_append((entry->>'intent_id')::uuid,CASE WHEN record_state='committed' THEN 'committed' ELSE 'aborted' END,
      entry->>'transaction_ref',(entry->>'target')::uuid,(entry->>'subject')::uuid,entry->>'action',(entry->>'policy_epoch')::bigint,entry->'payload');
    resolved:=resolved+1;
  END LOOP;
  head:=core.archive_head();
  UPDATE core.security_checkpoint SET seq=(head->>'seq')::bigint,hash_chain=head->>'hash_chain';
  RETURN jsonb_build_object('code','OK','resolved',resolved,'watermark',head->'seq');
END $$;
REVOKE ALL ON FUNCTION core.archive_append(uuid,text,text,uuid,uuid,text,bigint,jsonb),core.archive_head(),core.archive_ready(),core.archive_records(bigint,integer),
  core.reconcile_security_journal(),core.archive_policy_restriction() FROM PUBLIC,anon,authenticated,service_role,core_runtime;
GRANT EXECUTE ON FUNCTION core.archive_ready() TO core_runtime;
GRANT EXECUTE ON FUNCTION core.archive_head(),core.archive_ready(),core.archive_records(bigint,integer),core.reconcile_security_journal() TO postgres;
REVOKE EXECUTE ON FUNCTION extensions.dblink(text,text),extensions.dblink_exec(text,text),extensions.dblink_connect(text),
  extensions.dblink_connect_u(text),extensions.dblink_connect_u(text,text) FROM PUBLIC,anon,authenticated,service_role,core_runtime;
