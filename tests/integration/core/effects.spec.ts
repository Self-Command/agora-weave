import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {test} from 'node:test';
import {sql,rows} from '../../fixtures/core/runtime.ts';
const env=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
const enqueue=(id:string,plugin='core',epoch=1)=>`INSERT INTO core.outbox(id,event_id,aggregate_id,aggregate_version,owner_plugin,lifecycle_epoch,effect_key,environment,created_at)
  VALUES('${id}','${randomUUID()}','40000000-0000-4000-8000-000000000001',1,'${plugin}',${epoch},'fixture:${id}','${env}','2000-01-01T00:00:00Z');`;
const claim=(id:string)=>`UPDATE core.outbox SET lease='${id}',lease_until=clock_timestamp()+interval '30 seconds' WHERE id='${id}' AND result IS NULL;`;
// Hold the policy barrier from setup through observation; the real worker stays running.
const observe=(statement:string)=>sql(`BEGIN;SELECT pg_advisory_xact_lock(17013,1);${statement}COMMIT;`)
  .split(/\r?\n/).filter(line=>line.startsWith('{')).map(line=>JSON.parse(line));
test('EF01: repeated delivery commits one inbox effect and one client invalidation',()=>{
  const id=randomUUID(),results=observe(`${enqueue(id)}${claim(id)}
    SELECT core.complete_outbox('${id}','${id}','core-events-v1','${env}');
    SELECT core.complete_outbox('${id}','${id}','core-events-v1','${env}');`);
  assert.equal(results[0].code,'OK');assert.equal(results[1].code,'OK');
  assert.equal(Number(rows(`SELECT count(*) AS total FROM core.inbox WHERE effect_key='fixture:${id}'`)[0].total),1);
  assert.equal(Number(rows(`SELECT count(*) AS total FROM core.event_delivery d JOIN core.outbox o ON o.event_id=d.event_id WHERE o.id='${id}'`)[0].total),1);
});
test('EF02: expired leases cannot commit effects and their next claimant receives a new lease',()=>{
  const id=randomUUID(),results=observe(`${enqueue(id)}${claim(id)}
    UPDATE core.outbox SET lease_until=clock_timestamp()-interval '1 second' WHERE id='${id}';
    SELECT core.complete_outbox('${id}','${id}','core-events-v1','${env}');
    SELECT core.claim_outbox('core-events-v1','${env}',50);`);
  assert.equal(results[0].code,'CONFLICT');
  const lease=results[1].items.find((entry:{id:string})=>entry.id===id);
  assert.ok(lease);assert.notEqual(lease.lease,id);
});
test('EF03: disabling a plugin after a lease is claimed prevents its final durable effect',()=>{
  const id=randomUUID(),results=observe(`
    INSERT INTO core.plugin_installation(plugin,environment,state,lifecycle_epoch) VALUES('fixture-effects','${env}','enabled',1)
      ON CONFLICT(environment,plugin) DO UPDATE SET state='enabled',lifecycle_epoch=1;
    ${enqueue(id,'fixture-effects')}${claim(id)}
    UPDATE core.plugin_installation SET state='disabled',lifecycle_epoch=2 WHERE plugin='fixture-effects' AND environment='${env}';
    SELECT core.complete_outbox('${id}','${id}','core-events-v1','${env}');`);
  assert.equal(results[0].code,'FORBIDDEN');
  assert.equal(Number(rows(`SELECT count(*) AS total FROM core.inbox WHERE effect_key='fixture:${id}'`)[0].total),0);
});
test('EF04: the long-lived worker uses a non-bypass role with no direct table access',()=>{
  assert.deepEqual(rows("SELECT rolsuper,rolcreaterole,rolcreatedb,rolbypassrls FROM pg_roles WHERE rolname='core_worker'")[0],
    {rolsuper:false,rolcreaterole:false,rolcreatedb:false,rolbypassrls:false});
  for(const table of ['resource','audit_event','outbox','security_journal'])assert.equal(sql(`SELECT has_table_privilege('core_worker','core.${table}','SELECT');`).trim(),'f');
});
test('EF05: an unclaimed effect cannot be completed with a null or fabricated lease',()=>{
  const id=randomUUID(),forged=randomUUID(),results=observe(`${enqueue(id)}
    SELECT core.complete_outbox('${id}',NULL,'core-events-v1','${env}');
    SELECT core.complete_outbox('${id}','${forged}','core-events-v1','${env}');
    SELECT jsonb_build_object('inbox_count',(SELECT count(*) FROM core.inbox WHERE effect_key='fixture:${id}'),
      'delivery_count',(SELECT count(*) FROM core.event_delivery d JOIN core.outbox o ON o.event_id=d.event_id WHERE o.id='${id}'));
    ${claim(id)}
    SELECT core.complete_outbox('${id}',NULL,'core-events-v1','${env}');
    SELECT core.complete_outbox('${id}','${id}','core-events-v1','${env}');`);
  assert.equal(results[0].code,'CONFLICT');assert.equal(results[1].code,'CONFLICT');
  assert.deepEqual(results[2],{inbox_count:0,delivery_count:0});
  assert.equal(results[3].code,'CONFLICT');assert.equal(results[4].code,'OK');
  assert.equal(results[4].reused,false);
});

test('EF06: null consumer, environment or batch bounds cannot claim unbounded work',()=>{
  const id=randomUUID(),results=observe(`${enqueue(id)}
    SELECT core.claim_outbox(NULL,'${env}',20);
    SELECT core.claim_outbox('core-events-v1',NULL,20);
    SELECT core.claim_outbox('core-events-v1','${env}',NULL);
    SELECT jsonb_build_object('attempt',attempt,'lease',lease) FROM core.outbox WHERE id='${id}';`);
  assert.deepEqual(results.slice(0,3).map(result=>result.code),['INVALID_INPUT','INVALID_INPUT','INVALID_INPUT']);
  assert.deepEqual(results[3],{attempt:0,lease:null});
});
