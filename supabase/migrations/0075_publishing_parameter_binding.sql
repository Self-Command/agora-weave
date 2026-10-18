-- Qualify parameters when a joined table has a column with the same name.
-- 0069 is already applied and remains immutable.
DO $$
DECLARE signature text;definition text;label text;
BEGIN
 FOREACH signature IN ARRAY ARRAY[
  'core.patch_content_result(uuid,uuid,text,uuid,text,jsonb,text,integer,integer,text)',
  'core.patch_visibility_result(uuid,uuid,text,uuid,jsonb,text)',
  'core.patch_reply_policy_result(uuid,uuid,text,uuid,jsonb,text)',
  'core.delete_resource_result(uuid,uuid,text,uuid,text,jsonb,text)'] LOOP
  definition:=pg_get_functiondef(to_regprocedure(signature));
  label:=split_part(split_part(signature,'.',2),'(',1);
  IF strpos(definition,'s.target=target')=0 THEN RAISE EXCEPTION 'Publishing source drift: %',signature; END IF;
  definition:=replace(definition,'s.target=target','s.target='||label||'.target');
  definition:=replace(definition,'d.target=target','d.target='||label||'.target');
  EXECUTE definition;
 END LOOP;
 definition:=pg_get_functiondef('core.list_recently_deleted_result(uuid,uuid,text,integer,timestamp with time zone,uuid)'::regprocedure);
 IF strpos(definition,'d.actor=actor')=0 THEN RAISE EXCEPTION 'Recent deletion source drift'; END IF;
 EXECUTE replace(definition,'d.actor=actor','d.actor=list_recently_deleted_result.actor');
END $$;
