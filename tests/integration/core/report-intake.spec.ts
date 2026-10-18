import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { account, session, sql } from '../../fixtures/core/runtime.ts';

test('report intake checks current target access, idempotency and own projection', () => {
  const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
  assert.ok(environment === 'dev' || environment === 'test');
  const operation = randomUUID();
  const secondOperation = randomUUID();
  const output = sql(`BEGIN;
    DO $check$ DECLARE
      actor uuid:='${account(1)}'; sess uuid:='${session(1)}'; env text:='${environment}';
      target uuid:='${account(2)}'; command uuid:='${operation}'; second uuid:='${secondOperation}';
      payload jsonb; first_result jsonb; result jsonb; report_id uuid;
      resource_ref uuid; revision_ref uuid; post_ref uuid; resource_kind text;
    BEGIN
      INSERT INTO core.account(id) VALUES (actor),(target) ON CONFLICT DO NOTHING;
      INSERT INTO core.session_registry(session_id,account_id) VALUES (sess,actor) ON CONFLICT DO NOTHING;
      IF NOT core.current_identity(actor,sess) THEN RAISE EXCEPTION 'Fixture identity unavailable'; END IF;
      payload:=jsonb_build_object('operation_id',command,'target_kind','account','target_id',target,
        'reason','Synthetic safety concern','evidence_refs','[]'::jsonb);
      first_result:=core.create_report_result(actor,sess,env,payload,repeat('a',64),24);
      IF first_result->>'code' IS DISTINCT FROM 'OK' OR first_result->'data'->>'state' IS DISTINCT FROM 'pending'
      THEN RAISE EXCEPTION 'Report rejected: %',first_result; END IF;
      report_id:=(first_result->'data'->>'id')::uuid;
      result:=core.create_report_result(actor,sess,env,payload,repeat('a',64),24);
      IF result->'data' IS DISTINCT FROM first_result->'data' THEN RAISE EXCEPTION 'Retry changed receipt'; END IF;
      result:=core.create_report_result(actor,sess,env,payload,repeat('b',64),24);
      IF result->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Changed payload accepted'; END IF;
      result:=core.create_report_result(actor,sess,env,payload || jsonb_build_object('operation_id',second),repeat('c',64),24);
      IF result->>'code' IS DISTINCT FROM 'CONFLICT' THEN RAISE EXCEPTION 'Open duplicate accepted'; END IF;
      result:=core.create_report_result(actor,sess,env,payload || jsonb_build_object('operation_id',second,
        'target_kind','message'),repeat('d',64),24);
      IF result->>'code' IS DISTINCT FROM 'NOT_FOUND' THEN RAISE EXCEPTION 'Unavailable message accepted'; END IF;
      result:=core.create_report_result(actor,sess,env,payload || jsonb_build_object('operation_id',second,
        'evidence_refs',jsonb_build_array(gen_random_uuid())),repeat('e',64),24);
      IF result->>'code' IS DISTINCT FROM 'NOT_FOUND' THEN RAISE EXCEPTION 'Unknown evidence accepted'; END IF;
      result:=core.list_own_reports_result(actor,sess,env,20,NULL,NULL);
      IF result->>'code' IS DISTINCT FROM 'OK' OR jsonb_array_length(result->'items')<>1 OR
        (result->'items'->0->>'id')::uuid<>report_id OR result->'items'->0 ? 'reason'
      THEN RAISE EXCEPTION 'Own projection incorrect: %',result; END IF;
      result:=core.account_operation_result(actor,sess,command,env,'aal1');
      IF result->'data'->'result' IS DISTINCT FROM first_result->'data'
      THEN RAISE EXCEPTION 'Original report not recoverable'; END IF;
      IF (SELECT count(*) FROM core.report r WHERE r.reporter=actor AND r.target_ref=target)<>1
      THEN RAISE EXCEPTION 'Duplicate report rows'; END IF;
      FOREACH resource_kind IN ARRAY ARRAY['post','comment'] LOOP
        resource_ref:=gen_random_uuid();revision_ref:=gen_random_uuid();
        INSERT INTO core.resource(id,author_id,kind,visibility,publication_state,root_post)
          VALUES(resource_ref,target,resource_kind,'public','published',CASE WHEN resource_kind='comment' THEN post_ref END);
        INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state,submitted_at)
          VALUES(revision_ref,resource_ref,1,'Synthetic reportable content',target,'approved',clock_timestamp());
        UPDATE core.resource SET current_revision_id=revision_ref WHERE id=resource_ref;
        IF resource_kind='post' THEN post_ref:=resource_ref;
        ELSE INSERT INTO core.resource_dependency(dependent,source,kind,purposes)
          VALUES(resource_ref,post_ref,'comment_post',ARRAY['read']); END IF;
        result:=core.create_report_result(actor,sess,env,
          jsonb_build_object('operation_id',gen_random_uuid(),'target_kind',resource_kind,'target_id',resource_ref,
            'reason','Synthetic content concern','evidence_refs','[]'::jsonb),repeat('f',64),25);
        IF result->>'code' IS DISTINCT FROM 'OK' THEN RAISE EXCEPTION 'Content report failed: %',result; END IF;
        result:=core.create_report_result(actor,sess,env,
          jsonb_build_object('operation_id',gen_random_uuid(),'target_kind',CASE WHEN resource_kind='post' THEN 'comment' ELSE 'post' END,
            'target_id',resource_ref,'reason','Wrong target kind','evidence_refs','[]'::jsonb),repeat('0',64),17);
        IF result->>'code' IS DISTINCT FROM 'NOT_FOUND' THEN RAISE EXCEPTION 'Mismatched resource kind accepted'; END IF;
      END LOOP;
    END $check$;
    SELECT 'verified'; ROLLBACK;`);
  assert.match(output, /verified/);
});
