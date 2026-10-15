import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

test('FG01: public readiness upload excludes the private completion record tree', () => {
  const workflow = readFileSync('.github/workflows/verify-increment.yml', 'utf8');
  const gate = workflow.split('\n  gate:\n')[1]?.split('\n  development-readiness:')[0];
  assert.ok(gate, 'The actual initialization gate must exist');
  const upload = gate.split('name: verify-readiness-')[1];
  assert.ok(upload, 'The actual readiness upload must exist');
  const path = upload.split('path:')[1]?.split('if-no-files-found:')[0] || '';
  assert.ok(!/^\s*gate-output\/\s*$/m.test(path), 'A public upload cannot include the whole private completion tree');
  for (const file of ['readiness.json', 'orchestration.json', 'final-source-job-outcomes.json']) {
    assert.ok(path.includes('gate-output/' + file), 'Public technical indexes must remain available: ' + file);
  }
  assert.ok(!path.includes('completion-records'), 'Private completion records must remain exclusively in controlled storage');
});

test('FG02: top-level final gate runs after failed planning and rejects incomplete or non-completion chains', () => {
  const workflow = readFileSync('.github/workflows/verify-release.yml', 'utf8');
  const gate = workflow.split('\n  final-gate:\n')[1];
  assert.ok(gate, 'A failed plan must still reach the real top-level final gate');
  assert.match(gate, /name: agoraweave\/ci-gate/);
  assert.match(gate, /needs: \[plan, bootstrap, development\]/);
  assert.match(gate, /if: \$\{\{ always\(\) \}\}/);
  assert.match(gate, /run: node --experimental-strip-types tools\/ci\/final-dispatch-gate.ts/);
  const complete = { plan: { result: 'success', outputs: { full_required: 'true', development_required: 'false', validation_intent: 'completion' } },
    bootstrap: { result: 'success' }, development: { result: 'skipped' } };
  const candidates = [complete,
    { ...complete, plan: { result: 'failure', outputs: {} } },
    { ...complete, bootstrap: { result: 'skipped' } },
    { ...complete, bootstrap: { result: 'failure' } },
    { ...complete, plan: { result: 'success', outputs: { ...complete.plan.outputs, validation_intent: 'green' } } },
    { ...complete, plan: { result: 'success', outputs: { full_required: 'false', development_required: 'true', validation_intent: 'feedback' } } },
    { ...complete, plan: { result: 'success', outputs: { validation_intent: 'completion' } } },
  ];
  for (const [index, needs] of candidates.entries()) {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/final-dispatch-gate.ts'], {
      encoding: 'utf8', env: { ...process.env, NEEDS_JSON: JSON.stringify(needs) },
    });
    assert.equal(result.status, index === 0 ? 0 : 1, JSON.stringify(needs) + '\n' + result.stderr);
    const report = JSON.parse(readFileSync('dispatch-gate-output/result.json', 'utf8'));
    assert.equal(report.ci_ready, index === 0);
    assert.equal(report.feature_complete, false);
    assert.equal(report.validation_intent, needs.plan.outputs.validation_intent || 'invalid_or_missing');
  }
});
