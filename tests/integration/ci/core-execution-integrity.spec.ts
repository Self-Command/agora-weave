import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { test } from 'node:test';
import { resolveTddSourcePurpose } from '../../../tools/ci/tdd-purpose.ts';

test('CW06: a zero-exit substituted suite script cannot certify an unexecuted core target', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-core-integrity-'));
  const write = (path: string, value: string | object) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof value === 'string' ? value : JSON.stringify(value));
  };
  try {
    for (const name of ['core-entry.ts', 'core-database.ts', 'run-check-set.ts', 'discover-targets.ts', 'local-services.ts', 'execution-context.ts']) {
      mkdirSync(join(root, 'tools/ci'), { recursive: true });
      copyFileSync(`tools/ci/${name}`, join(root, 'tools/ci', name));
    }
    const file = 'tests/integration/core/actual.spec.ts';
    write(file, "import { test } from 'node:test'; test('actual target', () => { throw new Error('must really execute'); });\n");
    write('package.json', { type: 'module', scripts: { 'ci:discover': 'node --experimental-strip-types tools/ci/discover-targets.ts',
      'ci:contracts': 'node -e "process.exit(0)"', 'ci:migrate': 'node -e "process.exit(0)"',
      'ci:seed': 'node -e "process.exit(0)"', 'ci:service': 'node -e "process.exit(0)"' } });
    write('tools/ci/validation-manifest.json', { schema_version: 1, engineering_case_count: 1, engineering_targets: [], core_case_count: 1,
      core_targets: [{ id: 'core.actual', command: 'ci:service', files: [file], case_count: 1 }] });
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture'], { cwd: root });
    const environment = { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_ENVIRONMENT: 'github-hosted',
      CI_ENVIRONMENT: 'test', GITHUB_RUN_ID: '1234', COMPOSE_PROJECT_NAME: 'agoraweave-test-1234' };
    delete environment.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/core-entry.ts', 'all'],
      { cwd: root, env: environment, encoding: 'utf8', timeout: 45000 });
    assert.notEqual(result.status, 0, 'A substituted empty script concealed a target which must fail');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('CW07: the actual service runner installs the frozen dependencies before executing active core suites', () => {
  const workflow = readFileSync('.github/workflows/service-bootstrap.yml', 'utf8');
  const installation = workflow.indexOf('npm run ci:install');
  const core = workflow.indexOf('npm run ci:core');
  assert.ok(installation >= 0 && core > installation, 'Upstream jobs cannot supply node_modules to this isolated runner');
});

test('CW08: core Green purpose is verified against its committed command inventory and the journal has a real core source entry', () => {
  const directory = mkdtempSync(join(tmpdir(), 'aw-core-purpose-'));
  try {
    const environment = { ...process.env, GIT_INDEX_FILE: join(directory, 'index') };
    const git = (args: string[], input?: string) => execFileSync('git', args, { env: environment, input, encoding: 'utf8' }).trim();
    git(['read-tree', 'HEAD']);
    const file = 'tests/integration/core/schema-config.spec.ts';
    const manifest = { schema_version: 1, engineering_case_count: 221, core_case_count: 1,
      core_targets: [{ id: 'core.schema', command: 'ci:service', files: [file], case_count: 1 }] };
    const blob = git(['hash-object', '-w', '--stdin'], JSON.stringify(manifest));
    git(['update-index', '--add', '--cacheinfo', `100644,${blob},tools/ci/validation-manifest.json`]);
    const sha = git(['-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', 'commit-tree', git(['write-tree']), '-p', 'HEAD'], 'synthetic core purpose fixture\n');
    const cycle = { cycle_id: 'core.synthetic', test_file: file, executor: { kind: 'core', environment: 'test', command: 'ci:service' } };
    const raw = 'ok 1 - core target\n1..1\n# tests 1\n# pass 1\n# fail 0\n# cancelled 0\n# skipped 0\n# todo 0\n';
    const result = resolveTddSourcePurpose({ cycle, label: 'green', source: { sha, run_id: '1234', attempt: 1 }, raw });
    assert.equal(result.purpose_authenticated, true);
    assert.equal(result.applicable_set_verified, true, 'Engineering case count cannot authenticate a distinct core suite');
    const workflow = readFileSync('.github/workflows/tdd-cycle.yml', 'utf8');
    assert.match(workflow, /core_source_run_id/, 'Core Red needs the existing journal entry before product implementation');
    assert.match(workflow, /core-tdd-journal\.ts/);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
