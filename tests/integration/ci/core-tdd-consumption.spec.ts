import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { selectTddExecutorSource, assessCoreTddJournal } from '../../../tools/ci/core-tdd-consumption.ts';
import { deriveTddCycle } from '../../../tools/ci/tdd-cycle.ts';
import { resolveTddSourcePurpose } from '../../../tools/ci/tdd-purpose.ts';
import { selectTddCases } from '../../../tools/ci/tdd-cases.ts';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';

const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const targets = [
  { id: 'core.synthetic-contract', command: 'ci:core:contracts', files: ['tests/contract/core/subject.spec.ts'], case_count: 1 },
  { id: 'core.synthetic-service', command: 'ci:service', files: ['tests/integration/core/subject.spec.ts'], case_count: 1 },
];
const manifest = { schema_version: 1, engineering_case_count: 1, core_case_count: 2, core_targets: targets,
  core_fixture_files: ['tests/fixtures/core/runtime.ts', 'tests/fixtures/core/seed.sql'] };

/** Real Node TAP and Git objects, with synthetic transport envelopes at the already-authenticated reader boundary. */
function historyFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aw-core-cycle-'));
  const gitEnvironment = { ...process.env, GIT_INDEX_FILE: join(directory, 'index') };
  const childEnvironment = { ...process.env };
  delete childEnvironment.NODE_TEST_CONTEXT;
  const git = (args: string[], input?: string) => execFileSync('git', args,
    { env: gitEnvironment, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const write = (file: string, bytes: string) => {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    writeFileSync(join(directory, file), bytes);
    const blob = git(['hash-object', '-w', '--stdin'], bytes);
    git(['update-index', '--add', '--cacheinfo', `100644,${blob},${file}`]);
  };
  try {
    git(['read-tree', 'HEAD']);
    write('tools/ci/validation-manifest.json', JSON.stringify(manifest));
    write('infra/ci/validation-request.json', JSON.stringify({ schema_version: 1, validation_intent: 'green' }));
    write('tests/fixtures/core/seed.sql', 'SELECT 1;\n');
    write('tests/fixtures/core/runtime.ts', 'export const fixtureClock = 1;\n');
    for (const [index, target] of targets.entries()) {
      write(target.files[0], `import assert from 'node:assert/strict';\nimport { test } from 'node:test';\n` +
        `import { value } from '../../../subject.mjs';\n` +
        `test('K0${index + 1}: synthetic core behavior', () => assert.equal(value, 1));\n`);
    }
    const stages: { sha: string; run_id: string; raw: string[]; exits: number[] }[] = [];
    let parent = git(['rev-parse', 'HEAD']);
    for (const [index, phase] of ['red', 'green', 'final'].entries()) {
      write('subject.mjs', `export const value = ${phase === 'red' ? 0 : 1};\n`);
      const sha = git(['-c', 'user.name=Cloud core cycle fixture', '-c', 'user.email=fixture@example.invalid',
        'commit-tree', git(['write-tree']), '-p', parent], `Synthetic ${phase} executor\n`);
      parent = sha;
      const executions = targets.map(target => spawnSync(process.execPath,
        ['--experimental-strip-types', '--test', '--test-reporter=tap', target.files[0]],
        { cwd: directory, env: childEnvironment, encoding: 'utf8', timeout: 30000 }));
      for (const execution of executions) {
        assert.equal(execution.status, phase === 'red' ? 1 : 0, `Synthetic Node transport failed: ${execution.stderr}`);
        assert.match(execution.stdout, /^# tests 1$/m);
        assert.match(execution.stdout, /^# cancelled 0$/m);
      }
      stages.push({ sha, run_id: String(201 + index), raw: executions.map(execution => execution.stdout),
        exits: executions.map(execution => execution.status!) });
    }
    const fixtureFiles = manifest.core_fixture_files.map(path => ({ path, sha256: hash(readFileSync(join(directory, path))) }));
    const groups = ['dev', 'test'].flatMap(environment => targets.map((target, index) => {
      const cycle = { cycle_id: `${environment}-${target.id}`, behavior_id: target.id,
        case_ids: [`K0${index + 1}`], test_file: target.files[0], fixture_file: 'tests/fixtures/core/seed.sql',
        executor: { kind: 'core', environment, command: target.command } };
      const execution = (stage: typeof stages[number], label: 'red' | 'green' | 'final') => ({
        sha: stage.sha, run_id: stage.run_id, attempt: 1, source: 'github-actions', source_authenticated: true,
        environment, command: target.command, check_set_digest: hash(JSON.stringify(manifest)),
        health: 'passed', migration_state: 'passed', seed_state: 'passed', cleanup_state: 'passed',
        state: label === 'red' ? 'failed' : 'passed', discovered: 1, executed: 1,
        failed: label === 'red' ? 1 : 0, exit_code: stage.exits[index], regressions_passed: label !== 'red',
        test_digest: hash(readFileSync(join(directory, target.files[0]))),
        oracle_digest: hash(readFileSync(join(directory, target.files[0]))),
        fixture_digest: hash(JSON.stringify(fixtureFiles)), fixture_files: structuredClone(fixtureFiles),
        raw_report_digest: hash(stage.raw[index]), raw_tap: stage.raw[index],
        executed_files: [{ path: target.files[0], sha256: hash(readFileSync(join(directory, target.files[0]))) }],
        selected_assertions: selectTddCases(stage.raw[index], cycle),
        ...resolveTddSourcePurpose({ source: stage, cycle, label, raw: stage.raw[index] }),
      });
      const record = { ...cycle, target_sha: stages[2].sha, implementation_sha: stages[1].sha,
        require_authenticated_purpose: true, raw_red_preserved: true,
        red: { ...execution(stages[0], 'red'), failure_kind: 'assertion', cause: 'missing_behavior', implementation_present: false,
          cause_read_by: 'synthetic-fixture-reader', cause_read_at: '2026-10-16T00:00:00Z' },
        green: execution(stages[1], 'green'), final: execution(stages[2], 'final'),
        history: { source: 'git-objects', ancestors: Object.fromEntries(stages.slice(1).map(stage =>
          [stage.sha, git(['rev-list', stage.sha]).split('\n').slice(1)])) } };
      assert.equal(deriveTddCycle(record).state, 'passed', 'The existing cycle evaluator must accept the unchanged original inputs');
      return { environment, command: target.command, target_sha: stages[2].sha, run_id: stages[2].run_id,
        attempt: 1, source_authenticated: true, raw_tap: stages[2].raw[index], expected_count: 1, records: [record] };
    }));
    return { input: { target_sha: stages[2].sha, check_set_digest: hash(JSON.stringify(manifest)), manifest,
      source_authenticated: true, groups }, cleanup: () => rmSync(directory, { recursive: true, force: true }) };
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

test('CG01: a core catalog cycle selects the actual environment and command stream instead of the engineering transport', () => {
  // Break caught: a core cycle is routed to bootstrap-transport/engineering.tap, which cannot contain its assertions.
  const sha = 'a'.repeat(40), repository = 'Self-Command/agora-weave';
  const run = { head_sha: sha, run_attempt: 1, event: 'pull_request', head_branch: 'codex/core-fixture',
    repository: { full_name: repository }, head_repository: { full_name: repository } };
  const input = { target_sha: sha, repository, event: 'pull_request', branch: 'codex/core-fixture', manifest,
    cycle: { test_file: targets[1].files[0], executor: { kind: 'core', environment: 'test', command: 'ci:service' } },
    runs: [{ ...run, id: 101, path: '.github/workflows/ci-bootstrap.yml' },
      { ...run, id: 202, path: '.github/workflows/verify-release.yml' }] };
  const selected = selectTddExecutorSource(input);
  assert.equal(selected.state, 'selected', 'A registered core cycle has a distinct original executor');
  assert.equal(selected.run_id, '202');
  assert.equal(selected.workflow_path, '.github/workflows/verify-release.yml');
  assert.equal(selected.artifact_name, 'core-services-test-202-1');
  assert.equal(selected.health_artifact_name, 'bootstrap-services-test-202-1');
  assert.equal(selected.report_name, 'ci-service.tap');
  for (const runs of [input.runs.slice(0, 1), [...input.runs, { ...input.runs[1], id: 203 }],
    [{ ...input.runs[1], event: 'push' }], [{ ...input.runs[1], head_sha: 'b'.repeat(40) }]]) {
    assert.equal(selectTddExecutorSource({ ...input, runs }).state, 'blocked');
  }
  for (const executor of [{ kind: 'core', environment: 'production', command: 'ci:service' },
    { kind: 'core', environment: 'test', command: 'ci:unregistered' }]) {
    assert.equal(selectTddExecutorSource({ ...input, cycle: { ...input.cycle, executor } }).state, 'blocked');
  }
});

test('CG02: core completion binds every original Red Green and final fixture rather than accepting a passing observation', () => {
  // Break caught: seed/runtime drift or an unhealthy Red can be hidden by unchanged test bytes and a passing summary.
  const fixture = historyFixture();
  try {
    assert.equal(assessCoreTddJournal(fixture.input).state, 'recorded_cycles_verified');
    for (const phase of ['red', 'green', 'final'] as const) {
      const changed = structuredClone(fixture.input);
      const execution = changed.groups[0].records[0][phase];
      execution.fixture_files[0].sha256 = 'f'.repeat(64);
      execution.fixture_digest = hash(JSON.stringify(execution.fixture_files));
      assert.equal(assessCoreTddJournal(changed).state, 'blocked', `${phase} runtime fixture changed`);
      const missing = structuredClone(fixture.input);
      missing.groups[0].records[0][phase].fixture_files.pop();
      assert.equal(assessCoreTddJournal(missing).state, 'blocked', `${phase} seed binding missing`);
    }
    for (const field of ['health', 'migration_state', 'seed_state', 'cleanup_state'] as const) {
      const unhealthy = structuredClone(fixture.input);
      unhealthy.groups[0].records[0].red[field] = 'failed';
      assert.equal(assessCoreTddJournal(unhealthy).state, 'blocked', `Red ${field} failed`);
    }
    const substituted = structuredClone(fixture.input);
    substituted.groups[0].records[0].final.executed_files[0].path = 'tests/fixtures/unregistered.spec.ts';
    assert.equal(assessCoreTddJournal(substituted).state, 'blocked');
    const feedback = structuredClone(fixture.input);
    Object.assign(feedback.groups[0].records[0].green, { validation_intent: 'feedback' });
    assert.equal(assessCoreTddJournal(feedback).state, 'blocked');
  } finally { fixture.cleanup(); }
});

test('CG03: complete core coverage consumes both environments and every active command with their own original TAP', () => {
  // Break caught: one engineering/global TAP or a reduced cycle catalog certifies a missing active core stream.
  const fixture = historyFixture();
  try {
    const journal = assessCoreTddJournal(fixture.input);
    assert.equal(journal.state, 'recorded_cycles_verified');
    assert.equal(journal.coverage, 'complete');
    assert.equal(journal.readiness, 'not_evaluated');
    assert.equal(journal.task_complete, false);
    for (let index = 0; index < 4; index++) {
      const missing = structuredClone(fixture.input);
      missing.groups.splice(index, 1);
      assert.equal(assessCoreTddJournal(missing).state, 'blocked', `Missing core stream ${index}`);
    }
    const duplicate = structuredClone(fixture.input);
    duplicate.groups[1] = structuredClone(duplicate.groups[0]);
    assert.equal(assessCoreTddJournal(duplicate).state, 'blocked');
    const wrongTap = structuredClone(fixture.input);
    wrongTap.groups[0].raw_tap = wrongTap.groups[1].raw_tap;
    assert.equal(assessCoreTddJournal(wrongTap).state, 'blocked');
    const uncovered = structuredClone(fixture.input);
    uncovered.groups[0].records = [];
    assert.equal(assessCoreTddJournal(uncovered).state, 'blocked');
    const newTarget = structuredClone(fixture.input);
    newTarget.manifest.core_targets.push({ id: 'core.new-security', command: 'ci:security',
      files: ['tests/security/core/new.spec.ts'], case_count: 1 });
    newTarget.manifest.core_case_count = 3;
    newTarget.check_set_digest = hash(JSON.stringify(newTarget.manifest));
    assert.equal(assessCoreTddJournal(newTarget).state, 'blocked');
  } finally { fixture.cleanup(); }
});

test('CG04: the actual report consumer refuses engineering-only or observation records when the committed manifest activates core', () => {
  // Break caught: bootstrap.tdd sees engineering coverage=complete and silently grants the core completion requirement.
  const fixture = historyFixture();
  try {
    const sha = fixture.input.target_sha, toolchain = 'd'.repeat(64);
    const engineering = { target_sha: sha, state: 'recorded_cycles_verified', coverage: 'complete',
      records: [{ cycle_id: 'ci.synthetic-existing', target_sha: sha, assessment: { state: 'passed' } }] };
    const consume = (journal: unknown, activeManifest: object) => {
      const checkSet = hash(JSON.stringify(activeManifest));
      const identity = { checkout_sha: sha, check_set_digest: checkSet, toolchain_digest: toolchain,
        source: 'github-actions', runner_environment: 'github-hosted', run_id: '103', attempt: 1 };
      return assessBootstrapRaw(JSON.parse(JSON.stringify({ kind: 'tdd', target_sha: sha,
        check_set_digest: checkSet, toolchain_digest: toolchain, source_authenticated: true,
        source_job_state: 'success', run_id: '103', attempt: 1, identity, raw: { journal, manifest: activeManifest } })));
    };
    assert.equal(consume(engineering, { ...manifest, core_case_count: 0, core_targets: [] }).state, 'passed');
    assert.equal(consume({ target_sha: sha, state: 'authenticated_observation', task_complete: false,
      observations: [{ environment: 'test', command: 'ci:service', state: 'green_observed' }] }, manifest).state, 'blocked');
    assert.equal(consume(engineering, manifest).state, 'blocked', 'Engineering coverage cannot discharge an activated core requirement');
    assert.equal(consume({ ...engineering, core: { state: 'authenticated_observation', coverage: 'complete' } }, manifest).state, 'blocked');
    const core = assessCoreTddJournal(fixture.input);
    assert.equal(core.state, 'recorded_cycles_verified');
    assert.equal(consume({ ...engineering, core }, manifest).state, 'passed', 'The consumer must accept the complete producer output');
    assert.equal(consume({ ...engineering, core: { ...core, target_sha: 'f'.repeat(40) } }, manifest).state, 'blocked');
  } finally { fixture.cleanup(); }
});
