import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const script = resolve('tools/dev/sync-runtime.mjs');
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'aw-runtime-sync-')), source = join(root, 'source'), runtime = join(root, 'runtime');
  mkdirSync(join(source, 'infra/development'), { recursive: true });
  writeFileSync(join(source, 'infra/development/policy.json'), JSON.stringify({ runtime_root: runtime }));
  writeFileSync(join(source, '.gitignore'), '.agoraweave/\nnode_modules/\n');
  writeFileSync(join(source, 'business.txt'), 'first');
  const git = (...args: string[]) => execFileSync('git', args, { cwd: source, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '--quiet'); git('add', '.');
  git('-c', 'user.name=Synthetic fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'fixture');
  const destination = join(runtime, 'workspace');
  const sync = () => execFileSync(process.execPath, [script, source, destination], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return { root, source, destination, git, sync };
}

test('RS01: unchanged files retain mtime, same-size same-mtime edits sync, deletions and branch changes follow source', () => {
  const f = fixture();
  try {
    f.sync();
    const source = join(f.source, 'business.txt'), target = join(f.destination, 'business.txt');
    const fixed = new Date('2020-01-01T00:00:00Z');
    utimesSync(target, fixed, fixed);
    const marker = join(f.destination, '.runtime-sync.json'), markerMtime = statSync(marker).mtimeMs;
    assert.match(f.sync(), /copied=0, removed=0/);
    assert.equal(statSync(target).mtimeMs, fixed.getTime()); assert.equal(statSync(marker).mtimeMs, markerMtime);
    writeFileSync(source, 'other'); utimesSync(source, fixed, fixed);
    f.sync(); assert.equal(readFileSync(target, 'utf8'), 'other');
    writeFileSync(join(f.source, 'new.txt'), 'untracked source'); f.sync();
    assert.equal(readFileSync(join(f.destination, 'new.txt'), 'utf8'), 'untracked source');
    rmSync(join(f.source, 'new.txt')); rmSync(source); f.sync();
    assert.equal(existsSync(target), false); assert.equal(existsSync(join(f.destination, 'new.txt')), false);
    f.git('restore', 'business.txt'); f.git('checkout', '--quiet', '-b', 'next');
    writeFileSync(source, 'branch value'); f.git('add', 'business.txt');
    f.git('-c', 'user.name=Synthetic fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--quiet', '-m', 'branch');
    f.sync(); assert.equal(readFileSync(target, 'utf8'), 'branch value');
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});

test('RS02: private runtime and dependencies survive stale ownership; unsafe marker paths cannot delete outside workspace', () => {
  const f = fixture();
  try {
    f.sync();
    for (const file of ['.agoraweave/local/dev/runtime/private.json', 'node_modules/synthetic/index.js']) {
      mkdirSync(dirname(join(f.destination, file)), { recursive: true }); writeFileSync(join(f.destination, file), 'preserve');
    }
    const marker = join(f.destination, '.runtime-sync.json');
    const previous = JSON.parse(readFileSync(marker, 'utf8'));
    previous.files.push('.agoraweave/local/dev/runtime/private.json', 'node_modules/synthetic/index.js');
    writeFileSync(marker, JSON.stringify(previous)); f.sync();
    assert.equal(readFileSync(join(f.destination, '.agoraweave/local/dev/runtime/private.json'), 'utf8'), 'preserve');
    assert.equal(readFileSync(join(f.destination, 'node_modules/synthetic/index.js'), 'utf8'), 'preserve');
    const outside = join(f.root, 'outside.txt'); writeFileSync(outside, 'keep');
    const corrupted = JSON.parse(readFileSync(marker, 'utf8')); corrupted.files.push('../../outside.txt');
    writeFileSync(marker, JSON.stringify(corrupted));
    const result = spawnSync(process.execPath, [script, f.source, f.destination], { encoding: 'utf8' });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /Unsafe runtime path/);
    assert.equal(readFileSync(outside, 'utf8'), 'keep');
    const invalid = spawnSync(process.execPath, [script, f.source, join(f.root, 'wrong')], { encoding: 'utf8' });
    assert.notEqual(invalid.status, 0); assert.match(invalid.stderr, /Unexpected runtime workspace/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
