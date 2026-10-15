import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, rmSync, readFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

test('BR01: a ready handoff obtains bootstrap start admission before its executing transition', () => {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-ready-start-'));
  try {
    execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
    symlinkSync(path.resolve('node_modules'), path.join(root, 'node_modules'), 'dir');
    const handoffPath = path.join(root, '.specify/superpowers-handoff.json');
    const handoff = JSON.parse(readFileSync(handoffPath, 'utf8'));
    handoff.status = 'ready';
    writeFileSync(handoffPath, JSON.stringify(handoff, null, 2) + '\n');
    execFileSync('git', ['add', '.specify/superpowers-handoff.json'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Cloud lifecycle probe', '-c', 'user.email=probe@example.invalid',
      'commit', '--allow-empty', '-m', 'Synthetic ready bootstrap start'], { cwd: root, stdio: 'pipe' });
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/bridge-gate.ts'], { cwd: root,
      encoding: 'utf8', env: { ...process.env, GITHUB_HEAD_SHA: sha, ACTUAL_PRE_HOOK: 'success',
        BRIDGE_MODE: 'bootstrap-only', BRIDGE_TRANSITION: 'start' } });
    assert.equal(result.status, 0, `The start hook must authenticate ready before executing: ${result.stderr}`);
    const report = JSON.parse(readFileSync(path.join(root, 'bridge-output/bridge-admission.json'), 'utf8'));
    assert.equal(report.state, 'passed');
    assert.equal(report.mode, 'bootstrap-only');
    assert.equal(report.transition, 'start');
    assert.equal(report.target_sha, sha);
    assert.equal(JSON.parse(readFileSync(handoffPath, 'utf8')).status, 'ready', 'Assessment cannot transition the handoff');
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', root], { encoding: 'utf8' });
    rmSync(root, { recursive: true, force: true });
  }
});

test('BS01: actual cloud bridge scope refuses an unregistered mobile business implementation', () => {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-scope-'));
  try {
    execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
    writeFileSync(path.join(root, 'apps/mobile/app/business.tsx'), 'export default function Business() { return null; }\n');
    execFileSync('git', ['add', 'apps/mobile/app/business.tsx'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Cloud scope probe', '-c', 'user.email=probe@example.invalid', 'commit', '-m', 'Synthetic unapproved business scope'], { cwd: root, stdio: 'pipe' });
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/bridge-gate.ts'], { cwd: root,
      encoding: 'utf8', env: { ...process.env, GITHUB_HEAD_SHA: sha, ACTUAL_PRE_HOOK: 'success' } });
    assert.notEqual(result.status, 0, 'An actual business file was incorrectly admitted by the bootstrap gate');
    const report = JSON.parse(readFileSync(path.join(root, 'bridge-output/bridge-admission.json'), 'utf8'));
    assert.equal(report.state, 'blocked');
    assert.ok(report.reason_codes.includes('outside_bootstrap_scope'));
    assert.ok(report.changed_paths.includes('apps/mobile/app/business.tsx'));
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', root], { encoding: 'utf8' });
    rmSync(root, { recursive: true, force: true });
  }
});
