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
      encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_ENVIRONMENT: 'github-hosted',
        GITHUB_SHA: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
        GITHUB_HEAD_SHA: '', NEEDS_JSON: JSON.stringify(needs) },
    });
    assert.equal(result.status, index === 0 ? 0 : 1, JSON.stringify(needs) + '\n' + result.stderr);
    const report = JSON.parse(readFileSync('dispatch-gate-output/result.json', 'utf8'));
    assert.equal(report.ci_ready, index === 0);
    assert.equal(report.feature_complete, false);
    assert.equal(report.validation_intent, needs.plan.outputs.validation_intent || 'invalid_or_missing');
  }
  const batch = { plan: { result: 'success', outputs: { full_required: 'false', development_required: 'true', validation_intent: 'batch' } },
    bootstrap: { result: 'skipped' }, development: { result: 'success' } };
  for (const outcome of ['success', 'failure', 'skipped']) {
    const needs = { ...batch, development: { result: outcome } };
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/final-dispatch-gate.ts'], {
      encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_ENVIRONMENT: 'github-hosted', GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_SHA: spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
        GITHUB_HEAD_SHA: '', NEEDS_JSON: JSON.stringify(needs) },
    });
    assert.equal(result.status, outcome === 'success' ? 0 : 1, result.stderr);
    const report = JSON.parse(readFileSync('dispatch-gate-output/result.json', 'utf8'));
    assert.equal(report.ci_ready, false, 'Batch result cannot claim formal release readiness');
    assert.equal(report.feature_complete, false);
  }
});

test('FG03: the forwarding workflow also publishes only named technical indexes', () => {
  const workflow = readFileSync('.github/workflows/ci-bootstrap.yml', 'utf8');
  const upload = workflow.split('name: bootstrap-readiness-')[1];
  const path = upload?.split('path:')[1]?.split('if-no-files-found:')[0] || '';
  assert.ok(!/^\s*gate-output\/\s*$/m.test(path), 'Forwarded completion records must not become public');
  assert.ok(path.includes('gate-output/readiness.json'));
  assert.ok(!path.includes('completion-records'));
});

test('FG04: public bridge receipts omit full completion/source documents and bind a verified private copy', async () => {
  const source = readFileSync('tools/ci/bridge-gate.ts', 'utf8');
  assert.match(source, /publicBridgeReceipt\(record,/,
    'The real bridge writer must publish the controlled technical receipt, not its full record');
  const helperPath = '../../../tools/ci/' + 'bridge-public.ts';
  const { publicBridgeReceipt } = await import(helperPath);
  const input = { state: 'passed', transition: 'complete', target_sha: 'a'.repeat(40),
    completion_record: { summary: 'private-review-body' }, completion_source: { document: { private: true } },
    initialization_source: { document: { private: true } }, development_source: { document: { private: true } } };
  const privateCopy = { path: '/archive/ordinary/bridge-admission/record.json', sha256: 'b'.repeat(64),
    state: 'archived_and_readback_verified', temporary_key_files_removed: true };
  const receipt = publicBridgeReceipt(input, privateCopy);
  for (const field of ['completion_record', 'completion_source', 'initialization_source', 'development_source']) {
    assert.ok(!(field in receipt), 'A public receipt cannot contain ' + field);
  }
  assert.deepEqual(receipt.private_record, privateCopy);
  assert.throws(() => publicBridgeReceipt(input, { ...privateCopy, state: 'missing' }));
  const workflow = readFileSync('.github/workflows/bridge-admission.yml', 'utf8');
  const path = workflow.split('name: bridge-admission-')[1]?.split('path:')[1]?.split('if-no-files-found:')[0] || '';
  assert.match(path, /bridge-output\/bridge-admission.json/);
  assert.ok(!/^\s*bridge-output\/\s*$/m.test(path), 'Raw bridge completion records cannot be public');
  const reader = readFileSync('tools/ci/bridge-transition.ps1', 'utf8');
  assert.match(reader, /private_record/);
  assert.match(reader, /archived_and_readback_verified/);
});
