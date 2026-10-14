import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('HK01: both bridge lifecycle phases resolve to mandatory unfiltered project commands', () => {
  const parsed = spawnSync('python3', ['-c', 'import json,yaml; print(json.dumps(yaml.safe_load(open(".specify/extensions.yml",encoding="utf-8"))))'], { encoding: 'utf8' });
  assert.equal(parsed.status, 0, `Registry parser must execute successfully: ${parsed.stderr}`);
  const registry = JSON.parse(parsed.stdout);
  for (const phase of ['before_implement', 'after_implement']) {
    const mandatory = (registry.hooks?.[phase] || []).filter((hook: Record<string, unknown>) =>
      hook.extension !== 'speckit-superpowers-bridge' && hook.enabled !== false && !hook.condition && hook.optional === false);
    assert.equal(mandatory.length, 1, `${phase} must have an unfiltered project admission hook`);
    const skill = String(mandatory[0].command).replaceAll('.', '-');
    for (const agent of ['.agents', '.claude']) {
      const location = `${agent}/skills/${skill}/SKILL.md`;
      assert.ok(existsSync(location), `Native command must resolve: ${location}`);
      const content = readFileSync(location, 'utf8');
      assert.ok(content.includes('tools/ci/bridge-transition.ps1'), 'Hook must invoke the authenticated transition');
      assert.ok(content.includes(phase === 'before_implement' ? '-Transition start' : '-Transition complete'));
    }
  }
});
