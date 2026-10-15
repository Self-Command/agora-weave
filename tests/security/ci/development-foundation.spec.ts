import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

for (const [id, description, files] of [
  ['FD01', 'official Compose and function inputs', ['supabase/upstream/docker/docker-compose.yml',
    'supabase/upstream/docker/volumes/functions/main/index.ts']],
  ['FD02', 'workspace dependency and build configuration', ['apps/admin/package.json', 'apps/share/package.json',
    'apps/mobile/package.json', 'apps/admin/tsconfig.json', 'apps/admin/postcss.config.mjs']],
  ['FD03', 'root lint and submodule configuration', ['eslint.config.mjs', '.gitmodules']],
] as const) {
  test(`${id}: development ancestry cannot reuse a foundation after changed ${description}`, () => {
    assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
    const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-foundation-'));
    try {
      execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
      const read = (): Record<string, string> => JSON.parse(execFileSync(process.execPath,
        ['--experimental-strip-types', '--input-type=module', '-e',
          "import { initializationDigests } from './tools/ci/bridge-inputs.ts'; console.log(JSON.stringify(initializationDigests()));"],
        { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
      for (const file of files) {
        const before = read();
        appendFileSync(path.join(root, file), '\n');
        const after = read();
        assert.ok(before[file], `Foundation omitted actual input ${file}`);
        assert.notEqual(after[file], before[file], `Changed foundation input reused: ${file}`);
      }
    } finally {
      spawnSync('git', ['worktree', 'remove', '--force', root]);
      rmSync(root, { recursive: true, force: true });
    }
  });
}

test('FD04: a changed tracked submodule revision invalidates inherited development inputs', () => {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const root = mkdtempSync(path.join(tmpdir(), 'agoraweave-foundation-gitlink-'));
  try {
    execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
    const read = (): Record<string, string> => JSON.parse(execFileSync(process.execPath,
      ['--experimental-strip-types', '--input-type=module', '-e',
        "import { initializationDigests } from './tools/ci/bridge-inputs.ts'; console.log(JSON.stringify(initializationDigests()));"],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }));
    const before = read();
    const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    execFileSync('git', ['update-index', '--cacheinfo', '160000', revision, 'superpowers-v7'], { cwd: root });
    const after = read();
    assert.ok(before['superpowers-v7'], 'Tracked submodule revision was omitted');
    assert.notEqual(after['superpowers-v7'], before['superpowers-v7']);
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', root]);
    rmSync(root, { recursive: true, force: true });
  }
});
