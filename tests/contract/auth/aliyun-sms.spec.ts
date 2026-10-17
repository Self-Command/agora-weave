import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createHash,createHmac} from 'node:crypto';
import {setImmediate} from 'node:timers/promises';
import {sendAliyunSms,SmsError} from '../../../supabase/functions/core/adapters/aliyun-sms.ts';
import type {AliyunSmsInput,AliyunSmsConfig} from '../../../supabase/functions/core/adapters/aliyun-sms.ts';

const input={phone:'+8613800000000',otp:'123456',requestId:'a4000000-0000-4000-8000-000000000001'};
const config={accessKeyId:'testAccessKeyId',accessKeySecret:'testAccessKeySecret',signName:'测试签名',templateCode:'SMS_123456'};
const now=()=>new Date('2025-04-16T07:45:55.789Z');
const nonce=()=>'315484d3-b129-4966-974a-699b7ee56647';
const accepted={Code:'OK',RequestId:'F655A8D5-B967-440B-8683-DAD6FF8DE990',BizId:'90061974693649840000'};
const response=(body:unknown=accepted,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json;charset=utf-8'}});
const checkError=(code:string)=>(error:unknown)=>{
  assert.ok(error instanceof SmsError); assert.equal(error.code,code); assert.equal(error.message,code);
  assert.deepEqual(Object.keys(error).sort(),['code','name']);
  assert.doesNotMatch(String(error)+JSON.stringify(error),/testAccessKey|13800000000|123456|SENSITIVE_UPSTREAM|TemplateParam/);
  return true;
};
const send=(transport:typeof fetch,patch:Partial<AliyunSmsInput>={})=>sendAliyunSms({...input,...patch},config,transport,now,nonce);

test('AS01: real WebCrypto matches an independently calculated ACS3 SendSms vector and signs the exact private form payload',async()=>{
  // Official canonicalization: https://help.aliyun.com/zh/sdk/product-overview/v3-request-structure-and-signature
  // Synthetic SendSms vector independently calculated with Node crypto, not the adapter helpers.
  const body='OutId=a4000000-0000-4000-8000-000000000001&PhoneNumbers=8613800000000&SignName=%E6%B5%8B%E8%AF%95%E7%AD%BE%E5%90%8D&TemplateCode=SMS_123456&TemplateParam=%7B%22code%22%3A%22123456%22%7D';
  const payloadHash='c85e785039ddba12cc3d5824034027f7bb0efa4e60550b5ace9ba83cc8d1370a';
  const signed='content-type;host;x-acs-action;x-acs-content-sha256;x-acs-date;x-acs-signature-nonce;x-acs-version';
  const canonical=`POST\n/\n\ncontent-type:application/x-www-form-urlencoded\nhost:dysmsapi.aliyuncs.com\nx-acs-action:SendSms\nx-acs-content-sha256:${payloadHash}\nx-acs-date:2025-04-16T07:45:55Z\nx-acs-signature-nonce:${nonce()}\nx-acs-version:2017-05-25\n\n${signed}\n${payloadHash}`;
  const canonicalHash='bd2ec496be79c2d0f59515e160ed9579f6b57cbfd95a5ef00d3ba66155f9f005';
  const signature='a0e3d65731ebbacb1bc78601f3900816ea259c0b965741501449be0b7c94b95f';
  assert.equal(createHash('sha256').update(body).digest('hex'),payloadHash);
  assert.equal(createHash('sha256').update(canonical).digest('hex'),canonicalHash);
  assert.equal(createHmac('sha256',config.accessKeySecret).update(`ACS3-HMAC-SHA256\n${canonicalHash}`).digest('hex'),signature);
  let calls=0;
  const transport:typeof fetch=async(url,options)=>{
    calls++; assert.equal(url,'https://dysmsapi.aliyuncs.com/'); assert.equal(options?.method,'POST');
    assert.equal(options?.redirect,'manual'); assert.equal(options?.credentials,'omit');
    assert.ok(options?.signal instanceof AbortSignal); assert.equal(options.body,body);
    const headers=new Headers(options.headers);
    assert.equal(headers.get('accept'),'application/json');
    assert.equal(headers.get('x-acs-content-sha256'),payloadHash);
    assert.equal(headers.get('x-acs-date'),'2025-04-16T07:45:55Z');
    assert.equal(headers.get('authorization'),`ACS3-HMAC-SHA256 Credential=testAccessKeyId,SignedHeaders=${signed},Signature=${signature}`);
    assert.equal(new URLSearchParams(String(options.body)).get('OutId'),input.requestId);
    return response();
  };
  assert.deepEqual(await send(transport),{provider_ref:accepted.BizId}); assert.equal(calls,1);
});

test('AS02: trusted E164 mainland Hong Kong and international numbers preserve country codes for the fixed China-site endpoint',async()=>{
  // SendSms PhoneNumbers: https://help.aliyun.com/zh/sms/developer-reference/api-dysmsapi-2017-05-25-sendsms
  for(const phone of ['+8613800000000','+85251234567','+14155550100','+442079460000']) {
    await send(async(url,options)=>{
      assert.equal(url,'https://dysmsapi.aliyuncs.com/');
      assert.equal(new URLSearchParams(String(options?.body)).get('PhoneNumbers'),phone.slice(1));
      return response();
    },{phone});
  }
});

test('AS03: malformed inputs and missing or unsafe credentials never reach transport',async()=>{
  let calls=0; const transport:typeof fetch=async()=>{calls++;return response();};
  const inputs:unknown[]=[null,{}, {...input,extra:true},...['13800000000','+013800000000','+8613800000000,+85251234567','+1\n23456789','+123','+1234567890123456'].map(phone=>({...input,phone})),
    ...['12345','1234567','１２３４５６','12345\n','123456\n'].map(otp=>({...input,otp})),{...input,phone:input.phone+'\n'},{...input,requestId:'not-an-operation'}];
  for(const candidate of inputs) await assert.rejects(sendAliyunSms(candidate as AliyunSmsInput,config,transport,now,nonce),checkError('SERVICE_UNAVAILABLE'));
  const configs:unknown[]=[null,{}, {...config,endpoint:'https://example.invalid'}, {...config,accessKeyId:''},
    {...config,accessKeySecret:''},{...config,accessKeyId:'bad\r\nheader'},{...config,accessKeySecret:'bad\r\nsecret'},
    {...config,signName:' 签名'},{...config,signName:'签名\n注入'}, {...config,templateCode:'SMS_1&PhoneNumbers=1'}];
  for(const candidate of configs) await assert.rejects(sendAliyunSms(input,candidate as AliyunSmsConfig,transport,now,nonce),checkError('SERVICE_UNAVAILABLE'));
  assert.equal(calls,0);
});

test('AS04: invalid clocks or nonce sources fail before transport and sanitize thrown causes',async()=>{
  let calls=0; const transport:typeof fetch=async()=>{calls++;return response();};
  await assert.rejects(sendAliyunSms(input,config,transport,()=>new Date('invalid'),nonce),checkError('SERVICE_UNAVAILABLE'));
  await assert.rejects(sendAliyunSms(input,config,transport,now,()=>''),checkError('SERVICE_UNAVAILABLE'));
  await assert.rejects(sendAliyunSms(input,config,transport,()=>{throw new Error('SENSITIVE_UPSTREAM');},nonce),checkError('SERVICE_UNAVAILABLE'));
  assert.equal(calls,0);
});

test('AS05: definite provider rejection is unavailable and never retried or exposed in errors',async()=>{
  for(const status of [200,400,403,429]) {
    let calls=0;
    await assert.rejects(send(async()=>{calls++;return response({...accepted,Code:'isv.BUSINESS_LIMIT_CONTROL',Message:'SENSITIVE_UPSTREAM'},status);}),checkError('SERVICE_UNAVAILABLE'));
    assert.equal(calls,1);
  }
});

test('AS06: 5xx network failures and rejected HTTP success claims remain unconfirmed without automatic retry',async()=>{
  for(const status of [500,502,503]) {
    let calls=0;
    await assert.rejects(send(async()=>{calls++;return response(accepted,status);}),checkError('SMS_UNCONFIRMED'));
    assert.equal(calls,1);
  }
  await assert.rejects(send(async()=>{throw new TypeError('SENSITIVE_UPSTREAM '+config.accessKeySecret);}),checkError('SMS_UNCONFIRMED'));
  await assert.rejects(send(async()=>response(accepted,400)),checkError('SMS_UNCONFIRMED'));
});

test('AS07: manual redirects and unexpectedly followed or changed-origin responses never become accepted',async()=>{
  let calls=0;
  await assert.rejects(send(async(_url,options)=>{
    calls++; assert.equal(options?.redirect,'manual');
    return new Response(null,{status:307,headers:{location:'https://example.invalid/leak'}});
  }),checkError('SMS_UNCONFIRMED'));
  assert.equal(calls,1);
  for(const metadata of [{redirected:true},{url:'https://example.invalid/'}]) {
    const changed=response(); for(const [key,value] of Object.entries(metadata)) Object.defineProperty(changed,key,{value});
    await assert.rejects(send(async()=>changed),checkError('SMS_UNCONFIRMED'));
  }
});

test('AS08: malformed missing or hostile response identifiers never confirm submission',async()=>{
  for(const body of [null,[],{}, {...accepted,RequestId:'bad'}, {...accepted,RequestId:null}, {...accepted,BizId:''},
    {...accepted,BizId:'SENSITIVE_UPSTREAM\n'}, {...accepted,BizId:123}, {...accepted,Code:'ok'}, {...accepted,Code:null}]) {
    await assert.rejects(send(async()=>response(body)),checkError(body && !Array.isArray(body) && 'Code' in body && body.Code==='ok'?'SERVICE_UNAVAILABLE':'SMS_UNCONFIRMED'));
  }
  assert.deepEqual(await send(async()=>response({...accepted,BizId:'134523^435123456'})),{provider_ref:'134523^435123456'});
});

test('AS09: wrong media types malformed JSON invalid UTF8 and missing bodies remain unconfirmed',async()=>{
  for(const candidate of [new Response('SENSITIVE_UPSTREAM'),new Response('{',{headers:{'content-type':'application/json'}}),
    new Response(new Uint8Array([0xff]),{headers:{'content-type':'application/json'}}),new Response(null,{status:204})]) {
    await assert.rejects(send(async()=>candidate),checkError('SMS_UNCONFIRMED'));
  }
});

test('AS10: oversized declared or streamed responses are bounded cancelled and unconfirmed',async()=>{
  let cancelled=false;
  const stream=new ReadableStream<Uint8Array>({start(controller){controller.enqueue(new Uint8Array(16385));},cancel(){cancelled=true;}});
  await assert.rejects(send(async()=>new Response(stream,{headers:{'content-type':'application/json'}})),checkError('SMS_UNCONFIRMED'));
  assert.equal(cancelled,true);
  for(const length of ['16385','not-a-size','1']) {
    await assert.rejects(send(async()=>new Response(JSON.stringify(accepted),{headers:{'content-type':'application/json','content-length':length}})),checkError('SMS_UNCONFIRMED'));
  }
});

test('AS11: a transport that never settles is timed out aborted and unconfirmed exactly once',async(context)=>{
  context.mock.timers.enable({apis:['setTimeout']});
  let started!:()=>void; const ready=new Promise<void>(resolve=>{started=resolve;});
  let signal:AbortSignal|undefined; let calls=0;
  const pending=send(async(_url,options)=>{calls++;signal=options?.signal||undefined;started();return new Promise<Response>(()=>{});});
  await ready; const rejected=assert.rejects(pending,checkError('SMS_UNCONFIRMED'));
  context.mock.timers.tick(10000); await rejected;
  assert.equal(signal?.aborted,true); assert.equal(calls,1);
});

test('AS12: a stalled response body is also covered by the same timeout and is cancelled',async(context)=>{
  context.mock.timers.enable({apis:['setTimeout']});
  let cancelled=false,started!:()=>void; const ready=new Promise<void>(resolve=>{started=resolve;});
  const pending=send(async()=>{
    const stream=new ReadableStream<Uint8Array>({pull(){started();return new Promise<void>(()=>{});},cancel(){cancelled=true;}});
    return new Response(stream,{headers:{'content-type':'application/json'}});
  });
  await ready; await setImmediate(); const rejected=assert.rejects(pending,checkError('SMS_UNCONFIRMED'));
  context.mock.timers.tick(10000); await rejected; assert.equal(cancelled,true);
});
