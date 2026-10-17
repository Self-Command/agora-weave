import { execFileSync,spawnSync } from 'node:child_process';
import { mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync } from 'node:fs';
import { join,resolve,sep } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

/** Run the actual pinned Edge Runtime without service credentials or published ports. */
export async function edgeRuntimeProbe(source:string,tag:string) {
  if(!/^[A-Z_]{1,40}$/.test(tag))throw new Error('Invalid runtime result tag');
  const lock=JSON.parse(readFileSync('infra/ci/images.lock.json','utf8'));
  const image=lock.images.find((entry:{reference:string})=>entry.reference.startsWith('supabase/edge-runtime:')).repo_digests[0];
  const local=process.env.AGORAWEAVE_EXECUTION_SOURCE==='local';
  const base=local?resolve('.agoraweave/local',process.env.AGORAWEAVE_LOCAL_ENVIRONMENT!,'tmp'):process.env.RUNNER_TEMP || tmpdir();
  mkdirSync(base,{recursive:true});const directory=mkdtempSync(join(base,'unicode-')),container=`agoraweave-unicode-${randomUUID()}`;
  if(!resolve(directory).startsWith(resolve(base)+sep))throw new Error('Unexpected conformance temporary path');
  writeFileSync(join(directory,'index.ts'),source);
  const docker=(args:string[])=>execFileSync('docker',args,{encoding:'utf8',timeout:60000,stdio:['ignore','pipe','pipe']});
  try {
    docker(['run','-d','--name',container,'--mount',`type=bind,source=${directory},target=/unicode,readonly`,image,'start','--main-service','/unicode']);
    for(let attempt=0;attempt<100;attempt++){
      const logs=spawnSync('docker',['logs',container],{encoding:'utf8',timeout:10000});
      const output=(logs.stdout || '')+(logs.stderr || ''),found=output.match(new RegExp(tag+':([^\\r\\n]+)'));
      if(found)return JSON.parse(found[1]);
      if(docker(['inspect','--format','{{.State.Running}}',container]).trim()!=='true')throw new Error('Deno conformance runtime stopped');
      await new Promise(done=>setTimeout(done,500));
    }
    throw new Error('Deno conformance runtime timed out');
  } finally {
    try{docker(['rm','-f',container]);}finally{rmSync(directory,{recursive:true,force:true});}
  }
}

export async function denoConformance(){
  const vectors=readFileSync('tests/fixtures/unicode/GraphemeBreakTest-17.0.0.txt','utf8').split(/\r?\n/)
    .map(line=>line.split('#')[0].trim()).filter(Boolean).map(line=>{const parts=line.split(/\s+/);
      return [String.fromCodePoint(...parts.filter(value=>/^[0-9A-F]+$/.test(value)).map(value=>parseInt(value,16))),parts.filter(value=>value==='÷').length-1];});
  const source=readFileSync('packages/contracts/src/graphemes.ts','utf8').replace("'unicode-segmenter/grapheme'","'npm:unicode-segmenter@0.17.3/grapheme'");
  return edgeRuntimeProbe(`${source}\nconst vectors=${JSON.stringify(vectors)};\nfor(const [input,expected] of vectors){if(countVisibleCharacters(input as string)!==expected)throw new Error('UNICODE_CONFORMANCE');}\nconsole.log('UNICODE_RESULT:'+JSON.stringify({engine:'Deno',version:Deno.version.deno,executed:vectors.length,failed:0}));\nDeno.serve(()=>new Response('ok'));\n`,'UNICODE_RESULT');
}
