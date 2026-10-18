import { database } from '../database.ts';
import type { Principal } from '../identity.ts';
import { readCommandJson } from '../request-body.ts';
import { admittedOutput,jsonOutput,type Failure } from '../output.ts';
import { adminDigest,adminEnvironment,adminFailure,adminKeys,adminLifetime,adminObject,adminReason,adminUuid } from '../identity/admin-policy.ts';

const otpKeys=['auth.otp_lifetime_seconds','auth.otp_resend_seconds','auth.otp_max_failures',
  'auth.otp_phone_hourly','auth.otp_phone_daily','auth.otp_ip_hourly'];
const version=(value:unknown):value is string=>typeof value==='string'&&value.length>0&&value.length<=2048&&value.trim()===value;
const targetValues=(value:unknown)=>adminObject(value)&&Object.keys(value).length===otpKeys.length&&
  Object.entries(value).every(([key,number])=>otpKeys.includes(key)&&Number.isSafeInteger(number)&&Number(number)>0);

export async function configuration(request:Request,path:string,actor:Principal|null,failure:Failure):Promise<Response> {
  if(!actor||actor.audience!=='authenticated')return adminFailure('SESSION_INVALID');
  const env=adminEnvironment(),maximum=adminLifetime();
  if(!env||maximum===null)return adminFailure('SERVICE_UNAVAILABLE');
  const url=new URL(request.url),sql=database();
  if(path==='/admin/config/definitions'){
    if(request.method!=='GET')return adminFailure('METHOD_NOT_ALLOWED');
    if([...url.searchParams].some(([key,value])=>key!=='group'||value!=='otp')||url.searchParams.getAll('group').length>1)return adminFailure('INVALID_INPUT');
    return admittedOutput(failure,async tx=>{
      const [row]=await tx`SELECT core.admin_config_definitions_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${maximum}) AS result`;
      return row.result.code==='OK'?jsonOutput(tx,row.result.data):adminFailure(row.result.code);
    });
  }
  if(!['/admin/config/previews','/admin/config/releases','/admin/config/rollbacks'].includes(path))return adminFailure('NOT_FOUND');
  if(request.method!=='POST')return adminFailure('METHOD_NOT_ALLOWED');
  if(url.search)return adminFailure('INVALID_INPUT');
  let input;
  try{input=await readCommandJson(request,16384);}catch{return adminFailure('INVALID_INPUT');}
  if(typeof input.operation_id!=='string'||!adminUuid.test(input.operation_id))return adminFailure('INVALID_INPUT');
  const operation=input.operation_id;
  if(path==='/admin/config/previews'){
    if(!adminKeys(input,['base_version','values','rollback_version','reason','operation_id'])||!version(input.base_version)||!adminReason(input.reason)||
      Object.hasOwn(input,'values')===Object.hasOwn(input,'rollback_version')||
      Object.hasOwn(input,'values')&&!targetValues(input.values)||Object.hasOwn(input,'rollback_version')&&!version(input.rollback_version))return adminFailure('INVALID_INPUT',operation);
    const [row]=await sql`SELECT core.admin_config_preview_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},
      ${input.base_version},${input.values===undefined?null:sql.json(input.values)},${input.rollback_version as string|undefined??null},
      ${input.reason},${operation}::uuid,${maximum}) AS result`;
    if(row.result.code!=='OK')return adminFailure(row.result.code,operation);
    const preview=row.result.data;
    return admittedOutput(failure,async tx=>{
      const [eligible]=await tx`SELECT core.admin_stepup_target_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},${preview.action_digest}) AS result`;
      return eligible.result.code==='OK'?jsonOutput(tx,preview):adminFailure(eligible.result.code,operation);
    });
  }
  if(!adminKeys(input,['preview_id','preview_digest','stepup_id','operation_id'])||typeof input.preview_id!=='string'||!adminUuid.test(input.preview_id)||
    typeof input.preview_digest!=='string'||!adminDigest.test(input.preview_digest)||typeof input.stepup_id!=='string'||!adminUuid.test(input.stepup_id))return adminFailure('INVALID_INPUT',operation);
  const kind=path==='/admin/config/rollbacks'?'rollback':'release';
  const [row]=await sql`SELECT core.admin_config_commit_result(${actor.account}::uuid,${actor.session}::uuid,${env},${actor.aal},
    ${input.preview_id}::uuid,${input.preview_digest},${input.stepup_id}::uuid,${operation}::uuid,${kind},${maximum}) AS result`;
  if(row.result.code!=='OK')return adminFailure(row.result.code,operation);
  return admittedOutput(failure,async tx=>{
    const [receipt]=await tx`SELECT core.account_operation_result(${actor.account}::uuid,${actor.session}::uuid,${operation}::uuid,${env},${actor.aal}) AS result`;
    if(receipt.result.code!=='OK')return adminFailure(receipt.result.code,operation);
    if(receipt.result.data.state!=='succeeded'||!receipt.result.data.result)return adminFailure('SERVICE_UNAVAILABLE',operation);
    return jsonOutput(tx,receipt.result.data.result);
  });
}
