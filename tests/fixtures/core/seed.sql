-- Controlled synthetic Auth subjects, exclusively inside the isolated development/test database.
DO $$ BEGIN
  IF coalesce(current_setting('agoraweave.fixture_environment',true),'') NOT IN ('dev','test') THEN
    RAISE EXCEPTION 'Synthetic fixtures require an explicit nonproduction environment';
  END IF;
END $$;
INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
  confirmation_token,recovery_token,email_change_token_current,email_change_token_new,email_change,phone_change_token,phone_change,reauthentication_token)
SELECT ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
  'core-fixture-' || n || '@example.invalid',clock_timestamp(),'{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,clock_timestamp(),clock_timestamp(),'','','','','','','',''
FROM (SELECT generate_series(1,11) AS n UNION ALL SELECT generate_series(21,25)) subjects ON CONFLICT(id) DO NOTHING;
INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
SELECT ('20000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,clock_timestamp(),clock_timestamp(),'aal1'
FROM (SELECT generate_series(1,11) AS n UNION ALL SELECT generate_series(21,25)) subjects ON CONFLICT(id) DO NOTHING;
INSERT INTO core.account(id)
SELECT ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid FROM generate_series(21,25) n ON CONFLICT(id) DO NOTHING;
INSERT INTO core.session_registry(session_id,account_id,device_label)
SELECT ('20000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
  ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,'Isolated role fixture'
FROM generate_series(21,25) n ON CONFLICT(session_id) DO NOTHING;
INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment)
SELECT ('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,role,ARRAY[action],
  current_setting('agoraweave.fixture_environment')
FROM (VALUES (21,'super_admin','admin.manage'),(22,'content_moderator','content.review'),
  (23,'community_operator','community.operate'),(24,'ai_operator','ai.configure'),(25,'auditor','audit.read')) subjects(n,role,action)
WHERE NOT EXISTS (SELECT 1 FROM core.admin_grant g WHERE g.account_id=('10000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid
  AND g.role=subjects.role AND g.environment=current_setting('agoraweave.fixture_environment'));

-- Real, complete nonproduction configuration is required by every successful HTTP envelope.
DO $$
DECLARE fixture_environment text:=current_setting('agoraweave.fixture_environment'); values jsonb; layers jsonb; compat jsonb; fixture_version text;
BEGIN
  SELECT coalesce(jsonb_object_agg(key,default_value ORDER BY key),'{}'::jsonb) INTO values FROM core.config_definition;
  layers:=jsonb_build_array(jsonb_build_object('scope','global','values',values));
  SELECT jsonb_object_agg(consumer,jsonb_build_array('0.0.0','fixture-v1','synthetic-account-v1')) INTO compat
    FROM unnest(ARRAY['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins']) consumer;
  fixture_version:='isolated-foundation-' || fixture_environment || '-' || encode(sha256(convert_to(jsonb_build_array(layers,compat)::text,'UTF8')),'hex');
  INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
    VALUES(fixture_version,layers,1,compat,'active',clock_timestamp(),repeat('f',64),ARRAY['api','mobile','admin','share','sql','media','worker','ai','mcp','plugins'])
    ON CONFLICT(version) DO NOTHING;
  INSERT INTO core.config_activation(environment,active_ptr) VALUES(fixture_environment,fixture_version)
    ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;
END $$;
