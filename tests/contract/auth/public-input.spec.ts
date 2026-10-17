import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { challengeInput,verifyInput } from '../../../supabase/functions/core/identity/public-input.ts';
import { trustedClientIp } from '../../../supabase/functions/core/identity/ingress.ts';
import { authLifetimeCompatible } from '../../../supabase/functions/core/identity/auth-lifetime.ts';
test('PI01: public inputs reject identity, digest, audience and unregistered purpose selectors before any dependency',()=>{
  const input={phone:'+8613800000000',purpose:'login',operation_id:randomUUID()};
  assert.deepEqual(challengeInput(input),{...input,context:{}});
  for (const extra of [{actor:randomUUID()},{phone_digest:'a'.repeat(64)},{ip:'127.0.0.1'},{audience:'share-read'},
    {purpose:'change_phone'},{phone:input.phone+'\n'},{operation_id:input.operation_id+'\n'},
    {age_declaration:{version:'adult-18-v1',declared:true}}]) assert.equal(challengeInput({...input,...extra}),null);
});
test('PI02: registration binds explicit declarations and the complete consent DTO without accepting server facts',()=>{
  const age={version:'adult-18-v1',declared:true},digest='a'.repeat(64);
  assert.ok(challengeInput({phone:'+85251234567',purpose:'register',operation_id:randomUUID(),invitation_ref:'synthetic-invite',
    age_declaration:age,document_set_digest:digest}));
  const input={challenge_id:randomUUID(),otp:'123456',operation_id:randomUUID(),age_declaration:age,document_set_digest:digest,
    consents:[{release_id:randomUUID(),digest,decision:'consented'}]};
  assert.ok(verifyInput(input));
  for (const extra of [{otp:'123456\n'},{verified:true},{consents:[{...input.consents[0],actor:randomUUID()}]},
    {age_declaration:{...age,verified:true}},{document_set_digest:digest+'\n'}]) assert.equal(verifyInput({...input,...extra}),null);
});
test('PI03: only the private gateway credential and explicit socket-peer field contribute to quota IP',()=>{
  const secret='a'.repeat(64),headers={'X-Core-Ingress-Token':secret,'X-Core-Client-IP':'2001:db8::1','X-Forwarded-For':'1.2.3.4'};
  const request=(patch:Record<string,string>={})=>new Request('https://controlled.invalid',{headers:{...headers,...patch}});
  assert.equal(trustedClientIp(request(),secret),'2001:db8::1');
  assert.equal(trustedClientIp(request({'X-Core-Ingress-Token':'b'.repeat(64)}),secret),null);
  assert.equal(trustedClientIp(request({'X-Core-Client-IP':'1.2.3.4,5.6.7.8'}),secret),null);
  assert.equal(trustedClientIp(new Request('https://controlled.invalid',{headers:{'X-Forwarded-For':'1.2.3.4'}}),secret),null);
  assert.equal(trustedClientIp(request(),undefined),null);
});
test('PI04: delayed provider work cannot extend the advertised lifetime beyond the original Auth OTP deadline',()=>{
  const issued='2026-10-17T00:00:00.000Z';
  assert.equal(authLifetimeCompatible('2026-10-17T00:01:00.000Z',issued,'60'),true);
  assert.equal(authLifetimeCompatible('2026-10-17T00:01:05.000Z',issued,'60'),false);
  for(const value of ['','invalid','0','1.5','9007199254740992',undefined])
    assert.equal(authLifetimeCompatible('2026-10-17T00:01:00.000Z',issued,value),false);
  assert.equal(authLifetimeCompatible('invalid',issued,'60'),false);
});
