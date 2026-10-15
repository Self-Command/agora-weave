import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

function fixture(kind: string, raw: Record<string, unknown>) {
  const sha = 'a'.repeat(40);
  return { kind, target_sha: sha, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64),
    source_authenticated: true, source_job_state: 'success', run_id: '101', attempt: 1,
    identity: { checkout_sha: sha, source: 'github-actions', runner_environment: 'github-hosted',
      run_id: '101', attempt: 1, check_set_digest: 'b'.repeat(64), toolchain_digest: 'c'.repeat(64) }, raw };
}

const tap = 'TAP version 13\n# Subtest: fixture\nok 1 - fixture\n1..1\n# tests 1\n# pass 1\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
const web = { suites: [{ specs: [{ title: 'admin light narrow', tests: [{ expectedStatus: 'passed',
  results: [{ status: 'passed', errors: [] }] }] }] }], errors: [],
  stats: { expected: 1, unexpected: 0, flaky: 0, skipped: 0 } };
const service = { configuration: { internal_network: true, published_ports: [], environment: 'test',
  services: ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor'] },
  outcome: { health: 'success', cleanup: 'success' },
  containers: ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor']
    .map(name => ({ Service: name, State: 'running', Health: ['api-gw', 'auth', 'db', 'imgproxy', 'meta', 'realtime', 'storage', 'studio', 'supavisor'].includes(name) ? 'healthy' : '' })),
  schema_seed: 'BEGIN\nCREATE SCHEMA\nCREATE TABLE\nINSERT 0 1\nDO\nROLLBACK\n',
  schema_seed_repeat: 'BEGIN\nCREATE SCHEMA\nCREATE TABLE\nINSERT 0 1\nDO\nROLLBACK\n' };

test('BR01: engineering state is recomputed from exact raw TAP rather than a summary claim', () => {
  assert.equal(assessBootstrapRaw(fixture('engineering', { tap, expected_count: 1 })).state, 'passed');
  assert.equal(assessBootstrapRaw(fixture('engineering', { tap: tap.replace('# pass 1', '# pass 0'), expected_count: 1 })).state, 'blocked');
});

test('BR02: real Playwright results require all cases, no retries, skips, flaky or global errors', () => {
  assert.equal(assessBootstrapRaw(fixture('web', { report: web, expected_count: 1 })).state, 'passed');
  for (const patch of [{ stats: { ...web.stats, skipped: 1 } }, { errors: [{ message: 'real failure' }] },
    { suites: [] }, { suites: [{ specs: [{ title: 'admin', tests: [{ expectedStatus: 'passed', results: [{ status: 'failed' }, { status: 'passed' }] }] }] }] }]) {
    assert.equal(assessBootstrapRaw(fixture('web', { report: { ...web, ...patch }, expected_count: 1 })).state, 'blocked');
  }
});

test('BR03: official service report needs every container, isolated ports, schema seed repeat and successful cleanup', () => {
  assert.equal(assessBootstrapRaw(fixture('service', service)).state, 'passed');
  for (const patch of [{ containers: service.containers.slice(1) }, { schema_seed_repeat: '' },
    { outcome: { ...service.outcome, cleanup: 'failure' } },
    { configuration: { ...service.configuration, published_ports: [5432] } }]) {
    assert.equal(assessBootstrapRaw(fixture('service', { ...service, ...patch })).state, 'blocked');
  }
});

test('BR04: Android parser needs actual light/dark instrumentation, foreground hierarchy and both images', () => {
  const raw = { light_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n', dark_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n',
    hierarchy: '<node package="org.agoraweave.app" text="AgoraWeave" />', images: ['d'.repeat(64), 'e'.repeat(64)],
    light_theme: 'light:16', dark_theme: 'dark:32' };
  assert.equal(assessBootstrapRaw(fixture('android', raw)).state, 'passed');
  for (const patch of [{ dark_log: 'FAILURES!!!\nTests run: 1, Failures: 1' }, { images: [] },
    { hierarchy: '<node package="com.google.android.apps.nexuslauncher" text="AgoraWeave" />' }]) {
    assert.equal(assessBootstrapRaw(fixture('android', { ...raw, ...patch })).state, 'blocked');
  }
});

test('BR07: a named dark capture with a light or absent actual configuration is rejected', () => {
  const raw = { light_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n', dark_log: 'OK (1 test)\nINSTRUMENTATION_CODE: -1\n',
    hierarchy: '<node package="org.agoraweave.app" text="AgoraWeave" />', images: ['d'.repeat(64), 'e'.repeat(64)],
    light_theme: 'light:16', dark_theme: 'dark:32' };
  assert.equal(assessBootstrapRaw(fixture('android', raw)).state, 'passed');
  for (const patch of [{ dark_theme: 'light:16' }, { dark_theme: '' }, { light_theme: 'light:32' }]) {
    assert.equal(assessBootstrapRaw(fixture('android', { ...raw, ...patch })).state, 'blocked');
  }
});

test('BR05: failed original job or different checkout/digests never passes from green-looking raw data', () => {
  for (const patch of [{ source_authenticated: false }, { source_job_state: 'failure' }, { target_sha: 'e'.repeat(40) },
    { check_set_digest: 'e'.repeat(64) }, { toolchain_digest: 'e'.repeat(64) }]) {
    assert.equal(assessBootstrapRaw({ ...fixture('engineering', { tap, expected_count: 1 }), ...patch }).state, 'blocked');
  }
});

test('BR06: both original XCTest summaries and all launch/resume images are required', () => {
  const summary = { result: 'Passed', totalTestCount: 1, passedTests: 1, failedTests: 0, skippedTests: 0,
    expectedFailures: 0, testFailures: [] };
  const raw = { light: summary, dark: summary, images: Array(4).fill('d'.repeat(64)) };
  assert.equal(assessBootstrapRaw(fixture('ios', raw)).state, 'passed');
  for (const patch of [{ dark: { ...summary, skippedTests: 1 } }, { light: { ...summary, failedTests: 1 } },
    { images: ['d'.repeat(64)] }, { dark: { ...summary, result: 'Failed' } }]) {
    assert.equal(assessBootstrapRaw(fixture('ios', { ...raw, ...patch })).state, 'blocked');
  }
});

test('BR08: bridge admission is recomputed from the bound original record and rejects a forged passed state', () => {
  const sha = 'a'.repeat(40), checkSet = 'b'.repeat(64);
  const bridge = { state: 'passed', actor: 'codex', expected_actor: 'codex',
    feature: 'specs/001-agoraweave-v1', expected_feature: 'specs/001-agoraweave-v1',
    target_sha: sha, expected_sha: sha, contract_digest: 'd'.repeat(64), expected_contract_digest: 'd'.repeat(64),
    check_set_digest: checkSet, expected_check_set_digest: checkSet,
    source: 'github-actions', runner_environment: 'github-hosted', mode: 'bootstrap-only', transition: 'start',
    ownership_guard_passed: true, required_hooks_ran: true, working_tree_clean: true,
    changed_paths: ['tools/ci/bridge-gate.ts'], read_by: 'actions-ownership', read_at: '2026-10-14T20:00:00Z',
    ci_ready: false, feature_complete: false };
  assert.equal(assessBootstrapRaw(fixture('bridge', { admission: bridge })).state, 'passed');
  for (const patch of [{ required_hooks_ran: false }, { target_sha: 'f'.repeat(40), expected_sha: 'f'.repeat(40) },
    { changed_paths: ['apps/mobile/app/new-business.tsx'] }, { ci_ready: true }]) {
    assert.equal(assessBootstrapRaw(fixture('bridge', { admission: { ...bridge, ...patch } })).state, 'blocked');
  }
});

test('BR09: cleanup requires observed zero residual resources and removed temporary files in both environments', () => {
  const environments = ['dev', 'test'].map(environment => ({ environment, cleanup: 'success',
    remaining_containers: [], remaining_volumes: [], remaining_networks: [], temporary_files_removed: true }));
  assert.equal(assessBootstrapRaw(fixture('cleanup', { environments })).state, 'passed');
  for (const invalid of [environments.slice(1), [environments[0], environments[0]],
    [environments[0], { ...environments[1], remaining_volumes: ['synthetic-leftover'] }],
    [environments[0], { ...environments[1], temporary_files_removed: false }],
    [environments[0], { ...environments[1], cleanup: 'failure' }]]) {
    assert.equal(assessBootstrapRaw(fixture('cleanup', { environments: invalid })).state, 'blocked');
  }
});

test('BR10: a partial TDD catalog never satisfies full bootstrap coverage despite individually green cycles', () => {
  const journal = { target_sha: 'a'.repeat(40), coverage: 'complete', state: 'recorded_cycles_verified',
    records: [{ cycle_id: 'synthetic-case', target_sha: 'a'.repeat(40), assessment: { state: 'passed' } }] };
  assert.equal(assessBootstrapRaw(fixture('tdd', { journal })).state, 'passed');
  for (const patch of [{ coverage: 'partial' }, { records: [] }, { target_sha: 'e'.repeat(40) },
    { records: [{ ...journal.records[0], assessment: { state: 'blocked' } }] }]) {
    assert.equal(assessBootstrapRaw(fixture('tdd', { journal: { ...journal, ...patch } })).state, 'blocked');
  }
});
