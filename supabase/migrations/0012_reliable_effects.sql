CREATE ROLE core_worker LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE core_worker SET statement_timeout='5s';
ALTER ROLE core_worker SET lock_timeout='3s';
GRANT USAGE ON SCHEMA core TO core_worker;
ALTER TABLE core.outbox ADD COLUMN event_type text NOT NULL DEFAULT 'access.changed';
ALTER TABLE core.outbox ADD COLUMN environment text NOT NULL DEFAULT 'test' CHECK(environment IN ('dev','test','production'));
ALTER TABLE core.outbox ADD COLUMN payload jsonb NOT NULL DEFAULT '{"state":"changed"}'::jsonb;
ALTER TABLE core.outbox ADD COLUMN recipient uuid REFERENCES core.account(id);
CREATE TABLE core.event_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  event_id uuid NOT NULL UNIQUE,event_type text NOT NULL,aggregate_id uuid NOT NULL,aggregate_version bigint NOT NULL,
  recipient uuid REFERENCES core.account(id),environment text NOT NULL,owner_plugin text NOT NULL,lifecycle_epoch bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
SELECT core.protect_table('core.event_delivery',false);
CREATE INDEX ON core.event_delivery(environment,sequence);
CREATE FUNCTION core.bind_outbox_context() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
DECLARE entry core.operation;
BEGIN
  SELECT * INTO entry FROM core.operation WHERE result_ref=NEW.aggregate_id ORDER BY created_at DESC LIMIT 1;
  IF entry.id IS NOT NULL THEN NEW.environment:=entry.environment;NEW.recipient:=entry.actor; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER bind_context BEFORE INSERT ON core.outbox FOR EACH ROW EXECUTE FUNCTION core.bind_outbox_context();
CREATE FUNCTION core.claim_outbox(consumer_ref text,target_environment text,batch_limit integer DEFAULT 20) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF consumer_ref<>'core-events-v1' OR target_environment NOT IN ('dev','test','production') OR batch_limit NOT BETWEEN 1 AND 50 THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.archive_ready() THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  WITH selected AS (SELECT id FROM core.outbox WHERE environment=target_environment AND result IS NULL
    AND (lease_until IS NULL OR lease_until<=clock_timestamp()) ORDER BY created_at,id FOR UPDATE SKIP LOCKED LIMIT batch_limit),
  claimed AS (UPDATE core.outbox o SET lease=gen_random_uuid(),lease_until=clock_timestamp()+interval '30 seconds',attempt=attempt+1
    FROM selected s WHERE o.id=s.id RETURNING o.id,o.lease)
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'lease',lease)),'[]'::jsonb) INTO result FROM claimed;
  RETURN jsonb_build_object('code','OK','items',result);
END $$;
CREATE FUNCTION core.complete_outbox(target uuid,lease_ref uuid,consumer_ref text,target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.outbox;inserted uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF consumer_ref<>'core-events-v1' OR NOT core.archive_ready() THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO entry FROM core.outbox WHERE id=target AND environment=target_environment FOR UPDATE;
  IF entry.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.result='delivered' AND EXISTS(SELECT 1 FROM core.inbox WHERE consumer=consumer_ref AND effect_key=entry.effect_key) THEN
    RETURN jsonb_build_object('code','OK','reused',true); END IF;
  IF entry.lease IS DISTINCT FROM lease_ref OR entry.lease_until<=clock_timestamp() OR entry.result IS NOT NULL THEN
    RETURN jsonb_build_object('code','CONFLICT'); END IF;
  IF entry.owner_plugin<>'core' AND NOT EXISTS (SELECT 1 FROM core.plugin_installation WHERE plugin=entry.owner_plugin
    AND environment=target_environment AND state='enabled' AND lifecycle_epoch=entry.lifecycle_epoch) THEN
    UPDATE core.outbox SET result='cancelled',lease=NULL,lease_until=NULL WHERE id=target;
    RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  INSERT INTO core.inbox(consumer,effect_key,event_id,result) VALUES(consumer_ref,entry.effect_key,entry.event_id,'delivered')
    ON CONFLICT(consumer,effect_key) DO NOTHING RETURNING id INTO inserted;
  IF inserted IS NOT NULL THEN
    INSERT INTO core.event_delivery(event_id,event_type,aggregate_id,aggregate_version,recipient,environment,owner_plugin,lifecycle_epoch)
      VALUES(entry.event_id,entry.event_type,entry.aggregate_id,entry.aggregate_version,entry.recipient,target_environment,entry.owner_plugin,entry.lifecycle_epoch)
      ON CONFLICT(event_id) DO NOTHING;
  END IF;
  UPDATE core.outbox SET result='delivered',lease=NULL,lease_until=NULL WHERE id=target;
  RETURN jsonb_build_object('code','OK','reused',inserted IS NULL);
END $$;
CREATE FUNCTION core.read_events_result(actor uuid,session_ref uuid,target_environment text,after_sequence bigint,page_limit integer) RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.event_delivery;items jsonb:='[]'::jsonb;cursor bigint:=after_sequence;resource_result jsonb;
BEGIN
  IF NOT core.archive_ready() THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  IF NOT core.current_identity(actor,session_ref) THEN RETURN jsonb_build_object('code','SESSION_INVALID'); END IF;
  IF after_sequence<0 OR page_limit NOT BETWEEN 1 AND 50 OR target_environment NOT IN ('dev','test','production') THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  FOR entry IN SELECT * FROM core.event_delivery WHERE environment=target_environment AND sequence>after_sequence ORDER BY sequence LIMIT 200 LOOP
    cursor:=entry.sequence;
    IF entry.owner_plugin<>'core' AND NOT EXISTS(SELECT 1 FROM core.plugin_installation WHERE plugin=entry.owner_plugin
      AND environment=target_environment AND state='enabled' AND lifecycle_epoch=entry.lifecycle_epoch) THEN CONTINUE; END IF;
    IF entry.recipient=actor THEN
      items:=items||jsonb_build_array(jsonb_build_object('event_id',entry.event_id,'type',entry.event_type,'scope','account','sequence',entry.sequence));
    ELSIF entry.recipient IS NULL THEN
      resource_result:=core.resource_action_result(actor,session_ref,entry.aggregate_id,'event.read','read');
      IF resource_result->>'code'='OK' THEN
        items:=items||jsonb_build_array(jsonb_build_object('event_id',entry.event_id,'type',entry.event_type,'target_ref',entry.aggregate_id,
          'aggregate_version',entry.aggregate_version,'sequence',entry.sequence));
      END IF;
    END IF;
    EXIT WHEN jsonb_array_length(items)>=page_limit;
  END LOOP;
  RETURN jsonb_build_object('code','OK','data',jsonb_build_object('items',items,'cursor',cursor));
END $$;
CREATE FUNCTION core.worker_journal_records(after_sequence bigint) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT core.archive_records(after_sequence,100) $$;
CREATE FUNCTION core.worker_reconcile() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$ SELECT core.reconcile_security_journal() $$;
REVOKE ALL ON FUNCTION core.claim_outbox(text,text,integer),core.complete_outbox(uuid,uuid,text,text),core.read_events_result(uuid,uuid,text,bigint,integer),
  core.worker_journal_records(bigint),core.worker_reconcile() FROM PUBLIC,anon,authenticated,service_role,core_runtime;
GRANT EXECUTE ON FUNCTION core.claim_outbox(text,text,integer),core.complete_outbox(uuid,uuid,text,text),core.worker_journal_records(bigint),core.worker_reconcile() TO core_worker,postgres;
GRANT EXECUTE ON FUNCTION core.read_events_result(uuid,uuid,text,bigint,integer) TO core_runtime;
