import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import { assessCoreBaselineCoverage, assessCoreTddJournal } from '../../../tools/ci/core-tdd-consumption.ts';
import { deriveTddCycle } from '../../../tools/ci/tdd-cycle.ts';
import { resolveTddSourcePurpose } from '../../../tools/ci/tdd-purpose.ts';
import { selectTddCases } from '../../../tools/ci/tdd-cases.ts';

const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const testFile = 'tests/integration/core/subject.spec.ts';
const fixtureFiles = ['tests/fixtures/core/runtime.ts', 'tests/fixtures/core/seed.sql'];
const manifest = { schema_version: 1, engineering_case_count: 1, core_case_count: 2,
  core_targets: [{ id: 'core.synthetic-service', command: 'ci:service', files: [testFile], case_count: 2 }],
  core_fixture_files: fixtureFiles };

/** Environment checks pass before implementation; only the business assertion supplies the Red. */
function baselineFixture() {
  const directory = mkdtempSync(join(tmpdir(), 'aw-core-baseline-'));
  const gitEnvironment = { ...process.env, GIT_INDEX_FILE: join(directory, 'index') };
  const childEnvironment: NodeJS.ProcessEnv = { ...process.env, BASELINE_HEALTH: 'available' };
  delete childEnvironment.NODE_TEST_CONTEXT;
  const git = (args: string[], input?: string) => execFileSync('git', args,
    { env: gitEnvironment, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  const write = (file: string, bytes: string) => {
    mkdirSync(dirname(join(directory, file)), { recursive: true });
    writeFileSync(join(directory, file), bytes);
    const blob = git(['hash-object', '-w', '--stdin'], bytes);
    git(['update-index', '--add', '--cacheinfo', `100644,${blob},${file}`]);
  };
  const execute = (available = true) => spawnSync(process.execPath,
    ['--experimental-strip-types', '--test', '--test-reporter=tap', testFile], {
      cwd: directory, env: { ...childEnvironment, BASELINE_HEALTH: available ? 'available' : 'unavailable' },
      encoding: 'utf8', timeout: 30000 });
  try {
    git(['read-tree', 'HEAD']);
    write('tools/ci/validation-manifest.json', JSON.stringify(manifest));
    write('infra/ci/validation-request.json', JSON.stringify({ schema_version: 1, validation_intent: 'green' }));
    write(fixtureFiles[0], 'export const fixtureClock = 1;\n');
    write(fixtureFiles[1], 'SELECT 1;\n');
    write(testFile, `import assert from 'node:assert/strict';\nimport { test } from 'node:test';\n` +
      `import { value } from '../../../subject.mjs';\n` +
      `test('B01: actual environment precondition', () => assert.equal(process.env.BASELINE_HEALTH, 'available'));\n` +
      `test('K01: synthetic core business behavior', () => assert.equal(value, 1));\n`);
    const stages: { sha: string; run_id: string; attempt: number; raw: string; unhealthy: string; exit: number }[] = [];
    let parent = git(['rev-parse', 'HEAD']);
    for (const [index, phase] of ['red', 'green', 'final'].entries()) {
      write('subject.mjs', `export const value = ${phase === 'red' ? 0 : 1};\n`);
      const sha = git(['-c', 'user.name=Cloud baseline fixture', '-c', 'user.email=fixture@example.invalid',
        'commit-tree', git(['write-tree']), '-p', parent], `Synthetic baseline ${phase}\n`);
      parent = sha;
      const actual = execute(), unhealthy = execute(false);
      assert.equal(actual.status, phase === 'red' ? 1 : 0, actual.stderr);
      assert.equal(unhealthy.status, 1, unhealthy.stderr);
      assert.match(actual.stdout, /^# tests 2$/m);
      assert.match(actual.stdout, /^ok 1 - B01: actual environment precondition$/m);
      assert.match(unhealthy.stdout, /^not ok 1 - B01: actual environment precondition$/m);
      stages.push({ sha, run_id: String(301 + index), attempt: 1, raw: actual.stdout,
        unhealthy: unhealthy.stdout, exit: actual.status! });
    }
    const fixtures = fixtureFiles.map(path => ({ path, sha256: hash(readFileSync(join(directory, path))) }));
    const baseline = { baseline_id: 'core.environment-live-probe', kind: 'environment-precondition',
      command: 'ci:service', test_file: testFile, case_ids: ['B01'],
      anchor: { sha: stages[0].sha, run_id: stages[0].run_id, attempt: 1 },
      oracle_digest: hash(readFileSync(join(directory, testFile))), fixture_files: structuredClone(fixtures),
      fixture_digest: hash(JSON.stringify(fixtures)) };
    const groups = ['dev', 'test'].map(environment => {
      const cycle = { cycle_id: `${environment}-core.synthetic-business`, behavior_id: 'core.synthetic-business',
        case_ids: ['K01'], test_file: testFile, fixture_file: fixtureFiles[1],
        executor: { kind: 'core', environment, command: 'ci:service' } };
      const execution = (stage: typeof stages[number], label: 'red' | 'green' | 'final') => ({
        sha: stage.sha, run_id: stage.run_id, attempt: 1, source: 'github-actions', source_authenticated: true,
        environment, command: 'ci:service', check_set_digest: hash(JSON.stringify(manifest)),
        health: 'passed', migration_state: 'passed', seed_state: 'passed', cleanup_state: 'passed',
        state: label === 'red' ? 'failed' : 'passed', discovered: 1, executed: 1,
        failed: label === 'red' ? 1 : 0, exit_code: stage.exit, regressions_passed: label !== 'red',
        test_digest: baseline.oracle_digest, oracle_digest: baseline.oracle_digest,
        fixture_files: structuredClone(fixtures), fixture_digest: baseline.fixture_digest,
        raw_report_digest: hash(stage.raw), raw_tap: stage.raw,
        executed_files: [{ path: testFile, sha256: baseline.oracle_digest }],
        selected_assertions: selectTddCases(stage.raw, cycle),
        ...resolveTddSourcePurpose({ source: stage, cycle, label, raw: stage.raw }),
      });
      const record = { ...cycle, target_sha: stages[2].sha, implementation_sha: stages[1].sha,
        require_authenticated_purpose: true, raw_red_preserved: true,
        red: { ...execution(stages[0], 'red'), failure_kind: 'assertion', cause: 'missing_behavior', implementation_present: false,
          cause_read_by: 'synthetic-fixture-reader', cause_read_at: '2026-10-16T00:00:00Z' },
        green: execution(stages[1], 'green'), final: execution(stages[2], 'final'),
        history: { source: 'git-objects', ancestors: Object.fromEntries(stages.slice(1).map(stage =>
          [stage.sha, git(['rev-list', stage.sha]).split('\n').slice(1)])) } };
      assert.equal(deriveTddCycle(record).state, 'passed', 'Business cycle remains independently valid');
      return { environment, command: 'ci:service', target_sha: stages[2].sha, run_id: stages[2].run_id,
        attempt: 1, source_authenticated: true, raw_tap: stages[2].raw, expected_count: 2, records: [record] };
    });
    return { input: { target_sha: stages[2].sha, check_set_digest: hash(JSON.stringify(manifest)), manifest,
      source_authenticated: true, baseline_declarations: [baseline], groups }, stages,
      cleanup: () => rmSync(directory, { recursive: true, force: true }) };
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
}

test('CG05: environment baselines remain healthy in every original phase and bound to the earliest qualified Red', () => {
  // Break caught: a permanently passing live service prerequisite either needs a fake business Red or becomes an unchecked exclusion.
  const fixture = baselineFixture();
  try {
    assert.equal(assessCoreBaselineCoverage(fixture.input).state, 'passed');
    for (const [index, phase] of (['red', 'green', 'final'] as const).entries()) {
      const failed = structuredClone(fixture.input);
      const execution = failed.groups[0].records[0][phase];
      execution.raw_tap = fixture.stages[index].unhealthy;
      execution.raw_report_digest = hash(execution.raw_tap);
      execution.exit_code = 1;
      assert.equal(assessCoreBaselineCoverage(failed).state, 'blocked', `${phase} baseline failed despite nominal service health`);
      const missing = structuredClone(fixture.input);
      missing.groups[0].records[0][phase].raw_tap = '';
      assert.equal(assessCoreBaselineCoverage(missing).state, 'blocked', `${phase} original baseline absent`);
      const changed = structuredClone(fixture.input);
      changed.groups[0].records[0][phase].fixture_files[0].sha256 = 'f'.repeat(64);
      changed.groups[0].records[0][phase].fixture_digest = hash(JSON.stringify(changed.groups[0].records[0][phase].fixture_files));
      assert.equal(assessCoreBaselineCoverage(changed).state, 'blocked', `${phase} baseline fixture changed`);
      const changedOracle = structuredClone(fixture.input);
      changedOracle.groups[0].records[0][phase].oracle_digest = 'f'.repeat(64);
      assert.equal(assessCoreBaselineCoverage(changedOracle).state, 'blocked', `${phase} baseline oracle changed`);
    }
    const wrongAnchor = structuredClone(fixture.input);
    wrongAnchor.baseline_declarations[0].anchor = { sha: fixture.stages[1].sha, run_id: fixture.stages[1].run_id, attempt: 1 };
    assert.equal(assessCoreBaselineCoverage(wrongAnchor).state, 'blocked');
    const wrongRun = structuredClone(fixture.input);
    wrongRun.baseline_declarations[0].anchor.run_id = '999';
    assert.equal(assessCoreBaselineCoverage(wrongRun).state, 'blocked');
    const changedOracle = structuredClone(fixture.input);
    changedOracle.baseline_declarations[0].oracle_digest = 'f'.repeat(64);
    assert.equal(assessCoreBaselineCoverage(changedOracle).state, 'blocked');
  } finally { fixture.cleanup(); }
});

test('CG06: baseline accounting preserves complete original execution and every business Red Green final chain', () => {
  // Break caught: baseline classification hides a failed business assertion or replaces the active business coverage requirement.
  const fixture = baselineFixture();
  try {
    const journal = assessCoreTddJournal(fixture.input);
    assert.equal(journal.state, 'recorded_cycles_verified');
    assert.equal(journal.coverage, 'complete');
    const undeclared = structuredClone(fixture.input);
    undeclared.baseline_declarations = [];
    assert.equal(assessCoreTddJournal(undeclared).state, 'blocked');
    const hiddenBusiness = structuredClone(fixture.input);
    hiddenBusiness.baseline_declarations.push({ ...hiddenBusiness.baseline_declarations[0],
      baseline_id: 'core.disguised-business', case_ids: ['K01'] });
    assert.equal(assessCoreBaselineCoverage(hiddenBusiness).state, 'blocked');
    assert.equal(assessCoreTddJournal(hiddenBusiness).state, 'blocked');
    const noBusiness = structuredClone(fixture.input);
    noBusiness.groups[0].records = [];
    assert.equal(assessCoreTddJournal(noBusiness).state, 'blocked');
    const noDeclarationType = structuredClone(fixture.input);
    noDeclarationType.baseline_declarations[0].kind = 'business-result';
    assert.equal(assessCoreTddJournal(noDeclarationType).state, 'blocked');
    const duplicate = structuredClone(fixture.input);
    duplicate.baseline_declarations.push(structuredClone(duplicate.baseline_declarations[0]));
    assert.equal(assessCoreTddJournal(duplicate).state, 'blocked');
    const reduced = structuredClone(fixture.input);
    reduced.groups[0].expected_count = 1;
    assert.equal(assessCoreTddJournal(reduced).state, 'blocked', 'A baseline does not reduce the original execution count');
    const invalidBusiness = structuredClone(fixture.input);
    invalidBusiness.groups[0].records[0].green.validation_intent = 'feedback';
    assert.equal(assessCoreTddJournal(invalidBusiness).state, 'blocked');
  } finally { fixture.cleanup(); }
});
