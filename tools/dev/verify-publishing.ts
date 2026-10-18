import assert from 'node:assert/strict';
import { createHash,randomBytes,randomUUID } from 'node:crypto';
import { existsSync,mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { deflateSync } from 'node:zlib';
import { compose,coreEnvironmentFile,sql } from '../ci/core-database.ts';
import { curlRequestConfig } from './local-core-api.mjs';

if(process.env.AGORAWEAVE_EXECUTION_SOURCE!=='local' || process.env.AGORAWEAVE_LOCAL_ENVIRONMENT!=='dev')
  throw new Error('Requires the existing isolated local dev runtime');
const privateDirectory=resolve('.agoraweave/local/dev');
const env=Object.fromEntries(readFileSync(coreEnvironmentFile(),'utf8').split(/\r?\n/).filter(line=>/^[A-Z][A-Z0-9_]*=/.test(line))
  .map(line=>[line.slice(0,line.indexOf('=')),line.slice(line.indexOf('=')+1)]));
const base='http://127.0.0.1:4821/core/api/v1';
const evidence:{name:string;status:string}[]=[];
const check=(name:string,value:unknown)=>{assert.ok(value,name);evidence.push({name,status:'passed'});};
function authRequest(path:string,body:unknown,admin=false) {
  const config=curlRequestConfig('http://auth:9999'+path,'POST',{'Content-Type':'application/json',
    apikey:env.ANON_KEY,Authorization:`Bearer ${admin?env.SERVICE_ROLE_KEY:env.ANON_KEY}`},JSON.stringify(body));
  const raw=compose(['exec','-T','db','curl','--config','-'],config),index=raw.lastIndexOf('\n');
  return {status:Number(raw.slice(index+1)),data:JSON.parse(raw.slice(0,index))};
}
async function call(path:string,token:string|null,method='GET',body?:unknown,extra:Record<string,string>={}) {
  const response=await fetch(base+path,{method,signal:AbortSignal.timeout(30000),
    headers:{'X-Client-Release':'0.0.0',...(token?{Authorization:`Bearer ${token}`} : {}),
      ...(body!==undefined?{'Content-Type':'application/json'}:{}),...extra},
    ...(body!==undefined?{body:body instanceof Uint8Array?body:JSON.stringify(body)}:{})});
  const raw=await response.text();
  let envelope;try {envelope=JSON.parse(raw);}catch {envelope=null;}
  return {status:response.status,data:envelope?.data,code:envelope?.code};
}
async function run() {
  const credentialFile=resolve('../.agoraweave/local/dev/app-test-credentials.md');
  const credentials=readFileSync(credentialFile,'utf8');
  const field=(name:string)=>credentials.match(new RegExp(`^${name}:\\s*(.+)$`,'m'))?.[1].trim().replace(/^`|`$/g,'');
  const trustedLogin=await call('/auth/dev-test-login',null,'POST',{username:field('Username'),password:field('Password')});
  check('configured App account authenticates through real dev login',trustedLogin.status===200 && trustedLogin.data?.session?.access_token);
  const trusted={id:trustedLogin.data.account.id,token:trustedLogin.data.session.access_token};
  const accountFile=resolve(privateDirectory,'publishing-verification-account.json');
  let ordinary:{id:string;phone:string;password:string};
  if(existsSync(accountFile))ordinary=JSON.parse(readFileSync(accountFile,'utf8'));
  else {
    const password=randomBytes(24).toString('base64url'),phone='+16505550127';
    const result=authRequest('/admin/users',{phone,password,phone_confirm:true,user_metadata:{local_synthetic:'publishing-verification'}},true);
    check('ordinary synthetic Auth account provisioned once',result.status===200 && typeof result.data.id==='string');
    ordinary={id:result.data.id,phone,password};
    writeFileSync(accountFile,JSON.stringify(ordinary),{mode:0o600});
  }
  const publisher=env.CORE_DEV_TEST_ACCOUNT_ID;
  const fixtureId=randomUUID(),document=randomUUID(),revision=randomUUID(),release=randomUUID(),invitation=randomUUID(),receipt=randomUUID();
  sql(`BEGIN; DO $fixture$ DECLARE digest text:=encode(sha256(convert_to('Synthetic local test admission','UTF8')),'hex');
    BEGIN
      INSERT INTO core.account(id) VALUES('${ordinary.id}') ON CONFLICT DO NOTHING;
      IF NOT EXISTS(SELECT 1 FROM core.admission a WHERE a.account_id='${ordinary.id}') THEN
        INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
          VALUES('${document}','synthetic.publishing.${fixtureId}','terms','zh-CN','${publisher}',ARRAY['app']);
        INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
          VALUES('${revision}','${document}',1,'Synthetic local test','Synthetic local test admission',digest,'ready','${publisher}');
        INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
          VALUES('${release}','${document}','${revision}',digest,'{"environment":"dev","surfaces":["app"],"purposes":["register"]}',
            'published','${publisher}',clock_timestamp());
        UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
        INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
          VALUES('${invitation}',encode(sha256(convert_to('${invitation}','UTF8')),'hex'),'${publisher}',clock_timestamp()+interval '1 hour');
        UPDATE core.invitation SET state='used',used_account_id='${ordinary.id}',used_at=clock_timestamp() WHERE id='${invitation}';
        INSERT INTO core.document_receipt(id,subject,release_id,revision_digest,presentation_ref,purpose,decision,request_id)
          VALUES('${receipt}','${ordinary.id}','${release}',digest,gen_random_uuid(),'register','consented',gen_random_uuid());
        INSERT INTO core.admission(account_id,invitation_id,phone_verified_at,age_declaration,terms_version,terms_receipt_id)
          VALUES('${ordinary.id}','${invitation}',clock_timestamp(),'{"version":"adult-18-v1","declared":true}','${release}','${receipt}');
        UPDATE core.managed_document SET active_release_id=NULL WHERE id='${document}';
        UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
      END IF;
      INSERT INTO core.profile(account_id,nickname,username) VALUES('${ordinary.id}','普通审核测试账号','ordinary_${ordinary.id.slice(0,8)}') ON CONFLICT DO NOTHING;
      INSERT INTO core.audit_event(actor,operation,object_ref,environment,plugin,reason,result,request_id)
        VALUES('${publisher}','dev.synthetic_account.verify','${ordinary.id}','dev','core','User-authorized publishing verification','ready',gen_random_uuid());
    END $fixture$; COMMIT;`);
  const login=authRequest('/token?grant_type=password',{phone:ordinary.phone,password:ordinary.password});
  check('ordinary account receives an official Auth password session',login.status===200 && login.data.access_token);
  const claims=JSON.parse(Buffer.from(login.data.access_token.split('.')[1],'base64url').toString());
  sql(`INSERT INTO core.session_registry(session_id,account_id,device_label)
    VALUES('${claims.session_id}','${ordinary.id}','Isolated publishing verification') ON CONFLICT DO NOTHING;`);
  const regular={id:ordinary.id,token:login.data.access_token};
  const runFile=resolve(privateDirectory,'publishing-verification-run.json');
  const state=existsSync(runFile)?JSON.parse(readFileSync(runFile,'utf8')):{};
  const remember=()=>writeFileSync(runFile,JSON.stringify(state,null,2),{mode:0o600});
  const op=(key:string)=>{state[key]??=randomUUID();remember();return state[key] as string;};
  const createText=async(actor:typeof trusted,name:string,expected:string)=>{
    const input={operation_id:op(`${name}.text`),type:'text',body:`本地发布验证 · ${name}`,
      visibility:'public',reply_scope:'all_readers'};
    const result=await call('/posts',actor.token,'POST',input);
    check(`${name} text receipt matches review policy`,result.status===202 && result.data?.publication_state===expected);
    const retry=await call('/posts',actor.token,'POST',input);
    check(`${name} exact text retry returns the same receipt`,retry.status===202 && JSON.stringify(retry.data)===JSON.stringify(result.data));
    const original=await call(`/operations/${input.operation_id}`,actor.token);
    check(`${name} original text operation resolves`,original.status===200 && original.data?.state==='succeeded' &&
      original.data.result?.resource_id===result.data.resource_id);
    return result.data;
  };
  const published=await createText(trusted,'trusted','published');
  const pending=await createText(regular,'ordinary','awaiting_review');
  const chunk=(name:string,bytes:Buffer)=>{
    const type=Buffer.from(name),size=Buffer.alloc(4),checksum=Buffer.alloc(4),data=Buffer.concat([type,bytes]);
    let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
    size.writeUInt32BE(bytes.length);checksum.writeUInt32BE((crc^0xffffffff)>>>0);
    return Buffer.concat([size,data,checksum]);
  };
  for(const [actor,name,expected] of [[trusted,'trusted','published'],[regular,'ordinary','awaiting_review']] as const) {
    const png=Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',Buffer.from('00000001000000010806000000','hex')),
      chunk('IDAT',deflateSync(Buffer.from([0,255,140,0,255]))),chunk('IEND',Buffer.alloc(0))]);
    const sha256=createHash('sha256').update(png).digest('hex');
    let image=state[`${name}.imageReceipt`];
    if(!image) {
      const upload=await call('/uploads',actor.token,'POST',{operation_id:op(`${name}.valid-png.upload`),intent:'post',kind:'image',size_bytes:png.length,sha256});
      check(`${name} real image upload allocation`,upload.status===200 && upload.data?.id);
      const id=upload.data.id;
      const part=await call(`/uploads/${id}/parts/0`,actor.token,'PUT',png,{'Content-Type':'application/octet-stream','X-Operation-Id':op(`${name}.valid-png.part`)});
      check(`${name} real Storage image bytes upload`,part.status===200);
      const complete=await call(`/uploads/${id}/complete`,actor.token,'POST',{operation_id:op(`${name}.valid-png.complete`),sha256});
      check(`${name} real Storage readback validates image (${complete.status}, ${String(complete.code || complete.data?.state)})`,complete.status===200 && complete.data?.state==='validated');
      const result=await call('/posts',actor.token,'POST',{operation_id:op(`${name}.image`),type:'images',body:`本地图片验证 · ${name}`,
        visibility:'public',reply_scope:'all_readers',media_refs:[complete.data.media_id]});
      check(`${name} image post receipt matches review policy`,result.status===202 && result.data?.publication_state===expected);
      image=result.data;state[`${name}.imageReceipt`]=image;state[`${name}.mediaId`]=complete.data.media_id;remember();
    }
    const imageOperation=await call(`/operations/${op(`${name}.image`)}`,actor.token);
    check(`${name} image receipt recoverable`,imageOperation.status===200 && imageOperation.data?.result?.resource_id===image.resource_id);
    const visible=await call(`/posts/${image.resource_id}`,null);
    check(`${name} image public read respects review`,visible.status===(expected==='published'?200:404));
    const mediaResponse=await fetch(base+`/media/${state[`${name}.mediaId`]}`,{signal:AbortSignal.timeout(30000)});
    check(`${name} media public read respects review`,mediaResponse.status===(expected==='published'?200:404));
    await mediaResponse.arrayBuffer();
    const comment=await call(`/posts/${published.resource_id}/comments`,actor.token,'POST',{
      operation_id:op(`${name}.comment`),body:`本地评论验证 · ${name}`});
    check(`${name} comment receipt matches review policy`,comment.status===202 && comment.data?.publication_state===expected);
    const commentOperation=await call(`/operations/${op(`${name}.comment`)}`,actor.token);
    check(`${name} comment original receipt resolves`,commentOperation.status===200 && commentOperation.data?.result?.resource_id===comment.data.resource_id);
    state[`${name}.commentId`]=comment.data.resource_id;remember();
  }
  const owned=await call('/me/contents?limit=50',regular.token);
  check('ordinary author can find the accepted pending post privately',owned.status===200 &&
    owned.data.items.some((item:any)=>item.resource_id===pending.resource_id && item.review_state==='pending'));
  check('private content list rejects anonymous requests',(await call('/me/contents',null)).status===401);
  const others=await call('/me/contents?limit=50',trusted.token);
  check('another account cannot find pending content in its private list',others.status===200 &&
    !others.data.items.some((item:any)=>item.resource_id===pending.resource_id));
  for(const token of [null,trusted.token,regular.token]) {
    const profile=await call(`/profiles/${regular.id}/contents?limit=50`,token);
    check('public profile list excludes pending content for every viewer',profile.status===200 &&
      !profile.data.items.some((item:any)=>item.id===pending.resource_id));
    const feed=await call('/feeds/latest?limit=50',token);
    check('latest feed excludes pending content for every viewer',feed.status===200 &&
      !feed.data.items.some((item:any)=>item.id===pending.resource_id));
  }
  const comments=await call(`/posts/${published.resource_id}/comments?limit=50&sort=latest`,null);
  check('public comments contain trusted but exclude pending ordinary comment',comments.status===200 &&
    comments.data.items.some((item:any)=>item.id===state['trusted.commentId']) &&
    !comments.data.items.some((item:any)=>item.id===state['ordinary.commentId']));
  for(const [actor,name] of [[trusted,'trusted'],[regular,'ordinary']] as const) {
    check(`${name} current sessions read`,(await call('/me/sessions',actor.token)).status===200);
    check(`${name} own sanctions read`,(await call('/me/sanctions',actor.token)).status===200);
    check(`${name} own appeals read`,(await call('/appeals',actor.token)).status===200);
    check(`${name} current profile read`,(await call(`/profiles/${actor.id}`,actor.token)).status===200);
  }
  const privatePost=await call('/posts',trusted.token,'POST',{operation_id:op('trusted.self-post'),type:'text',
    body:'本地仅自己可见帖子验证',visibility:'self',reply_scope:'all_readers'});
  check('trusted self-only post accepted',privatePost.status===202 && privatePost.data?.publication_state==='published');
  check('self-only detail is readable by the author',(await call(`/posts/${privatePost.data.resource_id}`,trusted.token)).status===200);
  check('self-only detail is hidden from anonymous and other accounts',
    (await call(`/posts/${privatePost.data.resource_id}`,null)).status===404 &&
    (await call(`/posts/${privatePost.data.resource_id}`,regular.token)).status===404);
  const liked=await call(`/resources/${published.resource_id}/likes`,regular.token,'PUT',{operation_id:op('ordinary.like')});
  const likeState=await call(`/resources/${published.resource_id}/likes`,regular.token);
  check('real like and current state agree',liked.status===200 && liked.data?.active===true && likeState.data?.active===true);
  const unliked=await call(`/resources/${published.resource_id}/likes`,regular.token,'DELETE',{operation_id:op('ordinary.unlike')});
  check('real unlike returns inactive state',unliked.status===200 && unliked.data?.active===false);
  const report=await call('/reports',regular.token,'POST',{operation_id:op('ordinary.report'),target_kind:'post',
    target_id:published.resource_id,reason:'本地合成数据举报链路验证',evidence_refs:[]});
  check('ordinary report accepted by real intake',report.status===202 && report.data?.id);
  const reportOperation=await call(`/operations/${op('ordinary.report')}`,regular.token);
  check('report original receipt resolves',reportOperation.status===200 && reportOperation.data?.state==='succeeded');
  const blocked=await call(`/me/blocks/${trusted.id}`,regular.token,'PUT',{operation_id:op('ordinary.block')});
  check('real block command accepted',blocked.status===200);
  try {
    check('blocked post is hidden from the blocker',(await call(`/posts/${published.resource_id}`,regular.token)).status===404);
    const blockedFeed=await call('/feeds/latest?limit=50',regular.token);
    check('authenticated feed filters blocked author',blockedFeed.status===200 &&
      !blockedFeed.data.items.some((item:any)=>item.author_id===trusted.id));
    const blockedProfile=await call(`/profiles/${trusted.id}/contents?limit=50`,regular.token);
    check('blocked profile content does not disclose posts',blockedProfile.status===404 || blockedProfile.status===200 && !blockedProfile.data.items.length);
  } finally {
    const unblocked=await call(`/me/blocks/${trusted.id}`,regular.token,'DELETE',{operation_id:op('ordinary.unblock')});
    check('test block removed through real API',unblocked.status===200);
  }
  const reportDirectory=resolve('../reports/publishing-alignment-20261018');mkdirSync(reportDirectory,{recursive:true});
  writeFileSync(resolve(reportDirectory,'live.json'),JSON.stringify({state:'passed',provider:'real',environment:'local-dev',
    at:new Date().toISOString(),evidence,user_ui_acceptance:'pending'},null,2));
  console.log(JSON.stringify({state:'passed',provider:'real',checks:evidence.length,report:'reports/publishing-alignment-20261018/live.json'}));
}
run().catch(error=>{console.error(JSON.stringify({state:'failed',checks_passed:evidence.length,
  reason:error instanceof assert.AssertionError?error.message:'Local live verification failed; no credentials logged'}));process.exitCode=1;});
