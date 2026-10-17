import { createHash } from 'node:crypto';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Test-only build instrumentation: no page, route or production runtime switch is added.
const action=process.argv[2],directory=process.argv[3] || 'native-output';
if(action==='prepare') {
  if(process.env.GITHUB_ACTIONS!=='true' || process.env.RUNNER_ENVIRONMENT!=='github-hosted') throw new Error('Native probe requires an isolated Actions checkout');
  const vectorFile='tests/fixtures/unicode/GraphemeBreakTest-17.0.0.txt';
  const vectors=readFileSync(vectorFile,'utf8').split(/\r?\n/).map(line=>line.split('#')[0].trim()).filter(Boolean).map(line=>{
    const parts=line.split(/\s+/);
    return [String.fromCodePoint(...parts.filter(value=>/^[0-9A-F]+$/.test(value)).map(value=>parseInt(value,16))),parts.filter(value=>value==='÷').length-1];
  });
  const sourceDigest=createHash('sha256').update(readFileSync('packages/contracts/src/graphemes.ts')).digest('hex');
  const vectorDigest=createHash('sha256').update(readFileSync(vectorFile)).digest('hex');
  const probe=`import {Platform} from 'react-native';
import {countVisibleCharacters,normalizeText} from '../../packages/contracts/src/graphemes';
const vectors=${JSON.stringify(vectors)} as [string,number][];
const hermes=!!(globalThis as unknown as {HermesInternal?:unknown}).HermesInternal;
let failed=hermes?0:1;
for(const [input,expected] of vectors)if(countVisibleCharacters(input)!==expected)failed++;
if(normalizeText('  a\\r\\nb\\rc  ')!=='  a\\nb\\nc  ')failed++;
const result={engine:hermes?'Hermes':'unexpected',platform:Platform.OS,executed:vectors.length,failed,
source:'actual-native-app-runtime',source_digest:'${sourceDigest}',vector_digest:'${vectorDigest}'};
console.warn('AGORAWEAVE_UNICODE_RESULT:'+JSON.stringify(result));
if(failed)throw new Error('NATIVE_UNICODE_CONFORMANCE');
`;
  writeFileSync('apps/mobile/.ci-unicode-probe.ts',probe);
  const layout='apps/mobile/app/_layout.tsx',source=readFileSync(layout,'utf8');
  if(source.includes('.ci-unicode-probe'))throw new Error('Native probe already prepared');
  writeFileSync(layout,"import '../.ci-unicode-probe';\n"+source);
  mkdirSync(directory,{recursive:true});
  writeFileSync(resolve(directory,'unicode-input.json'),JSON.stringify({source_digest:sourceDigest,vector_digest:vectorDigest,expected_vectors:vectors.length})+'\n');
} else if(action==='check') {
  const platform=process.argv[4];
  if(!['android','ios'].includes(platform))throw new Error('Explicit native platform required');
  const logs=readFileSync(resolve(directory,'unicode-runtime.log'),'utf8');
  const input=JSON.parse(readFileSync(resolve(directory,'unicode-input.json'),'utf8'));
  const records=[...logs.matchAll(/AGORAWEAVE_UNICODE_RESULT:(\{[^\r\n]*\})/g)].map(match=>JSON.parse(match[1]));
  if(!records.length || records.some(result=>result.engine!=='Hermes' || result.platform!==platform || result.failed!==0 ||
    result.executed!==input.expected_vectors || result.source_digest!==input.source_digest || result.vector_digest!==input.vector_digest)) {
    throw new Error('Actual native Hermes conformance result missing or failed');
  }
  writeFileSync(resolve(directory,'unicode-hermes.json'),JSON.stringify({state:'passed',...records[0],observed_runs:records.length},null,2)+'\n');
} else throw new Error('Use prepare or check');
