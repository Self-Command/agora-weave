import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

export function initializationDigests(): Record<string, string> {
  const files = execFileSync('git', ['ls-files', '-z', '--', 'tools/ci', 'infra/ci', '.github/workflows',
    '.github/actions', 'supabase/upstream', 'supabase/config.toml',
    'apps/*/package.json', 'apps/*/tsconfig*', 'apps/*/*config*', 'apps/*/app.json', 'apps/*/eas.json',
    '.gitmodules', '.npmrc', '.node-version', '.nvmrc', 'eslint.config.*', 'tsconfig*.json',
    'babel.config.*', 'metro.config.*', 'postcss.config.*', 'tailwind.config.*',
    'tests/contract/ci', 'tests/integration/ci', 'tests/security/ci', 'tests/fixtures/bootstrap', 'tests/e2e',
    'package.json', 'package-lock.json', '.specify/memory/constitution.md',
    'specs/001-agoraweave-v1/spec.md', 'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/contracts'],
  { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }).split('\0').filter(Boolean).sort();
  const submodules = execFileSync('git', ['ls-files', '--stage', '-z'], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
    .split('\0').filter(Boolean).flatMap(entry => {
      const match = /^160000 ([a-f0-9]{40}) 0\t(.+)$/.exec(entry);
      return match ? [[match[2], createHash('sha256').update(`gitlink:${match[1]}`).digest('hex')]] : [];
    });
  return Object.fromEntries([...files.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]), ...submodules]);
}
