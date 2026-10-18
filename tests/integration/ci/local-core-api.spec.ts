import assert from 'node:assert/strict';
import {test} from 'node:test';
import {once} from 'node:events';
import {request as httpRequest,createServer} from 'node:http';
import {execFile} from 'node:child_process';
import type {Server} from 'node:http';
import {createLocalCoreApi,curlRequestConfig} from '../../../tools/dev/local-core-api.mjs';

type Forward={path:string;method:string;headers:Record<string,string>;body?:string|Buffer;media?:boolean;binary?:boolean};
type Reply={status:number;body:string|Buffer;headers?:Record<string,string>};

test('LC10: real curl sends URL glob characters as one literal request',async()=>{
  const seen:string[]=[];
  const server=createServer((request,response)=>{seen.push(request.url!);request.resume();response.end('{}');});
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');
  const path='/core/api/v1/auth/refresh?x={a,b}&y=[1-3]';
  try {
    const output=await new Promise<string>((resolve,reject)=>{
      const child=execFile('curl',['--config','-'],{encoding:'utf8',windowsHide:true,timeout:10000},(error,stdout)=>error?reject(error):resolve(stdout));
      child.stdin!.end(curlRequestConfig(`http://127.0.0.1:${address.port}${path}`,'POST',{'content-type':'application/json'},'{}'));
    });
    assert.equal(output,'{}\n200');assert.deepEqual(seen,[path]);
  }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
const uuid='10000000-0000-4000-8000-000000000001',prefix='/core/api/v1';
async function fixture(run:(port:number,server:Server)=>Promise<void>,forward:(input:Forward)=>Promise<Reply>=async()=>({status:200,body:'{"data":{"synthetic":true}}'})) {
  const server=createLocalCoreApi({environment:'dev',forward});server.listen(0);await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address==='object');
  try {await run(address.port,server);}finally {server.closeAllConnections();await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
}
function request(port:number,path:string,options:{method?:string;headers?:Record<string,string>;body?:string|Uint8Array;chunks?:string[]}={}) {
  return new Promise<{status:number;headers:Record<string,unknown>;body:string}>((resolve,reject)=>{
    const req=httpRequest({host:'127.0.0.1',port,path,method:options.method||'GET',headers:{connection:'close',
      ...(options.body!==undefined?{'content-length':String(Buffer.byteLength(options.body))}:{}),...options.headers}},res=>{
      let body='';res.setEncoding('utf8');res.on('data',chunk=>{body+=chunk;});res.on('end',()=>resolve({status:res.statusCode!,headers:res.headers,body}));
    });req.on('error',reject);for(const chunk of options.chunks||[])req.write(chunk);req.end(options.body);
  });
}
const jsonHeaders={'content-type':'application/json'};

test('LC01: process readiness is loopback only and never claims backend business health',async()=>{
  let forwarded=0;
  assert.throws(()=>createLocalCoreApi({environment:'production',forward:async()=>({status:200,body:'{}'})}));
  await fixture(async(port,server)=>{
    assert.equal((server.address() as {address:string}).address,'127.0.0.1');
    const result=await request(port,'/status');assert.equal(result.status,200);
    assert.deepEqual(JSON.parse(result.body),{ready:true,environment:'dev'});
    assert.equal(result.headers['cache-control'],'no-store');assert.equal(result.headers['x-content-type-options'],'nosniff');
    assert.equal(forwarded,0);
  },async()=>{forwarded++;throw new Error('Backend offline');});
  const server=createLocalCoreApi({environment:'test',forward:async()=>({status:200,body:'{}'})});
  assert.throws(()=>server.listen(0,'0.0.0.0'));
});

test('LC02: only explicit app and admin routes and methods are forwarded',async()=>{
  const forwarded:Forward[]=[];
  await fixture(async port=>{
    for(const [method,path] of [['POST','/auth/challenges'],['POST','/auth/verify'],['POST',`/auth/operations/${uuid}`],
      ['GET','/feeds/latest?limit=20'],['GET',`/posts/${uuid}`],['POST','/auth/password'],['POST','/auth/password/captcha'],['POST','/auth/password/forgot'],
      ['POST','/auth/refresh'],['POST','/auth/logout'],['GET','/documents/current?kind=terms&surface=app&locale=zh-CN'],
      ['GET','/me/sessions?limit=20'],['DELETE',`/me/sessions/${uuid}`],['POST','/recovery-cases'],['GET',`/recovery-cases/${uuid}`],
      ['GET',`/profiles/${uuid}`],['PATCH','/me/profile'],['POST','/reports'],['GET','/me/reports?limit=20'],
      ['POST','/uploads'],['POST',`/uploads/${uuid}/complete`],
      ['GET',`/operations/${uuid}`],['GET','/admin/session'],['GET','/admin/accounts?limit=20'],['GET','/admin/mfa/factors'],
      ['POST','/admin/mfa/factors'],['POST','/admin/mfa/challenges'],['POST','/admin/mfa/verify'],['POST','/admin/stepup'],
      ['GET','/admin/config/definitions?group=otp'],['POST','/admin/config/previews'],['POST','/admin/config/releases'],['POST','/admin/config/rollbacks']]) {
      const writing=['POST','PATCH','DELETE'].includes(method);
      assert.equal((await request(port,prefix+path,{method,headers:writing?jsonHeaders:{},body:writing?'{}':undefined})).status,200);
      assert.equal(forwarded.at(-1)?.path,prefix+path);assert.equal(forwarded.at(-1)?.method,method);
    }
    const count=forwarded.length;
    assert.equal((await request(port,prefix+'/auth/verify')).status,405);
    for(const path of ['/auth/v1/admin/users',prefix+'/admin/users',prefix+'/admin/mfa/factors/'+uuid,
      prefix+'/config/effective'])assert.equal((await request(port,path)).status,404);
    assert.equal(forwarded.length,count);
  },async input=>{forwarded.push(input);return {status:200,body:'{}'};});
});

test('LC03: raw absolute encoded traversal backslash and duplicate-slash targets cannot select another backend',async()=>{
  let calls=0;
  await fixture(async port=>{
    for(const path of ['http://example.invalid'+prefix+'/admin/session','//example.invalid'+prefix+'/admin/session',
      prefix+'//admin/session',prefix+'/admin/../session',prefix+'/admin/%2e%2e/session',prefix+'/admin%2fsession',
      prefix+'/admin\\session',prefix+'/admin/session#fragment','/core/api/v10/admin/session']) {
      assert.equal((await request(port,path)).status,404);
    }
    assert.equal(calls,0);
  },async()=>{calls++;return {status:200,body:'{}'};});
});

test('LC04: Host and browser Origin checks prevent rebinding while native calls and the two admin origins work',async()=>{
  let calls=0;
  await fixture(async port=>{
    for(const host of ['example.invalid','127.0.0.1.example.invalid','0.0.0.0','2130706433',`localhost:${port===65535?65534:port+1}`])
      assert.equal((await request(port,prefix+'/admin/session',{headers:{host}})).status,403);
    for(const origin of ['null','https://localhost:3000','http://localhost:3001','http://example.invalid','http://127.0.0.1:3000.evil'])
      assert.equal((await request(port,prefix+'/admin/session',{headers:{origin}})).status,403);
    assert.equal(calls,0);
    for(const host of ['127.0.0.1','localhost','[::1]','10.0.2.2'])
      assert.equal((await request(port,prefix+'/admin/session',{headers:{host:`${host}:${port}`}})).status,200);
    for(const origin of ['http://localhost:3000','http://127.0.0.1:3000']) {
      const reply=await request(port,prefix+'/admin/session',{headers:{origin}});
      assert.equal(reply.status,200);assert.equal(reply.headers['access-control-allow-origin'],origin);
      assert.equal(reply.headers['access-control-allow-credentials'],undefined);
    }
  },async()=>{calls++;return {status:200,body:'{}'};});
});

test('LC05: preflight permits only the actual fixed method and three supported browser headers',async()=>{
  let calls=0;
  await fixture(async port=>{
    const headers={origin:'http://localhost:3000','access-control-request-method':'POST',
      'access-control-request-headers':'Authorization, Content-Type, X-Client-Release'};
    const valid=await request(port,prefix+'/auth/verify',{method:'OPTIONS',headers});
    assert.equal(valid.status,204);assert.equal(valid.headers['access-control-allow-methods'],'POST');
    assert.equal(calls,0);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'OPTIONS',headers:{...headers,'access-control-request-method':'GET'}})).status,403);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'OPTIONS',headers:{...headers,'access-control-request-headers':'X-Core-Ingress-Token'}})).status,403);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'OPTIONS'})).status,403);
  },async()=>{calls++;return {status:200,body:'{}'};});
});

test('LC06: only bounded Bearer and client release survive; cookies identity headers caller API keys and hosts are dropped',async()=>{
  const received:Forward[]=[];
  await fixture(async port=>{
    const headers={...jsonHeaders,authorization:'Bearer abc.def.ghi','x-client-release':'fixture-v1',cookie:'SENSITIVE_COOKIE',
      apikey:'SENSITIVE_CLIENT_APIKEY','x-core-ingress-token':'forged','x-core-client-ip':'1.2.3.4','x-forwarded-for':'5.6.7.8','x-role':'service_role'};
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers,body:'{"operation_id":"synthetic"}'})).status,200);
    assert.deepEqual(received[0],{path:prefix+'/auth/verify',method:'POST',body:'{"operation_id":"synthetic"}',media:false,binary:false,
      headers:{accept:'application/json','content-type':'application/json',authorization:'Bearer abc.def.ghi','x-client-release':'fixture-v1'}});
    for(const authorization of ['Basic abc','Bearer none','Bearer '+'a'.repeat(8192)])
      assert.equal((await request(port,prefix+'/admin/session',{headers:{authorization}})).status,400);
    assert.equal((await request(port,prefix+'/admin/session',{headers:{'x-client-release':'invalid release'}})).status,400);
    assert.equal(received.length,1);
  },async value=>{received.push(value);return {status:200,body:'{}'};});
});

test('LC07: JSON write bodies are bounded in declared and actual bytes and invalid media or UTF8 is rejected',async()=>{
  let calls=0;
  await fixture(async port=>{
    for(const body of ['','{','null','[]'])
      assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers:jsonHeaders,body})).status,400);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers:jsonHeaders,body:new Uint8Array([255])})).status,400);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',body:'{}'})).status,400);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers:{...jsonHeaders,'content-length':'16385'},body:'{}'})).status,413);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers:jsonHeaders,chunks:['{"body":"','a'.repeat(16385),'"}']})).status,413);
    assert.equal((await request(port,prefix+'/admin/session',{headers:{'content-length':'2'},body:'{}'})).status,400);
    assert.equal(calls,0);
    assert.equal((await request(port,prefix+'/auth/verify',{method:'POST',headers:jsonHeaders,body:JSON.stringify({body:'a'.repeat(16373)})})).status,200);
    assert.equal(calls,1);
  },async()=>{calls++;return {status:200,body:'{}'};});
});

test('LC08: upstream faults invalid response shape redirects and oversize become sanitized unavailable responses',async()=>{
  const results:unknown[]=[new Error('SENSITIVE_STDERR'),{status:302,body:'{}'},{status:200,body:'not-json'},{status:200,body:'null'},
    {status:200,body:'[]'},{status:200,body:'x'.repeat(1048577)},{status:0,body:'{}'}];
  for(const value of results) await fixture(async port=>{
    const result=await request(port,prefix+'/admin/session');assert.equal(result.status,503);
    assert.deepEqual(JSON.parse(result.body),{code:'SERVICE_UNAVAILABLE'});assert.equal(result.body.includes('SENSITIVE_STDERR'),false);
  },async()=>{if(value instanceof Error)throw value;return value as Reply;});
  await fixture(async port=>{const result=await request(port,prefix+'/admin/session');assert.equal(result.status,401);
    assert.deepEqual(JSON.parse(result.body),{code:'SESSION_INVALID'});},async()=>({status:401,body:'{"code":"SESSION_INVALID"}'}));
});

test('LC09: at most four forwards run concurrently and a fifth request cannot enter the backend',async()=>{
  let entered=0,release!:()=>void,ready!:()=>void;const barrier=new Promise<void>(resolve=>{release=resolve;});
  const started=new Promise<void>(resolve=>{ready=resolve;});
  await fixture(async port=>{
    const pending=Array.from({length:4},()=>request(port,prefix+'/admin/session'));
    await started;
    try {assert.equal((await request(port,prefix+'/admin/session')).status,503);assert.equal(entered,4);}
    finally {release();await Promise.all(pending);}
    assert.equal((await request(port,prefix+'/admin/session')).status,200);assert.equal(entered,5);
  },async()=>{entered++;if(entered===4)ready();await barrier;return {status:200,body:'{}'};});
});

test('LC11: password BFF proof is format checked and forwarded only on the three exact server paths',async()=>{
  const received:Forward[]=[],proof={'x-admin-password-time':'1792252800','x-admin-password-nonce':uuid,'x-admin-password-signature':'a'.repeat(64)};
  await fixture(async port=>{
    for(const path of ['/auth/password','/auth/password/captcha','/auth/password/forgot']) {
      const reply=await request(port,prefix+path,{method:'POST',headers:{...jsonHeaders,...proof},body:'{}'});
      assert.equal(reply.status,200);
      assert.deepEqual(received.at(-1)?.headers,{accept:'application/json','content-type':'application/json',...proof});
    }
    const count=received.length;
    for(const invalid of [
      {...proof,'x-admin-password-time':'179225280'}, {...proof,'x-admin-password-time':'17922528000'},
      {...proof,'x-admin-password-nonce':'not-a-uuid'},{...proof,'x-admin-password-signature':'a'.repeat(63)},
      {...proof,'x-admin-password-signature':'g'.repeat(64)},{'x-admin-password-time':proof['x-admin-password-time']},
    ])assert.equal((await request(port,prefix+'/auth/password',{method:'POST',headers:{...jsonHeaders,...invalid},body:'{}'})).status,400);
    assert.equal(received.length,count);
    assert.equal((await request(port,prefix+'/auth/password',{method:'POST',headers:{...jsonHeaders,...proof,origin:'http://localhost:3000'},body:'{}'})).status,403);
    const preflight=await request(port,prefix+'/auth/password',{method:'OPTIONS',headers:{origin:'http://localhost:3000',
      'access-control-request-method':'POST','access-control-request-headers':'X-Admin-Password-Time, X-Admin-Password-Nonce, X-Admin-Password-Signature'}});
    assert.equal(preflight.status,403);assert.equal(received.length,count);
    for(const path of ['/auth/verify','/admin/config/previews']) {
      assert.equal((await request(port,prefix+path,{method:'POST',headers:{...jsonHeaders,...proof},body:'{}'})).status,200);
      assert.equal(Object.keys(received.at(-1)!.headers).some(name=>name.startsWith('x-admin-password-')),false);
    }
    assert.equal((await request(port,prefix+'/feeds/latest',{headers:proof})).status,200);
    assert.equal(Object.keys(received.at(-1)!.headers).some(name=>name.startsWith('x-admin-password-')),false);
    assert.equal((await request(port,prefix+'/auth/password/anything',{method:'POST',headers:{...jsonHeaders,...proof},body:'{}'})).status,404);
    assert.equal((await request(port,prefix+'/media/'+uuid,{method:'HEAD'})).status,405);
  },async value=>{received.push(value);return {status:200,body:'{}'};});
});

test('LC12: image part forwards only bounded opaque bytes with its exact operation identity',async()=>{
  const binary=Buffer.from([0,255,1,10,13,34,92]);
  let seen:Forward|undefined;
  await fixture(async port=>{
    const path=prefix+`/uploads/${uuid}/parts/0`;
    assert.equal((await request(port,path,{method:'PUT',headers:{'content-type':'application/octet-stream',
      'x-operation-id':uuid,authorization:'Bearer abc.def.ghi'},body:binary})).status,200);
    assert.equal(seen?.binary,true);assert.deepEqual(seen?.body,binary);
    assert.equal(seen?.headers['x-operation-id'],uuid);
    assert.equal(seen?.headers['content-length'],String(binary.length));
    const count=seen;
    assert.equal((await request(port,path,{method:'PUT',headers:{'content-type':'application/octet-stream'},body:binary})).status,400);
    assert.equal((await request(port,path,{method:'PUT',headers:{'content-type':'application/json','x-operation-id':uuid},body:'{}'})).status,400);
    assert.equal((await request(port,prefix+`/uploads/${uuid}/parts/1`,{method:'PUT',headers:{'content-type':'application/octet-stream','x-operation-id':uuid},body:binary})).status,404);
    assert.equal(seen,count);
  },async input=>{seen=input;return {status:200,body:'{}'};});
});

test('LC13: media forwards only recognized image bytes and preserves private response headers',async()=>{
  const bytes=Buffer.from([137,80,78,71,0,255,10]);
  await fixture(async port=>{
    const response=await new Promise<{status:number;headers:Record<string,unknown>;body:Buffer}>((resolve,reject)=>{
      const req=httpRequest({host:'127.0.0.1',port,path:prefix+`/media/${uuid}`,headers:{authorization:'Bearer abc.def.ghi'}},res=>{
        const parts:Buffer[]=[];res.on('data',(part:Buffer)=>parts.push(part));res.on('end',()=>resolve({status:res.statusCode!,headers:res.headers,body:Buffer.concat(parts)}));
      });req.on('error',reject);req.end();
    });
    assert.equal(response.status,200);assert.deepEqual(response.body,bytes);
    assert.equal(response.headers['cache-control'],'no-store');
    assert.equal(response.headers['content-type'],'image/png');
  },async input=>{assert.equal(input.media,true);return {status:200,body:bytes,headers:{'content-type':'image/png'}};});
});
