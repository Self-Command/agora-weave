import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { readFileSync } from 'node:fs';
import { account,request,sql,token } from '../../fixtures/core/runtime.ts';
import { activateConfiguration } from '../../fixtures/core/configuration.ts';
import { randomUUID } from 'node:crypto';
const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
before(()=>{sql(readFileSync('tests/fixtures/core/policy.sql','utf8'));activateConfiguration(env);});
const get=(release='fixture-v1')=>request('/config/effective?consumer=mobile',{token:token(),headers:{'X-Client-Release':release}});

test('EC01: live configuration uses the shared complete resolver and rejects unregistered client releases without partial values',()=>{
  const response=get();assert.equal(response.status,200);assert.equal(response.data.data.values['content.body_limit'],2000);
  assert.equal(response.data.data.values['content.long_body_limit'],10000);assert.equal(response.data.data.values['media.video_bytes'],200000000);
  const incompatible=get('unknown-release');assert.equal(incompatible.status,503);assert.equal(incompatible.data.code,'CONFIG_UNAVAILABLE');assert.equal(incompatible.data.data,undefined);
  sql(`UPDATE core.config_definition SET default_value='1234'::jsonb WHERE key='content.body_limit';`);
  try{assert.equal(get().data.data.values['content.body_limit'],2000,'A fixed bundle cannot drift when registry defaults change');}
  finally{sql(`UPDATE core.config_definition SET default_value='2000'::jsonb WHERE key='content.body_limit';`);}
});
test('EC02: equal-priority authorized groups cannot silently select different current values',()=>{
  sql(`INSERT INTO core.config_group_membership(subject,group_key,environment,owner) VALUES ('${account()}','fixture-a','${env}','core'),('${account()}','fixture-b','${env}','core') ON CONFLICT DO NOTHING;`);
  activateConfiguration(env,'foundation-conflict-v1',[
    {scope:'global',values:{}},
    {scope:'user_group',environment:env,owner:'core',group:'fixture-a',priority:2,values:{'content.body_limit':1750}},
    {scope:'user_group',environment:env,owner:'core',group:'fixture-a',priority:1,values:{'content.body_limit':1000}},
    {scope:'user_group',environment:env,owner:'core',group:'fixture-b',priority:1,values:{'content.body_limit':1500}},
  ]);
  try{assert.equal(get().status,503);}finally{activateConfiguration(env);}
});
test('EC03: share projection ignores opposing account preferences and excludes policy, cost and account values',()=>{
  const read=()=>request('/config/effective?consumer=share',{token:token(1,{aud:'share-read'}),headers:{'X-Client-Release':'fixture-v1'}});
  sql(`UPDATE core.user_preferences SET video_policy='always',preload=false WHERE account_id='${account()}';`);
  const first=read();assert.equal(first.status,200);
  sql(`UPDATE core.user_preferences SET video_policy='never',preload=true WHERE account_id='${account()}';`);
  const second=read();assert.equal(second.status,200);assert.deepEqual(first.data.data,second.data.data);
  assert.equal(second.data.data.values['media.video_default'],'wifi_only');
  assert.doesNotMatch(JSON.stringify(second.data.data),/otp|daily_cost|read_receipt|video_policy|preload|phone_change/);
  assert.equal(request('/config/effective?consumer=share&account_id='+account(),{token:token(1,{aud:'share-read'})}).status,422);
});
test('EC04: fixing a compatible bundle never freezes the current account session or restore gate',()=>{
  assert.equal(get().status,200);
  sql(`UPDATE core.restore_gate SET state='closed' WHERE environment='${env}';`);
  const logout=randomUUID(),recovery=randomUUID();
  try{
    assert.equal(get().status,503);assert.equal(request('/posts/40000000-0000-4000-8000-000000000001').status,503);
    assert.equal(request('/auth/logout',{method:'POST',token:token(),body:{operation_id:logout}}).status,503);
    assert.equal(request('/recovery-cases',{method:'POST',token:token(),body:{operation_id:recovery,mode:'manual'}}).status,503);
    assert.equal(sql(`SELECT count(*) FROM core.operation WHERE operation_id IN ('${logout}','${recovery}');`).trim(),'0');
  }
  finally{sql(`UPDATE core.restore_gate SET state='open' WHERE environment='${env}';`);}
});
