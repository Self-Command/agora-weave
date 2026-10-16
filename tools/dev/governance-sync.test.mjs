import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { synchronize, verify } from './governance-sync.mjs';

test('synchronizes checked-out and dormant branches, preserves unrelated staged work and backs up replaced rules', () => {
  const directory = mkdtempSync(join(tmpdir(), 'agora-governance-'));
  const root = join(directory, 'repo'), other = join(directory, 'other');
  mkdirSync(root);
  const git = (args, cwd = root) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim();
  const save = (path, value) => { mkdirSync(resolve(root, path, '..'), { recursive: true }); writeFileSync(resolve(root, path), value); };
  try {
    git(['init', '--quiet']); git(['config','user.name','Fixture']); git(['config','user.email','fixture@local.invalid']);
    save('.specify/memory/constitution.md', '**版本**: 5.0.0\n'); save('rules.md', 'old\n'); save('business.txt','original\n');
    save('policies/old.md','old name\n'); save('policies/binary.bin',Buffer.from([0,255,128,13,10]));
    save('infra/development/policy.json', JSON.stringify({runtime_root: join(directory,'runtime')}));
    save('tools/dev/governance-sync-manifest.json', JSON.stringify({ schema_version: 1, current_policy: 'ED-22', minimum_constitution_version: '5.0.0',
      files: ['.specify/memory/constitution.md','rules.md','infra/development/policy.json','tools/dev/governance-sync-manifest.json'], directories: ['policies'], deleted_files: [], additional_workspaces: [] }));
    git(['add','.']); git(['commit','--quiet','-m','Original']);
    git(['branch','dormant']); git(['worktree','add','--quiet','-b','other',other]);
    const remote = join(directory,'remote.git'); git(['init','--bare','--quiet',remote]); git(['remote','add','origin',remote]); git(['push','--quiet','--all','origin']);
    const before = git(['rev-parse','dormant']);
    writeFileSync(resolve(other,'rules.md'),'uncommitted target rule\n');
    save('rules.md','new\n'); save('business.txt','unfinished business\n'); git(['add','business.txt']);
    assert.throws(() => verify(root), /Governance drift/);
    const result = synchronize(root);
    assert.equal(result.local_branches,3); assert.equal(result.workspaces,2);
    assert.equal(readFileSync(resolve(other,'rules.md'),'utf8'),'new\n');
    assert.equal(git(['show','dormant:rules.md']),'new');
    assert.equal(git(['show','dormant:business.txt']),'original');
    assert.equal(git(['rev-parse','dormant^']),before);
    assert.equal(git(['diff','--cached','--name-only']),'business.txt');
    assert.equal(readFileSync(resolve(root,'business.txt'),'utf8'),'unfinished business\n');
    const after = git(['rev-parse','dormant']); synchronize(root); assert.equal(git(['rev-parse','dormant']),after);
    writeFileSync(resolve(other,'rules.md'),'stale\n'); assert.throws(() => verify(root), /Governance drift/);
    rmSync(resolve(root,'policies/old.md')); save('policies/new.md','new name\n');
    git(['commit','--quiet','--only','-m','Unfinished business checkpoint','--','business.txt']);
    synchronize(root,true);
    assert.equal(existsSync(resolve(other,'policies/old.md')),false);
    assert.equal(git(['show','dormant:policies/new.md']),'new name');
    assert.throws(() => git(['show','dormant:policies/old.md']));
    assert.equal(git(['show','origin/dormant:business.txt']),'original');
    assert.equal(git(['show',`origin/${git(['branch','--show-current'])}:business.txt`]),'original','Publishing rules must not publish business commits');
    assert.deepEqual(readFileSync(resolve(other,'policies/binary.bin')),Buffer.from([0,255,128,13,10]));
  } finally {
    if (existsSync(other)) git(['worktree','remove','--force',other]);
    if (!resolve(directory).startsWith(resolve(tmpdir()))) throw new Error('Unsafe fixture cleanup path');
    rmSync(directory,{recursive:true,force:true});
  }
});
