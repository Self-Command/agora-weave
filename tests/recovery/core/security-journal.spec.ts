import assert from 'node:assert/strict';
import { before,test } from 'node:test';
import { readFileSync } from 'node:fs';
import { sql,rows } from '../../fixtures/core/runtime.ts';
import { compose } from '../../../tools/ci/core-database.ts';
import { randomUUID } from 'node:crypto';
import { mkdtemp,writeFile,unlink,rmdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { SecurityJournal,type JournalRecord } from '../../../services/core-worker/src/security-journal.ts';
import { workerTick } from '../../../services/core-worker/src/worker.ts';
import { request } from '../../fixtures/core/runtime.ts';
import { edgeRuntimeProbe } from '../../fixtures/unicode/deno-runtime.ts';
before(()=>{sql(readFileSync('tests/fixtures/core/policy.sql','utf8'));sql('SELECT core.reconcile_security_journal();');});
const target='40000000-0000-4000-8000-000000000002';
test('SJ01: a rolled-back business restriction leaves its independently committed deny intent and closes output until reconciliation',()=>{
  const previous=JSON.parse(sql('SELECT core.archive_head();').trim());
  // A session lock keeps the real reconciler behind this observation barrier.
  // The production worker remains running and is free to reconcile after release.
  const observation=sql(`SELECT pg_advisory_lock(17013,1);
    BEGIN; UPDATE core.resource SET visibility='self' WHERE id='${target}'; ROLLBACK;
    SELECT jsonb_build_object('head',core.archive_head(),'ready',core.archive_ready(),
      'context',core.policy_context_result(NULL::uuid,NULL::uuid,'${process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT}'));
    SELECT pg_advisory_unlock(17013,1);`).split(/\r?\n/).find(line=>line.startsWith('{'))!;
  const after=JSON.parse(observation);
  assert.ok(Number(after.head.seq)>Number(previous.seq));assert.equal(after.ready,false);
  assert.equal(after.context.code,'SERVICE_UNAVAILABLE');
  assert.equal(rows(`SELECT visibility FROM core.resource WHERE id='${target}'`)[0].visibility,'followers');
  assert.equal(JSON.parse(sql('SELECT core.reconcile_security_journal();').trim()).code,'OK');
  assert.equal(sql('SELECT core.archive_ready();').trim(),'t');
});
test('SJ02: a committed restriction is archived before the local result and reconciliation preserves immutable history',()=>{
  sql(`UPDATE core.resource SET visibility='self' WHERE id='${target}';`);
  const entry=rows("SELECT archive_seq,hash_chain FROM core.security_journal WHERE archive_seq IS NOT NULL ORDER BY archive_seq DESC LIMIT 1")[0];
  assert.ok(Number(entry.archive_seq)>0);assert.match(String(entry.hash_chain),/^[a-f0-9]{64}$/);
  assert.equal(sql('SELECT core.archive_ready();').trim(),'t');
  assert.equal(JSON.parse(sql('SELECT core.reconcile_security_journal();').trim()).code,'OK');
  sql(`UPDATE core.resource SET visibility='followers' WHERE id='${target}';SELECT core.reconcile_security_journal();`);
});
test('SJ03: losing the independent writer prevents the restriction from committing',()=>{
  const admin=(statement: string)=>compose(['exec','-T','db','psql','-X','-qAt','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1'],statement);
  admin(`SELECT extensions.dblink_exec('core_security','ALTER FUNCTION journal.append(uuid,text,text,uuid,uuid,text,bigint,jsonb) RENAME TO unavailable_append');`);
  try {
    assert.throws(()=>sql(`UPDATE core.resource SET visibility='self' WHERE id='${target}';`));
    assert.equal(rows(`SELECT visibility FROM core.resource WHERE id='${target}'`)[0].visibility,'followers');
  } finally {
    admin(`SELECT extensions.dblink_exec('core_security','ALTER FUNCTION journal.unavailable_append(uuid,text,text,uuid,uuid,text,bigint,jsonb) RENAME TO append');`);
  }
});
test('SJ04: resolved independent commits missing from a restored business snapshot keep normal output closed',()=>{
  const intent=randomUUID(),environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
  const gates=rows('SELECT environment,state FROM core.restore_gate');
  const admin=(statement:string)=>compose(['exec','-T','db','psql','-X','-qAt','-U','supabase_admin','-d','postgres','-v','ON_ERROR_STOP=1'],statement);
  const result=admin(`BEGIN;
    SELECT core.archive_append('${intent}','intent',pg_current_xact_id()::text,'${target}',NULL,'resource.update',1,'{"table":"resource","mutation":"UPDATE","fields":{"visibility":"self"}}');
    SELECT core.archive_append('${intent}','committed',pg_current_xact_id()::text,'${target}',NULL,'resource.update',1,'{"table":"resource","mutation":"UPDATE","fields":{"visibility":"self"}}');
    COMMIT;`).split(/\r?\n/).filter(line=>line.startsWith('{')).map(line=>JSON.parse(line));
  const archived=result[0];
  try{
    assert.equal(JSON.parse(sql('SELECT core.reconcile_security_journal();').trim()).code,'JOURNAL_GAP');
    assert.equal(sql(`SELECT state FROM core.restore_gate WHERE environment='${environment}';`).trim(),'closed');
    assert.equal(JSON.parse(sql(`SELECT core.policy_context_result(NULL::uuid,NULL::uuid,'${environment}');`).trim()).code,'SERVICE_UNAVAILABLE');
  }finally{
    // Complete the synthetic restored projection explicitly; reconciliation itself must not invent it.
    sql(`INSERT INTO core.security_journal(deny_intent_id,target,action,policy_epoch,committed_result,hash_chain,archive_seq)
      VALUES('${intent}','${target}','resource.update',1,'committed','${archived.hash_chain}',${archived.seq});
      SELECT core.reconcile_security_journal();`);
    for(const gate of gates)sql(`UPDATE core.restore_gate SET state='${gate.state}' WHERE environment='${gate.environment}';`);
  }
});

test('SJ05: filesystem append and restart verify actual independent ledger payload hashes, not just hash shape',async()=>{
  const records=JSON.parse(sql('SELECT core.archive_records(0,100);').trim()) as JournalRecord[];
  assert.ok(records.length>0);
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  try{
    const journal=new SecurityJournal(path);await journal.append(records);
    const restart=new SecurityJournal(path);await restart.initialize();assert.equal(restart.watermark,records.length);
    const corrupted=structuredClone(records);corrupted[0].payload={state:'tampered'};
    await writeFile(path,corrupted.map(record=>JSON.stringify(record)).join('\n')+'\n');
    await assert.rejects(()=>new SecurityJournal(path).initialize(),/JOURNAL_GAP/);
    await unlink(path);
    await assert.rejects(()=>new SecurityJournal(path).append(corrupted),/JOURNAL_GAP/);
  }finally{
    await unlink(path).catch(error=>{if(error.code!=='ENOENT')throw error;});await rmdir(directory);
  }
});

test('SJ06: archive failure closes the real output gate before attempting any effects',async()=>{
  const environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
  const prior=rows(`SELECT state FROM core.restore_gate WHERE environment='${environment}'`)[0].state;
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  let claimed=false;
  await writeFile(path,'{');
  try{
    await assert.rejects(()=>workerTick({
      reconcile:async()=>JSON.parse(sql('SELECT core.reconcile_security_journal();').trim()),
      records:async after=>JSON.parse(sql(`SELECT core.archive_records(${after},100);`).trim()),
      closeOutput:async()=>{sql(`SELECT core.worker_close_output('${environment}');`);},
      claim:async()=>{claimed=true;return [];},complete:async()=>{},
    },new SecurityJournal(path)),/JOURNAL_GAP/);
    assert.equal(claimed,false);
    assert.equal(rows(`SELECT state FROM core.restore_gate WHERE environment='${environment}'`)[0].state,'closed');
    assert.equal(request('/posts/40000000-0000-4000-8000-000000000001').status,503);
  }finally{
    sql(`UPDATE core.restore_gate SET state='${prior}' WHERE environment='${environment}';`);
    await unlink(path);await rmdir(directory);
  }
});

test('SJ07: the actual pinned Deno worker durably appends across cycles and restarts without duplicating records',async()=>{
  const records=JSON.parse(sql('SELECT core.archive_records(0,2);').trim());assert.equal(records.length,2);
  const source=readFileSync('services/core-worker/src/security-journal.ts','utf8');
  const result=await edgeRuntimeProbe(`${source}
    const records=${JSON.stringify(records)},path='/tmp/security-journal.ndjson';
    const journal=new SecurityJournal(path);await journal.append(records.slice(0,1));await journal.append(records.slice(1));
    const restart=new SecurityJournal(path);await restart.initialize();
    const persisted=await Deno.readTextFile(path);
    if(restart.watermark!==2 || persisted.trim().split('\\n').length!==2)throw new Error('ARCHIVE_RESTART');
    records[0].payload={tampered:true};await Deno.writeTextFile(path,records.map(row=>JSON.stringify(row)).join('\\n')+'\\n');
    let rejected=false;try{await new SecurityJournal(path).initialize();}catch{rejected=true;}
    if(!rejected)throw new Error('ARCHIVE_INTEGRITY');
    console.log('JOURNAL_RESULT:'+JSON.stringify({engine:'Deno',records:2,integrity_rejected:rejected}));Deno.serve(()=>new Response('ok'));
  `,'JOURNAL_RESULT');
  assert.deepEqual(result,{engine:'Deno',records:2,integrity_rejected:true});
});

test('SJ08: an invalid archive suffix cannot advance the in-memory watermark and a repaired file can be retried',async()=>{
  const records=JSON.parse(sql('SELECT core.archive_records(0,2);').trim()) as JournalRecord[];assert.equal(records.length,2);
  const corrupted=structuredClone(records);corrupted[1].payload={tampered:true};
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  try{
    await writeFile(path,corrupted.map(record=>JSON.stringify(record)).join('\n')+'\n');
    const journal=new SecurityJournal(path);
    await assert.rejects(()=>journal.initialize(),/JOURNAL_GAP/);assert.equal(journal.watermark,0);
    await writeFile(path,records.map(record=>JSON.stringify(record)).join('\n')+'\n');
    await journal.initialize();assert.equal(journal.watermark,2);
  }finally{await unlink(path);await rmdir(directory);}
});

test('SJ09: an independent head behind the durable file closes real output before any effect claim',async()=>{
  const records=JSON.parse(sql('SELECT core.archive_records(0,2);').trim()) as JournalRecord[];assert.equal(records.length,2);
  const environment=process.env.AGORAWEAVE_LOCAL_ENVIRONMENT || process.env.CI_ENVIRONMENT!;
  const prior=rows(`SELECT state FROM core.restore_gate WHERE environment='${environment}'`)[0].state;
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  let claimed=false,read=false;
  try{
    const journal=new SecurityJournal(path);await journal.append(records);
    await assert.rejects(()=>workerTick({
      // Inject a rolled-back remote watermark while keeping the verified durable file.
      reconcile:async()=>({code:'OK',watermark:1}),
      records:async()=>{read=true;return [];},
      closeOutput:async()=>{sql(`SELECT core.worker_close_output('${environment}');`);},
      claim:async()=>{claimed=true;return [];},complete:async()=>{},
    },journal),/JOURNAL_GAP/);
    assert.equal(read,false);assert.equal(claimed,false);
    assert.equal(rows(`SELECT state FROM core.restore_gate WHERE environment='${environment}'`)[0].state,'closed');
    assert.equal(request('/posts/40000000-0000-4000-8000-000000000001').status,503);
  }finally{
    sql(`UPDATE core.restore_gate SET state='${prior}' WHERE environment='${environment}';`);
    await unlink(path);await rmdir(directory);
  }
});

test('SJ10: a record stream ending before its reconciled head is a gap and cannot claim effects',async()=>{
  const records=JSON.parse(sql('SELECT core.archive_records(0,2);').trim()) as JournalRecord[];assert.equal(records.length,2);
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  let claimed=false,closed=false;
  try{
    const journal=new SecurityJournal(path);
    await assert.rejects(()=>workerTick({
      reconcile:async()=>({code:'OK',watermark:3}),records:async()=>records,
      closeOutput:async()=>{closed=true;},
      claim:async()=>{claimed=true;return [];},complete:async()=>{},
    },journal),/JOURNAL_GAP/);
    assert.equal(closed,true);assert.equal(claimed,false);assert.equal(journal.watermark,2);
  }finally{await unlink(path);await rmdir(directory);}
});

test('SJ11: a bounded archive catch-up waits until the reconciled head before draining effects',async()=>{
  // PostgreSQL supplies its real jsonb canonical hashes without creating ledger
  // facts or changing the shared independent security database.
  const records=JSON.parse(sql(`WITH RECURSIVE chain(seq,previous_hash,hash_chain,fields) AS (
    SELECT 0,''::text,''::text,jsonb_build_object('intent_id','${randomUUID()}','kind','intent',
      'transaction_ref','fixture','target','${target}','subject',NULL,'action','fixture.archive','policy_epoch',1,'payload','{}'::jsonb)
    UNION ALL SELECT seq+1,hash_chain,encode(sha256(convert_to(hash_chain||fields::text,'UTF8')),'hex'),fields FROM chain WHERE seq<2001)
    SELECT jsonb_agg(fields||jsonb_build_object('seq',seq,'previous_hash',previous_hash,'hash_chain',hash_chain) ORDER BY seq)
      FROM chain WHERE seq>0;`).trim()) as JournalRecord[];
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson');
  let claimed=0,completed=0,closed=false;
  const store={
    reconcile:async()=>({code:'OK',watermark:2001}),records:async(after:number)=>records.slice(after,after+100),
    closeOutput:async()=>{closed=true;},
    claim:async()=>{claimed++;return [{id:randomUUID(),lease:randomUUID()}];},complete:async()=>{completed++;},
  };
  try{
    const journal=new SecurityJournal(path);
    assert.equal(await workerTick(store,journal),0);assert.equal(journal.watermark,2000);
    assert.equal(claimed,0);assert.equal(completed,0);assert.equal(closed,false);
    assert.equal(await workerTick(store,journal),1);assert.equal(journal.watermark,2001);
    assert.equal(claimed,1);assert.equal(completed,1);assert.equal(closed,false);
    const restart=new SecurityJournal(path);await restart.initialize();assert.equal(restart.watermark,2001);
  }finally{await unlink(path);await rmdir(directory);}
});

test('SJ12: a missing or divergent independent anchor closes output even when its watermark matches the durable file',async()=>{
  const chains=JSON.parse(sql(`WITH RECURSIVE chain(branch,seq,previous_hash,hash_chain,fields) AS (
    SELECT branch,0,''::text,''::text,jsonb_build_object('intent_id','${randomUUID()}','kind','intent',
      'transaction_ref','fixture','target','${target}','subject',NULL,'action','fixture.archive','policy_epoch',1,
      'payload',jsonb_build_object('branch',branch)) FROM (VALUES ('local'),('remote')) b(branch)
    UNION ALL SELECT branch,seq+1,hash_chain,encode(sha256(convert_to(hash_chain||fields::text,'UTF8')),'hex'),fields FROM chain WHERE seq<2),
    grouped AS (SELECT branch,jsonb_agg(fields||jsonb_build_object('seq',seq,'previous_hash',previous_hash,'hash_chain',hash_chain) ORDER BY seq) AS records
      FROM chain WHERE seq>0 GROUP BY branch)
    SELECT jsonb_object_agg(branch,records) FROM grouped;`).trim()) as {local:JournalRecord[];remote:JournalRecord[]};
  const directory=await mkdtemp(join(tmpdir(),'agoraweave-journal-')),path=join(directory,'journal.ndjson'),remotePath=join(directory,'remote.ndjson');
  try{
    const journal=new SecurityJournal(path),remote=new SecurityJournal(remotePath);
    await journal.append(chains.local);await remote.append(chains.remote);
    assert.equal(journal.watermark,remote.watermark);assert.notEqual(journal.headHash,remote.headHash);
    for(const anchor of [chains.remote.slice(1),[],[chains.local[0]]]){
      let claimed=false,closed=false;const reads:number[]=[];
      await assert.rejects(()=>workerTick({
        reconcile:async()=>({code:'OK',watermark:2}),records:async(after:number)=>{reads.push(after);return anchor;},
        closeOutput:async()=>{closed=true;},
        claim:async()=>{claimed=true;return [];},complete:async()=>{},
      },journal),/JOURNAL_GAP/);
      assert.deepEqual(reads,[1]);assert.equal(closed,true);assert.equal(claimed,false);
      assert.equal(journal.watermark,2);assert.equal(journal.headHash,chains.local[1].hash_chain);
    }
  }finally{await unlink(path);await unlink(remotePath);await rmdir(directory);}
});
