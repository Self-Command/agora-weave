CREATE OR REPLACE FUNCTION core.claim_outbox(consumer_ref text,target_environment text,batch_limit integer DEFAULT 20) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE output jsonb;
BEGIN
  IF consumer_ref<>'core-events-v1' OR target_environment NOT IN ('dev','test','production') OR batch_limit NOT BETWEEN 1 AND 50 THEN
    RETURN jsonb_build_object('code','INVALID_INPUT'); END IF;
  PERFORM pg_advisory_xact_lock_shared(17013,1);
  IF NOT core.archive_ready() THEN RETURN jsonb_build_object('code','SERVICE_UNAVAILABLE'); END IF;
  WITH selected AS (SELECT o.id FROM core.outbox o WHERE o.environment=target_environment AND o.result IS NULL
    AND (o.lease_until IS NULL OR o.lease_until<=clock_timestamp()) ORDER BY o.created_at,o.id FOR UPDATE SKIP LOCKED LIMIT batch_limit),
  claimed AS (UPDATE core.outbox o SET lease=gen_random_uuid(),lease_until=clock_timestamp()+interval '30 seconds',attempt=o.attempt+1
    FROM selected s WHERE o.id=s.id RETURNING o.id,o.lease)
  SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'lease',lease)),'[]'::jsonb) INTO output FROM claimed;
  RETURN jsonb_build_object('code','OK','items',output);
END $$;
