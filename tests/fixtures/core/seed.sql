-- Controlled synthetic Auth subjects, exclusively inside the isolated Actions database.
INSERT INTO auth.users(id,instance_id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,
  confirmation_token,recovery_token,email_change_token_current,email_change_token_new,email_change,phone_change_token,phone_change,reauthentication_token)
SELECT ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,'authenticated','authenticated',
  'core-fixture-' || n || '@example.invalid',clock_timestamp(),'{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,clock_timestamp(),clock_timestamp(),'','','','','','','',''
FROM generate_series(1,9) n ON CONFLICT(id) DO NOTHING;
INSERT INTO auth.sessions(id,user_id,created_at,updated_at,aal)
SELECT ('20000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,
  ('10000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid,clock_timestamp(),clock_timestamp(),'aal1'
FROM generate_series(1,9) n ON CONFLICT(id) DO NOTHING;
