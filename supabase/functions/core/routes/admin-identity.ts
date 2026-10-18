import { database } from '../database.ts';
import { principal,type Principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';
import { admittedOutput,jsonOutput,type Failure } from '../output.ts';
import { enrollTotp,challengeTotp,verifyTotp,MfaError } from '../adapters/supabase-admin-mfa.ts';
import { adminAccess,adminDigest,adminEnvironment,adminFailure,adminKeys,adminUuid } from '../identity/admin-policy.ts';

function onlyMethod(request:Request,method:string) {
  if(request.method===method)return null;
  const response=adminFailure('METHOD_NOT_ALLOWED');response.headers.set('Allow',method);return response;
}
async function body(request:Request) {try{return await readCommandJson(request,4096);}catch{return null;}}
const factorBody=(value:Record<string,unknown>|null)=>value&&typeof value.factor_id==='string'&&adminUuid.test(value.factor_id);
const verifyBody=(value:Record<string,unknown>|null)=>factorBody(value)&&typeof value!.challenge_id==='string'&&adminUuid.test(value!.challenge_id)&&
  typeof value!.code==='string'&&/^\d{6}$/.test(value!.code);
const upstreamFailure=(error:unknown)=>adminFailure(error instanceof MfaError?error.code:'MFA_UNCONFIRMED');

/** All account/session/assurance inputs come from the signature-verified principal. */
export async function adminIdentity(request:Request,path:string,actor:Principal|null,failure:Failure):Promise<Response> {
  const env=adminEnvironment(),access=adminAccess(request,actor);
  if(!actor||!access)return adminFailure('SESSION_INVALID');
  if(!env)return adminFailure('SERVICE_UNAVAILABLE');
  const url=new URL(request.url),sql=database();
  if(path==='/admin/accounts'){
    const method=onlyMethod(request,'GET');if(method)return method;
    const limit=url.searchParams.get('limit')||'20',cursor=url.searchParams.get('cursor');
    if([...url.searchParams.keys()].some(key=>!['limit','cursor'].includes(key))||
      url.searchParams.getAll('limit').length>1||url.searchParams.getAll('cursor').length>1||
      !/^\d+$/.test(limit)||Number(limit)<1||Number(limit)>50||cursor!==null&&!adminUuid.test(cursor))return adminFailure('INVALID_INPUT');
    return admittedOutput(failure,async tx=>{
      const [row]=await tx`SELECT core.admin_accounts_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},
        ${Number(limit)},${cursor}::uuid) AS result`;
      return row.result.code==='OK'?jsonOutput(tx,row.result.data):adminFailure(row.result.code);
    });
  }
  if(url.search)return adminFailure('INVALID_INPUT');
  if(path==='/admin/session'){
    const method=onlyMethod(request,'GET');if(method)return method;
    return admittedOutput(failure,async tx=>{
      const [row]=await tx`SELECT core.admin_session_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal}) AS result`;
      return row.result.code==='OK'?jsonOutput(tx,row.result.data):adminFailure(row.result.code);
    });
  }
  if(path==='/admin/mfa/factors'&&request.method==='GET')return admittedOutput(failure,async tx=>{
    const [row]=await tx`SELECT core.admin_factors_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal}) AS result`;
    return row.result.code==='OK'?jsonOutput(tx,row.result.data):adminFailure(row.result.code);
  });
  if(!['/admin/mfa/factors','/admin/mfa/challenges','/admin/mfa/verify','/admin/stepup'].includes(path))return adminFailure('NOT_FOUND');
  const method=onlyMethod(request,'POST');if(method)return method;
  const input=await body(request);if(!input)return adminFailure('INVALID_INPUT');
  const [current]=await sql`SELECT core.admin_session_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal}) AS result`;
  if(current.result.code!=='OK')return adminFailure(current.result.code);
  if(path==='/admin/mfa/factors'){
    if(!adminKeys(input,['friendly_name'])||typeof input.friendly_name!=='string'||!input.friendly_name.trim()||input.friendly_name.length>80||
      Array.from(input.friendly_name).some(character=>character.charCodeAt(0)<32||character.charCodeAt(0)===127))return adminFailure('INVALID_INPUT');
    if(current.result.data.mfa.enrolled)return adminFailure('CONFLICT');
    const [prepared]=await sql`SELECT core.admin_prepare_totp_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal}) AS result`;
    if(prepared.result.code!=='OK')return adminFailure(prepared.result.code);
    let enrolled;
    try {enrolled=await enrollTotp(access,input.friendly_name.trim()+'-'+crypto.randomUUID().slice(0,8));}
    catch(error){return upstreamFailure(error);}
    return admittedOutput(failure,async tx=>{
      const [owned]=await tx`SELECT core.admin_factor_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${enrolled.id}::uuid,false) AS result`;
      if(owned.result.code!=='OK')return adminFailure(owned.result.code);
      if(owned.result.data.status!=='unverified')return adminFailure('MFA_UNCONFIRMED');
      return jsonOutput(tx,enrolled);
    });
  }
  if(!factorBody(input))return adminFailure('INVALID_INPUT');
  if(path==='/admin/mfa/challenges'){
    if(!adminKeys(input,['factor_id']))return adminFailure('INVALID_INPUT');
  }else if(!verifyBody(input)||!adminKeys(input,path==='/admin/stepup'?['factor_id','challenge_id','code','action_digest']:['factor_id','challenge_id','code'])||
    path==='/admin/stepup'&&(typeof input.action_digest!=='string'||!adminDigest.test(input.action_digest)))return adminFailure('INVALID_INPUT');
  const factor=input.factor_id as string;
  const [owned]=await sql`SELECT core.admin_factor_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${factor}::uuid,${path==='/admin/stepup'}) AS result`;
  if(owned.result.code!=='OK')return adminFailure(owned.result.code);
  if(path==='/admin/mfa/challenges'){
    let challenge;
    try{challenge=await challengeTotp(access,factor);}catch(error){return upstreamFailure(error);}
    return admittedOutput(failure,async tx=>{
      const [eligible]=await tx`SELECT core.admin_factor_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${factor}::uuid,false) AS result`;
      return eligible.result.code==='OK'?jsonOutput(tx,challenge):adminFailure(eligible.result.code);
    });
  }
  if(path==='/admin/stepup'){
    const [target]=await sql`SELECT core.admin_stepup_target_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${input.action_digest as string}) AS result`;
    if(target.result.code!=='OK')return adminFailure(target.result.code);
  }
  let verified;
  try{
    verified=await verifyTotp(access,factor,input.challenge_id as string,input.code as string,
      {account:actor.account,session:actor.session},async token=>principal(new Request(request.url,{headers:{Authorization:`Bearer ${token}`}})));
  }catch(error){return upstreamFailure(error);}
  const fresh=verified.actor;
  if(path==='/admin/stepup'){
    let receipt;
    try{
      const [row]=await sql`SELECT core.admin_stepup_result(${fresh.account}::uuid,${fresh.session}::uuid,${env},${fresh.aal},
        ${factor}::uuid,${input.challenge_id as string}::uuid,${input.action_digest as string}) AS result`;
      receipt=row.result;
    }catch{return adminFailure('MFA_UNCONFIRMED');}
    if(receipt.code!=='OK')return adminFailure(receipt.code);
    return admittedOutput(failure,async tx=>{
      const [eligible]=await tx`SELECT core.admin_stepup_target_result(${fresh.account}::uuid,${fresh.session}::uuid,${env},${fresh.aal},${input.action_digest as string}) AS result`;
      return eligible.result.code==='OK'?jsonOutput(tx,{...receipt.data,session:verified.tokens}):adminFailure(eligible.result.code);
    });
  }
  return admittedOutput(failure,async tx=>{
    const [administrator]=await tx`SELECT core.admin_session_result(${fresh.account}::uuid,${fresh.session}::uuid,${env},${fresh.aal}) AS result`;
    if(administrator.result.code!=='OK')return adminFailure(administrator.result.code);
    if(!administrator.result.data.mfa.verified)return adminFailure('MFA_REQUIRED');
    return jsonOutput(tx,{session:verified.tokens,administrator:administrator.result.data});
  });
}
