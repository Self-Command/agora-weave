CREATE OR REPLACE FUNCTION core.reconcile_security_journal() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry jsonb;record_state text;head jsonb;records jsonb;confirmed jsonb;checkpoint bigint;resolved integer:=0;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
  SELECT seq INTO checkpoint FROM core.security_checkpoint WHERE id;
  -- An already resolved independent commit can outlive a restored business snapshot.
  -- Reconciliation may resolve unknown outcomes, but must never certify missing facts.
  SELECT data INTO confirmed FROM extensions.dblink('core_security',format(
    'SELECT coalesce(jsonb_agg(jsonb_build_object(''intent_seq'',i.seq,''intent_id'',i.intent_id)),''[]''::jsonb)
      FROM journal.ledger r JOIN journal.ledger i ON i.intent_id=r.intent_id AND i.kind=''intent''
      WHERE r.kind=''committed'' AND r.seq>%L',checkpoint)) AS q(data jsonb);
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(confirmed) r WHERE NOT EXISTS(
    SELECT 1 FROM core.security_journal j WHERE j.archive_seq=(r->>'intent_seq')::bigint AND j.deny_intent_id=(r->>'intent_id')::uuid)) THEN
    UPDATE core.restore_gate SET state='closed';RETURN jsonb_build_object('code','JOURNAL_GAP');
  END IF;
  SELECT data INTO records FROM extensions.dblink('core_security',
    'SELECT coalesce(jsonb_agg(q),''[]''::jsonb) FROM (SELECT i.* FROM journal.ledger i WHERE kind=''intent'' AND NOT EXISTS
      (SELECT 1 FROM journal.ledger r WHERE r.intent_id=i.intent_id AND r.kind<>''intent'') ORDER BY seq LIMIT 100) q') AS q(data jsonb);
  FOR entry IN SELECT * FROM jsonb_array_elements(records) LOOP
    BEGIN record_state:=pg_xact_status((entry->>'transaction_ref')::xid8);
    EXCEPTION WHEN OTHERS THEN record_state:=NULL; END;
    IF record_state='in progress' THEN CONTINUE; END IF;
    IF record_state IS NULL OR record_state='committed' AND NOT EXISTS(SELECT 1 FROM core.security_journal WHERE archive_seq=(entry->>'seq')::bigint) THEN
      UPDATE core.restore_gate SET state='closed';RETURN jsonb_build_object('code','JOURNAL_GAP');
    END IF;
    PERFORM core.archive_append((entry->>'intent_id')::uuid,CASE WHEN record_state='committed' THEN 'committed' ELSE 'aborted' END,
      entry->>'transaction_ref',(entry->>'target')::uuid,(entry->>'subject')::uuid,entry->>'action',(entry->>'policy_epoch')::bigint,entry->'payload');
    resolved:=resolved+1;
  END LOOP;
  head:=core.archive_head();
  UPDATE core.security_checkpoint SET seq=(head->>'seq')::bigint,hash_chain=head->>'hash_chain';
  RETURN jsonb_build_object('code','OK','resolved',resolved,'watermark',head->'seq');
END $$;
