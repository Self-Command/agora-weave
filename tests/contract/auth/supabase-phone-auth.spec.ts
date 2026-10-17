import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {setImmediate} from 'node:timers/promises';
import {requestPhoneOtp,verifyPhoneOtp,AuthError} from '../../../supabase/functions/core/adapters/supabase-phone-auth.ts';
import type {VerifyPhoneAccess,VerifiedPhoneActor} from '../../../supabase/functions/core/adapters/supabase-phone-auth.ts';

const phone='+8613800000000',otp='123456',secret='SYNTHETIC_AUTH_SIGNATURE_KEY_ONLY';
const account='10000000-0000-4000-8000-000000000001',session='20000000-0000-4000-8000-000000000001';
const actor:VerifiedPhoneActor={account,session,audience:'authenticated',expires_at:Math.floor(Date.now()/1000)+600};
const baseClaims={sub:account,session_id:session,aud:'authenticated',role:'authenticated',phone:phone.slice(1),exp:actor.expires_at};
function token(patch:Record<string,unknown>={}) {
  const input=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+
    Buffer.from(JSON.stringify({...baseClaims,...patch})).toString('base64url');
  return input+'.'+createHmac('sha256',secret).update(input).digest('base64url');
}
// Independent signature verification callback; transport never supplies an authoritative actor.
const verifyAccess:VerifyPhoneAccess=async value=>{
  const parts=value.split('.'),signature=createHmac('sha256',secret).update(parts[0]+'.'+parts[1]).digest();
  const supplied=Buffer.from(parts[2],'base64url');
  if(supplied.length!==signature.length || !timingSafeEqual(supplied,signature)) return null;
  return {...actor};
};
const body=()=>({access_token:token(),refresh_token:'Abc123456xyz',token_type:'bearer',expires_at:1,expires_in:1,
  user:{id:account,phone:phone.slice(1),phone_confirmed_at:new Date(Date.now()-60000).toISOString(),role:'authenticated',aud:'authenticated'}});
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json'}});
const verify=(transport:typeof fetch,callback:VerifyPhoneAccess=verifyAccess)=>verifyPhoneOtp(phone,otp,callback,transport);
const error=(code:string)=>(value:unknown)=>{
  assert.ok(value instanceof AuthError);assert.equal(value.code,code);assert.equal(value.message,code);
  assert.deepEqual(Object.keys(value).sort(),['code','name']);
  assert.doesNotMatch(String(value)+JSON.stringify(value),/SENSITIVE_UPSTREAM|13800000000|123456|SYNTHETIC_AUTH|Abc123456xyz/);
  return true;
};

test('PA01: login and registration request only the official fixed phone SMS operation with explicit account-creation policy',async()=>{
  for(const purpose of ['login','register'] as const) {
    let calls=0;
    await requestPhoneOtp(phone,purpose,async(url,options)=>{
      calls++;assert.equal(url,'http://auth:9999/otp');assert.equal(options?.method,'POST');
      assert.equal(options?.redirect,'manual');assert.equal(options?.credentials,'omit');
      assert.deepEqual(JSON.parse(String(options?.body)),{phone,channel:'sms',create_user:purpose==='register'});
      assert.deepEqual(Object.fromEntries(new Headers(options?.headers)),{'accept':'application/json','content-type':'application/json'});
      assert.deepEqual(Object.keys(options!).sort(),['body','credentials','headers','method','redirect','signal']);
      assert.ok(options?.signal instanceof AbortSignal);return json({});
    });
    assert.equal(calls,1);
  }
  await requestPhoneOtp(phone,'login',async()=>json({message_id:'provider-reference'}));
});

test('PA02: malformed phone purpose email password data or upstream URL inputs never reach transport',async()=>{
  let calls=0;const transport:typeof fetch=async()=>{calls++;return json({});};
  for(const bad of ['13800000000','+013800000000','+123','+1234567890123456','+8613800000000\n','+8613800000000,+85251234567',
    'http://example.invalid/otp', {phone,email:'person@example.invalid',password:'SENSITIVE_UPSTREAM',data:{admin:true}},null]) {
    await assert.rejects(requestPhoneOtp(bad as string,'login',transport),error('SERVICE_UNAVAILABLE'));
    await assert.rejects(verifyPhoneOtp(bad as string,otp,verifyAccess,transport),error('AUTH_FAILED'));
  }
  await assert.rejects(requestPhoneOtp(phone,'email' as 'login',transport),error('SERVICE_UNAVAILABLE'));
  for(const bad of ['12345','1234567','１２３４５６','123456\n',null,{token:otp,password:'SENSITIVE_UPSTREAM'}])
    await assert.rejects(verifyPhoneOtp(phone,bad as string,verifyAccess,transport),error('AUTH_FAILED'));
  await assert.rejects(verifyPhoneOtp(phone,otp,null as unknown as VerifyPhoneAccess,transport),error('SERVICE_UNAVAILABLE'));
  assert.equal(calls,0);
});

test('PA03: verification cross-checks the actual phone user and signed actor and uses only signed expiry',async()=>{
  let calls=0,verified=0;const result=body();
  const output=await verify(async(url,options)=>{
    calls++;assert.equal(url,'http://auth:9999/verify');assert.equal(options?.method,'POST');
    assert.equal(options?.redirect,'manual');assert.equal(options?.credentials,'omit');
    assert.deepEqual(JSON.parse(String(options?.body)),{phone,token:otp,type:'sms'});
    assert.equal(new Headers(options?.headers).has('authorization'),false);return json(result);
  },async value=>{verified++;assert.equal(value,result.access_token);return await verifyAccess(value);});
  assert.deepEqual(output,{actor,tokens:{access_token:result.access_token,refresh_token:result.refresh_token,expires_at:actor.expires_at}});
  assert.equal(calls,1);assert.equal(verified,1);
  assert.deepEqual(await verifyPhoneOtp('+85251234567',otp,verifyAccess,async()=>json({...result,
    access_token:token({phone:'85251234567'}),user:{...result.user,phone:'85251234567'}})),
    {actor,tokens:{access_token:token({phone:'85251234567'}),refresh_token:result.refresh_token,expires_at:actor.expires_at}});
});

test('PA04: signature rejection exceptions expired actors and unauthorized audiences cannot produce a session',async()=>{
  for(const callback of [async()=>null,async()=>{throw new Error('SENSITIVE_UPSTREAM');},
    async()=>({...actor,expires_at:Math.floor(Date.now()/1000)-1}),async()=>({...actor,expires_at:NaN}),
    async()=>({...actor,audience:'share-read'}),async()=>({...actor,account:'not-a-uuid'}),async()=>({...actor,session:'not-a-session'})]) {
    await assert.rejects(verify(async()=>json(body()),callback),error('AUTH_FAILED'));
  }
  const invalid=body();invalid.access_token=invalid.access_token.slice(0,-2)+'aa';
  await assert.rejects(verify(async()=>json(invalid)),error('AUTH_FAILED'));
});

test('PA05: a valid signature never bypasses role subject session audience phone or expiry mismatches',async()=>{
  for(const patch of [{role:'service_role'},{role:'anon'},{role:null},{sub:'10000000-0000-4000-8000-000000000002'},
    {session_id:'20000000-0000-4000-8000-000000000002'},{aud:'share-read'},{aud:['authenticated']},
    {phone:'8613900000000'},{phone:null},{exp:actor.expires_at+1}]) {
    await assert.rejects(verify(async()=>json({...body(),access_token:token(patch)})),error('AUTH_FAILED'));
  }
});

test('PA06: response user identity phone confirmation and optional role must match the verified token',async()=>{
  for(const user of [{},null,{...body().user,id:'10000000-0000-4000-8000-000000000002'},
    {...body().user,phone:'8613900000000'},{...body().user,phone:' '+phone},{...body().user,phone_confirmed_at:null},
    {...body().user,phone_confirmed_at:'not-a-date'},{...body().user,phone_confirmed_at:'2025-02-30T00:00:00Z'},
    {...body().user,phone_confirmed_at:'2025-01-01T00:00:00+99:00'},
    {...body().user,phone_confirmed_at:new Date(Date.now()+60000).toISOString()},
    {...body().user,role:'service_role'},{...body().user,aud:'share-read'}]) {
    await assert.rejects(verify(async()=>json({...body(),user})),error(user===null?'AUTH_UNCONFIRMED':'AUTH_FAILED'));
  }
  const accepted=body();accepted.user.phone=phone;
  accepted.user.phone_confirmed_at=accepted.user.phone_confirmed_at.replace('Z','+00:00');
  assert.equal((await verify(async()=>json(accepted))).actor.account,account);
});

test('PA07: token syntax sizes bearer type and missing actual users are bounded before signature verification',async()=>{
  for(const patch of [{access_token:'not-a-token'},{access_token:'a.'.padEnd(9000,'a')+'.b'},
    {access_token:'eyJhbGciOiJIUzI1NiJ9.bm90LWpzb24.c2lnbmF0dXJl'},
    {refresh_token:'short'},{refresh_token:'a'.repeat(4097)},{refresh_token:'SENSITIVE_UPSTREAM\n'},
    {token_type:'Basic'},{token_type:null},{user:null}]) {
    await assert.rejects(verify(async()=>json({...body(),...patch})),error(patch.access_token?.startsWith('eyJ')?'AUTH_FAILED':'AUTH_UNCONFIRMED'));
  }
});

test('PA08: known client failures and rate limits have distinct request and verification classifications without retry',async()=>{
  for(const status of [400,401,403,404,422,429]) {
    let requests=0;const transport:typeof fetch=async()=>{requests++;return json({msg:'SENSITIVE_UPSTREAM'},status);};
    await assert.rejects(requestPhoneOtp(phone,'login',transport),error(status===429?'RATE_LIMITED':'SERVICE_UNAVAILABLE'));
    await assert.rejects(verify(transport),error(status===429?'RATE_LIMITED':'AUTH_FAILED'));assert.equal(requests,2);
  }
});

test('PA09: network server failures malformed JSON wrong response media and invalid request success shapes remain unconfirmed',async()=>{
  for(const transport of [async()=>{throw new TypeError('SENSITIVE_UPSTREAM');},
    async()=>json(body(),500),async()=>json({},503),async()=>new Response('{',{headers:{'content-type':'application/json'}}),
    async()=>new Response('SENSITIVE_UPSTREAM'),async()=>json(null),async()=>new Response(null,{status:204})]) {
    await assert.rejects(requestPhoneOtp(phone,'login',transport),error('AUTH_UNCONFIRMED'));
    await assert.rejects(verify(transport),error('AUTH_UNCONFIRMED'));
  }
  await assert.rejects(requestPhoneOtp(phone,'login',async()=>json(body())),error('AUTH_UNCONFIRMED'));
  await assert.rejects(requestPhoneOtp(phone,'login',async()=>json({message_id:123})),error('AUTH_UNCONFIRMED'));
});

test('PA10: redirects are disabled and followed or changed-origin replies never confirm a request',async()=>{
  for(const invoke of [(transport:typeof fetch)=>requestPhoneOtp(phone,'login',transport),verify]) {
    let calls=0;await assert.rejects(invoke(async(_url,options)=>{
      calls++;assert.equal(options?.redirect,'manual');return new Response(null,{status:302,headers:{location:'https://example.invalid/verify'}});
    }),error('AUTH_UNCONFIRMED'));assert.equal(calls,1);
    for(const metadata of [{redirected:true},{url:'http://example.invalid/verify'}]) {
      const result=json(body());for(const [key,value] of Object.entries(metadata)) Object.defineProperty(result,key,{value});
      await assert.rejects(invoke(async()=>result),error('AUTH_UNCONFIRMED'));
    }
  }
});

test('PA11: response bytes are bounded by declared and actual length and oversized streams are cancelled',async()=>{
  for(const invoke of [(transport:typeof fetch)=>requestPhoneOtp(phone,'login',transport),verify]) {
    let cancelled=false;const stream=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new Uint8Array(16385));},cancel(){cancelled=true;}});
    await assert.rejects(invoke(async()=>new Response(stream,{headers:{'content-type':'application/json'}})),error('AUTH_UNCONFIRMED'));
    assert.equal(cancelled,true);
    for(const length of ['16385','not-a-size','1'])
      await assert.rejects(invoke(async()=>new Response(JSON.stringify(body()),{headers:{'content-type':'application/json','content-length':length}})),error('AUTH_UNCONFIRMED'));
  }
});

test('PA12: stalled transport and response bodies share one eight-second timeout and are aborted without retry',async(context)=>{
  context.mock.timers.enable({apis:['setTimeout']});
  for(const stallBody of [false,true]) {
    let started!:()=>void,signal:AbortSignal|undefined,cancelled=false,calls=0;const ready=new Promise<void>(resolve=>{started=resolve;});
    const pending=verify(async(_url,options)=>{
      calls++;signal=options?.signal||undefined;
      if(!stallBody) {started();return new Promise<Response>(()=>{});}
      return new Response(new ReadableStream<Uint8Array>({pull(){started();return new Promise<void>(()=>{});},cancel(){cancelled=true;}}),
        {headers:{'content-type':'application/json'}});
    });
    await ready;await setImmediate();const rejected=assert.rejects(pending,error('AUTH_UNCONFIRMED'));
    context.mock.timers.tick(8000);await rejected;assert.equal(signal?.aborted,true);assert.equal(calls,1);
    if(stallBody) assert.equal(cancelled,true);
  }
});

test('PA13: signature verification cannot extend the total request deadline or return a late session',async(context)=>{
  context.mock.timers.enable({apis:['setTimeout']});
  let started!:()=>void,finish!:(value:VerifiedPhoneActor)=>void;const ready=new Promise<void>(resolve=>{started=resolve;});
  const pending=verify(async()=>json(body()),async()=>{started();return new Promise(resolve=>{finish=resolve;});});
  await ready;const rejected=assert.rejects(pending,error('AUTH_UNCONFIRMED'));context.mock.timers.tick(8000);await rejected;
  finish(actor);await setImmediate();
});
