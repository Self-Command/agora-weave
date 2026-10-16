import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

/** Real CLI/Node execution in an isolated synthetic checkout; no business behavior is supplied. */
function checkout() {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-core-wiring-'));
  const write = (file: string, value: string | object) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), typeof value === 'string' ? value : JSON.stringify(value));
  };
  for (const directory of ['tests/contract/ci', 'tests/integration/ci', 'tests/security/ci', 'tools/ci', 'infra/ci']) {
    mkdirSync(path.join(root, directory), { recursive: true });
  }
  for (const file of ['discover-targets.ts', 'run-check-set.ts', 'test-harness.ts', 'execution-context.ts']) {
    copyFileSync(`tools/ci/${file}`, path.join(root, 'tools/ci', file));
  }
  const approved = 'tests/contract/ci/approved.spec.ts';
  write(approved, "import { test } from 'node:test'; import { writeFileSync } from 'node:fs'; test('approved target really ran', () => { writeFileSync('approved-ran', 'yes'); });\n");
  write('tests/fixtures/decoy.spec.ts', "import { test } from 'node:test'; test('unapproved decoy', () => {});\n");
  write('package.json', { type: 'module', scripts: {
    'ci:contracts': 'node --experimental-strip-types --test tests/fixtures/decoy.spec.ts',
  } });
  write('tools/ci/validation-manifest.json', { schema_version: 1, engineering_case_count: 1,
    engineering_targets: [{ id: 'ci.approved', command: 'ci:contracts', files: [approved] }] });
  write('infra/ci/toolchain-lock.json', { node: process.version });
  execFileSync('git', ['init', '--quiet'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=synthetic-fixture', '-c', 'user.email=fixture@example.invalid',
    'commit', '--quiet', '-m', 'isolated wiring fixture'], { cwd: root });
  // This checkout models a top-level Actions process, not a child of this outer Node test runner.
  const environment = { ...process.env };
  delete environment.NODE_TEST_CONTEXT;
  const run = (file: string, patch: Record<string, string> = {}) => spawnSync(process.execPath, ['--experimental-strip-types', `tools/ci/${file}`],
    { cwd: root, encoding: 'utf8', env: { ...environment, ...patch }, timeout: 30000 });
  return { root, write, run, approved, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('CW04: registered active core targets are discovered and run separately from engineering regressions', () => {
  // Break caught: bootstrap-only execution cannot admit or execute a registered business contract suite.
  const fixture = checkout();
  try {
    const core = 'tests/contract/core/http.spec.ts';
    fixture.write(core, "import { test } from 'node:test'; import { writeFileSync } from 'node:fs'; test('core behavior really ran', () => { writeFileSync('core-ran', 'yes'); });\n");
    fixture.write('package.json', { type: 'module', scripts: {
      'ci:contracts': 'node --test tests/contract/ci/approved.spec.ts',
      'ci:core:contracts': 'node --test tests/contract/core/http.spec.ts',
    } });
    fixture.write('tools/ci/validation-manifest.json', { schema_version: 1, engineering_case_count: 1, core_case_count: 1,
      engineering_targets: [{ id: 'ci.approved', command: 'ci:contracts', files: [fixture.approved] }],
      core_targets: [{ id: 'core.http', command: 'ci:core:contracts', files: [core] }],
    });
    const discovered = fixture.run('discover-targets.ts');
    assert.equal(discovered.status, 0, `Registered core suite must be admitted: ${discovered.stderr}`);
    const discovery = JSON.parse(readFileSync(path.join(fixture.root, 'check-output/discovery.json'), 'utf8'));
    assert.deepEqual(discovery.targets.map((target: { id: string }) => target.id), ['ci.approved', 'core.http']);
    const executed = fixture.run('test-harness.ts', { CI_TARGET_GROUP: 'core' });
    assert.equal(executed.status, 0, executed.stderr);
    assert.equal(existsSync(path.join(fixture.root, 'core-ran')), true);
    assert.equal(existsSync(path.join(fixture.root, 'approved-ran')), false);
    const result = JSON.parse(readFileSync(path.join(fixture.root, 'check-output/execution.json'), 'utf8'));
    assert.equal(result.executed, 1);
    assert.deepEqual(result.executed_files.map((file: { path: string }) => file.path), [core]);
    assert.equal(result.scope, 'core-business-contracts');
    assert.equal(result.readiness, 'not_evaluated');
  } finally { fixture.cleanup(); }
});
