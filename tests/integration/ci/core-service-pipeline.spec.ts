import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

test('CW05: the shared isolated-service job executes active core migrations, seed and suites before cleanup', () => {
  // Break caught: healthy disposable services were destroyed without executing the registered core suites.
  const scripts = JSON.parse(readFileSync('package.json', 'utf8')).scripts;
  for (const name of ['ci:migrate', 'ci:seed', 'ci:core', 'ci:core:contracts', 'ci:service',
    'ci:security', 'ci:concurrency', 'ci:recovery', 'ci:components']) {
    assert.ok(typeof scripts[name] === 'string' && scripts[name].trim(), `Missing actual core entry: ${name}`);
  }
  const workflow = readFileSync('.github/workflows/service-bootstrap.yml', 'utf8');
  const health = workflow.indexOf('npm run ci:health');
  const core = workflow.indexOf('npm run ci:core');
  const cleanup = workflow.indexOf('id: cleanup');
  assert.ok(health >= 0 && core > health && cleanup > core, 'Core execution must follow real health and precede disposal');
  assert.match(workflow, /core-output\//, 'Original core execution must be preserved even on failure');
  for (const entry of ['verify-increment.yml', 'verify-development.yml']) {
    const executor = readFileSync(`.github/workflows/${entry}`, 'utf8');
    assert.match(executor, /uses: \.\/\.github\/workflows\/service-bootstrap\.yml/);
    assert.match(executor, /needs: \[install, service\]/, 'Later discovery cannot bypass a failed core service job');
  }
});
