import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicBridgeReceipt } from '../../../tools/ci/bridge-public.ts';
import { assessBootstrapRaw } from '../../../tools/ci/bootstrap-reports.ts';
import { bridgeFixture } from '../../fixtures/bootstrap/gates.ts';
import { preservePrivateBridgeRecord } from '../../../tools/ci/private-bridge-record.ts';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

test('PB01: the public bridge projection retains the exact context required by its real raw-report consumer', () => {
  const context = bridgeFixture();
  const record = { ...context, state: 'passed', reason_codes: [], checkout_sha: context.target_sha,
    toolchain_digest: 'd'.repeat(64), run_id: '123', attempt: 1, record_kind: 'bootstrap_start_only', feature_complete: false };
  const receipt = publicBridgeReceipt(record);
  const input = { kind: 'bridge', target_sha: context.target_sha, check_set_digest: context.check_set_digest,
    toolchain_digest: record.toolchain_digest, source_authenticated: true, source_job_state: 'success',
    run_id: '123', attempt: 1, identity: receipt, raw: { admission: receipt } };
  assert.equal(assessBootstrapRaw(input).state, 'passed', 'The actual collector must revalidate the public technical context');
  assert.deepEqual(receipt.changed_paths, context.changed_paths);
  for (const patch of [{ expected_sha: 'e'.repeat(40) }, { required_hooks_ran: false },
    { changed_paths: ['apps/mobile/app/business.tsx'] }]) {
    const changed = { ...receipt, ...patch };
    assert.equal(assessBootstrapRaw({ ...input, identity: changed, raw: { admission: changed } }).state, 'blocked');
  }
});

test('PB02: private bridge transport accepts a valid SSH secret without a final newline and removes temporary credentials', () => {
  // Break caught: writing a trimmed secret verbatim makes OpenSSH reject an otherwise valid private key.
  assert.equal(process.env.RUNNER_ENVIRONMENT, 'github-hosted');
  const directory = mkdtempSync(join(tmpdir(), 'aw-bridge-key-'));
  const names = ['PATH', 'RUNNER_TEMP', 'EVIDENCE_SSH_PRIVATE_KEY', 'EVIDENCE_SSH_KNOWN_HOSTS',
    'EVIDENCE_SSH_USER', 'EVIDENCE_SSH_HOST'];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    const key = join(directory, 'synthetic-key');
    execFileSync('ssh-keygen', ['-q', '-t', 'ed25519', '-N', '', '-f', key]);
    process.env.EVIDENCE_SSH_PRIVATE_KEY = readFileSync(key, 'utf8').trimEnd();
    process.env.EVIDENCE_SSH_KNOWN_HOSTS = 'synthetic.invalid ssh-ed25519 synthetic';
    process.env.EVIDENCE_SSH_USER = 'synthetic';
    process.env.EVIDENCE_SSH_HOST = 'synthetic.invalid';
    process.env.RUNNER_TEMP = directory;
    // Replace only the remote transport. OpenSSH still parses the actual on-disk private key.
    writeFileSync(join(directory, 'sftp'), `#!/usr/bin/env python3
import pathlib, shutil, subprocess, sys
args = sys.argv[1:]
key = args[args.index('-i') + 1]
subprocess.run(['/usr/bin/ssh-keygen', '-y', '-f', key], check=True, stdout=subprocess.DEVNULL)
lines = pathlib.Path(args[args.index('-b') + 1]).read_text().splitlines()
put = next(line.split() for line in lines if line.startswith('put '))
get = next(line.split() for line in lines if line.startswith('get '))
assert put[2] == get[1]
shutil.copyfile(put[1], get[2])
`, { mode: 0o700 });
    process.env.PATH = `${directory}:${saved.PATH}`;
    const record = { target_sha: 'a'.repeat(40), run_id: '123', attempt: 1, state: 'passed' };
    const result = preservePrivateBridgeRecord(record);
    assert.equal(result.state, 'archived_and_readback_verified');
    assert.equal(result.sha256, createHash('sha256').update(JSON.stringify(record, null, 2) + '\n').digest('hex'));
    assert.equal(result.temporary_key_files_removed, true);
    assert.equal(readdirSync(directory).some(name => name.startsWith('bridge-private-')), false);
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
    rmSync(directory, { recursive: true, force: true });
  }
});
