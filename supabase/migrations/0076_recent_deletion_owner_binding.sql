-- The joined deletion table also has actor; qualify the resource owner comparison.
DO $$
DECLARE definition text;
BEGIN
 definition:=pg_get_functiondef('core.list_recently_deleted_result(uuid,uuid,text,integer,timestamp with time zone,uuid)'::regprocedure);
 IF strpos(definition,'r.author_id=actor')=0 THEN RAISE EXCEPTION 'Recent deletion owner source drift'; END IF;
 EXECUTE replace(definition,'r.author_id=actor','r.author_id=list_recently_deleted_result.actor');
END $$;
