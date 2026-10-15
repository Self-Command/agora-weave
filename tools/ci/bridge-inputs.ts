import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

export function initializationDigests(): Record<string, string> {
  const files = execFileSync('git', ['ls-files', '-z', '--', 'tools/ci', 'infra/ci', '.github/workflows',
    'tests/contract/ci', 'tests/integration/ci', 'tests/security/ci', 'tests/fixtures/bootstrap', 'tests/e2e',
    'package.json', 'package-lock.json', '.specify/memory/constitution.md',
    'specs/001-agoraweave-v1/spec.md', 'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/contracts'],
  { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }).split('\0').filter(Boolean).sort();
  return Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
}
