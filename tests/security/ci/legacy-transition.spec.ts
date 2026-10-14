import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

test('LB01: direct legacy complete cannot change effective handoff without authenticated cloud completion', () => {
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
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
    writeFileSync(path.join(root, '.specify/superpowers-handoff.json'), JSON.stringify({
      status: 'executing', feature_directory: 'specs/001-agoraweave-v1', artifact_owner: 'codex',
    }));
    const initialized = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8' });
    assert.equal(initialized.status, 0, initialized.stderr);
    const result = spawnSync('pwsh', ['-NoLogo', '-NoProfile', '-File',
      path.join(root, '.specify/extensions/speckit-superpowers-bridge/scripts/powershell/update-handoff.ps1'),
      '-Status', 'complete', '-Actor', 'codex'], { cwd: root, encoding: 'utf8', timeout: 60000 });
    assert.notEqual(result.error?.message.includes('ENOENT'), true, 'PowerShell must actually execute');
    assert.notEqual(result.status, 0, `Legacy complete was accepted: ${result.stdout}`);
    const handoff = JSON.parse(readFileSync(path.join(root, '.specify/superpowers-handoff.json'), 'utf8'));
    assert.notEqual(handoff.status, 'complete');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
