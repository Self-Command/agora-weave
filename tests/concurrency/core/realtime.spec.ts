import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { setTimeout as pause } from 'node:timers/promises';
import { coreComposeArguments } from '../../../tools/ci/core-database.ts';
import { account,environment,request,session,sql,token } from '../../fixtures/core/runtime.ts';
const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
before(()=>sql(readFileSync('tests/fixtures/core/policy.sql','utf8')));
const enqueue=(id:string)=>sql(`INSERT INTO core.event_delivery(event_id,event_type,aggregate_id,aggregate_version,recipient,environment,owner_plugin,lifecycle_epoch)
  VALUES('${id}','access.changed','40000000-0000-4000-8000-000000000001',1,'${account(7)}','${env}','core',1);`);

test('RT01: a real open SSE connection stops receiving new events after its current session is revoked',async()=>{
  const first=randomUUID(),after=Number(sql('SELECT coalesce(max(sequence),0) FROM core.event_delivery;').trim());enqueue(first);
  const config=[`url = "http://api-gw:8000/functions/v1/core/api/v1/events?after=${after}&limit=20"`,'silent','show-error','no-buffer','max-time = 10',
    `header = ${JSON.stringify(`apikey: ${environment().ANON_KEY}`)}`,`header = ${JSON.stringify(`Authorization: Bearer ${token(7)}`)}`,'header = "Accept: text/event-stream"'].join('\n');
  const child=spawn('docker',[...coreComposeArguments(),'exec','-T','db','curl','--config','-'],{stdio:['pipe','pipe','pipe'],timeout:15000});
  let output='';child.stdout.setEncoding('utf8').on('data',value=>{output+=value;});child.stderr.resume();child.stdin.end(config+'\n');
  const done=new Promise<void>(resolve=>child.once('close',()=>resolve()));
  try{
    for(let count=0;count<40 && !output.includes(first);count++)await pause(100);
    assert.ok(output.includes(first),'The established connection must first deliver a real eligible event');
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session(7)}';`);
    const forbidden=randomUUID();enqueue(forbidden);await done;
    assert.equal(output.includes(forbidden),false,'No event created after the revocation commit may be sent on the old connection');
    assert.equal(request('/events?after=0',{token:token(7)}).status,401);
  }finally{child.kill();sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(7)}';`);}
});

test('RT02: reconnect cursors and content negotiation cannot upgrade share audience to realtime reading',()=>{
  for(const accept of ['application/json','text/event-stream'])assert.equal(request('/events?after=0',{token:token(1,{aud:'share-read'}),headers:{Accept:accept}}).status,403);
  assert.equal(request('/events?after=0&limit=51',{token:token()}).status,422);
  assert.equal(request('/events?after=0&after=1',{token:token()}).status,422);
});
test('RT03: a real WebSocket stops subsequent event output after session revocation',async()=>{
  const user=8,first=randomUUID(),after=Number(sql('SELECT coalesce(max(sequence),0) FROM core.event_delivery;').trim());
  const deliver=(id:string)=>sql(`INSERT INTO core.event_delivery(event_id,event_type,aggregate_id,aggregate_version,recipient,environment,owner_plugin,lifecycle_epoch)
    VALUES('${id}','access.changed','40000000-0000-4000-8000-000000000001',1,'${account(user)}','${env}','core',1);`);
  deliver(first);
  const config=[`url = "http://api-gw:8000/functions/v1/core/api/v1/events?after=${after}&limit=20"`,'silent','show-error','include','no-buffer','max-time = 10',
    `header = ${JSON.stringify(`apikey: ${environment().ANON_KEY}`)}`,`header = ${JSON.stringify(`Authorization: Bearer ${token(user)}`)}`,
    'header = "Connection: Upgrade"','header = "Upgrade: websocket"','header = "Sec-WebSocket-Version: 13"','header = "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ=="'].join('\n');
  const child=spawn('docker',[...coreComposeArguments(),'exec','-T','db','curl','--http1.1','--config','-'],{stdio:['pipe','pipe','pipe'],timeout:15000});
  let output='';child.stdout.setEncoding('utf8').on('data',value=>{output+=value;});child.stderr.resume();child.stdin.end(config+'\n');
  const done=new Promise<void>(resolve=>child.once('close',()=>resolve()));
  try{
    for(let count=0;count<50 && !output.includes(first);count++)await pause(100);
    assert.match(output,/101 Switching Protocols/);assert.ok(output.includes(first),'The real upgraded connection must deliver its first current event');
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id='${session(user)}';`);
    const forbidden=randomUUID();deliver(forbidden);await done;assert.equal(output.includes(forbidden),false);
  }finally{child.kill();sql(`UPDATE core.session_registry SET revoked_at=NULL WHERE session_id='${session(user)}';`);}
});
