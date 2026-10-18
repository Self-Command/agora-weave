import assert from 'node:assert/strict';
import {after,before,test} from 'node:test';
import {createHash,createHmac,randomInt,randomUUID} from 'node:crypto';
import {activateConfiguration} from '../../fixtures/core/configuration.ts';
import {account,request,rows,sql} from '../../fixtures/core/runtime.ts';

const environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT||process.env.CI_ENVIRONMENT;
const literal=(value:string)=>"'" + value.replaceAll("'", "''") + "'";
const json=(value:unknown)=>literal(JSON.stringify(value))+'::jsonb';
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
const record=(value:unknown):value is Record<string,unknown>=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const headers={'X-Client-Release':'fixture-v1'};
type Fixture={actor:string;access:string;session:string};
type Enrollment={factor:string;secret:string};
let previousConfig:string|undefined;

before(()=>{
  assert.ok(environment==='dev'||environment==='test','Admin HTTP tests require isolated dev/test services');
  previousConfig=rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr as string|undefined;
  activateConfiguration(environment,`admin-http-${randomUUID()}`);
});
after(()=>{
  if(previousConfig)sql(`UPDATE core.config_activation SET active_ptr=${literal(previousConfig)} WHERE environment='${environment}';`);
  else sql(`DELETE FROM core.config_activation WHERE environment='${environment}';`);
});

function success(response:ReturnType<typeof request>) {
  // Response bodies may contain real access/refresh tokens or TOTP enrollment
  // secrets. Assert only primitive status/shape, never log or compare whole bodies.
  assert.equal(response.status,200);
  assert.ok(record(response.data.data));
  return response.data.data;
}
function failure(response:ReturnType<typeof request>,status:number,code:string) {
  assert.equal(response.status,status);assert.equal(response.data.code,code);
  assert.equal(/access_token|refresh_token|otpauth:|qr_code|"secret"/.test(response.body),false);
}
function api(access:string,path:string,body?:unknown,method?:string) {
  return request(path,{token:access,headers,...(body===undefined?{}:{body}),method:method??(body===undefined?'GET':'POST')});
}
function claimsOf(access:string):Record<string,unknown> {
  const claims:unknown=JSON.parse(Buffer.from(access.split('.')[1],'base64url').toString('utf8'));
  assert.ok(record(claims));return claims;
}
function grant(f:Fixture,environmentOverride=environment) {
  sql(`INSERT INTO core.admin_grant(account_id,role,operation_scopes,environment) VALUES ('${f.actor}','super_admin',
    ARRAY['admin.accounts.read','config.read','auth.config.write','config.release','config.rollback'],'${environmentOverride}');`);
}
function totp(secret:string):string {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',bytes:number[]=[];
  let bits=0,value=0;
  for(const character of secret) {
    const digit=alphabet.indexOf(character);assert.equal(digit>=0,true,'Official TOTP secret must be base32');
    value=(value<<5)|digit;bits+=5;
    if(bits>=8){bits-=8;bytes.push((value>>>bits)&255);value&=(1<<bits)-1;}
  }
  const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
  const mac=createHmac('sha1',Buffer.from(bytes)).update(counter).digest(),offset=mac[mac.length-1]&15;
  return String((mac.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,'0');
}
function enroll(f:Fixture):Enrollment {
  assert.equal(rows(`SELECT email IS NULL AND email_confirmed_at IS NULL AS phone_only FROM auth.users WHERE id='${f.actor}'`)[0].phone_only,true);
  const enrolled=success(api(f.access,'/admin/mfa/factors',{friendly_name:'Synthetic route authenticator'}));
  assert.equal(enrolled.type,'totp');assert.equal(typeof enrolled.id,'string');assert.ok(record(enrolled.totp));
  assert.equal(typeof enrolled.totp.secret,'string');assert.equal(typeof enrolled.totp.qr_code,'string');
  assert.equal((enrolled.totp.qr_code as string).length>4096,true,'Exercise the real official SVG, not a reduced mock');
  assert.equal(/<svg\b/.test(enrolled.totp.qr_code as string),true);
  assert.equal(rows(`SELECT email='${f.actor}@totp-label.invalid' AND email_confirmed_at IS NULL AS internal_label
    FROM auth.users WHERE id='${f.actor}'`)[0].internal_label,true);
  return {factor:enrolled.id as string,secret:enrolled.totp.secret as string};
}
function challenge(access:string,factor:string):string {
  const challenged=success(api(access,'/admin/mfa/challenges',{factor_id:factor}));
  assert.equal(challenged.type,'totp');assert.equal(typeof challenged.id,'string');return challenged.id as string;
}
function verifiedSession(f:Fixture,enrollment:Enrollment):string {
  const challengeId=challenge(f.access,enrollment.factor);
  const verified=success(api(f.access,'/admin/mfa/verify',{factor_id:enrollment.factor,challenge_id:challengeId,code:totp(enrollment.secret)}));
  assert.ok(record(verified.session));assert.equal(typeof verified.session.access_token,'string');
  const access=verified.session.access_token as string,claims=claimsOf(access);
  assert.equal(claims.sub,f.actor);assert.equal(claims.session_id,f.session);assert.equal(claims.aal,'aal2');
  assert.equal(request('/user',{auth:true,token:access}).status,200,'Official Auth must accept the token issued by official MFA');
  return access;
}

// Only an unconfirmed phone user and an official SMS OTP hash are synthetic.
// Official Auth /verify creates every session/token/OTP AMR. Official MFA APIs
// create every TOTP factor, challenge, verification timestamp and aal2 claim.
function withFixture(run:(f:Fixture)=>void) {
  const originalConfig=rows(`SELECT active_ptr FROM core.config_activation WHERE environment='${environment}'`)[0]?.active_ptr;
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
        VALUES('${actor}','00000000-0000-0000-0000-000000000000','authenticated','authenticated',NULL,
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
    const admitted=success(request('/auth/verify',{method:'POST',body:{challenge_id:challenge,otp,operation_id:operation,...verification},headers}));
    assert.ok(record(admitted.session));
    assert.equal(typeof admitted.session.access_token,'string');
    const access=admitted.session.access_token as string;
    const claims=claimsOf(access);
    assert.equal(claims.sub,actor);assert.equal(claims.aal,'aal1');assert.equal(typeof claims.session_id,'string');
    run({actor,access,session:claims.session_id as string});
  } finally {
    // Preserve immutable admission/audit/consent facts while closing every live fixture entry point.
    sql(`BEGIN;
      ${typeof originalConfig==='string'?`UPDATE core.config_activation SET active_ptr=${literal(originalConfig)} WHERE environment='${environment}';`:
        `DELETE FROM core.config_activation WHERE environment='${environment}';`}
      UPDATE core.admin_grant SET revoked_at=clock_timestamp() WHERE account_id='${actor}';
      UPDATE core.managed_document SET active_release_id=NULL WHERE id='${document}';
      UPDATE core.document_release SET state='withdrawn' WHERE id='${release}';
      UPDATE core.invitation SET state='revoked',revoke_reason='Synthetic public OTP HTTP cleanup' WHERE id='${invitation}' AND state='unused';
      UPDATE core.session_registry SET revoked_at=clock_timestamp() WHERE account_id='${actor}';
      UPDATE auth.sessions SET not_after=clock_timestamp()-interval '1 second' WHERE user_id='${actor}';
      UPDATE core.account SET status='cancelled' WHERE id='${actor}';
      UPDATE auth.users SET email=NULL,phone=NULL,phone_confirmed_at=NULL,confirmation_token='',deleted_at=clock_timestamp() WHERE id='${actor}';
      ${challenge?`UPDATE core.otp_challenge SET state='superseded' WHERE id='${challenge}' AND state='pending';
        UPDATE core.public_otp_flow SET phone_cipher=NULL,otp_cipher=NULL,receipt_cipher=NULL WHERE challenge_id='${challenge}';`:''}
      COMMIT;`);
  }
}

test('AR01: an ordinary real OTP session and an anonymous request cannot obtain admin enrollment or session metadata',()=>{
  failure(request('/admin/session',{headers}),401,'SESSION_INVALID');
  withFixture(f=>{
    failure(api(f.access,'/admin/session'),403,'FORBIDDEN');
    failure(api(f.access,'/admin/mfa/factors',{friendly_name:'Unauthorized authenticator'}),403,'FORBIDDEN');
    failure(api(f.access,'/admin/accounts'),403,'FORBIDDEN');
    assert.equal(rows(`SELECT email IS NULL AS untouched FROM auth.users WHERE id='${f.actor}'`)[0].untouched,true);
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.mfa_factors WHERE user_id='${f.actor}'`)[0].n,0);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.admin_grant WHERE account_id='${f.actor}'`)[0].n,0);
  });
});

test('AR02: phone-only administrator enrollment returns the full official SVG, and official verify upgrades the same session without upgrading its old JWT',()=>{
  withFixture(f=>{
    grant(f);
    const guide=success(api(f.access,'/admin/session'));
    assert.ok(record(guide.mfa));assert.equal(guide.mfa.verified,false);assert.equal(guide.mfa.enrolled,false);
    assert.equal(Array.isArray(guide.permissions)&&guide.permissions.length===0,true);
    failure(api(f.access,'/admin/accounts'),403,'MFA_REQUIRED');
    failure(api(f.access,'/admin/config/definitions?group=otp'),403,'MFA_REQUIRED');
    const enrollment=enroll(f);
    const factors=success(api(f.access,'/admin/mfa/factors'));
    assert.ok(Array.isArray(factors.items));assert.equal(factors.items.length,1);assert.ok(record(factors.items[0]));
    assert.equal(factors.items[0].status,'unverified');assert.equal(Object.hasOwn(factors.items[0],'secret'),false);
    const access=verifiedSession(f,enrollment);
    const facts=rows(`SELECT s.aal,s.factor_id,
      EXISTS(SELECT 1 FROM auth.mfa_amr_claims a WHERE a.session_id=s.id AND a.authentication_method='otp') AS otp,
      EXISTS(SELECT 1 FROM auth.mfa_amr_claims a WHERE a.session_id=s.id AND a.authentication_method='totp') AS totp,
      (SELECT f.status FROM auth.mfa_factors f WHERE f.id=s.factor_id) AS status,
      (SELECT count(*)::int FROM auth.sessions other WHERE other.user_id='${f.actor}') AS sessions
      FROM auth.sessions s WHERE s.id='${f.session}'`)[0];
    assert.equal(facts.aal,'aal2');assert.equal(facts.factor_id,enrollment.factor);assert.equal(facts.otp,true);
    assert.equal(facts.totp,true);assert.equal(facts.status,'verified');assert.equal(facts.sessions,1);
    failure(api(f.access,'/admin/accounts'),403,'MFA_REQUIRED');
    failure(api(f.access,'/admin/config/definitions?group=otp'),403,'MFA_REQUIRED');
    assert.ok(Array.isArray(success(api(access,'/admin/accounts')).items));
    assert.equal((success(api(access,'/admin/config/definitions?group=otp')).definitions as unknown[]).length,6);
    failure(api(access,'/admin/mfa/factors',{friendly_name:'A second verified factor'}),409,'CONFLICT');
    assert.equal(rows(`SELECT email_confirmed_at IS NULL AND encrypted_password='' AS no_email_login_proof FROM auth.users WHERE id='${f.actor}'`)[0].no_email_login_proof,true);
  });
});

test('AR03: a fresh official MFA challenge binds one preview action and publishes one durable configuration receipt while wrong action, environment and revocation reject',()=>{
  withFixture(f=>{
    grant(f);const enrollment=enroll(f),access=verifiedSession(f,enrollment);
    const definitions=success(api(access,'/admin/config/definitions?group=otp'));
    assert.equal(typeof definitions.base_version,'string');assert.ok(Array.isArray(definitions.definitions));
    const values:Record<string,number>={};
    for(const definition of definitions.definitions){assert.ok(record(definition));assert.equal(typeof definition.key,'string');
      assert.equal(Number.isSafeInteger(definition.value),true);values[definition.key as string]=Number(definition.value);}
    values['auth.otp_resend_seconds']+=1;
    const previewBody={base_version:definitions.base_version,values,reason:'Synthetic official admin route release',operation_id:randomUUID()};
    const preview=success(api(access,'/admin/config/previews',previewBody));
    assert.equal(typeof preview.preview_id,'string');assert.equal(typeof preview.preview_digest,'string');assert.equal(typeof preview.action_digest,'string');
    const authChallenge=challenge(access,enrollment.factor);
    failure(api(access,'/admin/stepup',{factor_id:enrollment.factor,challenge_id:authChallenge,code:totp(enrollment.secret),action_digest:'0'.repeat(64)}),404,'NOT_FOUND');
    assert.equal(rows(`SELECT verified_at IS NULL AS untouched FROM auth.mfa_challenges WHERE id='${authChallenge}'`)[0].untouched,true);
    // The pinned official Auth permits a fresh challenge in the current TOTP
    // window. No session/factor/verification timestamp is advanced by this test.
    const stepped=success(api(access,'/admin/stepup',{factor_id:enrollment.factor,challenge_id:authChallenge,code:totp(enrollment.secret),action_digest:preview.action_digest}));
    assert.equal(typeof stepped.stepup_id,'string');assert.ok(record(stepped.session));assert.equal(typeof stepped.session.access_token,'string');
    const fresh=stepped.session.access_token as string,claims=claimsOf(fresh);
    assert.equal(claims.sub,f.actor);assert.equal(claims.session_id,f.session);assert.equal(claims.aal,'aal2');
    const command={preview_id:preview.preview_id,preview_digest:preview.preview_digest,stepup_id:stepped.stepup_id,operation_id:randomUUID()};
    const published=success(api(fresh,'/admin/config/releases',command));
    assert.equal(published.kind,'release');assert.equal(published.state,'active');assert.equal(published.previous_version,definitions.base_version);
    assert.equal(typeof published.version,'string');
    const retried=success(api(fresh,'/admin/config/releases',command));
    assert.equal(digest(JSON.stringify(retried)),digest(JSON.stringify(published)));
    const operation=success(api(fresh,`/operations/${command.operation_id}`));
    assert.equal(operation.state,'succeeded');assert.equal(operation.action,'config.release');assert.ok(record(operation.result));
    assert.equal(operation.result.version,published.version);
    const current=success(api(fresh,'/admin/config/definitions?group=otp'));
    assert.equal(current.base_version,published.version);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.operation WHERE actor='${f.actor}' AND operation_id='${command.operation_id}'`)[0].n,1);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.audit_event WHERE actor='${f.actor}' AND request_id='${command.operation_id}'`)[0].n,1);
    const binding=rows(`SELECT b.actor,b.session_id,b.auth_challenge_id,c.verified_at IS NOT NULL AS verified,
      s.consumed_at IS NOT NULL AS consumed FROM core.admin_stepup_binding b JOIN auth.mfa_challenges c ON c.id=b.auth_challenge_id
      JOIN core.stepup_challenge s ON s.id=b.stepup_id WHERE b.stepup_id=${literal(stepped.stepup_id as string)}`)[0];
    assert.equal(binding.actor,f.actor);assert.equal(binding.session_id,f.session);assert.equal(binding.auth_challenge_id,authChallenge);
    assert.equal(binding.verified,true);assert.equal(binding.consumed,true);
    failure(api(fresh,'/admin/config/releases',{...command,preview_digest:'0'.repeat(64)}),409,'CONFLICT');
    sql(`UPDATE core.admin_grant SET environment='${environment==='dev'?'test':'dev'}' WHERE account_id='${f.actor}';`);
    failure(api(fresh,'/admin/session'),403,'FORBIDDEN');
    failure(api(fresh,`/operations/${command.operation_id}`),403,'FORBIDDEN');
    sql(`UPDATE core.admin_grant SET environment='${environment}',revoked_at=clock_timestamp() WHERE account_id='${f.actor}';`);
    failure(api(fresh,'/admin/config/releases',command),403,'FORBIDDEN');
    failure(api(fresh,'/admin/mfa/challenges',{factor_id:enrollment.factor}),403,'FORBIDDEN');
  });
});

test('AR04: server logout invalidates both old OTP and current MFA access for every subsequent admin read or challenge',()=>{
  withFixture(f=>{
    grant(f);const enrollment=enroll(f),access=verifiedSession(f,enrollment);
    assert.equal(success(api(access,'/admin/session')).environment,environment);
    const loggedOut=success(api(access,'/auth/logout',{operation_id:randomUUID()}));
    assert.equal(loggedOut.revoked,true);
    for(const token of [f.access,access]){
      failure(api(token,'/admin/session'),401,'SESSION_INVALID');
      failure(api(token,'/admin/accounts'),401,'SESSION_INVALID');
      failure(api(token,'/admin/config/definitions?group=otp'),401,'SESSION_INVALID');
      failure(api(token,'/admin/mfa/challenges',{factor_id:enrollment.factor}),401,'SESSION_INVALID');
    }
    assert.equal(rows(`SELECT revoked_at IS NOT NULL AS revoked FROM core.session_registry WHERE session_id='${f.session}'`)[0].revoked,true);
  });
});

test('AR05: official MFA upgrades a second real OTP session while deleted older Auth sessions retain revoked registry tombstones and immutable history',()=>{
  withFixture(f=>{
    grant(f);
    const oldRegistry=rows(`SELECT id,epoch,row_version FROM core.session_registry WHERE account_id='${f.actor}' AND session_id='${f.session}'`)[0];
    assert.equal(typeof oldRegistry.id,'string');assert.equal(Number.isSafeInteger(oldRegistry.epoch),true);
    const oldOperation=rows(`SELECT op.operation_id,encode(sha256(convert_to(to_jsonb(op)::text,'UTF8')),'hex') AS digest
      FROM core.operation op WHERE op.actor='${f.actor}' AND op.session_id='${f.session}' AND op.action='auth.register'`)[0];
    assert.equal(typeof oldOperation.operation_id,'string');assert.equal(typeof oldOperation.digest,'string');
    const oldAudit=rows(`SELECT e.id,encode(sha256(convert_to(to_jsonb(e)::text,'UTF8')),'hex') AS digest
      FROM core.audit_event e WHERE e.actor='${f.actor}' AND e.session_id='${f.session}'
        AND e.request_id=${literal(oldOperation.operation_id as string)} ORDER BY e.id`);
    assert.equal(oldAudit.length,1);
    assert.equal(success(api(f.access,`/operations/${oldOperation.operation_id}`)).state,'succeeded');

    const phone=rows(`SELECT phone FROM auth.users WHERE id='${f.actor}'`)[0].phone;
    assert.equal(typeof phone,'string');
    const otp='391724',confirmation=createHash('sha224').update(String(phone)+otp).digest('hex');
    // Seed only an isolated OTP hash, without calling /otp or an SMS supplier.
    // Official /verify creates this second session, signed tokens and OTP AMR.
    sql(`UPDATE auth.users SET confirmation_token='${confirmation}',confirmation_sent_at=clock_timestamp() WHERE id='${f.actor}';`);
    const verified=request('/verify',{auth:true,method:'POST',body:{phone,token:otp,type:'sms'}});
    assert.equal(verified.status,200);assert.equal(typeof verified.data.access_token,'string');
    const secondAccess=verified.data.access_token as string,claims=claimsOf(secondAccess);
    assert.equal(claims.sub,f.actor);assert.equal(claims.aal,'aal1');assert.equal(typeof claims.session_id,'string');
    const secondSession=claims.session_id as string;assert.notEqual(secondSession,f.session);
    assert.equal(rows(`SELECT count(*)::int AS n FROM auth.sessions WHERE user_id='${f.actor}'`)[0].n,2);
    const command=randomUUID();
    const admitted=rows(`SELECT core.complete_login_result('${f.actor}',${literal(secondSession)},'${command}',
      'Synthetic second official OTP session','${environment}') AS result`)[0].result;
    assert.ok(record(admitted));assert.equal(admitted.code,'OK');
    const second:Fixture={actor:f.actor,access:secondAccess,session:secondSession};
    assert.equal(success(api(secondAccess,'/admin/session')).environment,environment);
    failure(api(secondAccess,'/admin/accounts'),403,'MFA_REQUIRED');
    const enrollment=enroll(second),access=verifiedSession(second,enrollment);

    const sessions=rows(`SELECT s.id,s.aal,s.factor_id FROM auth.sessions s WHERE s.user_id='${f.actor}'`);
    assert.equal(sessions.length,1);assert.equal(sessions[0].id,secondSession);assert.equal(sessions[0].aal,'aal2');
    assert.equal(sessions[0].factor_id,enrollment.factor);
    const tombstone=rows(`SELECT r.id,r.account_id,r.session_id,r.epoch,r.row_version,r.revoked_at IS NOT NULL AS revoked,
      NOT EXISTS(SELECT 1 FROM auth.sessions s WHERE s.id=r.session_id) AS auth_deleted
      FROM core.session_registry r WHERE r.session_id='${f.session}'`)[0];
    assert.equal(tombstone.id,oldRegistry.id);assert.equal(tombstone.account_id,f.actor);assert.equal(tombstone.session_id,f.session);
    assert.equal(tombstone.revoked,true);assert.equal(tombstone.auth_deleted,true);
    assert.equal(tombstone.epoch,Number(oldRegistry.epoch)+1);assert.ok(Number(tombstone.row_version)>Number(oldRegistry.row_version));
    const live=rows(`SELECT revoked_at IS NULL AS active FROM core.session_registry WHERE session_id=${literal(secondSession)} AND account_id='${f.actor}'`)[0];
    assert.equal(live.active,true);
    for(const path of ['/admin/session','/admin/accounts','/admin/config/definitions?group=otp','/admin/mfa/factors',`/operations/${oldOperation.operation_id}`]) {
      failure(api(f.access,path),401,'SESSION_INVALID');
    }
    failure(api(f.access,'/admin/mfa/challenges',{factor_id:enrollment.factor}),401,'SESSION_INVALID');
    assert.equal((success(api(access,'/admin/session')).mfa as Record<string,unknown>).verified,true);
    assert.ok(Array.isArray(success(api(access,'/admin/accounts')).items));
    assert.equal((success(api(access,'/admin/config/definitions?group=otp')).definitions as unknown[]).length,6);
    assert.equal(success(api(access,`/operations/${oldOperation.operation_id}`)).state,'succeeded');

    const retainedOperation=rows(`SELECT encode(sha256(convert_to(to_jsonb(op)::text,'UTF8')),'hex') AS digest
      FROM core.operation op WHERE op.actor='${f.actor}' AND op.operation_id=${literal(oldOperation.operation_id as string)}`)[0];
    assert.equal(retainedOperation.digest,oldOperation.digest);
    const retainedAudit=rows(`SELECT e.id,encode(sha256(convert_to(to_jsonb(e)::text,'UTF8')),'hex') AS digest
      FROM core.audit_event e WHERE e.actor='${f.actor}' AND e.session_id='${f.session}'
        AND e.request_id=${literal(oldOperation.operation_id as string)} ORDER BY e.id`);
    assert.deepEqual(retainedAudit,oldAudit);

    const nonexistentSession=randomUUID();
    // A caught subtransaction tests the remaining owner check without aborting
    // cleanup, and the outer rollback cannot remove the retained tombstone.
    sql(`BEGIN; DO $owner_check$ DECLARE rejected boolean:=false; BEGIN
      BEGIN
        INSERT INTO core.session_registry(session_id,account_id,device_label)
          VALUES('${nonexistentSession}','${f.actor}','Synthetic nonexistent Auth session');
      EXCEPTION WHEN check_violation OR foreign_key_violation THEN rejected:=true;
      END;
      IF NOT rejected OR EXISTS(SELECT 1 FROM core.session_registry WHERE session_id='${nonexistentSession}') THEN
        RAISE EXCEPTION 'Registry accepted a nonexistent Auth owner' USING ERRCODE='AW005';
      END IF;
      END $owner_check$; ROLLBACK;`);
    assert.equal(rows(`SELECT count(*)::int AS n FROM core.session_registry WHERE session_id='${f.session}' AND revoked_at IS NOT NULL`)[0].n,1);
  });
});

