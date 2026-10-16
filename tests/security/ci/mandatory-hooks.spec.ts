import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('HK01: ED-22 disables daily receipt hooks while keeping resolvable optional legacy diagnostics', () => {
  const parsed = spawnSync(process.platform === 'win32' ? 'python' : 'python3', ['-c', 'import json,yaml; print(json.dumps(yaml.safe_load(open(".specify/extensions.yml",encoding="utf-8"))))'], { encoding: 'utf8' });
  assert.equal(parsed.status, 0, `Registry parser must execute successfully: ${parsed.stderr}`);
  const registry = JSON.parse(parsed.stdout);
  for (const phase of ['before_implement', 'after_implement']) {
    const hooks = (registry.hooks?.[phase] || []).filter((hook: Record<string, unknown>) => hook.extension === 'agoraweave-ci');
    assert.equal(hooks.length, 1);
    assert.equal(hooks[0].enabled, false, `${phase} must not require a daily receipt`);
    const skill = String(hooks[0].command).replaceAll('.', '-');
    for (const agent of ['.agents', '.claude']) {
      const location = `${agent}/skills/${skill}/SKILL.md`;
      assert.ok(existsSync(location), `Native command must resolve: ${location}`);
      const content = readFileSync(location, 'utf8');
      assert.ok(content.includes('tools/ci/bridge-transition.ps1'), 'Legacy diagnostic remains available');
      assert.ok(content.includes('-LegacyAudit'));
      assert.ok(content.includes(phase === 'before_implement' ? '-Transition start' : '-Transition complete'));
    }
  }
});
