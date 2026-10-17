import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeText, countVisibleCharacters } from '../../../packages/contracts/src/graphemes.ts';
import { readFileSync } from 'node:fs';
import { denoConformance } from '../../fixtures/unicode/deno-runtime.ts';
const vectors: [string, number][] = [['👨‍👩‍👧‍👦', 1], ['👍🏽', 1], ['🇨🇳', 1], ['e\u0301', 1], ['क्‍ष', 1], ['中 文', 3], ['\t \n', 3], ['', 0]];
test('GC01: Unicode seventeen extended grapheme clusters count composite emoji, combining marks and whitespace without trimming', () => {
  for (const [input, expected] of vectors) {
    let actual: number | undefined;
    assert.doesNotThrow(() => { actual = countVisibleCharacters(input); }, 'The shared character counter must be callable');
    assert.equal(actual, expected, JSON.stringify(input));
  }
});
test('GC02: CRLF and lone CR normalize to LF while preserving all other user text', () => {
  assert.equal(normalizeText('  中\r\n文\r末尾  '), '  中\n文\n末尾  ');
  assert.equal(countVisibleCharacters('a\r\nb\rc'), 5);
});
test('GC03: the shared counter conforms to every official Unicode 17 grapheme-break vector',()=>{
  const lines=readFileSync('tests/fixtures/unicode/GraphemeBreakTest-17.0.0.txt','utf8').split(/\r?\n/);
  let executed=0;
  for(const line of lines){
    const expression=line.split('#')[0].trim();if(!expression)continue;
    const parts=expression.split(/\s+/),expected=parts.filter(value=>value==='÷').length-1;
    const input=String.fromCodePoint(...parts.filter(value=>/^[0-9A-F]+$/.test(value)).map(value=>parseInt(value,16)));
    assert.equal(countVisibleCharacters(input),expected,expression);executed++;
  }
  assert.ok(executed>=700,'A nonempty official conformance suite is required');
});
test('GC04: the pinned real Deno Edge Runtime passes the same complete official vectors',async()=>{
  const result=await denoConformance();assert.equal(result.engine,'Deno');assert.equal(result.failed,0);assert.equal(result.executed,766);
});
