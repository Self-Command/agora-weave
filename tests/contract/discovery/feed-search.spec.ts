import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after,before,test } from 'node:test';
import { account,session,sql,rows,request,token } from '../../fixtures/core/runtime.ts';
import { validatePage } from '../../../packages/contracts/src/http.ts';

const release = 'synthetic-account-v1';
const environment = process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT;
const headers = { 'X-Client-Release':release };
const ids:string[] = Array.from({ length:28 },()=>randomUUID());
const revisions = ids.map(()=>randomUUID());
const publicIds = ids.slice(0,21).sort().reverse();
const fixtureSet = ids.map(id=>`'${id}'`).join(',');
const get = (query='',user?: number,extra: Record<string,string>={})=>request('/feeds/latest'+query,
  { token:user ? token(user) : undefined,headers:{ ...headers,...extra } });
type Page = { items: { id:string; body:string; created_at:string; visibility:string }[]; next_cursor:string|null; has_more:boolean };
const page = (response:ReturnType<typeof request>)=>{
  assert.equal(response.status,200,response.body);
  assert.equal(validatePage(response.data.data),true);
  return response.data.data as Page;
};
const unavailable = (response:ReturnType<typeof request>,status:number)=>{
  assert.equal(response.status,status,response.body);
  assert.doesNotMatch(response.body,/Discovery excluded|secret_ref|object_internal_key|token_hash/);
};
let previousConfig:string|undefined;
let alternateConfig = '';

before(()=>{
  assert.ok(['dev','test'].includes(environment || ''));
  assert.equal(sql('SELECT 1;').trim(),'1');
  assert.equal(request('/user',{ auth:true,token:token() }).status,200);
  previousConfig = rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr as string|undefined;
  assert.ok(previousConfig,'A real active configuration is required');
  alternateConfig = 'synthetic-feed-'+randomUUID();
  sql(`INSERT INTO core.account(id) VALUES ('${account(1)}'),('${account(2)}') ON CONFLICT DO NOTHING;
    INSERT INTO core.session_registry(session_id,account_id) VALUES ('${session(1)}','${account(1)}'),('${session(2)}','${account(2)}')
      ON CONFLICT (session_id) DO NOTHING;
    INSERT INTO core.config_bundle(version,scoped_values,schema_version,compat,state,effective_at,preview_digest,consumers_ready)
      SELECT '${alternateConfig}',scoped_values,schema_version,compat,'active',clock_timestamp(),preview_digest,consumers_ready
      FROM core.config_bundle WHERE version='${previousConfig}';`);
  for (let index=0;index<ids.length;index++) {
    const visibility = index===21 ? 'followers' : index===22 ? 'self' : 'public';
    const kind = index===27 ? 'comment' : 'post';
    sql(`INSERT INTO core.resource(id,author_id,kind,visibility,publication_state,created_at)
      VALUES ('${ids[index]}','${account(1)}','${kind}','${visibility}','${index===24 ? 'draft' : 'published'}',
        '${index<21 ? '2099-01-01T00:00:00.123456Z' : '2100-01-01T00:00:00Z'}');
      INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state)
      VALUES ('${revisions[index]}','${ids[index]}',1,'${index<21 ? 'Discovery public' : 'Discovery excluded'} ${index}',
        '${account(1)}','${index===23 ? 'pending' : 'approved'}');
      UPDATE core.resource SET current_revision_id='${revisions[index]}',deleted_at=${index===25 ? 'clock_timestamp()' : 'NULL'} WHERE id='${ids[index]}';`);
  }
  sql(`INSERT INTO core.resource_dependency(dependent,source,kind,purposes)
    VALUES ('${ids[26]}','${ids[21]}','thread_head',ARRAY['read']);`);
});

after(()=>{
  if (previousConfig) sql(`UPDATE core.config_activation SET active_ptr='${previousConfig}' WHERE environment='${environment}';`);
  sql(`DELETE FROM core.resource_dependency WHERE dependent IN (${fixtureSet}) OR source IN (${fixtureSet});
    UPDATE core.resource SET current_revision_id=NULL WHERE id IN (${fixtureSet});
    DELETE FROM core.content_revision WHERE resource_id IN (${fixtureSet}); DELETE FROM core.resource WHERE id IN (${fixtureSet});
    DELETE FROM core.config_bundle WHERE version='${alternateConfig}';`);
});

test('DF01: anonymous latest reads only actual public approved posts, qualifies before pagination, and orders by creation time and id',()=>{
  const first = get(),data = page(first);
  assert.equal(first.data.config_version,previousConfig);
  assert.equal(data.items.length,20);
  assert.deepEqual(data.items.map(item=>item.id),publicIds.slice(0,20));
  assert.equal(data.has_more,true);
  for (const item of data.items) {
    assert.equal(item.visibility,'public');
    assert.equal(item.created_at,'2099-01-01T00:00:00.123456Z');
    assert.deepEqual(Object.keys(item).sort(),['author_id','body','created_at','id','revision_id','row_version','visibility']);
  }
  assert.doesNotMatch(first.body,/Discovery excluded|published_at|object_internal_key|secret_ref/);
  assert.equal(page(get('?limit=50')).items.filter(item=>ids.includes(item.id)).length,21);
});

test('DF02: signed cursors paginate without duplicates and survive physical deletion of their anchor',()=>{
  const first = page(get('?limit=1'));
  assert.equal(first.items[0].id,publicIds[0]);
  assert.ok(first.next_cursor);
  const anchor = first.items[0].id,revision = revisions[ids.indexOf(anchor)];
  sql(`UPDATE core.resource SET current_revision_id=NULL WHERE id='${anchor}';
    DELETE FROM core.content_revision WHERE id='${revision}'; DELETE FROM core.resource WHERE id='${anchor}';`);
  try {
    const second = page(get(`?limit=1&cursor=${first.next_cursor}`));
    assert.equal(second.items[0].id,publicIds[1]);
    assert.notEqual(second.items[0].id,anchor);
  } finally {
    sql(`INSERT INTO core.resource(id,author_id,kind,visibility,publication_state,created_at)
      VALUES ('${anchor}','${account(1)}','post','public','published','2099-01-01T00:00:00.123456Z');
      INSERT INTO core.content_revision(id,resource_id,revision_no,body,author,review_state)
      VALUES ('${revision}','${anchor}',1,'Discovery public restored','${account(1)}','approved');
      UPDATE core.resource SET current_revision_id='${revision}' WHERE id='${anchor}';`);
  }
});

test('DF03: strict parameters, cursor signatures, query scope, subject, session, release and environment cannot be forged',()=>{
  for (const query of ['?limit=0','?limit=51','?limit=1.5','?limit=01','?limit=1&limit=2','?cursor=','?cursor=bad',
    '?cursor=a&cursor=b','?kind=following','?scope=private','?account_id='+account(1)]) unavailable(get(query),422);
  unavailable(get('',undefined,{ 'X-Client-Release':'' }),422);
  const cursor = page(get('?limit=1')).next_cursor!;
  unavailable(get(`?limit=2&cursor=${cursor}`),422);
  unavailable(get(`?limit=1&cursor=${cursor}`,1),422);
  unavailable(get(`?limit=1&cursor=${cursor}`,undefined,{ 'X-Client-Release':'fixture-v1' }),422);
  const envelope = JSON.parse(Buffer.from(cursor,'base64url').toString());
  for (const patch of [{ position:randomUUID() },{ environment:environment==='dev' ? 'test' : 'dev' },
    { scope:'following' },{ session:session(1) },{ subject:account(1) }]) {
    const forged = Buffer.from(JSON.stringify({ ...envelope,payload:JSON.stringify({ ...JSON.parse(envelope.payload),...patch }) })).toString('base64url');
    unavailable(get(`?limit=1&cursor=${forged}`),422);
  }
  const authenticatedCursor = page(get('?limit=1',1)).next_cursor!;
  unavailable(get(`?limit=1&cursor=${authenticatedCursor}`,2),422);
  unavailable(get(`?limit=1&cursor=${authenticatedCursor}`),422);
});

test('DF04: a current logged-in author cannot elevate the public subset and share-read has no feed methods',()=>{
  const data = page(get('?limit=50',1));
  assert.equal(data.items.filter(item=>ids.includes(item.id)).length,21);
  for (const method of ['GET','HEAD','POST','PUT','DELETE']) unavailable(request('/feeds/latest',
    { method,token:token(1,{ aud:'share-read' }),headers }),403);
  unavailable(request('/feeds/latest',{ method:'POST',headers }),405);
  unavailable(request('/feeds/latest',{ token:token(1,{ session_id:session(2) }),headers }),401);
  unavailable(request('/feeds/latest',{ token:token(1,{ exp:1 }),headers }),401);
});

test('DF05: deletion, review withdrawal and transitive source visibility are rechecked on subsequent pages',()=>{
  const first = page(get('?limit=1')),target = publicIds[1],index = ids.indexOf(target);
  try {
    for (const mutation of [
      `UPDATE core.resource SET deleted_at=clock_timestamp() WHERE id='${target}';`,
      `UPDATE core.resource SET deleted_at=NULL WHERE id='${target}'; UPDATE core.content_revision SET review_state='pending' WHERE id='${revisions[index]}';`,
      `UPDATE core.content_revision SET review_state='approved' WHERE id='${revisions[index]}';
        INSERT INTO core.resource_dependency(dependent,source,kind,purposes) VALUES ('${target}','${ids[22]}','thread_head',ARRAY['read']);`,
    ]) {
      sql(mutation);
      const next = page(get(`?limit=1&cursor=${first.next_cursor}`));
      assert.equal(next.items[0].id,publicIds[2]);
      assert.equal(next.items.some(item=>item.id===target),false);
    }
  } finally {
    sql(`DELETE FROM core.resource_dependency WHERE dependent='${target}';
      UPDATE core.resource SET deleted_at=NULL WHERE id='${target}'; UPDATE core.content_revision SET review_state='approved' WHERE id='${revisions[index]}';`);
  }
});

test('DF06: current blocks, sanctions and revoked sessions filter or reject new reads without inventing placeholder posts',()=>{
  const block = randomUUID(),sanction = randomUUID();
  try {
    sql(`INSERT INTO core.block(id,blocker_id,blocked_id) VALUES ('${block}','${account(2)}','${account(1)}');`);
    assert.equal(page(get('?limit=50',2)).items.some(item=>ids.includes(item.id)),false);
    assert.equal(page(get('?limit=50')).items.filter(item=>ids.includes(item.id)).length,21);
    sql(`DELETE FROM core.block WHERE id='${block}'; INSERT INTO core.sanction(id,subject,type,functions,starts_at,reason,state)
      VALUES ('${sanction}','${account(2)}','function',ARRAY['read'],clock_timestamp(),'Synthetic feed empty qualification','active');`);
    assert.deepEqual(page(get('',2)),{ items:[],next_cursor:null,has_more:false });
    sql(`DELETE FROM core.sanction WHERE id='${sanction}'; UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session(2)}';`);
    unavailable(get('',2),401);
    assert.equal(get().status,200);
  } finally {
    sql(`DELETE FROM core.block WHERE id='${block}'; DELETE FROM core.sanction WHERE id='${sanction}';
      UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(2)}';`);
  }
});

test('DF07: a cursor from a previous active configuration is rejected, and the runtime has only the read function capability',()=>{
  const cursor = page(get('?limit=1')).next_cursor!;
  try {
    sql(`UPDATE core.config_activation SET active_ptr='${alternateConfig}' WHERE environment='${environment}';`);
    unavailable(get(`?limit=1&cursor=${cursor}`),422);
    const fresh = get(); page(fresh);
    assert.equal(fresh.data.config_version,alternateConfig);
  } finally { sql(`UPDATE core.config_activation SET active_ptr='${previousConfig}' WHERE environment='${environment}';`); }
  const privileges = rows(`SELECT has_table_privilege('core_runtime','core.resource','SELECT') AS table_read,
    has_function_privilege('core_runtime','core.latest_public_feed_result(uuid,uuid,text,text,integer,uuid,timestamptz,text)','EXECUTE') AS runtime_execute,
    has_function_privilege('authenticated','core.latest_public_feed_result(uuid,uuid,text,text,integer,uuid,timestamptz,text)','EXECUTE') AS client_execute`)[0];
  assert.deepEqual(privileges,{ table_read:false,runtime_execute:true,client_execute:false });
});
