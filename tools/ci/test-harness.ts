import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { discoverApprovedTargets, inventoryNodeTestFiles, normalizeExecution } from './run-check-set.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') {
  throw new Error('Test harness requires GitHub-hosted Actions');
}
const discovery = JSON.parse(readFileSync('check-output/discovery.json', 'utf8'));
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const checkSetDigest = createHash('sha256').update(manifestBytes).digest('hex');
const files = inventoryNodeTestFiles();
const current = discoverApprovedTargets({ profile: 'bootstrap', approved: manifest.engineering_targets,
  scripts: JSON.parse(readFileSync('package.json', 'utf8')).scripts, available_files: files });
if (discovery.state !== 'discovered' || discovery.checkout_sha !== sha || discovery.check_set_digest !== checkSetDigest) {
  throw new Error('Missing current approved discovery');
}
if (current.state !== 'discovered' || JSON.stringify(current.targets) !== JSON.stringify(discovery.targets) ||
    JSON.stringify(files) !== JSON.stringify(discovery.discovered_files) ||
    manifest.engineering_targets.some((target: { command: string }) => target.command !== 'ci:contracts')) {
  throw new Error('Discovery differs from the current approved executable set');
}
const result = spawnSync(process.execPath, ['--experimental-strip-types', '--test', '--test-reporter=tap', ...files],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const raw = result.stdout || '';
const assessment = normalizeExecution({ format: 'tap', raw, exit_code: result.status,
  expected_count: manifest.engineering_case_count });
mkdirSync('check-output', { recursive: true });
writeFileSync('check-output/engineering.tap', raw);
writeFileSync('check-output/engineering.stderr', result.stderr || '');
writeFileSync('check-output/execution.json', JSON.stringify({ ...assessment,
  checkout_sha: sha, target_sha: sha, run_id: process.env.GITHUB_RUN_ID,
  attempt: Number(process.env.GITHUB_RUN_ATTEMPT), source: 'github-actions',
  runner_environment: process.env.RUNNER_ENVIRONMENT, check_set_digest: checkSetDigest,
  toolchain_digest: createHash('sha256').update(readFileSync('infra/ci/toolchain-lock.json')).digest('hex'),
  executed_files: files.map(file => ({ path: file, sha256: createHash('sha256').update(readFileSync(file)).digest('hex') })),
  discovery_digest: createHash('sha256').update(readFileSync('check-output/discovery.json')).digest('hex'),
  raw_report_sha256: createHash('sha256').update(raw).digest('hex'),
  scope: 'engineering-bootstrap-contracts', readiness: 'not_evaluated',
}, null, 2) + '\n');
if (assessment.state !== 'passed') throw new Error(`Raw execution blocked: ${JSON.stringify(assessment.reason_codes)}`);
