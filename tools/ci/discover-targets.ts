import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { discoverApprovedTargets } from './run-check-set.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
  throw new Error('Target discovery requires GitHub-hosted Actions');
}
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const root = JSON.parse(readFileSync('package.json', 'utf8'));
const files: string[] = [];
function visit(directory: string) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) visit(relative);
    else if (entry.isFile() && entry.name.endsWith('.spec.ts')) files.push(relative);
  }
}
for (const directory of ['tests/contract/ci', 'tests/integration/ci', 'tests/security/ci']) visit(directory);
const result = discoverApprovedTargets({ profile: 'bootstrap', approved: manifest.engineering_targets,
  scripts: root.scripts, available_files: files.sort() });
mkdirSync('check-output', { recursive: true });
writeFileSync('check-output/discovery.json', JSON.stringify({ ...result,
  checkout_sha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  check_set_digest: createHash('sha256').update(manifestBytes).digest('hex'),
  source: 'github-actions', runner_environment: process.env.RUNNER_ENVIRONMENT,
  discovered_files: files, readiness: 'not_evaluated',
}, null, 2) + '\n');
if (result.state !== 'discovered') throw new Error(`Discovery blocked: ${JSON.stringify(result.reason_codes)}`);
