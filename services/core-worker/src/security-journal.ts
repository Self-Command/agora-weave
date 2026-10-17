import { open,mkdir,readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

export type JournalRecord={seq: number|string;previous_hash: string;hash_chain: string;[key:string]:unknown};
type NativeArchiveRuntime={open(path:string,options:{write:boolean;create:boolean;append:boolean;mode:number}):Promise<{
  write(bytes:Uint8Array):Promise<number>;sync():Promise<void>;close():void;
}>};
// Match the jsonb text hashed by the independent ledger. Restriction facts contain
// only JSON strings, booleans, nulls and safe integer counters.
function canonical(value:unknown):string {
  if(value===null || typeof value==='string' || typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='number' && Number.isSafeInteger(value))return String(value);
  if(Array.isArray(value))return '['+value.map(canonical).join(', ')+']';
  if(value && typeof value==='object'){
    const encoder=new TextEncoder();
    const keys=Object.keys(value).sort((a,b)=>{
      const left=encoder.encode(a),right=encoder.encode(b);
      if(left.length!==right.length)return left.length-right.length;
      for(let index=0;index<left.length;index++)if(left[index]!==right[index])return left[index]-right[index];
      return 0;
    });
    return '{'+keys.map(key=>JSON.stringify(key)+': '+canonical((value as Record<string,unknown>)[key])).join(', ')+'}';
  }
  throw new Error('JOURNAL_GAP');
}
function verify(record:JournalRecord,sequence:number,previous:string){
  if(!Number.isSafeInteger(Number(record.seq)) || Number(record.seq)!==sequence+1 || record.previous_hash!==previous ||
    !/^[a-f0-9]{64}$/.test(record.hash_chain))throw new Error('JOURNAL_GAP');
  const fields=Object.fromEntries(['intent_id','kind','transaction_ref','target','subject','action','policy_epoch','payload']
    .map(key=>[key,record[key]]));
  if(createHash('sha256').update(previous+canonical(fields)).digest('hex')!==record.hash_chain)throw new Error('JOURNAL_GAP');
}
/** The archive is on its own persisted filesystem, outside business backup/restore paths. */
export class SecurityJournal {
  private sequence=0;
  private hash='';
  private initialized=false;
  private path: string;
  constructor(path: string) { this.path=path; }
  async initialize() {
    if(this.initialized)return;
    let bytes='';try{bytes=await readFile(this.path,'utf8');}catch(error){if((error as {code?:string}).code!=='ENOENT')throw error;}
    if(bytes && !bytes.endsWith('\n'))throw new Error('JOURNAL_GAP');
    let sequence=0,hash='';
    for(const line of bytes.split('\n').filter(Boolean)){
      const record=JSON.parse(line) as JournalRecord;
      verify(record,sequence,hash);
      sequence=Number(record.seq);hash=record.hash_chain;
    }
    this.sequence=sequence;this.hash=hash;
    this.initialized=true;
  }
  get watermark(){return this.sequence;}
  get headHash(){return this.hash;}
  async append(records: JournalRecord[]){
    await this.initialize();if(!records.length)return;
    let sequence=this.sequence,hash=this.hash;
    for(const record of records){
      verify(record,sequence,hash);
      sequence=Number(record.seq);hash=record.hash_chain;
    }
    await mkdir(dirname(this.path),{recursive:true,mode:0o700});
    const bytes=new TextEncoder().encode(records.map(record=>JSON.stringify(record)).join('\n')+'\n');
    const native=(globalThis as typeof globalThis & {Deno?:NativeArchiveRuntime}).Deno;
    try{
      if(native){
        // The pinned Edge Runtime's Node FileHandle has no sync method.
        const handle=await native.open(this.path,{write:true,create:true,append:true,mode:0o600});
        try{
          let offset=0;
          while(offset<bytes.length){const written=await handle.write(bytes.subarray(offset));if(written<=0)throw new Error('ARCHIVE_IO');offset+=written;}
          await handle.sync();
        }finally{handle.close();}
      }else{
        const handle=await open(this.path,'a',0o600);
        try{await handle.writeFile(bytes);await handle.sync();}finally{await handle.close();}
      }
    }catch(error){this.initialized=false;this.sequence=0;this.hash='';throw error;}
    this.sequence=sequence;this.hash=hash;
  }
}
