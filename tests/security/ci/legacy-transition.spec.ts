import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('LB01: direct completion cannot claim an unfinished canonical feature under the current project policy', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-transition-'));
  try {
    mkdirSync(path.join(root, '.specify'), { recursive: true });
    cpSync('.specify/extensions', path.join(root, '.specify/extensions'), { recursive: true });
    cpSync('.specify/memory', path.join(root, '.specify/memory'), { recursive: true });
    cpSync('specs/001-agoraweave-v1', path.join(root, 'specs/001-agoraweave-v1'), { recursive: true });
    mkdirSync(path.join(root, 'tools/ci'), { recursive: true });
    for (const script of ['bridge-transition.ps1']) {
      try { cpSync(`tools/ci/${script}`, path.join(root, `tools/ci/${script}`)); } catch { /* Missing guard is the behavior under test. */ }
    }
    mkdirSync(path.join(root, 'infra/development'), { recursive: true });
    cpSync('infra/development/policy.json', path.join(root, 'infra/development/policy.json'));
    writeFileSync(path.join(root, '.specify/superpowers-handoff.json'), JSON.stringify({
      status: 'executing', feature_directory: 'specs/001-agoraweave-v1', artifact_owner: 'codex',
    }));
    const initialized = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8' });
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.equal(spawnSync('git', ['add', '.'], { cwd: root }).status, 0);
    assert.equal(spawnSync('git', ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@local.invalid',
      'commit', '--quiet', '-m', 'Test fixture'], { cwd: root }).status, 0);
    const start = spawnSync('pwsh', ['-NoLogo', '-NoProfile', '-File', path.join(root, 'tools/ci/bridge-transition.ps1'),
      '-Transition', 'start', '-Actor', 'codex'], { cwd: root, encoding: 'utf8', timeout: 60000 });
    assert.equal(start.status, 0, start.stderr);
    assert.match(start.stdout, /no daily admission receipt/);
    const result = spawnSync('pwsh', ['-NoLogo', '-NoProfile', '-File',
      path.join(root, '.specify/extensions/speckit-superpowers-bridge/scripts/powershell/update-handoff.ps1'),
      '-Status', 'complete', '-Actor', 'codex'], { cwd: root, encoding: 'utf8', timeout: 60000 });
    assert.notEqual(result.error?.message.includes('ENOENT'), true, 'PowerShell must actually execute');
    assert.notEqual(result.status, 0, `Legacy complete was accepted: ${result.stdout}`);
    assert.match(result.stderr, /Canonical tasks remain incomplete/);
    const handoff = JSON.parse(readFileSync(path.join(root, '.specify/superpowers-handoff.json'), 'utf8'));
    assert.notEqual(handoff.status, 'complete');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
