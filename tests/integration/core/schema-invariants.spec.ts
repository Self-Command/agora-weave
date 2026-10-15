import assert from 'node:assert/strict';
import { test } from 'node:test';
import { account, session, rows, sql } from '../../fixtures/core/runtime.ts';

const id = (number: number) => `30000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
function present(...tables: string[]) {
  for (const table of tables) assert.ok(sql(`SELECT to_regclass('core.${table}');`).trim(), `The ${table} authority must exist before checking its live invariants`);
}
const reject = (statement: string, condition = 'check_violation') => `DO $probe$ BEGIN BEGIN ${statement};
  RAISE EXCEPTION 'A required invariant was not enforced'; EXCEPTION WHEN ${condition} THEN NULL; END; END $probe$;`;
const accounts = `INSERT INTO core.account(id) VALUES ('${account(1)}'),('${account(2)}');`;
function transaction(statement: string) { assert.doesNotThrow(() => sql(`BEGIN; ${statement} ROLLBACK;`), 'The live database must enforce every registered invariant'); }

test('DB01: identity enforces Auth references, session ownership, account states and server-managed monotonic row versions', () => {
  present('account', 'session_registry');
  transaction(`${accounts}
    ${reject(`INSERT INTO core.account(id) VALUES ('${id(99)}')`, 'foreign_key_violation')}
    ${reject(`UPDATE core.account SET status='administrator' WHERE id='${account(1)}'`)}
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(1)}','${account(1)}');
    ${reject(`INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(2)}','${account(1)}')`)}
    UPDATE core.account SET status='cancelled' WHERE id='${account(1)}';
    DO $probe$ BEGIN IF (SELECT row_version FROM core.account WHERE id='${account(1)}') <> 2 THEN RAISE EXCEPTION 'CAS version did not advance'; END IF; END $probe$;
  `);
});

test('DB02: relationship pairs reject self and duplicate facts while account media preferences retain legal defaults', () => {
  present('account', 'follow', 'block', 'user_preferences', 'mute_rule');
  transaction(`${accounts}
    INSERT INTO core.follow(follower_id,followed_id,state) VALUES ('${account(1)}','${account(2)}','effective');
    ${reject(`INSERT INTO core.follow(follower_id,followed_id,state) VALUES ('${account(1)}','${account(2)}','effective')`, 'unique_violation')}
    ${reject(`INSERT INTO core.follow(follower_id,followed_id,state) VALUES ('${account(1)}','${account(1)}','effective')`)}
    ${reject(`INSERT INTO core.block(blocker_id,blocked_id) VALUES ('${account(1)}','${account(1)}')`)}
    INSERT INTO core.user_preferences(account_id) VALUES ('${account(1)}');
    ${reject(`UPDATE core.user_preferences SET video_policy='cellular' WHERE account_id='${account(1)}'`)}
    DO $probe$ BEGIN IF (SELECT video_policy FROM core.user_preferences WHERE account_id='${account(1)}') <> 'wifi_only' THEN RAISE EXCEPTION 'Initial playback policy changed'; END IF; END $probe$;
  `);
  assert.equal(rows("SELECT column_name FROM information_schema.columns WHERE table_schema='core' AND table_name='user_preferences' AND column_name='local_theme'").length, 0,
    'Local theme is not an account synchronization field');
});

test('DB03: operation identities and consumer effects are unique and their persistent states are closed', () => {
  present('account', 'operation', 'outbox', 'inbox');
  transaction(`${accounts}
    INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state)
      VALUES ('${account(1)}','${session(1)}','test','fixture.write','${id(1)}','${'a'.repeat(64)}','unknown');
    ${reject(`INSERT INTO core.operation(actor,session_id,environment,action,operation_id,payload_hash,state) VALUES ('${account(1)}','${session(1)}','test','fixture.write','${id(1)}','${'b'.repeat(64)}','pending')`, 'unique_violation')}
    ${reject(`UPDATE core.operation SET state='delivered' WHERE operation_id='${id(1)}'`)}
    INSERT INTO core.outbox(event_id,aggregate_id,aggregate_version,owner_plugin,lifecycle_epoch,effect_key)
      VALUES ('${id(2)}','${id(3)}',1,'core',1,'fixture:one');
    INSERT INTO core.inbox(consumer,effect_key,event_id) VALUES ('fixture.consumer','fixture:one','${id(2)}');
    ${reject(`INSERT INTO core.inbox(consumer,effect_key,event_id) VALUES ('fixture.consumer','fixture:one','${id(2)}')`, 'unique_violation')}
  `);
});

test('DB04: resources bind their own revisions and dependencies cannot create self or cyclic authority', () => {
  present('account', 'resource', 'content_revision', 'resource_dependency');
  transaction(`${accounts}
    INSERT INTO core.resource(id,author_id,kind,visibility) VALUES ('${id(10)}','${account(1)}','post','self'),('${id(11)}','${account(2)}','post','public');
    INSERT INTO core.content_revision(id,resource_id,revision_no,body,author) VALUES ('${id(12)}','${id(10)}',1,'Synthetic fixture','${account(1)}');
    UPDATE core.resource SET current_revision_id='${id(12)}' WHERE id='${id(10)}';
    ${reject(`UPDATE core.resource SET current_revision_id='${id(12)}' WHERE id='${id(11)}'`, 'foreign_key_violation')}
    INSERT INTO core.resource_dependency(dependent,source,kind,purposes) VALUES ('${id(10)}','${id(11)}','quote',ARRAY['read']);
    ${reject(`INSERT INTO core.resource_dependency(dependent,source,kind,purposes) VALUES ('${id(11)}','${id(10)}','quote',ARRAY['read'])`)}
    ${reject(`INSERT INTO core.resource_dependency(dependent,source,kind,purposes) VALUES ('${id(10)}','${id(10)}','quote',ARRAY['read'])`)}
  `);
});

test('DB05: retention and deletion clocks remain ordered and durable audit facts cannot be overwritten', () => {
  present('account', 'deletion', 'retention_record', 'audit_event');
  transaction(`${accounts}
    ${reject(`INSERT INTO core.retention_record(target,class,owner_plugin,trigger_at,due_at,rule_version,purge_state) VALUES ('${id(20)}','active_delete','core',clock_timestamp(),clock_timestamp()-interval '1 day','fixture-v1','pending')`)}
    ${reject(`INSERT INTO core.deletion(target,actor,kind,deleted_at,undo_until,restore_until,state) VALUES ('${id(20)}','${account(1)}','user',clock_timestamp(),clock_timestamp()+interval '20 days',clock_timestamp()+interval '10 days','deleted')`)}
    INSERT INTO core.audit_event(id,actor,session_id,operation,object_ref,environment,plugin,reason,result,request_id)
      VALUES ('${id(21)}','${account(1)}','${session(1)}','fixture.write','${id(20)}','test','core','synthetic','succeeded','${id(22)}');
    ${reject(`UPDATE core.audit_event SET result='failed' WHERE id='${id(21)}'`)}
    ${reject(`DELETE FROM core.audit_event WHERE id='${id(21)}'`)}
  `);
});

test('DB06: registered configuration keys are globally unique and an immutable bundle cannot be replaced in place', () => {
  present('config_definition', 'config_bundle', 'config_activation');
  transaction(`
    INSERT INTO core.config_definition(key,owner,schema,default_value,range,scopes,priority,permissions,dependencies,effect_mode,existing_policy,evidence_refs)
      VALUES ('fixture.page','core','{"type":"integer"}',20,'{"minimum":1,"maximum":50}',ARRAY['global'],0,ARRAY['config.read'],ARRAY[]::text[],'immediate','new_operations',ARRAY['synthetic']);
    ${reject(`INSERT INTO core.config_definition(key,owner,schema,default_value,range,scopes,priority,permissions,dependencies,effect_mode,existing_policy,evidence_refs) SELECT key,'other',schema,default_value,range,scopes,priority,permissions,dependencies,effect_mode,existing_policy,evidence_refs FROM core.config_definition WHERE key='fixture.page'`, 'unique_violation')}
    INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,preview_digest)
      VALUES ('fixture-v1','{"global":{"fixture.page":20}}',1,'{}','draft','${'c'.repeat(64)}');
    ${reject(`UPDATE core.config_bundle SET scoped_values='{"global":{"fixture.page":50}}' WHERE version='fixture-v1'`)}
  `);
});

test('DB07: ready document bodies and release bindings are immutable while lawful publication states remain mutable', () => {
  present('managed_document', 'document_revision', 'document_release', 'document_receipt');
  transaction(`${accounts}
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces) VALUES ('${id(30)}','fixture.terms','terms','zh-CN','${account(1)}',ARRAY['app']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES ('${id(31)}','${id(30)}',1,'Synthetic terms','Only an isolated fixture','${'d'.repeat(64)}','ready','${account(1)}');
    ${reject(`UPDATE core.document_revision SET body='Replaced' WHERE id='${id(31)}'`)}
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher)
      VALUES ('${id(32)}','${id(30)}','${id(31)}','${'d'.repeat(64)}','{"environment":"test","surfaces":["app"],"purposes":["register"]}','prepared','${account(1)}');
    ${reject(`UPDATE core.document_release SET content_digest='${'e'.repeat(64)}' WHERE id='${id(32)}'`)}
    UPDATE core.document_release SET state='published',published_at=clock_timestamp() WHERE id='${id(32)}';
    UPDATE core.document_release SET state='withdrawn' WHERE id='${id(32)}';
  `);
});
