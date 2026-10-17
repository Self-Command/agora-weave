import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash,randomUUID } from 'node:crypto';
import { account,environment,request,rows,sql,token } from '../../fixtures/core/runtime.ts';
import { compose } from '../../../tools/ci/core-database.ts';
import { activateConfiguration } from '../../fixtures/core/configuration.ts';
const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT||process.env.CI_ENVIRONMENT!;
const mediaId='60000000-0000-4000-8000-000000000001';
before(()=>{
  sql(readFileSync('tests/fixtures/core/policy.sql','utf8'));
  sql(`INSERT INTO core.config_definition(key,owner,schema,default_value,range,scopes,priority,permissions,dependencies,effect_mode,existing_policy,evidence_refs)
    VALUES ('ui.theme','ui','{"type":"string"}','"light"','{}',ARRAY['global'],0,ARRAY['config.read'],ARRAY[]::text[],'immediate','new_operations',ARRAY['fixture'])
    ON CONFLICT(key) DO NOTHING;
    UPDATE core.config_definition SET sensitive=false,consumer_ids=ARRAY['share','mobile'] WHERE key='ui.theme';
    INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces) VALUES
      ('61000000-0000-4000-8000-000000000001','gateway.help','help','zh-CN','${account()}',ARRAY['app','share']) ON CONFLICT(id) DO NOTHING;
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor) VALUES
      ('61000000-0000-4000-8000-000000000002','61000000-0000-4000-8000-000000000001',1,'帮助','当前帮助内容',repeat('b',64),'ready','${account()}') ON CONFLICT(id) DO NOTHING;
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at) VALUES
      ('61000000-0000-4000-8000-000000000003','61000000-0000-4000-8000-000000000001','61000000-0000-4000-8000-000000000002',repeat('b',64),'{"environment":"${env}","surfaces":["app","share"]}','published','${account()}',clock_timestamp()) ON CONFLICT(id) DO NOTHING;
    UPDATE core.managed_document SET active_release_id='61000000-0000-4000-8000-000000000003' WHERE id='61000000-0000-4000-8000-000000000001';
    INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,size_bytes,detected_mime,state,data_class,bound_resource)
      VALUES ('${mediaId}','${account()}','core','private','private/source-key',4,'image/png','bound','user_media','40000000-0000-4000-8000-000000000001') ON CONFLICT(id) DO NOTHING;`);
  sql(`INSERT INTO storage.buckets(id,name,public) VALUES ('private','private',false) ON CONFLICT(id) DO NOTHING;
    UPDATE core.media_object SET sha256=encode(sha256(convert_to('data','UTF8')),'hex') WHERE id='${mediaId}';`);
  const config = ['url = "http://storage:5000/object/private/private/source-key"','request = "POST"','silent','show-error','fail',
    `header = ${JSON.stringify(`Authorization: Bearer ${environment().SERVICE_ROLE_KEY}`)}`,'header = "Content-Type: image/png"','header = "x-upsert: true"','data = "data"'].join('\n');
  compose(['exec','-T','db','curl','--config','-'],config+'\n');
  activateConfiguration(env,'gateway-fixture-v2',[{scope:'global',values:{'ui.theme':'light'}}]);
});
test('GW01: authenticated config and published document reads expose only current safe projections',()=>{
  const config=request('/config/effective?consumer=mobile',{token:token(),headers:{'X-Client-Release':'fixture-v1'}});assert.equal(config.status,200);assert.equal(config.data.data.values['ui.theme'],'light');
  const doc=request('/documents/gateway.help/releases/current?kind=help&locale=zh-CN&surface=app',{token:token()});assert.equal(doc.status,200);assert.equal(doc.data.data.body,'当前帮助内容');
  assert.equal(JSON.stringify(doc.data).includes('private/source-key'),false);
});
test('GW02: share config is public-safe while account audience cannot be spoofed into share projection',()=>{
  const share=request('/config/effective?consumer=share',{token:token(1,{aud:'share-read'}),headers:{'X-Client-Release':'fixture-v1'}});assert.equal(share.status,200);assert.equal(share.data.data.values['ui.theme'],'light');
  const spoof=request('/config/effective?consumer=share',{token:token(),headers:{'X-Role':'share-read'}});assert.equal(spoof.status,403);
});
test('GW03: media requires current resource authorization and never returns object storage keys',()=>{
  const allowed=request(`/media/${mediaId}`,{token:token(1)});assert.equal(allowed.status,200);assert.equal(allowed.body,'data');
  const partial=request(`/media/${mediaId}`,{token:token(1),headers:{Range:'bytes=1-2'}});assert.equal(partial.status,206);assert.equal(partial.body,'at');
  sql(`UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='40000000-0000-4000-8000-000000000001';`);
  try {
    assert.equal(request(`/media/${mediaId}`,{token:token(2)}).status,404);
    assert.equal(request(`/media/${mediaId}`,{token:token(2),headers:{Range:'bytes=1-2','If-None-Match':'"cached"'}}).status,404);
    assert.equal(request(`/media/${mediaId}`,{method:'HEAD',token:token(2)}).status,404);
  }
  finally { sql(`UPDATE core.resource SET visibility='public' WHERE id='40000000-0000-4000-8000-000000000001';`); }
});
test('GW04: events use a current session and bounded cursor, with no raw event payload',()=>{
  sql(`INSERT INTO core.event_delivery(event_id,event_type,aggregate_id,aggregate_version,recipient,environment,owner_plugin,lifecycle_epoch)
    VALUES ('62000000-0000-4000-8000-000000000001','access.changed','40000000-0000-4000-8000-000000000001',1,'${account()}','${env}','core',1)
    ON CONFLICT(event_id) DO NOTHING;`);
  const response=request('/events?after=0&limit=20',{token:token()});assert.equal(response.status,200);assert.equal(response.data.data.items.length>=1,true);
  assert.equal(JSON.stringify(response.data).includes('body'),false);assert.equal(request('/events?after=-1',{token:token()}).status,422);
  assert.equal(rows(`SELECT count(*) AS count FROM core.event_delivery WHERE recipient='${account()}'`)[0].count>0,true);
});

test('GW05: document reads cannot switch audience surface or expose a future release',()=>{
  const base='/documents/gateway.help/releases/current?kind=help&locale=zh-CN';
  assert.equal(request(base,{token:token(1,{aud:'share-read'})}).status,200);
  assert.equal(request(base+'&surface=app',{token:token(1,{aud:'share-read'})}).status,403);
  assert.equal(request('/documents/current?kind=terms&surface=app&locale=zh-CN',{token:token(1,{aud:'share-read'})}).status,403);
  for(const actor of [undefined,token(),token(1,{aud:'share-read'})])
    assert.equal(request(base+'&surface=admin',{token:actor}).status,403);
  assert.equal(request(base+'&surface=app').status,200,'Registration still reads public App documents before login');
  assert.equal(request(base+'&surface=share').status,200);
  assert.equal(request(base+'&surface=share',{token:token()}).status,403);
  assert.equal(request(base+'&surface=',{token:token()}).status,422);
  const documentId=randomUUID(),revisionId=randomUUID(),releaseId=randomUUID(),stableKey=`gateway.future.${randomUUID()}`;
  sql(`INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces) VALUES
    ('${documentId}','${stableKey}','help','zh-CN','${account()}',ARRAY['app','share']);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor) VALUES
    ('${revisionId}','${documentId}',1,'尚未生效','Future release body',repeat('c',64),'ready','${account()}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at) VALUES
    ('${releaseId}','${documentId}','${revisionId}',repeat('c',64),
      '{"environment":"${env}","surfaces":["app","share"]}','published','${account()}',clock_timestamp()+interval '1 day');
    UPDATE core.managed_document SET active_release_id='${releaseId}' WHERE id='${documentId}';`);
  for(const actor of [undefined,token(),token(1,{aud:'share-read'})]) {
    const response=request(`/documents/${stableKey}/releases/current?kind=help&locale=zh-CN`,{token:actor});
    assert.equal(response.status,404);assert.equal(response.body.includes('Future release body'),false);
  }
});

const quote=(value:string)=>`'${value.replaceAll("'","''")}'`;
const json=(value:unknown)=>`${quote(JSON.stringify(value))}::jsonb`;
type DocumentFixture={documentId:string;revisionId:string;releaseId:string;stableKey:string;body:string;digest:string;locale:string};
function documentFixture(options:{kind?:string;locale?:string;surfaces?:string[];releaseSurfaces?:string[];environment?:string;
  state?:string;revisionState?:string;active?:boolean;publishedAt?:string;scopeExtra?:Record<string,unknown>;stableKey?:string}={},statements?:string[]):DocumentFixture {
  const documentId=randomUUID(),revisionId=randomUUID(),releaseId=randomUUID(),stableKey=options.stableKey||`gateway.document.${randomUUID()}`;
  const body=`SYNTHETIC DOCUMENT ${randomUUID()} — NOT A PRODUCTION POLICY`,digest=createHash('sha256').update(body).digest('hex');
  const locale=options.locale||'zh-CN',surfaces=options.surfaces||['app','share'];
  const statement=`INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
    VALUES('${documentId}',${quote(stableKey)},${quote(options.kind||'help')},${quote(locale)},'${account()}',ARRAY[${surfaces.map(quote).join(',')}]::text[]);
    INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
    VALUES('${revisionId}','${documentId}',1,'Synthetic document',${quote(body)},'${digest}',${quote(options.revisionState||'ready')},'${account()}');
    INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
    VALUES('${releaseId}','${documentId}','${revisionId}','${digest}',${json({environment:options.environment||env,surfaces:options.releaseSurfaces||surfaces,
      purposes:['read'],...options.scopeExtra})},${quote(options.state||'published')},'${account()}',${options.publishedAt||'clock_timestamp()'});
    ${options.active===false?'':`UPDATE core.managed_document SET active_release_id='${releaseId}' WHERE id='${documentId}';`}`;
  if(statements)statements.push(statement);else sql(statement);
  return {documentId,revisionId,releaseId,stableKey,body,digest,locale};
}
const currentPath=(fixture:DocumentFixture,surface='app')=>`/documents/current?stable_key=${fixture.stableKey}&kind=help&locale=${fixture.locale}&surface=${surface}`;
const releasePath=(fixture:DocumentFixture,release=fixture.releaseId,surface='app')=>`/documents/${fixture.documentId}/releases/${release}?locale=${fixture.locale}&surface=${surface}`;
const detachDocuments=(fixtures:DocumentFixture[])=>sql(`UPDATE core.managed_document SET active_release_id=NULL WHERE id IN (${fixtures.map(f=>quote(f.documentId)).join(',')});`);

test('GW06: current document sets use current published content, return a stable digest and never turn a GET into a document receipt',()=>{
  const beforeReceipts=sql('SELECT count(*) FROM core.document_receipt;').trim();
  const fixture=documentFixture({scopeExtra:{private_marker:'NOT_A_PUBLIC_SCOPE_VALUE'}});
  try {
    const first=request(currentPath(fixture));assert.equal(first.status,200,first.body);
    const data=first.data.data as {documents:Record<string,unknown>[];document_set_digest:string};
    assert.equal(data.documents.length,1);assert.match(data.document_set_digest,/^[a-f0-9]{64}$/);
    const document=data.documents[0];
    assert.equal(document.document_id,fixture.documentId);assert.equal(document.release_id,fixture.releaseId);
    assert.equal(document.body,fixture.body);assert.equal(document.digest,fixture.digest);assert.equal(document.stable_key,fixture.stableKey);
    assert.equal(document.kind,'help');assert.equal(document.locale,fixture.locale);assert.equal(document.state,'published');assert.equal(document.is_current,true);
    assert.ok(Number.isFinite(Date.parse(String(document.published_at))));
    assert.deepEqual(document.scope,{environment:env,surfaces:['app'],purposes:['read']});
    assert.doesNotMatch(first.body,/private_marker|NOT_A_PUBLIC_SCOPE_VALUE|publisher|confirmation_ref|audit_ref/);
    const again=request(currentPath(fixture),{token:token()});assert.equal(again.status,200,again.body);
    assert.equal((again.data.data as typeof data).document_set_digest,data.document_set_digest);
    const revision=randomUUID(),release=randomUUID(),body=`SYNTHETIC UPDATED DOCUMENT ${randomUUID()}`,digest=createHash('sha256').update(body).digest('hex');
    sql(`UPDATE core.document_release SET state='superseded' WHERE id='${fixture.releaseId}';
      INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
      VALUES('${revision}','${fixture.documentId}',2,'Updated synthetic document',${quote(body)},'${digest}','ready','${account()}');
      INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
      VALUES('${release}','${fixture.documentId}','${revision}','${digest}',${json({environment:env,surfaces:['app','share'],purposes:['read']})},'published','${account()}',clock_timestamp());
      UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${fixture.documentId}';`);
    const updated=request(currentPath(fixture));assert.equal(updated.status,200,updated.body);
    assert.notEqual((updated.data.data as typeof data).document_set_digest,data.document_set_digest);
    assert.equal((updated.data.data as typeof data).documents[0].body,body);assert.equal(updated.body.includes(fixture.body),false);
    assert.equal(sql('SELECT count(*) FROM core.document_receipt;').trim(),beforeReceipts);
  } finally {detachDocuments([fixture]);}
});

test('GW07: current and historical releases support UUID or stable keys and mark a superseded release without falling back when current disappears',()=>{
  const beforeReceipts=sql('SELECT count(*) FROM core.document_receipt;').trim();
  const fixture=documentFixture();
  try {
    const current=request(releasePath(fixture));assert.equal(current.status,200,current.body);
    assert.equal((current.data.data as Record<string,unknown>).is_current,true);
    const byKey=request(`/documents/${fixture.stableKey}/releases/${fixture.releaseId}`);assert.equal(byKey.status,200,byKey.body);
    assert.deepEqual(byKey.data.data,current.data.data);
    const byCurrent=request(`/documents/${fixture.documentId}/releases/current`);assert.equal(byCurrent.status,200,byCurrent.body);
    assert.deepEqual(byCurrent.data.data,current.data.data);
    sql(`UPDATE core.document_release SET state='superseded' WHERE id='${fixture.releaseId}';
      UPDATE core.managed_document SET active_release_id=NULL WHERE id='${fixture.documentId}';`);
    const historical=request(releasePath(fixture));assert.equal(historical.status,200,historical.body);
    assert.equal((historical.data.data as Record<string,unknown>).is_current,false);assert.equal((historical.data.data as Record<string,unknown>).state,'superseded');
    assert.equal((historical.data.data as Record<string,unknown>).body,fixture.body);
    assert.equal(request(`/documents/${fixture.documentId}/releases/current`).status,404);
    const missing=request(currentPath(fixture));assert.equal(missing.status,404);assert.equal(missing.data.code,'NOT_FOUND');assert.equal(missing.body.includes(fixture.body),false);
    sql(`UPDATE core.managed_document SET public_surfaces=ARRAY[]::text[] WHERE id='${fixture.documentId}';`);
    const revoked=request(releasePath(fixture));assert.equal(revoked.status,404);assert.equal(revoked.body.includes(fixture.body),false);
    assert.equal(sql('SELECT count(*) FROM core.document_receipt;').trim(),beforeReceipts);
  } finally {detachDocuments([fixture]);}
});

test('GW08: unpublished withdrawn future unready and mismatched document releases never leak through current sets or explicit release reads',()=>{
  const fixtures=[
    documentFixture({state:'prepared'}),documentFixture({state:'withdrawn'}),
    documentFixture({publishedAt:"clock_timestamp()+interval '1 day'"}),documentFixture({publishedAt:'NULL'}),
    documentFixture({revisionState:'draft'}),documentFixture({environment:env==='dev'?'test':'dev'}),
    documentFixture({releaseSurfaces:['share']}),documentFixture({surfaces:['share'],releaseSurfaces:['app']}),
    documentFixture({active:false}),
  ];
  try {
    for(const fixture of fixtures) {
      for(const path of [releasePath(fixture),`/documents/${fixture.stableKey}/releases/current?kind=help`,currentPath(fixture)]) {
        const response=request(path);assert.equal(response.status,404,path);assert.equal(response.body.includes(fixture.body),false,path);
        assert.equal(response.data.data,undefined,path);
      }
    }
  } finally {detachDocuments(fixtures);}
});

test('GW09: share document sets and historical reads keep their audience scope and reject spoofed or malformed query expansion',()=>{
  const publicDoc=documentFixture(),appOnly=documentFixture({surfaces:['app']}),shareToken=token(1,{aud:'share-read'});
  try {
    assert.equal(request(currentPath(publicDoc,'share'),{token:shareToken}).status,200);
    assert.equal(request(releasePath(publicDoc,publicDoc.releaseId,'share'),{token:shareToken}).status,200);
    sql(`UPDATE core.document_release SET state='superseded' WHERE id='${publicDoc.releaseId}';
      UPDATE core.managed_document SET active_release_id=NULL WHERE id='${publicDoc.documentId}';`);
    const history=request(releasePath(publicDoc,publicDoc.releaseId,'share'),{token:shareToken});assert.equal(history.status,200,history.body);
    assert.equal((history.data.data as Record<string,unknown>).is_current,false);
    assert.deepEqual((history.data.data as Record<string,unknown>).scope,{environment:env,surfaces:['share'],purposes:['read']});
    const mismatched=request(releasePath(appOnly,publicDoc.releaseId));assert.equal(mismatched.status,404);
    assert.equal(mismatched.body.includes(publicDoc.body),false);
    for(const path of [currentPath(appOnly,'share'),releasePath(appOnly,appOnly.releaseId,'share')]) {
      const hidden=request(path,{token:shareToken});assert.equal(hidden.status,404);assert.equal(hidden.body.includes(appOnly.body),false);
    }
    for(const path of [currentPath(appOnly),releasePath(appOnly)]) {
      assert.equal(request(path,{token:shareToken,headers:{'X-Role':'authenticated','Origin':'https://app.example.invalid'}}).status,403);
    }
    assert.equal(request(currentPath(appOnly,'share'),{token:token()}).status,403);
    for(const actor of [undefined,token(),shareToken])assert.equal(request(releasePath(appOnly,appOnly.releaseId,'admin'),{token:actor}).status,403);
    for(const extra of ['&kind=help','&locale=zh-CN','&surface=app','&stable_key=other','&account_id='+account(),'&unknown=true'])
      assert.equal(request(currentPath(appOnly)+extra).status,422,extra);
    for(const extra of ['&locale=zh-CN','&surface=app','&kind=help&kind=help','&stable_key='+appOnly.stableKey,'&unknown=true'])
      assert.equal(request(releasePath(appOnly)+extra).status,422,extra);
  } finally {detachDocuments([publicDoc,appOnly]);}
});

test('GW10: a 50-document current set is complete and 51 matching documents fail closed rather than truncate content or its digest',()=>{
  const fixtures:DocumentFixture[]=[],statements:string[]=[];
  const locale=randomUUID().replaceAll('-','').slice(0,8).replace(/[0-9]/g,digit=>String.fromCharCode(103+Number(digit)))+'-ZZ';
  try {
    for(let index=0;index<50;index++)fixtures.push(documentFixture({locale,stableKey:`gateway.bound.${randomUUID()}`},statements));
    sql(statements.join('\n'));
    const path=`/documents/current?kind=help&locale=${locale}&surface=app`;
    const full=request(path);assert.equal(full.status,200,full.body);
    const data=full.data.data as {documents:{document_id:string}[];document_set_digest:string};
    assert.equal(data.documents.length,50);assert.match(data.document_set_digest,/^[a-f0-9]{64}$/);
    assert.deepEqual(data.documents.map(document=>document.document_id).sort(),fixtures.map(fixture=>fixture.documentId).sort());
    fixtures.push(documentFixture({locale,stableKey:`gateway.bound.${randomUUID()}`}));
    const overflow=request(path);assert.equal(overflow.status,503);assert.equal(overflow.data.code,'SERVICE_UNAVAILABLE');assert.equal(overflow.data.data,undefined);
    for(const fixture of fixtures)assert.equal(overflow.body.includes(fixture.body),false);
    detachDocuments([fixtures[50]]);
    const restored=request(path);assert.equal(restored.status,200,restored.body);
    assert.deepEqual(restored.data.data,data,'The same complete current set has the same digest after an unrelated active pointer is removed');
  } finally {if(fixtures.length)detachDocuments(fixtures);}
});

test('GW11: registration current-document compatibility remains intact and alternate kinds locales and surfaces select only their own set',()=>{
  const terms=documentFixture({kind:'terms',surfaces:['app'],scopeExtra:{purposes:['register']}});
  const privacy=documentFixture({kind:'privacy',surfaces:['app'],scopeExtra:{purposes:['register']}});
  const notice=documentFixture({kind:'processing_notice',locale:'en-US',surfaces:['share'],scopeExtra:{purposes:['ai_processing']}});
  try {
    const beforeReceipts=sql('SELECT count(*) FROM core.document_receipt;').trim();
    const noQuery=request('/documents/current'),legacy=request('/documents/current?kind=terms&surface=app&locale=zh-CN');
    assert.equal(noQuery.status,200,noQuery.body);assert.equal(legacy.status,200,legacy.body);assert.deepEqual(noQuery.data.data,legacy.data.data);
    const registration=noQuery.data.data as {documents:{release_id:string}[];document_set_digest:string;age_declaration_version:string};
    assert.ok(registration.documents.some(document=>document.release_id===terms.releaseId));assert.ok(registration.documents.some(document=>document.release_id===privacy.releaseId));
    assert.equal(registration.age_declaration_version,'adult-18-v1');assert.match(registration.document_set_digest,/^[a-f0-9]{64}$/);
    const generic=request(`/documents/current?stable_key=${notice.stableKey}&kind=processing_notice&locale=en-US&surface=share`,{token:token(1,{aud:'share-read'})});
    assert.equal(generic.status,200,generic.body);
    const data=generic.data.data as {documents:Record<string,unknown>[];document_set_digest:string;age_declaration_version?:string};
    assert.equal(data.documents.length,1);assert.equal(data.documents[0].release_id,notice.releaseId);assert.equal(data.documents[0].body,notice.body);
    assert.equal(data.documents[0].kind,'processing_notice');assert.equal(data.documents[0].locale,'en-US');assert.equal(data.age_declaration_version,undefined);
    assert.equal(generic.body.includes(terms.body),false);assert.equal(generic.body.includes(privacy.body),false);
    assert.equal(sql('SELECT count(*) FROM core.document_receipt;').trim(),beforeReceipts);
  } finally {detachDocuments([terms,privacy,notice]);}
});

test('GW12: JSON success envelopes identify the admitted active configuration and missing activation never returns protected data',()=>{
  const original=String(rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${env}'`)[0].active_ptr);
  const help=documentFixture(),terms=documentFixture({kind:'terms',surfaces:['app'],scopeExtra:{purposes:['register']}});
  const privacy=documentFixture({kind:'privacy',surfaces:['app'],scopeExtra:{purposes:['register']}});
  const reads=()=>[
    request('/config/effective?consumer=mobile',{token:token(),headers:{'X-Client-Release':'fixture-v1'}}),
    request('/posts/40000000-0000-4000-8000-000000000001',{token:token()}),
    request('/events?after=0&limit=20',{token:token()}),request(currentPath(help)),request(releasePath(help)),
    request('/documents/current'),request('/me/sessions',{token:token(),headers:{'X-Client-Release':'fixture-v1'}}),
  ];
  const expectEnvelopes=(version:string)=>{
    for(const response of reads()) {
      assert.equal(response.status,200,response.body);assert.match(String(response.data.request_id),/^[a-f0-9-]{36}$/);
      assert.equal(response.data.config_version,version,response.body);assert.ok(response.data.data);
    }
  };
  try {
    for(const role of ['anon','authenticated','service_role','core_worker','core_runtime']) {
      const allowed=rows(`SELECT has_function_privilege('${role}','core.response_config_version(text)','EXECUTE') AS allowed`)[0].allowed;
      assert.equal(allowed,role==='core_runtime',role);
    }
    expectEnvelopes(original);
    activateConfiguration(env,'gateway-envelope-change',[{scope:'global',values:{'ui.theme':'light'}}]);
    const updated=String(rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${env}'`)[0].active_ptr);
    assert.notEqual(updated,original);expectEnvelopes(updated);
    sql(`DELETE FROM core.config_activation WHERE environment='${env}';`);
    for(const response of reads()) {
      assert.equal(response.status,503,response.body);assert.equal(response.data.data,undefined);
      assert.equal(response.data.config_version,undefined);
      assert.ok(['CONFIG_UNAVAILABLE','SERVICE_UNAVAILABLE'].includes(String(response.data.code)),response.body);
      assert.equal(response.body.includes(help.body),false);assert.equal(response.body.includes(terms.body),false);
    }
    assert.equal(request('/posts/40000000-0000-4000-8000-000000000099',{token:token()}).status,404,
      'Current authorization and existence checks retain their error precedence');
  } finally {
    sql(`INSERT INTO core.config_activation(environment,active_ptr) VALUES('${env}',${quote(original)})
      ON CONFLICT(environment) DO UPDATE SET active_ptr=excluded.active_ptr;`);
    detachDocuments([help,terms,privacy]);
  }
});
