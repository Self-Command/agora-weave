-- Unknown historical transaction status is never treated as an aborted restriction.
CREATE OR REPLACE FUNCTION core.reconcile_security_journal() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE entry jsonb;record_state text;head jsonb;records jsonb;resolved integer:=0;
BEGIN
  PERFORM pg_advisory_xact_lock(17013,1);
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

-- Inserting a new deny fact must be durable just like tightening an existing fact.
CREATE TRIGGER durable_restriction_insert BEFORE INSERT ON core.block FOR EACH ROW EXECUTE FUNCTION core.archive_policy_restriction();
CREATE TRIGGER durable_restriction_insert BEFORE INSERT ON core.sanction FOR EACH ROW EXECUTE FUNCTION core.archive_policy_restriction();
CREATE TRIGGER durable_restriction_insert BEFORE INSERT ON core.resource_dependency FOR EACH ROW EXECUTE FUNCTION core.archive_policy_restriction();

CREATE FUNCTION core.block_relationships() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.active AND NEW.revoked_at IS NULL THEN
    UPDATE core.follow SET state='removed' WHERE state='effective' AND
      ((follower_id=NEW.blocker_id AND followed_id=NEW.blocked_id) OR (follower_id=NEW.blocked_id AND followed_id=NEW.blocker_id));
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER block_relationships AFTER INSERT OR UPDATE ON core.block FOR EACH ROW EXECUTE FUNCTION core.block_relationships();
CREATE FUNCTION core.follow_not_blocked() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF NEW.state='effective' AND EXISTS(SELECT 1 FROM core.block WHERE active AND revoked_at IS NULL AND
    ((blocker_id=NEW.follower_id AND blocked_id=NEW.followed_id) OR (blocker_id=NEW.followed_id AND blocked_id=NEW.follower_id))) THEN
    RAISE EXCEPTION 'Blocked relationship cannot become effective' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER follow_not_blocked BEFORE INSERT OR UPDATE ON core.follow FOR EACH ROW EXECUTE FUNCTION core.follow_not_blocked();
CREATE FUNCTION core.consumed_stepup_immutable() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$
BEGIN
  IF OLD.consumed_at IS NOT NULL OR ROW(NEW.account_id,NEW.session_id,NEW.action_digest,NEW.aal,NEW.verified_at,NEW.expires_at)
    IS DISTINCT FROM ROW(OLD.account_id,OLD.session_id,OLD.action_digest,OLD.aal,OLD.verified_at,OLD.expires_at) THEN
    RAISE EXCEPTION 'Step-up binding and consumed state are immutable' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER stepup_immutable BEFORE UPDATE ON core.stepup_challenge FOR EACH ROW EXECUTE FUNCTION core.consumed_stepup_immutable();
