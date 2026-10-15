import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('WR01: installed Playwright writes the approved discovery report inside the archived Web handoff', () => {
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-web-report-'));
  try {
    const configDirectory = path.join(root, 'tests/e2e/bootstrap');
    mkdirSync(configDirectory, { recursive: true });
    symlinkSync(path.resolve('node_modules'), path.join(root, 'node_modules'), 'dir');
    writeFileSync(path.join(root, 'package.json'), '{"type":"module"}\n');
    for (const file of ['playwright.config.ts', 'web-shell.spec.ts']) {
      cpSync(`tests/e2e/bootstrap/${file}`, path.join(configDirectory, file));
    }
    const environment = { ...process.env };
    for (const key of ['PLAYWRIGHT_JSON_OUTPUT_FILE', 'PLAYWRIGHT_JSON_OUTPUT_DIR', 'PLAYWRIGHT_JSON_OUTPUT_NAME']) delete environment[key];
    const result = spawnSync(process.execPath, [path.resolve('node_modules/@playwright/test/cli.js'),
      'test', '--config', path.join(configDirectory, 'playwright.config.ts'), '--list'], {
      cwd: root, env: environment, encoding: 'utf8', timeout: 60000,
    });
    assert.equal(result.error, undefined, 'The installed CLI must actually execute');
    assert.equal(result.status, 0, `Discovery health failed: ${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /Total: 16 tests in 1 file/);
    const reportPath = path.join(root, 'web-output/playwright-report.json');
    assert.equal(existsSync(reportPath), true,
      'The real JSON reporter did not write the report at the archived Web handoff; successful discovery cannot replace its bytes');
    const report = JSON.parse(readFileSync(reportPath, 'utf8'));
    assert.deepEqual(report.errors, []);
    assert.equal(report.suites.length, 1);
    assert.equal(report.suites[0].specs.length, 16);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
