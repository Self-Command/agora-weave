import {drainOutbox,type EffectStore} from './outbox.ts';
import {SecurityJournal,type JournalRecord} from './security-journal.ts';
export type WorkerStore=EffectStore & {reconcile():Promise<{code:string;watermark?:number|string}>;records(after:number):Promise<JournalRecord[]>;closeOutput():Promise<void>};
export async function workerTick(store:WorkerStore,journal:SecurityJournal){
  try{
    const result=await store.reconcile(),watermark=Number(result.watermark);
    if(result.code!=='OK' || !['number','string'].includes(typeof result.watermark) ||
      typeof result.watermark==='string' && !/^\d+$/.test(result.watermark) ||
      !Number.isSafeInteger(watermark) || watermark<0)throw new Error('JOURNAL_GAP');
    await journal.initialize();
    if(journal.watermark>watermark)throw new Error('JOURNAL_GAP');
    if(journal.watermark>0){
      const [anchor]=await store.records(journal.watermark-1);
      if(!anchor || Number(anchor.seq)!==journal.watermark || anchor.hash_chain!==journal.headHash)throw new Error('JOURNAL_GAP');
    }
    for(let batch=0;batch<20;batch++){
      const records=await store.records(journal.watermark);await journal.append(records);
      if(records.length<100){
        if(journal.watermark<watermark)throw new Error('JOURNAL_GAP');
        break;
      }
    }
    // Keep a bounded cycle while a healthy archive catches up; effects wait for
    // at least the independently reconciled head to be durable on disk.
    if(journal.watermark<watermark)return 0;
  }catch(error){
    await store.closeOutput();
    throw error;
  }
  return drainOutbox(store);
}
