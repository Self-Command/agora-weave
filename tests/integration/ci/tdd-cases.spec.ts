import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectTddCases } from '../../../tools/ci/tdd-cases.ts';

const tap = 'ok 1 - A01: aggregate accepts complete evidence\nnot ok 2 - A01: archive retains failed original\n' +
  'ok 3 - E02: required failed execution rejects\nok 4 - E02: required skipped execution rejects\n';

test('TP01: exact original titles select loop cases and overlapping case IDs without borrowing another behavior', () => {
  const titles = ['A01: archive retains failed original', 'E02: required failed execution rejects', 'E02: required skipped execution rejects'];
  assert.deepEqual(selectTddCases(tap, { case_titles: titles }), titles.map((title, index) => ({ title, failed: index === 0 })));
});

test('TP02: missing duplicated or ambiguous source assertions cannot enter a TDD cycle', () => {
  for (const input of [ { case_titles: ['missing'] }, { case_titles: ['A01: archive retains failed original', 'A01: archive retains failed original'] },
    { case_ids: ['A01'] }, { case_titles: [] } ]) assert.deepEqual(selectTddCases(tap, input), []);
  assert.deepEqual(selectTddCases(tap + 'ok 5 - A01: archive retains failed original\n', { case_titles: ['A01: archive retains failed original'] }), []);
});
