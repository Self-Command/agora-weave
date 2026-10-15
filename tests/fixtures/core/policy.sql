INSERT INTO core.account(id)
SELECT id FROM auth.users WHERE id::text LIKE '10000000-0000-4000-8000-%'
ON CONFLICT (id) DO NOTHING;
INSERT INTO core.session_registry(session_id,account_id,device_label)
SELECT id,user_id,'Isolated synthetic device' FROM auth.sessions WHERE id::text LIKE '20000000-0000-4000-8000-%'
ON CONFLICT (session_id) DO NOTHING;
INSERT INTO core.resource(id,author_id,kind,visibility,publication_state) VALUES
 ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','post','public','published'),
 ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','post','followers','published'),
 ('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','post','self','published'),
 ('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000002','quote','public','published')
ON CONFLICT (id) DO NOTHING;
INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state) VALUES
 ('40000000-0000-4000-8000-000000000101','40000000-0000-4000-8000-000000000001',1,'Synthetic public body','10000000-0000-4000-8000-000000000001','approved'),
 ('40000000-0000-4000-8000-000000000102','40000000-0000-4000-8000-000000000002',1,'Synthetic restricted body','10000000-0000-4000-8000-000000000001','approved'),
 ('40000000-0000-4000-8000-000000000103','40000000-0000-4000-8000-000000000003',1,'Synthetic private body','10000000-0000-4000-8000-000000000001','approved'),
 ('40000000-0000-4000-8000-000000000104','40000000-0000-4000-8000-000000000004',1,'Synthetic dependent body','10000000-0000-4000-8000-000000000002','approved')
ON CONFLICT (id) DO NOTHING;
UPDATE core.resource SET current_revision_id = ('40000000-0000-4000-8000-' || lpad((100 + right(id::text, 12)::integer)::text,12,'0'))::uuid
WHERE id::text LIKE '40000000-0000-4000-8000-%';
INSERT INTO core.follow(follower_id,followed_id,state)
VALUES ('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','effective');
INSERT INTO core.resource_dependency(dependent,source,kind,purposes)
VALUES ('40000000-0000-4000-8000-000000000004','40000000-0000-4000-8000-000000000002','quote',ARRAY['read']);
INSERT INTO core.user_preferences(account_id) VALUES ('10000000-0000-4000-8000-000000000001');
INSERT INTO core.admin_grant(account_id,role,operation_scopes,resource_scope,environment)
VALUES ('10000000-0000-4000-8000-000000000004','super_admin',ARRAY['*'],NULL,'test');
