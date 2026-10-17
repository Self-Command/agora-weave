-- A target's current read qualification includes every transitive source.
CREATE OR REPLACE FUNCTION core.resource_action_result(actor uuid,session_ref uuid,target uuid,action_name text,purpose text)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE result jsonb;
BEGIN
  IF action_name NOT IN ('resource.read','media.read','event.read') OR purpose<>'read' THEN
    RETURN jsonb_build_object('code','FORBIDDEN');
  END IF;
  IF EXISTS (
    WITH RECURSIVE closure(id) AS (
      SELECT target UNION SELECT d.source FROM core.resource_dependency d JOIN closure c ON d.dependent=c.id
    )
    SELECT 1 FROM core.sanction s WHERE s.state='active' AND s.starts_at<=clock_timestamp()
      AND (s.ends_at IS NULL OR s.ends_at>clock_timestamp())
      AND (s.subject=actor OR s.target IN (SELECT id FROM closure))
      AND ('read'=ANY(s.functions) OR action_name=ANY(s.functions))
  ) THEN RETURN jsonb_build_object('code','NOT_FOUND'); END IF;
  result:=core.read_resource_result(actor,session_ref,target);
  RETURN result;
END $$;
