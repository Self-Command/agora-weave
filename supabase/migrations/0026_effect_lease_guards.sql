-- Missing lease fields must reject before any durable consumer effect.
CREATE OR REPLACE FUNCTION core.claim_outbox(consumer_ref text,target_environment text,batch_limit integer DEFAULT 20) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE output jsonb;
BEGIN
  IF consumer_ref IS DISTINCT FROM 'core-events-v1' OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    batch_limit IS NULL OR batch_limit NOT BETWEEN 1 AND 50 THEN RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.archive_ready() THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  WITH selected AS (SELECT o.id FROM core.outbox o WHERE o.environment=target_environment AND o.result IS NULL
    AND (o.lease_until IS NULL OR o.lease_until<=clock_timestamp()) ORDER BY o.created_at,o.id FOR UPDATE SKIP LOCKED LIMIT batch_limit),
  claimed AS (UPDATE core.outbox o SET lease=gen_random_uuid(),lease_until=clock_timestamp()+interval '30 seconds',attempt=o.attempt+1
    FROM selected s WHERE o.id=s.id RETURNING o.id,o.lease)
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'lease',lease)),'[]'::jsonb) INTO output FROM claimed;
  RETURN jsonb_build_object('code','OK','items',output);
END $$;

CREATE OR REPLACE FUNCTION core.complete_outbox(target uuid,lease_ref uuid,consumer_ref text,target_environment text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry core.outbox;inserted uuid;
BEGIN
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF consumer_ref IS DISTINCT FROM 'core-events-v1' OR target_environment IS NULL OR target_environment NOT IN ('dev','test','production') OR
    NOT core.archive_ready() THEN RETURN jsonb_build_object('code','FORBIDDEN'); END IF;
  SELECT * INTO entry FROM core.outbox WHERE id=target AND environment=target_environment FOR UPDATE;
  IF entry.id IS NULL THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  IF entry.result='delivered' AND EXISTS(SELECT 1 FROM core.inbox WHERE consumer=consumer_ref AND effect_key=entry.effect_key) THEN
    RETURN jsonb_build_object('code','OK','reused',true); END IF;
  IF lease_ref IS NULL OR entry.lease IS NULL OR entry.lease_until IS NULL OR entry.lease IS DISTINCT FROM lease_ref OR
    entry.lease_until<=clock_timestamp() OR entry.result IS NOT NULL THEN RETURN jsonb_build_object('code','CONFLICT'); END IF;
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
