import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

test('BP01: the transition reader authenticates equivalent canonical Git roots and still rejects escaping receipt paths', () => {
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const directory = mkdtempSync(path.join(tmpdir(), 'agoraweave-reader-path-'));
  const root = path.join(directory, 'checkout');
  const bin = path.join(directory, 'bin');
  const realGit = execFileSync('which', ['git'], { encoding: 'utf8' }).trim();
  try {
    mkdirSync(root); mkdirSync(bin);
    const digests: Record<string, string> = {};
    for (let index = 0; index < 4; index++) {
      const file = `input-${index}.json`;
      const bytes = Buffer.from(`{"input":${index}}\n`);
      writeFileSync(path.join(root, file), bytes);
      digests[file] = createHash('sha256').update(bytes).digest('hex');
    }
    execFileSync(realGit, ['init', '--quiet'], { cwd: root });
    execFileSync(realGit, ['add', '.'], { cwd: root });
    execFileSync(realGit, ['-c', 'user.name=Cloud path probe', '-c', 'user.email=probe@example.invalid',
      'commit', '--quiet', '-m', 'Synthetic frozen transition inputs'], { cwd: root });
    const sha = execFileSync(realGit, ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const receiptPath = path.join(directory, 'receipt.json');
    const archivePath = path.join(directory, 'receipt.zip');
    const metadataPath = path.join(directory, 'artifact.json');
    const run = { id: 123, run_attempt: 1, head_sha: sha, path: '.github/workflows/bridge-admission.yml',
      head_repository: { full_name: 'Self-Command/agora-weave' }, status: 'completed', conclusion: 'success' };
    const receipt = { target_sha: sha, actor: 'codex', feature: 'specs/001-agoraweave-v1', mode: 'bootstrap-only',
      transition: 'start', state: 'passed', source: 'github-actions', runner_environment: 'github-hosted',
      run_id: 123, attempt: 1, input_digests: digests };
    function archive() {
      writeFileSync(receiptPath, JSON.stringify(receipt));
      execFileSync('python3', ['-c', 'import sys,zipfile; z=zipfile.ZipFile(sys.argv[2],"w"); z.write(sys.argv[1],"bridge-admission.json"); z.close()', receiptPath, archivePath]);
      const bytes = readFileSync(archivePath);
      writeFileSync(metadataPath, JSON.stringify({ artifacts: [{ id: 456, name: 'bridge-admission-123-1', expired: false,
        workflow_run: { id: 123, head_sha: sha }, size_in_bytes: bytes.length,
        digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}` }] }));
    }
    archive();
    const gh = `#!/usr/bin/env node\nconst fs = require('node:fs');
const request = process.argv[3];
if (request.includes('/artifacts/456/zip')) process.stdout.write(fs.readFileSync(${JSON.stringify(archivePath)}));
else if (request.includes('/runs/123/artifacts')) process.stdout.write(fs.readFileSync(${JSON.stringify(metadataPath)}));
else if (request.includes('/actions/runs?')) process.stdout.write(JSON.stringify({workflow_runs:[${JSON.stringify(run)}]}));
else process.exit(2);\n`;
    writeFileSync(path.join(bin, 'gh'), gh); chmodSync(path.join(bin, 'gh'), 0o755);
    const git = `#!/usr/bin/env node\nconst cp = require('node:child_process');
const args = process.argv.slice(2);
if (args.join(' ') === 'rev-parse --show-toplevel') process.stdout.write(${JSON.stringify(root + '/.')} + '\\n');
else { const result = cp.spawnSync(${JSON.stringify(realGit)}, args, {stdio:'inherit'}); process.exit(result.status ?? 1); }\n`;
    writeFileSync(path.join(bin, 'git'), git); chmodSync(path.join(bin, 'git'), 0o755);
    const script = path.resolve('tools/ci/bridge-transition.ps1');
    const invoke = () => spawnSync('pwsh', ['-NoLogo', '-NoProfile', '-File', script,
      '-Transition', 'start', '-Mode', 'bootstrap-only', '-Actor', 'codex'], { cwd: root, encoding: 'utf8',
      env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH }, timeout: 60000 });
    const valid = invoke();
    assert.equal(valid.error, undefined, 'PowerShell and fixture transport must actually execute');
    assert.equal(valid.status, 0, `Equivalent Git root was rejected after ZIP authentication: ${valid.stderr}`);
    assert.match(valid.stdout, /Authenticated cloud start admitted/);
    delete receipt.input_digests['input-0.json'];
    receipt.input_digests['../escape.json'] = '0'.repeat(64);
    archive();
    const escaped = invoke();
    assert.notEqual(escaped.status, 0, 'Canonicalization must preserve the receipt path boundary');
    assert.match(escaped.stderr, /Invalid transition input path/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
