import assert from 'node:assert/strict';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import test from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

test('ordinary session cannot list, preview or decide a pending revision', () => {
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(environment === 'dev' || environment === 'test');
  const postOperation = randomUUID(), reviewOperation = randomUUID();
  const output = sql(`BEGIN;
    DO $check$ DECLARE
      actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${environment}';
      post_result jsonb; result jsonb; resource_ref uuid; revision_ref uuid;
    BEGIN
      INSERT INTO core.account(id) VALUES (actor) ON CONFLICT DO NOTHING;
      INSERT INTO core.session_registry(session_id,account_id) VALUES (sess,actor) ON CONFLICT DO NOTHING;
      post_result:=core.create_text_post_result(actor,sess,env,
        jsonb_build_object('operation_id','${postOperation}'::uuid,'type','text','body','review test',
          'tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs','[]'::jsonb,'visibility','public',
          'reply_scope','all_readers','indexing_mode','inherit'),repeat('a',64),11,2000,
        core.response_config_version(env));
      IF post_result->>'code' IS DISTINCT FROM 'OK' THEN RAISE EXCEPTION 'Post setup failed: %',post_result; END IF;
      resource_ref:=(post_result->'data'->>'resource_id')::uuid;
      revision_ref:=(post_result->'data'->>'revision_id')::uuid;
      result:=core.admin_review_page_result(actor,sess,env,'aal1',20,NULL);
      IF result->>'code'='OK' THEN RAISE EXCEPTION 'Ordinary session listed review queue'; END IF;
      result:=core.admin_review_preview_result(actor,sess,env,'aal1',revision_ref,'${reviewOperation}'::uuid,
        'approve','Synthetic review');
      IF result->>'code'='OK' THEN RAISE EXCEPTION 'Ordinary session created review preview'; END IF;
      result:=core.admin_review_decision_result(actor,sess,env,'aal1',revision_ref,'${reviewOperation}'::uuid,
        'approve','Synthetic review',1,gen_random_uuid(),repeat('a',64),gen_random_uuid());
      IF result->>'code'='OK' THEN RAISE EXCEPTION 'Ordinary session decided revision'; END IF;
      IF (SELECT v.review_state FROM core.content_revision v WHERE v.id=revision_ref)<>'pending'
        OR (SELECT r.publication_state FROM core.resource r WHERE r.id=resource_ref)<>'pending'
        OR core.resource_action_result(NULL,NULL,resource_ref,'resource.read','read')->>'code'<>'NOT_FOUND'
        THEN RAISE EXCEPTION 'Denied moderation changed public eligibility'; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(output, /verified/);
});

test('authorized moderator preview, fresh TOTP proof and decision share one current revision and durable receipt', () => {
  const env = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(env === 'dev' || env === 'test');
  const actor = randomUUID(), publisher = randomUUID(), sessionRef = randomUUID(), factor = randomUUID();
  const document = randomUUID(), revisionDoc = randomUUID(), release = randomUUID(), invitation = randomUUID();
  const postOperation = randomUUID(), reviewOperation = randomUUID(), challenge = randomUUID();
  const phone = `1555${String(randomInt(0, 10000000)).padStart(7, '0')}`;
  const body = 'SYNTHETIC MODERATION TERMS', digest = createHash('sha256').update(body).digest('hex');
  const invitationHash = createHash('sha256').update(randomUUID()).digest('hex');
  const output = sql(`BEGIN;
    INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,created_at,updated_at) VALUES
      ('${publisher}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${publisher}@example.invalid',NULL,NULL,clock_timestamp(),clock_timestamp()),
      ('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid','${phone}',clock_timestamp(),clock_timestamp(),clock_timestamp());
    INSERT INTO core.account(id) VALUES ('${publisher}');
    INSERT INTO auth.mfa_factors(id,user_id,factor_type,status,friendly_name,secret,created_at,updated_at)
      VALUES ('${factor}','${actor}','totp','verified','Synthetic TOTP','SYNTHETIC-SECRET-NOT-REAL',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.sessions(id,user_id,aal,factor_id,created_at,updated_at)
      VALUES ('${sessionRef}','${actor}','aal2','${factor}',clock_timestamp(),clock_timestamp());
    INSERT INTO auth.mfa_amr_claims(id,session_id,authentication_method,created_at,updated_at)
      SELECT gen_random_uuid(),'${sessionRef}',method,clock_timestamp(),clock_timestamp() FROM unnest(ARRAY['otp','totp']) method;
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
      VALUES ('${document}','synthetic.moderation.${document}','terms','zh-CN','${publisher}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${revisionDoc}','${document}',1,'Synthetic moderation terms','${body}','${digest}','ready','${publisher}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES ('${release}','${document}','${revisionDoc}','${digest}',
        '{"environment":"${env}","surfaces":["app"],"purposes":["register"]}','published','${publisher}',clock_timestamp());
    UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
    INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
      VALUES ('${invitation}','${invitationHash}','${publisher}',clock_timestamp()+interval '1 hour');
    CREATE TEMP TABLE review_documents ON COMMIT DROP AS SELECT core.registration_documents_result('${env}') AS result;
    CREATE TEMP TABLE review_admission ON COMMIT DROP AS SELECT core.complete_registration_result('${actor}','${sessionRef}',
      '${invitationHash}','adult-18-v1',true,(SELECT result->>'document_set_digest' FROM review_documents),
      (SELECT jsonb_agg(jsonb_build_object('release_id',d->'release_id','digest',d->'digest','decision','consented'))
        FROM review_documents,jsonb_array_elements(result->'documents') d),gen_random_uuid(),gen_random_uuid(),
      'Synthetic review device','${env}') AS result;
    SELECT result->>'code' FROM review_admission;
    INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment)
      VALUES ('${actor}','content_moderator',ARRAY['moderation.contents.read','moderation.revisions.decide','moderation.cases.read'],'${env}');
    CREATE TEMP TABLE review_post ON COMMIT DROP AS SELECT core.create_text_post_result('${actor}','${sessionRef}','${env}',
      jsonb_build_object('operation_id','${postOperation}'::uuid,'type','text','body','Synthetic review post',
        'tags','[]'::jsonb,'mentions','[]'::jsonb,'media_refs','[]'::jsonb,'visibility','public',
        'reply_scope','all_readers','indexing_mode','inherit'),repeat('a',64),11,2000,
      core.response_config_version('${env}')) AS result;
    SELECT result->>'code' FROM review_post;
    CREATE TEMP TABLE review_preview ON COMMIT DROP AS SELECT core.admin_review_preview_result('${actor}','${sessionRef}',
      '${env}','aal2',(SELECT (result->'data'->>'revision_id')::uuid FROM review_post),'${reviewOperation}',
      'approve','Synthetic evidence supports approval') AS result;
    SELECT result->>'code' FROM review_preview;
    INSERT INTO auth.mfa_challenges(id,factor_id,created_at,verified_at,ip_address)
      VALUES ('${challenge}','${factor}',clock_timestamp(),clock_timestamp(),'192.0.2.81');
    UPDATE auth.mfa_amr_claims SET updated_at=clock_timestamp() WHERE session_id='${sessionRef}' AND authentication_method='totp';
    CREATE TEMP TABLE review_stepup ON COMMIT DROP AS SELECT core.admin_stepup_result('${actor}','${sessionRef}','${env}',
      'aal2','${factor}','${challenge}',(SELECT result->'data'->>'action_digest' FROM review_preview)) AS result;
    SELECT result->>'code' FROM review_stepup;
    DO $check$ DECLARE result jsonb; preview_data jsonb; post_data jsonb; stepup_data jsonb;
      version bigint; revision_ref uuid; resource_ref uuid;
    BEGIN
      preview_data:=(SELECT p.result->'data' FROM review_preview p);
      post_data:=(SELECT p.result->'data' FROM review_post p);
      stepup_data:=(SELECT p.result->'data' FROM review_stepup p);
      version:=(preview_data->>'base_version')::bigint;
      revision_ref:=(post_data->>'revision_id')::uuid;
      resource_ref:=(post_data->>'resource_id')::uuid;
      result:=core.admin_review_decision_result('${actor}','${sessionRef}','${env}','aal2',revision_ref,
        '${reviewOperation}','approve','Synthetic evidence supports approval',version+1,
        (preview_data->>'preview_id')::uuid,preview_data->>'preview_digest',(stepup_data->>'stepup_id')::uuid);
      IF result->>'code'<>'CONFLICT' OR EXISTS (SELECT 1 FROM core.stepup_challenge
        WHERE id=(stepup_data->>'stepup_id')::uuid AND consumed_at IS NOT NULL) THEN
        RAISE EXCEPTION 'Stale CAS changed or consumed proof: %',result; END IF;
      result:=core.admin_review_decision_result('${actor}','${sessionRef}','${env}','aal2',revision_ref,
        '${reviewOperation}','approve','Synthetic evidence supports approval',version,
        (preview_data->>'preview_id')::uuid,preview_data->>'preview_digest',(stepup_data->>'stepup_id')::uuid);
      IF result->>'code'<>'OK' THEN RAISE EXCEPTION 'Valid review failed: %',result; END IF;
      IF (SELECT review_state FROM core.content_revision WHERE id=revision_ref)<>'approved'
        OR (SELECT publication_state FROM core.resource WHERE id=resource_ref)<>'published'
        OR NOT EXISTS (SELECT 1 FROM core.stepup_challenge WHERE id=(stepup_data->>'stepup_id')::uuid AND consumed_at IS NOT NULL)
        THEN RAISE EXCEPTION 'Review commit incomplete'; END IF;
      IF core.admin_review_decision_result('${actor}','${sessionRef}','${env}','aal2',revision_ref,
        '${reviewOperation}','approve','Synthetic evidence supports approval',version,
        (preview_data->>'preview_id')::uuid,preview_data->>'preview_digest',(stepup_data->>'stepup_id')::uuid)->'data'
        IS DISTINCT FROM result->'data' THEN RAISE EXCEPTION 'Retry changed receipt'; END IF;
      result:=core.account_operation_result('${actor}','${sessionRef}','${reviewOperation}','${env}','aal2');
      IF result->>'code'<>'OK' OR result->'data'->>'action'<>'moderation.revisions.decide'
        OR result->'data'->'result'->>'revision_id'<>revision_ref::text
        THEN RAISE EXCEPTION 'Original operation lookup failed: %',result; END IF;
    END $check$;
    SELECT 'verified'; ROLLBACK;`).trim().split(/\r?\n/);
  assert.deepEqual(output.slice(0, 4), ['OK', 'OK', 'OK', 'OK']);
  assert.equal(output[4], 'verified');
});
