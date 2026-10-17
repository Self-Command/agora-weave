import assert from 'node:assert/strict';
import {after,before,test} from 'node:test';
import {createHash,randomInt,randomUUID} from 'node:crypto';
import {activateConfiguration} from '../../fixtures/core/configuration.ts';
import {account,environment as runtimeEnvironment,request,rows,sql,token} from '../../fixtures/core/runtime.ts';
import {compose} from '../../../tools/ci/core-database.ts';

const environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT||process.env.CI_ENVIRONMENT;
const literal=(value:string)=>`'${value.replaceAll("'","''")}'`;
const json=(value:unknown)=>`${literal(JSON.stringify(value))}::jsonb`;
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
const record=(value:unknown):value is Record<string,unknown>=>value!==null && typeof value==='object' && !Array.isArray(value);
const unknownVerify=()=>({challenge_id:randomUUID(),otp:'713902',operation_id:randomUUID()});
let previousConfig:string|undefined;

before(()=>{
  assert.ok(environment==='dev'||environment==='test','Public OTP HTTP tests require isolated dev/test services');
  previousConfig=rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr as string|undefined;
  activateConfiguration(environment,`public-otp-http-${randomUUID()}`);
});
after(()=>{
  if(previousConfig) sql(`UPDATE core.config_activation SET active_ptr=${literal(previousConfig)} WHERE environment='${environment}';`);
  else sql(`DELETE FROM core.config_activation WHERE environment='${environment}';`);
});

function expectFailure(response:ReturnType<typeof request>,status:number,code:string) {
  // Never put a whole response (which could contain session tokens) in an assertion diagnostic.
  assert.equal(response.status,status);assert.equal(response.data.code,code);
  assert.equal(response.body.includes('access_token'),false);assert.equal(response.body.includes('refresh_token'),false);
}
function sessionResult(response:ReturnType<typeof request>) {
  assert.equal(response.status,200);
  assert.ok(record(response.data.data));const data=response.data.data;
  assert.ok(record(data.session));assert.ok(record(data.account));
  assert.equal(typeof data.session.access_token,'string');assert.equal(typeof data.session.refresh_token,'string');
  assert.equal(Number.isSafeInteger(data.session.expires_at),true);assert.equal(data.account.admitted,true);
  return {data,access:data.session.access_token as string,refresh:data.session.refresh_token as string};
}

type Consent={release_id:string;digest:string;decision:string};
function withFixture(run:(f:{actor:string;challenge:string;operation:string;otp:string;
  verification:{document_set_digest:string;age_declaration:{version:string;declared:boolean};consents:Consent[]};
  body:Record<string,unknown>})=>void) {
  const actor=randomUUID(),document=randomUUID(),revision=randomUUID(),release=randomUUID(),invitation=randomUUID(),invitationRef=randomUUID();
  const phone=`+1555${String(randomInt(0,10000000)).padStart(7,'0')}`,otp='713902',operation=randomUUID(),command=randomUUID();
  const terms='SYNTHETIC PUBLIC OTP HTTP TERMS — NOT A PRODUCTION POLICY',termsDigest=digest(terms);
  const confirmation=createHash('sha224').update(phone.slice(1)+otp).digest('hex');
  let challenge='';
  try {
    // Seed only an unconfirmed synthetic Auth user and the official OTP hash.
    // /verify must create the real session, OTP AMR and signed access/refresh tokens.
    sql(`BEGIN;
      INSERT INTO auth.users(id,instance_id,aud,role,email,phone,phone_confirmed_at,encrypted_password,
        raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,confirmation_sent_at,
        recovery_token,email_change_token_current,email_change_token_new,email_change,phone_change_token,phone_change,reauthentication_token)
        VALUES('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated','${actor}@example.invalid',
          '${phone.slice(1)}',NULL,'','{"provider":"phone","providers":["phone"]}','{}',clock_timestamp(),clock_timestamp(),
          '${confirmation}',clock_timestamp(),'','','','','','','');
      INSERT INTO core.managed_document(id,stable_key,kind,locale,owner,public_surfaces)
        VALUES('${document}','synthetic.public-otp-http.${document}','terms','zh-CN','${account()}',ARRAY['app']);
      INSERT INTO core.document_revision(id,document_id,version,title,body,content_digest,state,editor)
        VALUES('${revision}','${document}',1,'Synthetic public OTP HTTP terms',${literal(terms)},'${termsDigest}','ready','${account()}');
      INSERT INTO core.document_release(id,document_id,revision_ref,content_digest,scope,state,publisher,published_at)
        VALUES('${release}','${document}','${revision}','${termsDigest}',
          '{"environment":"${environment}","surfaces":["app"],"purposes":["register"]}','published','${account()}',clock_timestamp());
      UPDATE core.managed_document SET active_release_id='${release}' WHERE id='${document}';
      INSERT INTO core.invitation(id,token_hash,creator_id,expires_at)
        VALUES('${invitation}','${digest(invitationRef)}','${account()}',clock_timestamp()+interval '1 hour');
      COMMIT;`);
    const documents=rows(`SELECT core.registration_documents_result('${environment}') AS result`)[0].result as {
      code:string;document_set_digest:string;documents:{release_id:string;digest:string}[]};
    assert.equal(documents.code,'OK');
    const age={version:'adult-18-v1',declared:true};
    const verification={document_set_digest:documents.document_set_digest,age_declaration:age,
      consents:documents.documents.map(doc=>({release_id:doc.release_id,digest:doc.digest,decision:'consented'}))};
    const reservation=rows(`SELECT core.reserve_public_otp('${phone}','192.0.2.91','register','${command}',
      ${json({invitation_ref:invitationRef,age_declaration:age,document_set_digest:documents.document_set_digest})},'${environment}') AS result`)[0].result as {
      code:string;challenge_id:string;lease:string};
    assert.equal(reservation.code,'OK');challenge=reservation.challenge_id;
    const hooked=rows(`SELECT core.auth_send_sms_hook(${json({user:{id:actor,phone:phone.slice(1)},sms:{otp}})})='{}'::jsonb AS accepted`)[0];
    assert.equal(hooked.accepted,true);
    // Deliberately simulate supplier acceptance, without making any external SMS call.
    assert.equal(rows(`SELECT core.claim_public_sms('${challenge}','${reservation.lease}','${environment}')->>'code' AS code`)[0].code,'OK');
    assert.equal(rows(`SELECT core.finish_public_sms('${challenge}','${reservation.lease}','sent','${environment}')->>'code' AS code`)[0].code,'OK');
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.sessions WHERE user_id='${actor}'`)[0].n,0);
    run({actor,challenge,operation,otp,verification,body:{challenge_id:challenge,otp,operation_id:operation,...verification}});
  } finally {
    // Preserve immutable admission/audit/consent facts while closing every live fixture entry point.
    sql(`BEGIN;
      UPDATE core.managed_document SET active_release_id=NULL WHERE id='${document}';
      UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
      UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic public OTP HTTP cleanup' WHERE id='${invitation}' AND state='unused';
      UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE account_id='${actor}';
      UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE user_id='${actor}';
      UPDATE core.account SET status='cancelled' WHERE id='${actor}';
      UPDATE auth.users SET phone=NULL,phone_confirmed_at=NULL,confirmation_token='',deleted_at=clock_timestamp() WHERE id='${actor}';
      ${challenge?`UPDATE core.otp_challenge SET state='superseded' WHERE id='${challenge}' AND state='pending';
        UPDATE core.public_otp_flow SET phone_cipher=NULL,otp_cipher=NULL,receipt_cipher=NULL WHERE challenge_id='${challenge}';`:''}
      COMMIT;`);
  }
}

test('PR01: public OTP routes enforce POST and reject unknown client authority fields before upstream work',()=>{
  const operation=randomUUID(),verify=unknownVerify();
  for(const path of ['/auth/challenges','/auth/verify',`/auth/operations/${operation}`])
    expectFailure(request(path),405,'METHOD_NOT_ALLOWED');
  expectFailure(request('/auth/challenges',{method:'POST',body:{phone:'+15555550123',purpose:'login',operation_id:operation,data:{role:'admin'}}}),422,'INVALID_INPUT');
  for(const patch of [{phone:'+15555550123'},{access_token:'client-controlled'},{user:{id:account()}},{upstream:'http://example.invalid/verify'}])
    expectFailure(request('/auth/verify',{method:'POST',body:{...verify,...patch}}),422,'INVALID_INPUT');
  expectFailure(request(`/auth/operations/${operation}`,{method:'POST',body:verify}),422,'INVALID_INPUT');
});

test('PR02: share principals and unsigned bearer identities cannot enter public phone-auth handlers',()=>{
  const unsigned=Buffer.from('{"alg":"none"}').toString('base64url')+'.'+
    Buffer.from(JSON.stringify({sub:account(),aud:'authenticated',role:'authenticated'})).toString('base64url')+'.signature';
  for(const path of ['/auth/challenges','/auth/verify',`/auth/operations/${randomUUID()}`]) {
    expectFailure(request(path,{method:'POST',body:unknownVerify(),token:token(1,{aud:'share-read'})}),403,'FORBIDDEN');
    expectFailure(request(path,{method:'POST',body:unknownVerify(),token:unsigned}),401,'SESSION_INVALID');
  }
});

test('PR03: the gateway overwrites forged ingress proof while direct functions ingress refuses it and disabled sending creates no flow',()=>{
  const body=unknownVerify(),headers={'X-Core-Ingress-Token':'f'.repeat(64),'X-Core-Client-IP':'192.0.2.255'};
  expectFailure(request('/auth/verify',{method:'POST',body,headers}),422,'OTP_INVALID');
  // Only fixed synthetic direct-service routing is used; do not read the private ingress token.
  const env=runtimeEnvironment(),config=[
    'url = "http://functions:9000/core/api/v1/auth/verify"','request = "POST"','silent','show-error','max-time = 20',
    'write-out = "\\n%{http_code}"',`header = ${JSON.stringify(`apikey: ${env.ANON_KEY}`)}`,
    'header = "Content-Type: application/json"',...Object.entries(headers).map(([key,value])=>`header = ${JSON.stringify(`${key}: ${value}`)}`),
    `data = ${JSON.stringify(JSON.stringify(body))}`];
  const raw=compose(['exec','-T','db','curl','--config','-'],config.join('\n')+'\n'),split=raw.lastIndexOf('\n');
  const directBody=raw.slice(0,split),direct={status:Number(raw.slice(split+1)),body:directBody,data:JSON.parse(directBody) as Record<string,unknown>};
  expectFailure(direct,403,'FORBIDDEN');
  const operation=randomUUID();
  expectFailure(request('/auth/challenges',{method:'POST',headers,body:{phone:'+15555550123',purpose:'login',operation_id:operation}}),503,'SERVICE_UNAVAILABLE');
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.otp_challenge WHERE command='${operation}'`)[0].n,0);
  assert.equal(rows(`SELECT count(*)::int AS n FROM core.public_otp_flow f JOIN core.otp_challenge c ON c.id=f.challenge_id WHERE c.command='${operation}'`)[0].n,0);
});

test('PR04: real Auth verifies the seeded OTP once and public retries return one durable receipt until current-session revocation',()=>{
  withFixture(f=>{
    const first=sessionResult(request('/auth/verify',{method:'POST',body:f.body}));
    assert.equal(first.data.account && (first.data.account as Record<string,unknown>).id,f.actor);
    const identity=rows(`SELECT c.state,c.completion_actor,c.completion_session,c.completion_operation,
      (SELECT count(*)::int FROM auth.sessions s WHERE s.user_id='${f.actor}') AS sessions,
      (SELECT count(*)::int FROM auth.mfa_amr_claims a WHERE a.session_id=c.completion_session AND a.authentication_method='otp') AS otp_amr,
      (SELECT count(*)::int FROM core.admission a WHERE a.account_id='${f.actor}') AS admissions,
      (SELECT count(*)::int FROM core.operation o WHERE o.actor='${f.actor}' AND o.operation_id='${f.operation}') AS operations
      FROM core.otp_challenge c WHERE c.id='${f.challenge}'`)[0];
    assert.equal(identity.state,'consumed');assert.equal(identity.completion_actor,f.actor);assert.equal(identity.completion_operation,f.operation);
    assert.equal(identity.sessions,1);assert.equal(identity.otp_amr,1);assert.equal(identity.admissions,1);assert.equal(identity.operations,1);
    assert.equal(request('/user',{auth:true,token:first.access}).status,200,'Official Auth must accept its newly issued access token');
    assert.equal(request('/me/sessions',{token:first.access,headers:{'X-Client-Release':'fixture-v1'}}).status,200,'The admitted session must reach the real account API');
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.document_receipt WHERE subject='${f.actor}' AND presentation_ref='${f.challenge}'`)[0].n,f.verification.consents.length);
    for(const path of ['/auth/verify',`/auth/operations/${f.operation}`]) {
      const replay=sessionResult(request(path,{method:'POST',body:f.body}));
      assert.equal(digest(JSON.stringify(replay.data)),digest(JSON.stringify(first.data)));
    }
    expectFailure(request('/auth/verify',{method:'POST',body:{...f.body,consents:[]}}),409,'CONFLICT');
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.sessions WHERE user_id='${f.actor}'`)[0].n,1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE actor='${f.actor}' AND operation_id='${f.operation}'`)[0].n,1);
    sql(`UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE session_id=${literal(String(identity.completion_session))};`);
    for(const path of ['/auth/verify',`/auth/operations/${f.operation}`])
      expectFailure(request(path,{method:'POST',body:f.body}),401,'SESSION_INVALID');
    expectFailure(request('/me/sessions',{token:first.access,headers:{'X-Client-Release':'fixture-v1'}}),401,'SESSION_INVALID');
  });
});

test('PR05: operation queries report unknown verification without issuing Auth sessions or exposing a receipt',()=>{
  withFixture(f=>{
    const prepared=rows(`SELECT core.prepare_public_verify('${f.challenge}','${f.otp}','${f.operation}',${json(f.verification)},'${environment}') AS result`)[0].result as {code:string;lease:string};
    assert.equal(prepared.code,'OK');
    assert.equal(rows(`SELECT core.fail_public_verify('${f.challenge}','${prepared.lease}',true,'${environment}')->>'code' AS code`)[0].code,'AUTH_UNCONFIRMED');
    const query=request(`/auth/operations/${f.operation}`,{method:'POST',body:f.body});
    assert.equal(query.status,200);assert.ok(record(query.data.data));assert.equal(query.data.data.state,'unknown');
    assert.equal(query.data.data.operation_id,f.operation);assert.equal(query.body.includes('access_token'),false);assert.equal(query.body.includes('refresh_token'),false);
    expectFailure(request('/auth/verify',{method:'POST',body:f.body}),503,'AUTH_UNCONFIRMED');
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.sessions WHERE user_id='${f.actor}'`)[0].n,0);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE actor='${f.actor}'`)[0].n,0);
  });
});

test('PR06: missing current consent and incorrect OTP never reach Auth or admit an account',()=>{
  withFixture(f=>{
    expectFailure(request('/auth/verify',{method:'POST',body:{...f.body,consents:[]}}),422,'CONSENT_REQUIRED');
    expectFailure(request('/auth/verify',{method:'POST',body:{...f.body,otp:'000000'}}),422,'OTP_INVALID');
    assert.equal(rows(`SELECT attempts::int AS attempts FROM core.otp_challenge WHERE id='${f.challenge}'`)[0].attempts,1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.sessions WHERE user_id='${f.actor}'`)[0].n,0);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.account WHERE id='${f.actor}'`)[0].n,0);
  });
});
