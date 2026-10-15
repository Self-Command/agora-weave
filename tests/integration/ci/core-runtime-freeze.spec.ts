import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('CFZ01: the existing cloud freeze entry accepts only the pinned current core runtime extension', () => {
  const workflow = readFileSync('.github/workflows/ci-bootstrap.yml', 'utf8');
  const script = workflow.split('if [ -f infra/ci/dependency-freeze-request.json ]; then')[1]
    ?.split("<<'NODE'")[1]?.split('\n          NODE')[0];
  assert.ok(script, 'The actual cloud dependency authorization block must exist');
  const root = mkdtempSync(join(tmpdir(), 'aw-core-freeze-'));
  try {
    mkdirSync(join(root, 'infra/ci'), { recursive: true });
    const lock = '{"lockfileVersion":3,"packages":{}}\n';
    const packages = { postgres: '3.4.7', 'unicode-segmenter': '0.17.3' };
    const current = JSON.parse(readFileSync('package.json', 'utf8'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({ ...current, dependencies: packages }));
    writeFileSync(join(root, 'package-lock.json'), lock);
    const request = { scope: 'core-runtime-extension', previous_lock_sha256: createHash('sha256').update(lock).digest('hex'), packages };
    const run = (value: object) => {
      writeFileSync(join(root, 'infra/ci/dependency-freeze-request.json'), JSON.stringify(value));
      return execFileSync(process.execPath, ['--input-type=module', '-e', script], { cwd: root, stdio: 'pipe' });
    };
    assert.doesNotThrow(() => run(request), 'Pinned PostgreSQL and Unicode seventeen dependencies need the existing cloud-only lock path');
    for (const patch of [{ packages: { ...packages, postgres: '*' } }, { packages: { ...packages, arbitrary: '1.0.0' } },
      { previous_lock_sha256: '0'.repeat(64) }, { scope: 'arbitrary-runtime' }]) assert.throws(() => run({ ...request, ...patch }));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
