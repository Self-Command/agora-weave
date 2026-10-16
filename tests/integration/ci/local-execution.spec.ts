import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { localHandoffAllowsActor } from '../../../tools/ci/execution-context.ts';

const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const report = '.superpowers/local/engineering/check-output';

test('LD10: local start preserves the current handoff owner and canonical source boundary', () => {
  // Break caught: merely naming actor codex bypasses an absent or differently owned handoff.
  const handoff = { schema_version: 1, status: 'executing', executor: 'superpowers', artifact_owner: 'codex',
    feature_directory: 'specs/001-agoraweave-v1', review_only_agents: [], source_of_truth: {
      constitution: '.specify/memory/constitution.md', spec: 'specs/001-agoraweave-v1/spec.md',
      plan: 'specs/001-agoraweave-v1/plan.md', tasks: 'specs/001-agoraweave-v1/tasks.md' } };
  assert.equal(localHandoffAllowsActor(handoff, 'codex'), true);
  for (const patch of [{ artifact_owner: 'claude' }, { artifact_owner: undefined }, { status: 'blocked' },
    { source_of_truth: { ...handoff.source_of_truth, tasks: 'other/tasks.md' } }, { review_only_agents: ['codex'] }]) {
    assert.equal(localHandoffAllowsActor({ ...handoff, ...patch }, 'codex'), false);
  }
});

function localCheckout() {
  const root = mkdtempSync(join(tmpdir(), 'aw-local-execution-'));
  const write = (file: string, value: string | object) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), typeof value === 'string' ? value : JSON.stringify(value));
  };
  for (const file of ['discover-targets.ts', 'run-check-set.ts', 'test-harness.ts', 'execution-context.ts']) {
    if (existsSync(`tools/ci/${file}`)) {
      mkdirSync(join(root, 'tools/ci'), { recursive: true });
      copyFileSync(`tools/ci/${file}`, join(root, 'tools/ci', file));
    }
  }
  const file = 'tests/contract/ci/subject.spec.ts';
  write('.gitignore', '.superpowers/\n');
  write(file, "import assert from 'node:assert/strict'; import { test } from 'node:test'; import { value } from '../../../subject.mjs'; test('LOCAL01: real subject result', () => assert.equal(value, 1));\n");
  write('subject.mjs', 'export const value = 0;\n');
  write('package.json', { type: 'module', engines: { node: '22.23.3', npm: '10.9.9' },
    scripts: { 'ci:contracts': 'node --experimental-strip-types --test tests/contract/ci/*.spec.ts' } });
  write('tools/ci/validation-manifest.json', { schema_version: 1, engineering_case_count: 1,
    engineering_targets: [{ id: 'ci.local-subject', command: 'ci:contracts', files: [file] }], core_case_count: 0, core_targets: [] });
  write('infra/ci/toolchain-lock.json', { node: 'v22.23.3', npm: '10.9.9' });
  const git = (args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(['init', '--quiet']); git(['add', '.']);
  git(['-c', 'user.name=Local fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'synthetic local executor']);
  const environment: NodeJS.ProcessEnv = { ...process.env, AGORAWEAVE_EXECUTION_SOURCE: 'local' };
  for (const key of Object.keys(environment)) {
    if (/^(GITHUB_|RUNNER_)/.test(key) || key === 'NODE_TEST_CONTEXT' || key === 'GIT_INDEX_FILE') delete environment[key];
  }
  const run = (entry: string, extra: NodeJS.ProcessEnv = {}, args: string[] = []) => spawnSync(process.execPath,
    ['--experimental-strip-types', `tools/ci/${entry}`, ...args], { cwd: root, env: { ...environment, ...extra }, encoding: 'utf8', timeout: 30000 });
  const read = (name: string) => JSON.parse(readFileSync(join(root, report, name), 'utf8'));
  return { root, file, git, write, run, read, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}

test('LD01: local discovery and execution retain real failing assertions and reproducible input bytes without cloud identity', () => {
  // Break caught: runner-only discovery blocks a valid local target, or a local report fabricates cloud provenance.
  const fixture = localCheckout();
  try {
    fixture.write('subject.mjs', 'export const value = 1;\n');
    const discovery = fixture.run('discover-targets.ts');
    assert.equal(discovery.status, 0, discovery.stderr);
    const execution = fixture.run('test-harness.ts');
    assert.equal(execution.status, 0, execution.stderr);
    const result = fixture.read('execution.json');
    assert.equal(result.source, 'local');
    assert.equal(result.state, 'passed');
    assert.equal(result.exit_code, 0);
    assert.equal(result.executed, 1);
    assert.equal(result.readiness, 'not_evaluated');
    for (const key of ['run_id', 'attempt', 'runner_environment', 'artifact_id']) assert.equal(Object.hasOwn(result, key), false, key);
    assert.equal(result.workspace.base_sha, fixture.git(['rev-parse', 'HEAD']));
    assert.match(result.workspace.tree, /^[a-f0-9]{40}$/);
    assert.equal(fixture.git(['show', `${result.workspace.tree}:subject.mjs`]), 'export const value = 1;');
    assert.notEqual(result.workspace.tree, fixture.git(['rev-parse', 'HEAD^{tree}']));
    assert.equal(result.tool_environment.node, 'v22.23.3');
    assert.equal(result.tool_environment.npm, '10.9.9');
    assert.ok(result.tool_environment.platform);
    assert.ok(Date.parse(result.started_at) <= Date.parse(result.finished_at));
    assert.match(result.command, /--test/);
    const raw = readFileSync(join(fixture.root, report, 'engineering.tap'), 'utf8');
    assert.match(raw, /^ok 1 - LOCAL01: real subject result$/m);
    assert.equal(result.raw_report_sha256, digest(raw));
    assert.equal(fixture.git(['status', '--porcelain']), 'M subject.mjs', 'Evidence must not alter the caller index or include generated reports');
  } finally { fixture.cleanup(); }
});

test('LD02: changed local input or mixed runner identity refuses execution before a stale discovery can certify it', () => {
  // Break caught: unchanged HEAD hides working-tree changes, or local mode bypasses the Actions boundary.
  const fixture = localCheckout();
  try {
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    fixture.write('subject.mjs', 'export const value = 1;\n');
    const stale = fixture.run('test-harness.ts');
    assert.notEqual(stale.status, 0);
    assert.match(stale.stderr, /workspace|snapshot/i);
    assert.equal(existsSync(join(fixture.root, report, 'execution.json')), false);
    assert.notEqual(fixture.run('discover-targets.ts', { GITHUB_RUN_ID: '123' }).status, 0);
    assert.notEqual(fixture.run('discover-targets.ts', { RUNNER_ENVIRONMENT: 'github-hosted' }).status, 0);
    assert.notEqual(fixture.run('discover-targets.ts', { AGORAWEAVE_EXECUTION_SOURCE: 'anything' }).status, 0);
    assert.notEqual(fixture.run('discover-targets.ts', { AGORAWEAVE_EXECUTION_SOURCE: '' }).status, 0);
  } finally { fixture.cleanup(); }
});

test('LD03: a local semantic failure preserves original exit and report instead of becoming passed feedback', () => {
  // Break caught: a report adapter returns zero or replaces the original failed TAP with an empty success summary.
  const fixture = localCheckout();
  try {
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    const execution = fixture.run('test-harness.ts');
    assert.equal(execution.status, 1);
    const result = fixture.read('execution.json');
    assert.equal(result.source, 'local');
    assert.equal(result.state, 'blocked');
    assert.equal(result.failed, 1);
    assert.equal(result.exit_code, 1);
    assert.match(readFileSync(join(fixture.root, report, 'engineering.tap'), 'utf8'), /ERR_ASSERTION/);
  } finally { fixture.cleanup(); }
});

test('LD04: local discovery rejects an unmapped test and a mismatched fixed toolchain', () => {
  // Break caught: local mode silently relaxes the executable inventory or uses an unapproved runtime.
  const fixture = localCheckout();
  try {
    fixture.write('tests/contract/ci/unmapped.spec.ts', "import { test } from 'node:test'; test('unmapped', () => {});\n");
    assert.notEqual(fixture.run('discover-targets.ts').status, 0);
    assert.ok(fixture.read('discovery.json').reason_codes.includes('unmapped_actual_test'));
    fixture.write('infra/ci/toolchain-lock.json', { node: 'v0.0.0', npm: '10.9.9' });
    const result = fixture.run('discover-targets.ts');
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /toolchain|runtime/i);
  } finally { fixture.cleanup(); }
});

test('LD05: an unchanged committed public environment example is reproducible while modified or new secret files are refused', () => {
  // Break caught: the official public template blocks all local work, or changing it can smuggle credentials into a snapshot.
  const fixture = localCheckout();
  try {
    fixture.write('.env.example', 'PUBLIC_ORIGIN=http://local.invalid\n');
    fixture.git(['add', '.env.example']);
    fixture.git(['-c', 'user.name=Local fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'public template']);
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    fixture.write('.env.example', 'PRIVATE_SECRET=synthetic-never-publish\n');
    assert.notEqual(fixture.run('discover-targets.ts').status, 0);
    fixture.write('.env.example', 'PUBLIC_ORIGIN=http://local.invalid\n');
    fixture.write('.env.local', 'PRIVATE_SECRET=synthetic-never-publish\n');
    assert.notEqual(fixture.run('discover-targets.ts').status, 0);
  } finally { fixture.cleanup(); }
});

test('LD06: already tracked public placeholders under an ignored upstream data directory remain in the local snapshot', () => {
  // Break caught: exact-byte staging rejects the official tracked .gitkeep merely because its parent is ignored.
  const fixture = localCheckout();
  try {
    fixture.write('.gitignore', '.superpowers/\nvolumes/storage\n');
    fixture.write('volumes/storage/.gitkeep', '');
    fixture.git(['add', '.gitignore']); fixture.git(['add', '--force', 'volumes/storage/.gitkeep']);
    fixture.git(['-c', 'user.name=Local fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'public upstream placeholder']);
    const result = fixture.run('discover-targets.ts');
    assert.equal(result.status, 0, result.stderr);
    const tree = fixture.read('discovery.json').workspace.tree;
    assert.equal(fixture.git(['show', `${tree}:volumes/storage/.gitkeep`]), '');
  } finally { fixture.cleanup(); }
});

test('LD07: a large legitimate input is preserved without buffering an unbounded textual patch', () => {
  // Break caught: snapshotting a valid input fails at the process output buffer limit or silently omits its bytes.
  const fixture = localCheckout();
  try {
    const bytes = 'x'.repeat(2 * 1024 * 1024);
    fixture.write('large-input.txt', bytes);
    const result = fixture.run('discover-targets.ts');
    assert.equal(result.status, 0, result.stderr.slice(0, 500));
    const tree = fixture.read('discovery.json').workspace.tree;
    assert.equal(execFileSync('git', ['cat-file', '-s', `${tree}:large-input.txt`], { cwd: fixture.root, encoding: 'utf8' }).trim(), String(bytes.length));
  } finally { fixture.cleanup(); }
});

test('LD08: a selected registered pure core command executes its own full inventory independently of engineering and service targets', () => {
  // Break caught: selecting a pure contract command executes a different group's assertions or borrows its count.
  const fixture = localCheckout();
  try {
    const file = 'tests/contract/core/pure.spec.ts';
    fixture.write(file, "import { test } from 'node:test'; test('PURE01: pure core behavior', () => {});\n");
    fixture.write('package.json', { type: 'module', engines: { node: '22.23.3', npm: '10.9.9' }, scripts: {
      'ci:contracts': 'node --test tests/contract/ci/*.spec.ts', 'ci:core:contracts': 'node --test tests/contract/core/*.spec.ts' } });
    fixture.write('tools/ci/validation-manifest.json', { schema_version: 1, engineering_case_count: 1,
      engineering_targets: [{ id: 'ci.local-subject', command: 'ci:contracts', files: [fixture.file] }], core_case_count: 1,
      core_targets: [{ id: 'core.pure-subject', command: 'ci:core:contracts', files: [file], case_count: 1, requires_services: false }] });
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    const result = fixture.run('test-harness.ts', {}, ['--command', 'ci:core:contracts']);
    assert.equal(result.status, 0, result.stderr);
    const report = fixture.read('ci-core-contracts.json');
    assert.equal(report.command, 'ci:core:contracts');
    assert.deepEqual(report.executed_files.map((entry: { path: string }) => entry.path), [file]);
    assert.equal(report.executed, 1);
    assert.equal(fixture.run('test-harness.ts', {}, ['--command', 'ci:unregistered']).status, 1);
  } finally { fixture.cleanup(); }
});

test('LD09: local snapshots preserve CRLF execution bytes even when Git attributes normalize the path', () => {
  // Break caught: clean filters produce the same tree for different worktree bytes and allow stale discovery.
  const fixture = localCheckout();
  try {
    fixture.write('.gitattributes', '*.txt text eol=lf\n');
    fixture.write('input.txt', 'first\r\nsecond\r\n');
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    const first = fixture.read('discovery.json').workspace.tree;
    assert.equal(execFileSync('git', ['show', `${first}:input.txt`], { cwd: fixture.root }).toString(), 'first\r\nsecond\r\n');
    fixture.write('input.txt', 'first\nsecond\n');
    assert.equal(fixture.run('discover-targets.ts').status, 0);
    assert.notEqual(fixture.read('discovery.json').workspace.tree, first);
  } finally { fixture.cleanup(); }
});
