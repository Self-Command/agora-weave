import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

test('CE01: every approved shared executor entry exists as an actual command before it can be invoked', () => {
  const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
  for (const entry of ['ci:install', 'ci:health', 'ci:discover', 'ci:contracts', 'ci:lint',
    'ci:typecheck', 'ci:run', 'ci:e2e', 'ci:evidence']) {
    assert.equal(typeof scripts[entry], 'string', `Missing real ${entry} entry`);
    assert.ok(scripts[entry].trim(), `Empty ${entry} entry`);
    assert.doesNotMatch(scripts[entry], /--if-present|\becho\b|\btrue\b/, `Non-executing ${entry} entry`);
  }
});
