-- Register the remaining RD-10 defaults; publication still requires a complete new bundle.
WITH registered(key,value,description) AS (VALUES
  ('auth.api_timeout_seconds',10,'Ordinary API request protection.'),
  ('content.link_fetch_timeout_seconds',5,'Fetch protection; DNS and address checks apply at each redirect.'),
  ('content.link_fetch_body_bytes',2097152,'Maximum fetched link body in binary bytes.'),
  ('content.link_fetch_redirect_limit',3,'Maximum redirects; external fetch is unavailable to AI tools.')
), entries AS (SELECT *,split_part(key,'.',1) AS owner,
  '{"type":"integer","minimum":1,"maximum":9007199254740991}'::jsonb AS schema FROM registered)
INSERT INTO core.config_definition(key,owner,schema,default_value,range,scopes,priority,permissions,dependencies,
  effect_mode,existing_policy,evidence_refs,description,status,conflicts,read_permission,write_permission,sensitive,consumer_ids)
SELECT key,owner,schema,to_jsonb(value),schema,ARRAY['global','environment','module','plugin','user_group'],0,
  ARRAY['config.read',owner||'.config.write'],ARRAY[]::text[],'immediate','new_operations',ARRAY['research.RD-10'],
  description,'engineering',ARRAY[]::text[],'config.read',owner||'.config.write',false,
  ARRAY['api','mobile','admin','sql','media','worker','ai','mcp','plugins'] FROM entries ON CONFLICT(key) DO NOTHING;
