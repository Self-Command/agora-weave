import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeText, countVisibleCharacters } from '../../../packages/contracts/src/graphemes.ts';
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
