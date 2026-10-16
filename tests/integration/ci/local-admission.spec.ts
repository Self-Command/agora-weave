import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const command = (args: string[], extra: NodeJS.ProcessEnv = {}) => {
  const env = { ...process.env };
  for (const key of Object.keys(env)) if (/^(GITHUB_|RUNNER_)/.test(key) || key === 'NODE_TEST_CONTEXT' || key === 'AGORAWEAVE_LOCAL_ENVIRONMENT') delete env[key];
  return spawnSync('pwsh', ['-NoProfile', '-File', 'tools/ci/bridge-transition.ps1', ...args,
    '-ExecutionSource', 'local', '-NodePath', process.execPath, '-LegacyAudit'], { env: { ...env, ...extra }, encoding: 'utf8', timeout: 60000 });
};

test('LA01: the actual bridge start admits a registered local contract target with real discovery execution and source binding', () => {
  // Break caught: a valid local development scope still requires a dirty-worktree cloud receipt or fabricates cloud identity.
  const before = readFileSync('.specify/superpowers-handoff.json', 'utf8');
  const result = command(['-Transition', 'start', '-Mode', 'local-development', '-Target', 'core.configuration-resolution']);
  assert.equal(result.status, 0, result.stderr);
  const admission = JSON.parse(readFileSync('.superpowers/local/engineering/bridge-output/admission.json', 'utf8'));
  assert.equal(admission.source, 'local');
  assert.equal(admission.state, 'local-development-ready');
  assert.equal(admission.target, 'core.configuration-resolution');
  assert.equal(admission.executed, 5);
  assert.equal(admission.ci_ready, false);
  assert.equal(admission.feature_complete, false);
  assert.equal(admission.task_complete, false);
  assert.match(admission.workspace.tree, /^[a-f0-9]{40}$/);
  assert.equal(Object.hasOwn(admission, 'run_id'), false);
  assert.equal(Object.hasOwn(admission, 'attempt'), false);
  assert.equal(readFileSync('.specify/superpowers-handoff.json', 'utf8'), before, 'Assessment must not perform the lifecycle transition itself');
});

test('LA02: a target with a real service dependency cannot borrow pure-contract local admission', () => {
  // Break caught: a contract command also contains a live HTTP test and is incorrectly admitted without services.
  const result = command(['-Transition', 'start', '-Mode', 'local-development', '-Target', 'core.http']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /service|dev|test|isolat/i);
});

test('LA03: local evidence cannot authorize a complete or full release transition', () => {
  // Break caught: introducing local start bypasses the existing mandatory cloud completion gate.
  const result = command(['-Transition', 'complete', '-Mode', 'full-release', '-Target', 'core.configuration-resolution']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /local.*start|cloud|complete/i);
});

test('LA04: a failed current launcher cannot reuse a previous passing target report', () => {
  // Break caught: the child exits before writing new output but fixed prior Green paths grant local readiness.
  mkdirSync('.superpowers/local/admission-fixture', { recursive: true });
  const preload = resolve('.superpowers/local/admission-fixture/launcher.mjs');
  writeFileSync(preload, "if (process.argv[1]?.replaceAll('\\\\','/').endsWith('tools/ci/test-harness.ts')) { console.error('Synthetic launcher failure before a new target report'); process.exit(23); }\n");
  const result = command(['-Transition', 'start', '-Mode', 'local-development', '-Target', 'core.configuration-resolution'],
    { NODE_OPTIONS: `--import=${pathToFileURL(preload).href}` });
  assert.notEqual(result.status, 0, 'A stale Green authorized a failed current invocation');
  const admission = JSON.parse(readFileSync('.superpowers/local/engineering/bridge-output/admission.json', 'utf8'));
  assert.notEqual(admission.state, 'local-development-ready');
});
