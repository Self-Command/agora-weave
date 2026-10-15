import assert from 'node:assert/strict';
import { test } from 'node:test';
import { preservePrivateBridgeRecord } from '../../../tools/ci/private-bridge-record.ts';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('PB03: private bridge records use the admitted write-once ordinary archive layout without creating mutable directories', () => {
  const root = mkdtempSync(join(tmpdir(), 'aw-bridge-layout-'));
  const names = ['PATH', 'RUNNER_TEMP', 'EVIDENCE_SSH_PRIVATE_KEY', 'EVIDENCE_SSH_KNOWN_HOSTS', 'EVIDENCE_SSH_USER', 'EVIDENCE_SSH_HOST'];
  const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
  try {
    process.env.RUNNER_TEMP = root;
    process.env.EVIDENCE_SSH_PRIVATE_KEY = 'synthetic-transport-fixture';
    process.env.EVIDENCE_SSH_KNOWN_HOSTS = 'synthetic';
    process.env.EVIDENCE_SSH_USER = 'synthetic';
    process.env.EVIDENCE_SSH_HOST = 'synthetic.invalid';
    writeFileSync(join(root, 'sftp'), `#!/usr/bin/env python3
import pathlib, shutil, sys
args = sys.argv[1:]
lines = pathlib.Path(args[args.index('-b') + 1]).read_text().splitlines()
put = next(line.split() for line in lines if line.startswith('put '))
get = next(line.split() for line in lines if line.startswith('get '))
if pathlib.PurePosixPath(put[2]).parent != pathlib.PurePosixPath('/archive/ordinary'):
    sys.stderr.write('Permission denied: nested directories are sealed by the archive policy')
    sys.exit(1)
assert not any('mkdir ' in line for line in lines)
assert put[2] == get[1]
shutil.copyfile(put[1], get[2])
`, { mode: 0o700 });
    process.env.PATH = `${root}:${saved.PATH}`;
    let receipt: Record<string, unknown> = {};
    assert.doesNotThrow(() => { receipt = preservePrivateBridgeRecord({ target_sha: 'a'.repeat(40), run_id: '1234', attempt: 1 }); },
      'The bridge must obey the same admitted storage layout as complete source archives');
    assert.equal(receipt.state, 'archived_and_readback_verified');
    assert.match(receipt.path, /^\/archive\/ordinary\/bridge-admission-[a-f0-9]{40}-1234-1\.json$/);
    assert.equal(receipt.temporary_key_files_removed, true);
    assert.match(readFileSync('tools/ci/bridge-transition.ps1', 'utf8'), /ordinary\/bridge-admission-/,
      'The transition reader must accept and bind the admitted private receipt path');
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name];
    }
    rmSync(root, { recursive: true, force: true });
  }
});
