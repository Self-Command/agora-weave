import postgres from 'npm:postgres@3.4.7';
import {SecurityJournal} from './security-journal.ts';
import {workerTick} from './worker.ts';
import {effectResult} from './inbox.ts';
import '../../../deno/functions/main/index.ts';
const url=Deno.env.get('CORE_WORKER_DB_URL'),environment=Deno.env.get('CORE_ENVIRONMENT');
if(!url || new URL(url).username!=='core_worker' || !['dev','test','production'].includes(environment || ''))throw new Error('WORKER_CONFIGURATION');
const sql=postgres(url,{max:1,prepare:false,connect_timeout:3,idle_timeout:10,fetch_types:false,onnotice:()=>{}});
const journal=new SecurityJournal('/var/lib/agoraweave-security/journal.ndjson');
let running=false,lastFailure='';
setInterval(async()=>{
  if(running)return;running=true;
  try{
    await workerTick({
      reconcile:async()=>{const [row]=await sql`SELECT core.worker_reconcile() AS result`;return row.result;},
      records:async after=>{const [row]=await sql`SELECT core.worker_journal_records(${after}) AS result`;return row.result;},
      closeOutput:async()=>{await sql`SELECT core.worker_close_output(${environment})`;},
      claim:async()=>{const [row]=await sql`SELECT core.claim_outbox('core-events-v1',${environment},20) AS result`;
        if(row.result.code!=='OK')throw new Error('EFFECT_UNAVAILABLE');return row.result.items;},
      complete:async lease=>{const [row]=await sql`SELECT core.complete_outbox(${lease.id}::uuid,${lease.lease}::uuid,'core-events-v1',${environment}) AS result`;effectResult(row.result);},
    },journal);
    lastFailure='';
  }catch(error){
    const fault=error as {code?:string;name?:string;message?:string};
    const code=fault.code && /^[A-Z0-9_]{2,40}$/.test(fault.code)?fault.code:
      ['JOURNAL_GAP','EFFECT_UNAVAILABLE'].includes(fault.message || '')?fault.message:'WORKER_UNAVAILABLE';
    if(code!==lastFailure){console.error(JSON.stringify({event:'core_worker_cycle_failed',code}));lastFailure=code;}
  }
  finally{running=false;}
},500);
