import assert from 'node:assert/strict';
import { test } from 'node:test';
import { discoverApprovedTargets, normalizeExecution } from '../../../tools/ci/run-check-set.ts';

const discovery = () => ({ profile: 'bootstrap' as const,
  approved: [{ id: 'ci.target', command: 'ci:contracts', files: ['tests/contract/ci/evidence.spec.ts'] }],
  scripts: { 'ci:contracts': 'node --test tests/contract/ci/*.spec.ts' },
  available_files: ['tests/contract/ci/evidence.spec.ts'] });

test('D01: discovery returns a nonempty frozen executable target list', () => {
  const result = discoverApprovedTargets(discovery());
  assert.equal(result.state, 'discovered');
  assert.deepEqual(result.targets, [{ id: 'ci.target', command: 'ci:contracts', files: ['tests/contract/ci/evidence.spec.ts'] }]);
});

for (const mutation of ['empty', 'missing_script', 'missing_file', 'duplicate_id', 'extra_test', 'business_in_bootstrap'] as const) {
  test(`D02: ${mutation} cannot shrink or bypass approved discovery`, () => {
    const input = discovery();
    if (mutation === 'empty') input.approved = [];
    if (mutation === 'missing_script') input.scripts = {} as typeof input.scripts;
    if (mutation === 'missing_file') input.available_files = [];
    if (mutation === 'duplicate_id') input.approved.push(input.approved[0]);
    if (mutation === 'extra_test') input.available_files.push('tests/contract/ci/new-unmapped.spec.ts');
    if (mutation === 'business_in_bootstrap') { input.approved[0].files = ['tests/security/core/policy.spec.ts']; input.available_files = [...input.approved[0].files]; }
    assert.equal(discoverApprovedTargets(input).state, 'blocked');
  });
}

const execution = () => ({ format: 'tap', exit_code: 0,
  expected_count: 2, raw: 'TAP version 13\n# Subtest: first\nok 1 - first\n# Subtest: second\nok 2 - second\n1..2\n# tests 2\n# pass 2\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n' });

test('N01: only complete nonempty raw successful execution can pass', () => {
  const result = normalizeExecution(execution());
  assert.equal(result.state, 'passed');
  assert.equal(result.executed, 2);
  assert.equal(result.passed, 2);
});

for (const mutation of ['zero', 'skip', 'failure', 'exit', 'missing_summary', 'wrong_count'] as const) {
  test(`N02: raw ${mutation} cannot become a passing report`, () => {
    const input = execution();
    if (mutation === 'zero') { input.expected_count = 0; input.raw = '1..0\n# tests 0\n# pass 0\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n'; }
    if (mutation === 'skip') input.raw = input.raw.replace('# skipped 0', '# skipped 1').replace('ok 2 - second', 'ok 2 - second # SKIP');
    if (mutation === 'failure') input.raw = input.raw.replace('ok 2 - second', 'not ok 2 - second').replace('# fail 0', '# fail 1').replace('# pass 2', '# pass 1');
    if (mutation === 'exit') input.exit_code = 1;
    if (mutation === 'missing_summary') input.raw = 'TAP version 13\nok 1 - first\nok 2 - second\n';
    if (mutation === 'wrong_count') input.expected_count = 3;
    assert.equal(normalizeExecution(input).state, 'blocked');
  });
}
