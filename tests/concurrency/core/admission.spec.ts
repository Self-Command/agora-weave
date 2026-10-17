import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash,randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { setTimeout as pause } from 'node:timers/promises';
import { account,environment,session,request,token,sql } from '../../fixtures/core/runtime.ts';
import { compose,coreComposeArguments } from '../../../tools/ci/core-database.ts';
import { asynchronousCompose, heldTransaction, readConcurrently } from '../../fixtures/core/concurrency.ts';

const target = '40000000-0000-4000-8000-000000000002';
before(() => sql(readFileSync('tests/fixtures/core/policy.sql','utf8')));

test('AD01: a request admitted behind an uncommitted restriction waits for its authoritative commit and emits no old body', async () => {
  assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 200, 'The same live follower must first read the original body');
  const writer = await heldTransaction(`SELECT pg_advisory_xact_lock(17013,1); UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='${target}'`);
  let finished = false;
  const pending = readConcurrently(`/posts/${target}`, 2).finally(() => { finished = true; });
  void pending.catch(() => {});
  try {
    try {
      await pause(250);
      assert.equal(finished, false, 'Read admission must coordinate with the in-flight policy writer');
    } finally { await writer.commit(); }
    const result = await pending;
    assert.equal(result.status, 404);
    assert.doesNotMatch(result.body, /Synthetic restricted body/);
  } finally { await pending.catch(() => {}); sql(`UPDATE core.resource SET visibility='followers' WHERE id='${target}';`); }
});

test('AD02: actual session mutation takes the same exclusive admission lock and every read after its commit rejects the old JWT', async () => {
  assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 200);
  const admission = await heldTransaction('SELECT pg_advisory_xact_lock_shared(17013,1)');
  let finished = false;
  const pending = asynchronousCompose(['exec', '-T', 'db', 'psql', '-X', '-qAt', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1'],
    `UPDATE core.session_registry SET revoked_at=clock_timestamp(),epoch=epoch+1 WHERE account_id='${account(2)}' AND session_id='${session(2)}';\n`)
    .finally(() => { finished = true; });
  void pending.catch(() => {});
  try {
    try {
      await pause(250);
      assert.equal(finished, false, 'The real policy mutation must wait for an existing bounded admission');
    } finally { await admission.commit(); }
    await pending;
    for (let number = 0; number < 3; number++) assert.equal(request(`/posts/${target}`, { token: token(2) }).status, 401);
  } finally { await pending.catch(() => {}); sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(2)}';`); }
});

test('AD03: multi-unit media and actual ETag hits recheck current access behind the policy writer before any new Range or conditional output',async()=>{
  const id=randomUUID(),key=`admission/${id}`,body='SYNTHETIC_STREAM_UNIT_'.repeat(8192),digest=createHash('sha256').update(body).digest('hex');
  const etag=`"${digest}"`,path=`/media/${id}`,env=environment();
  sql(`INSERT INTO storage.buckets(id,name,public) VALUES('private','private',false) ON CONFLICT(id) DO NOTHING;
    INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,size_bytes,sha256,detected_mime,state,data_class,bound_resource)
      VALUES('${id}','${account()}','core','private','${key}',${body.length},'${digest}','application/octet-stream','bound','user_media','${target}');`);
  const upload=[`url = "http://storage:5000/object/private/${key}"`,'request = "POST"','silent','show-error','fail',
    `header = ${JSON.stringify(`Authorization: Bearer ${env.SERVICE_ROLE_KEY}`)}`,'header = "Content-Type: application/octet-stream"',
    `data = ${JSON.stringify(body)}`].join('\n');
  compose(['exec','-T','db','curl','--config','-'],upload+'\n');
  try {
    const full=request(path,{token:token(2)});assert.equal(full.status,200);assert.equal(full.body,body);
    const partial=request(path,{token:token(2),headers:{Range:'bytes=0-131071'}});assert.equal(partial.status,206);assert.equal(partial.body,body.slice(0,131072));
    const hit=request(path,{token:token(2),headers:{'If-None-Match':etag}});assert.equal(hit.status,304);assert.equal(hit.body,'');
    const writer=await heldTransaction(`UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='${target}'`);
    let completed=0;
    const pending=[{Range:'bytes=0-131071'},{'If-None-Match':etag}].map(async headers=>{
      const config=[`url = "http://api-gw:8000/functions/v1/core/api/v1${path}"`,'silent','show-error','max-time = 15','write-out = "\\n%{http_code}"',
        `header = ${JSON.stringify(`apikey: ${env.ANON_KEY}`)}`,`header = ${JSON.stringify(`Authorization: Bearer ${token(2)}`)}`,
        ...Object.entries(headers).map(([name,value])=>`header = ${JSON.stringify(`${name}: ${value}`)}`)].join('\n');
      const raw=await asynchronousCompose(['exec','-T','db','curl','--config','-'],config+'\n');completed++;
      const split=raw.lastIndexOf('\n');return {status:Number(raw.slice(split+1)),body:raw.slice(0,split)};
    });
    pending.forEach(result=>{void result.catch(()=>{});});
    try {
      await pause(250);assert.equal(completed,0,'New media reads must wait behind the uncommitted current policy restriction');
    } finally {await writer.commit();}
    const denied=await Promise.all(pending);
    for(const result of denied){assert.equal(result.status,404);assert.doesNotMatch(result.body,/SYNTHETIC_STREAM_UNIT|object_internal_key|source-key/);}
    assert.equal(request(path,{method:'HEAD',token:token(2),headers:{'If-None-Match':etag}}).status,404);
  } finally {
    sql(`UPDATE core.resource SET visibility='followers' WHERE id='${target}';UPDATE core.media_object SET state='cleaned' WHERE id='${id}';`);
    const cleanup=[`url = "http://storage:5000/object/private/${key}"`,'request = "DELETE"','silent','show-error','fail',
      `header = ${JSON.stringify(`Authorization: Bearer ${env.SERVICE_ROLE_KEY}`)}`].join('\n');
    compose(['exec','-T','db','curl','--config','-'],cleanup+'\n');
  }
});

test('AD04: an already open media stream stops before its remaining units after a restriction commits between units',async()=>{
  const id=randomUUID(),key=`admission/${id}`,size=8*1024*1024,body='S'.repeat(size),digest=createHash('sha256').update(body).digest('hex');
  const env=environment(),path=`/media/${id}`;
  sql(`INSERT INTO storage.buckets(id,name,public) VALUES('private','private',false) ON CONFLICT(id) DO NOTHING;
    INSERT INTO core.media_object(id,owner,plugin,bucket,object_internal_key,size_bytes,sha256,detected_mime,state,data_class,bound_resource)
      VALUES('${id}','${account()}','core','private','${key}',${size},'${digest}','application/octet-stream','bound','user_media','${target}');`);
  const upload=[`url = "http://storage:5000/object/private/${key}"`,'request = "POST"','silent','show-error','fail',
    `header = ${JSON.stringify(`Authorization: Bearer ${env.SERVICE_ROLE_KEY}`)}`,'header = "Content-Type: application/octet-stream"',
    `data = ${JSON.stringify(body)}`].join('\n');
  let child:ReturnType<typeof spawn>|undefined;
  let completion:Promise<{code:number|null;signal:NodeJS.Signals|null}>|undefined;
  try {
    compose(['exec','-T','db','curl','--config','-'],upload+'\n');
    const baseline=request(path,{token:token(2),headers:{Range:'bytes=0-65535'}});
    assert.equal(baseline.status,206);assert.equal(baseline.body,'S'.repeat(65536));
    // Use the actual product gateway and production handler on the isolated
    // network; no test endpoint or authorization substitute is installed.
    // The pinned worker lifetime is 60 seconds. A truncated fixed-length relay
    // can wait for worker shutdown before EOF; this checks eventual truncation,
    // not immediate connection closure. A client timeout still fails the test.
    const config=[`url = "http://api-gw:8000/functions/v1/core/api/v1${path}"`,'http1.1','silent','show-error','fail','no-buffer',
      'limit-rate = 1048576','max-time = 70','dump-header = "/dev/stderr"',`header = ${JSON.stringify(`apikey: ${env.ANON_KEY}`)}`,
      `header = ${JSON.stringify(`Authorization: Bearer ${token(2)}`)}`].join('\n');
    child=spawn('docker',[...coreComposeArguments(),'exec','-T','db','curl','--config','-'],{stdio:['pipe','pipe','pipe'],timeout:75000});
    let received=0,invalidBytes=false,stderr='';
    completion=new Promise((resolve,reject)=>{
      child!.once('error',reject);child!.once('close',(code,signal)=>resolve({code,signal}));
    });
    void completion.catch(()=>{});
    const firstUnit=new Promise<void>((resolve,reject)=>{
      child!.stdout!.on('data',(chunk:Uint8Array)=>{
        received+=chunk.length;invalidBytes ||= chunk.some(value=>value!==83);
        if(received>=65536)resolve();
      });
      child!.once('error',reject);
      child!.once('close',()=>{if(received<65536)reject(new Error('The live media stream ended before its first source unit'));});
    });
    child.stderr!.setEncoding('utf8');child.stderr!.on('data',value=>{stderr+=value;});child.stdin!.end(config+'\n');
    await firstUnit;
    assert.equal(invalidBytes,false,'The established stream must first deliver the actual private object bytes');
    // The exclusive writer waits for any currently admitted unit, then prevents
    // another unit from being admitted until its restriction has committed.
    const writer=await heldTransaction(`UPDATE core.resource SET visibility='self',policy_epoch=policy_epoch+1 WHERE id='${target}'`);
    try {assert.ok(received<size,'The restriction must occur while this same response still has undelivered units');}
    finally {await writer.commit();}
    assert.equal(request(path,{token:token(2),headers:{Range:'bytes=65536-131071'}}).status,404);
    const result=await completion;
    assert.equal(result.signal,null,'A killed client is not evidence of server-side revocation');
    assert.equal(result.code,18,`Expected a server-truncated Content-Length response, not a timeout or successful full transfer: ${stderr.slice(0,300)}`);
    assert.ok(received>=65536&&received<size,`Expected a positive prefix and rejected remaining units, received ${received}/${size}`);
    assert.equal(invalidBytes,false);
    // Bytes admitted before commit may already be buffered by the transport and
    // drain afterward. Early server closure proves later units did not finish;
    // this does not claim that already handed-off transport bytes are recalled.
  } finally {
    child?.kill();await completion?.catch(()=>{});
    sql(`UPDATE core.resource SET visibility='followers' WHERE id='${target}';UPDATE core.media_object SET state='cleaned' WHERE id='${id}';`);
    const cleanup=[`url = "http://storage:5000/object/private/${key}"`,'request = "DELETE"','silent','show-error','fail',
      `header = ${JSON.stringify(`Authorization: Bearer ${env.SERVICE_ROLE_KEY}`)}`].join('\n');
    compose(['exec','-T','db','curl','--config','-'],cleanup+'\n');
  }
});
