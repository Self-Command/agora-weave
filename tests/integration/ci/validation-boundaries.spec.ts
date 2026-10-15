import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolveValidationRequest } from '../../../tools/ci/run-check-set.ts';
import { deriveTddCycle } from '../../../tools/ci/tdd-cycle.ts';

const sha = (letter: string) => letter.repeat(40);
const context = { repository: 'Self-Command/agora-weave', event: 'push', event_sha: sha('a'), target_sha: sha('a'),
  checkout_sha: sha('a'), check_set_digest: 'd'.repeat(64) };

test('VI03: engineering executables, contracts and unknown paths always require complete applicable validation', () => {
  for (const file of ['tools/ci/collect-evidence.ts', 'tools/ci/tdd-journal.ts', 'tools/ci/write-validation-plan.ts',
    'specs/001-agoraweave-v1/contracts/cloud-validation.md', 'docs/engineering/execution-policy.md', 'unknown/input']) {
    const result = resolveValidationRequest({ schema_version: 1, validation_intent: 'feedback' }, { ...context, changed_paths: [file] });
    assert.equal(result.full_required, true, `Executable or governing input was treated as ordinary documentation: ${file}`);
  }
});

test('VI04: the actual planner includes earlier executable changes in multi-commit PR and push ranges', () => {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const directory = mkdtempSync(path.join(tmpdir(), 'agoraweave-range-'));
  const root = path.join(directory, 'checkout');
  try {
    execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
    const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    writeFileSync(path.join(root, 'infra/ci/validation-request.json'), JSON.stringify({ schema_version: 1, validation_intent: 'feedback' }) + '\n');
    writeFileSync(path.join(root, 'tools/ci/range-probe.ts'), 'export const synthetic = true;\n');
    execFileSync('git', ['add', 'infra/ci/validation-request.json', 'tools/ci/range-probe.ts'], { cwd: root });
    const commit = (message: string) => execFileSync('git', ['-c', 'user.name=Cloud range probe', '-c', 'user.email=probe@example.invalid', 'commit', '--quiet', '-m', message], { cwd: root });
    commit('Synthetic earlier executable input');
    writeFileSync(path.join(root, 'docs/engineering/range-note.md'), 'Synthetic final documentation input.\n');
    execFileSync('git', ['add', 'docs/engineering/range-note.md'], { cwd: root }); commit('Synthetic final documentation input');
    const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    for (const eventName of ['pull_request', 'push']) {
      const eventFile = path.join(directory, `${eventName}.json`), output = path.join(directory, `${eventName}.txt`);
      writeFileSync(eventFile, JSON.stringify(eventName === 'pull_request' ?
        { pull_request: { base: { sha: base }, head: { sha: head } } } : { before: base, after: head }));
      const result = spawnSync(process.execPath, ['--experimental-strip-types', 'tools/ci/write-validation-plan.ts'], { cwd: root,
        encoding: 'utf8', env: { ...process.env, GITHUB_EVENT_NAME: eventName, GITHUB_EVENT_PATH: eventFile,
          GITHUB_OUTPUT: output, GITHUB_SHA: eventName === 'pull_request' ? sha('b') : head, GITHUB_REPOSITORY: context.repository } });
      assert.equal(result.status, 0, result.stderr);
      const plan = JSON.parse(readFileSync(path.join(root, 'validation-plan/plan.json'), 'utf8'));
      assert.equal(plan.full_required, true, `${eventName} hid earlier executable inputs`);
      assert.ok(plan.changed_paths.includes('tools/ci/range-probe.ts'), 'The complete event range must be retained as evidence');
    }
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', root]); rmSync(directory, { recursive: true, force: true });
  }
});

test('TI01: authenticated feedback and incomplete applicable sets cannot enter formal TDD Green or final records', () => {
  const execution = { source_authenticated: true, source: 'github-actions', health: 'passed', discovered: 1, executed: 1,
    test_digest: 'd'.repeat(64), fixture_digest: 'd'.repeat(64), oracle_digest: 'd'.repeat(64), regressions_passed: true,
    validation_intent: 'green', purpose_authenticated: true, applicable_set_verified: true };
  const fixture = { behavior_id: 'ci.purpose-binding', target_sha: sha('c'), implementation_sha: sha('b'), raw_red_preserved: true,
    require_authenticated_purpose: true,
    red: { ...execution, sha: sha('a'), run_id: '101', state: 'failed', failed: 1, failure_kind: 'assertion', cause: 'missing_behavior',
      implementation_present: false, cause_read_by: 'current-codex', cause_read_at: '2026-10-15T00:00:00Z' },
    green: { ...execution, sha: sha('b'), run_id: '102', state: 'passed', failed: 0 },
    final: { ...execution, sha: sha('c'), run_id: '103', state: 'passed', failed: 0 },
    history: { source: 'git-objects', ancestors: { [sha('b')]: [sha('a')], [sha('c')]: [sha('a'), sha('b')] } } };
  assert.equal(deriveTddCycle(fixture).state, 'passed');
  for (const label of ['green', 'final'] as const) {
    for (const patch of [{ validation_intent: 'feedback' }, { validation_intent: 'unknown' },
      { purpose_authenticated: false }, { applicable_set_verified: false }]) {
      assert.equal(deriveTddCycle({ ...fixture, [label]: { ...fixture[label], ...patch } }).state, 'blocked', `${label}: ${JSON.stringify(patch)}`);
    }
  }
});

test('AR01: actual archive collection persists transfer and raw reuse bindings inside the readback index', () => {
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const directory = mkdtempSync(path.join(tmpdir(), 'agoraweave-archive-reuse-'));
  const root = path.join(directory, 'checkout');
  try {
    execFileSync('git', ['worktree', 'add', '--detach', root, 'HEAD'], { stdio: 'pipe' });
    const target = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const archive = path.join(directory, 'source.zip');
    execFileSync('python3', ['-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[1],"w"); z.writestr("raw-report.json","{\\"synthetic\\":true}\\n"); z.close()', archive]);
    const bytes = readFileSync(archive), digest = createHash('sha256').update(bytes).digest('hex');
    const run = { id: 4242, head_sha: target, run_attempt: 1, event: 'push', status: 'completed', conclusion: 'success',
      path: '.github/workflows/ci-bootstrap.yml', repository: { full_name: context.repository }, head_repository: { full_name: context.repository } };
    const artifact = { id: 77, name: 'synthetic-archive', expired: false, size_in_bytes: bytes.length, digest: `sha256:${digest}`,
      workflow_run: { id: 4242, head_sha: target } };
    const preload = path.join(directory, 'fetch.mjs');
    writeFileSync(preload, `import {readFileSync} from 'node:fs';
const run=${JSON.stringify(run)}, artifact=${JSON.stringify(artifact)};
globalThis.fetch=async input=>{const url=String(input), pathname=new URL(url).pathname;
const reply=value=>new Response(JSON.stringify(value),{status:200});
if(pathname.endsWith('/actions/runs/4242')||pathname.endsWith('/attempts/1')) return reply(run);
if(pathname.endsWith('/artifacts')) return reply({total_count:1,artifacts:[artifact]});
if(pathname.endsWith('/artifacts/77/zip')) return new Response(null,{status:302,headers:{location:'https://synthetic.actions.githubusercontent.com/source.zip'}});
if(url.startsWith('https://synthetic.actions.githubusercontent.com/')) return new Response(readFileSync(${JSON.stringify(archive)}));
throw new Error('Unexpected synthetic archive request: '+url);};\n`);
    const result = spawnSync(process.execPath, ['--experimental-strip-types', '--import', preload, 'tools/ci/collect-archives.ts'],
      { cwd: root, encoding: 'utf8', env: { ...process.env, GH_TOKEN: 'synthetic-archive-token',
        GITHUB_REPOSITORY: context.repository, SOURCE_RUN_ID: '4242', SOURCE_SHA: target } });
    assert.equal(result.status, 0, result.stderr);
    const index = JSON.parse(readFileSync(path.join(root, 'archive-output/77/index.json'), 'utf8'));
    assert.equal(index.source_reuse?.raw_files_verified, true, 'Reuse evidence was dropped from the persisted private index');
    assert.equal(index.source_reuse.download_requests, 1);
    assert.equal(index.source_reuse.downloaded_bytes, bytes.length);
    assert.match(index.source_reuse.raw_index_digest, /^[a-f0-9]{64}$/);
    assert.equal(index.source_reuse.token, undefined);
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', root]); rmSync(directory, { recursive: true, force: true });
  }
});
