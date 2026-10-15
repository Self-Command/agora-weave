import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

test('RP01: the actual transition reader authenticates each same-SHA receipt and selects one exact business purpose while rejecting ambiguity', () => {
  assert.equal(process.env.GITHUB_ACTIONS, 'true');
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const directory = mkdtempSync(path.join(tmpdir(), 'agoraweave-reader-purpose-'));
  const root = path.join(directory, 'checkout'), bin = path.join(directory, 'bin');
  const metadata = path.join(directory, 'metadata'), archives = path.join(directory, 'archives');
  const runsPath = path.join(directory, 'runs.json'), logPath = path.join(directory, 'requests.log');
  try {
    for (const folder of [root, bin, metadata, archives]) mkdirSync(folder);
    const digests: Record<string, string> = {};
    for (let index = 0; index < 4; index++) {
      const file = `input-${index}.json`, bytes = Buffer.from(`{"input":${index}}\n`);
      writeFileSync(path.join(root, file), bytes);
      digests[file] = createHash('sha256').update(bytes).digest('hex');
    }
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    execFileSync('git', ['add', '.'], { cwd: root });
    execFileSync('git', ['-c', 'user.name=Cloud purpose probe', '-c', 'user.email=probe@example.invalid',
      'commit', '--quiet', '-m', 'Synthetic frozen reader inputs'], { cwd: root });
    const sha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    const run = (id: number) => ({ id, run_attempt: 1, head_sha: sha, path: '.github/workflows/bridge-admission.yml',
      repository: { full_name: 'Self-Command/agora-weave' }, head_repository: { full_name: 'Self-Command/agora-weave' },
      status: 'completed', conclusion: 'success' });
    const receipt = (id: number, mode = 'business-increment') => ({ target_sha: sha, actor: 'codex',
      feature: 'specs/001-agoraweave-v1', mode, transition: 'start', state: 'passed',
      source: 'github-actions', runner_environment: 'github-hosted', run_id: id, attempt: 1, input_digests: { ...digests } });
    function publish(value: ReturnType<typeof receipt>, corruptDigest = false) {
      const id = value.run_id, artifact = id + 1000;
      const receiptPath = path.join(directory, `receipt-${id}.json`), archivePath = path.join(archives, `${artifact}.zip`);
      writeFileSync(receiptPath, JSON.stringify(value));
      execFileSync('python3', ['-c',
        'import sys,zipfile; z=zipfile.ZipFile(sys.argv[2],"w"); z.write(sys.argv[1],"bridge-admission.json"); z.close()', receiptPath, archivePath]);
      const bytes = readFileSync(archivePath);
      writeFileSync(path.join(metadata, `${id}.json`), JSON.stringify({ artifacts: [{ id: artifact,
        name: `bridge-admission-${id}-1`, expired: false, workflow_run: { id, head_sha: sha }, size_in_bytes: bytes.length,
        digest: `sha256:${corruptDigest ? '0'.repeat(64) : createHash('sha256').update(bytes).digest('hex')}` }] }));
    }
    publish(receipt(123, 'bootstrap-only'));
    publish(receipt(124));
    writeFileSync(runsPath, JSON.stringify({ workflow_runs: [run(123), run(124)] }));
    const gh = `#!/usr/bin/env node\nconst fs=require('node:fs'),path=require('node:path');
const request=process.argv.find(value=>value.startsWith('repos/'));
fs.appendFileSync(${JSON.stringify(logPath)},String(request)+'\\n');
let match;
if(request.includes('/actions/runs?')) process.stdout.write(fs.readFileSync(${JSON.stringify(runsPath)}));
else if((match=request.match(/\\/runs\\/(\\d+)\\/artifacts(?:\\?|$)/))) process.stdout.write(fs.readFileSync(path.join(${JSON.stringify(metadata)},match[1]+'.json')));
else if((match=request.match(/\\/artifacts\\/(\\d+)\\/zip$/))) process.stdout.write(fs.readFileSync(path.join(${JSON.stringify(archives)},match[1]+'.zip')));
else if((match=request.match(/\\/actions\\/runs\\/(\\d+)(?:\\/attempts\\/1)?$/))) {
const runs=JSON.parse(fs.readFileSync(${JSON.stringify(runsPath)},'utf8')).workflow_runs;
const value=runs.find(run=>String(run.id)===match[1]); if(!value) process.exit(2); process.stdout.write(JSON.stringify(value));
} else process.exit(2);\n`;
    writeFileSync(path.join(bin, 'gh'), gh); chmodSync(path.join(bin, 'gh'), 0o755);
    const script = path.resolve('tools/ci/bridge-transition.ps1');
    const invoke = () => spawnSync('pwsh', ['-NoLogo', '-NoProfile', '-File', script,
      '-Transition', 'start', '-Mode', 'business-increment', '-Actor', 'codex'], { cwd: root, encoding: 'utf8',
      env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH }, timeout: 60000 });
    const valid = invoke();
    assert.equal(valid.error, undefined, 'PowerShell and the actual archive transport must execute');
    assert.equal(valid.status, 0, `A distinct bootstrap receipt must not make the business receipt ambiguous: ${valid.stderr}`);
    assert.match(valid.stdout, /Authenticated cloud start admitted for business-increment/);
    const requests = readFileSync(logPath, 'utf8');
    for (const id of [123, 124]) {
      assert.ok(requests.includes(`/runs/${id}/artifacts`), `Run ${id} artifact metadata was not read`);
      assert.ok(requests.includes(`/artifacts/${id + 1000}/zip`), `Run ${id} ZIP bytes were not authenticated before purpose selection`);
    }
    publish(receipt(125));
    writeFileSync(runsPath, JSON.stringify({ workflow_runs: [run(123), run(124), run(125)] }));
    assert.notEqual(invoke().status, 0, 'Two exact authenticated business receipts must remain ambiguous');
    writeFileSync(runsPath, JSON.stringify({ workflow_runs: [run(123), run(124)] }));
    for (const patch of [{ mode: 'unknown' }, { actor: 'other' }, { feature: 'specs/another-feature' },
      { transition: 'complete' }, { input_digests: { ...digests, 'input-0.json': '0'.repeat(64) } }]) {
      publish({ ...receipt(124), ...patch });
      assert.notEqual(invoke().status, 0, `A nonmatching or invalid receipt authorized business: ${JSON.stringify(patch)}`);
    }
    publish(receipt(124), true);
    assert.notEqual(invoke().status, 0, 'A wrong archive digest must not authorize the matching purpose');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
