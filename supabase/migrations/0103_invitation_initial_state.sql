CREATE OR REPLACE FUNCTION core.check_invitation_transition() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.state <> 'unused' OR NEW.used_account_id IS NOT NULL OR NEW.used_at IS NOT NULL OR NEW.revoke_reason IS NOT NULL THEN
      RAISE EXCEPTION 'Invitation starts unused' USING ERRCODE = '23514';
    END IF;
  ELSE
    IF ROW(NEW.id,NEW.token_hash,NEW.creator_id,NEW.expires_at)
      IS DISTINCT FROM ROW(OLD.id,OLD.token_hash,OLD.creator_id,OLD.expires_at) THEN
      RAISE EXCEPTION 'Invitation binding is immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.state <> 'unused' AND ROW(NEW.state,NEW.used_account_id,NEW.used_at,NEW.revoke_reason)
      IS DISTINCT FROM ROW(OLD.state,OLD.used_account_id,OLD.used_at,OLD.revoke_reason) THEN
      RAISE EXCEPTION 'Invitation terminal state is immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD.state = 'used' THEN RETURN NEW; END IF;
  END IF;
  IF NEW.state = 'used' AND (NEW.expires_at <= clock_timestamp() OR NEW.used_at > clock_timestamp()) THEN
    RAISE EXCEPTION 'Invitation is not currently usable' USING ERRCODE = '23514';
  END IF;
  IF NEW.state = 'expired' AND NEW.expires_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Invitation expiry is authoritative' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
