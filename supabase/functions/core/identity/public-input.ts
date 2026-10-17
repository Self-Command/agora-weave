const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digest=/^[a-f0-9]{64}$/;
const match=(v:unknown,p:RegExp):v is string=>typeof v==='string' && v.trim()===v && p.test(v);
const object=(v:unknown):v is Record<string,unknown>=>v!==null && typeof v==='object' && !Array.isArray(v);
const keys=(v:Record<string,unknown>,allowed:string[])=>Object.keys(v).every(k=>allowed.includes(k));
const age=(v:unknown)=>object(v) && keys(v,['version','declared']) && typeof v.version==='string' &&
  v.version.length>0 && v.version.length<=128 && typeof v.declared==='boolean';
export function challengeInput(input:Record<string,unknown>) {
  if (!keys(input,['phone','purpose','operation_id','invitation_ref','age_declaration','document_set_digest']) ||
    !match(input.phone,/^\+[1-9]\d{7,14}$/) ||
    !['login','register'].includes(String(input.purpose)) || !match(input.operation_id,uuid)) return null;
  if (input.purpose==='login' && Object.keys(input).some(k=>!['phone','purpose','operation_id'].includes(k))) return null;
  if (input.purpose==='register' && (typeof input.invitation_ref!=='string' || input.invitation_ref.length<1 || input.invitation_ref.length>256 ||
    Array.from(input.invitation_ref).some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127) || !age(input.age_declaration) ||
    !match(input.document_set_digest,digest))) return null;
  return {phone:input.phone,purpose:input.purpose as 'login'|'register',operation_id:input.operation_id,
    context:input.purpose==='login' ? {} : {invitation_ref:input.invitation_ref,age_declaration:input.age_declaration,document_set_digest:input.document_set_digest}};
}
export function verifyInput(input:Record<string,unknown>) {
  if (!keys(input,['challenge_id','otp','operation_id','age_declaration','document_set_digest','consents']) ||
    !match(input.challenge_id,uuid) || !match(input.otp,/^\d{6}$/) || !match(input.operation_id,uuid)) return null;
  const hasRegistration=['age_declaration','document_set_digest','consents'].some(k=>Object.hasOwn(input,k));
  if (hasRegistration && (!age(input.age_declaration) || !match(input.document_set_digest,digest) ||
    !Array.isArray(input.consents) || input.consents.some(c=>!object(c) || !keys(c,['release_id','digest','decision']) ||
      !match(c.release_id,uuid) || !match(c.digest,digest) ||
      !['consented','presented','acknowledged'].includes(String(c.decision))))) return null;
  return {challenge_id:input.challenge_id,otp:input.otp,operation_id:input.operation_id,
    verification:hasRegistration ? {age_declaration:input.age_declaration,document_set_digest:input.document_set_digest,consents:input.consents} : {}};
}
