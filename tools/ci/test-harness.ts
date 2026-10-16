import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { discoverApprovedTargets, inventoryNodeTestFiles, normalizeExecution } from './run-check-set.ts';
import { executionContext, executionDirectory, snapshotWorkspace } from './execution-context.ts';

const identity = executionContext();
const directory = executionDirectory('check', identity);
const discovery = JSON.parse(readFileSync(`${directory}/discovery.json`, 'utf8'));
const sha = identity.checkout_sha;
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const checkSetDigest = createHash('sha256').update(manifestBytes).digest('hex');
const inventory = inventoryNodeTestFiles();
const coreTargets = manifest.core_targets || [];
const profile = coreTargets.length ? 'business-increment' : 'bootstrap';
const current = discoverApprovedTargets({ profile, approved: [...manifest.engineering_targets, ...coreTargets],
  scripts: JSON.parse(readFileSync('package.json', 'utf8')).scripts, available_files: inventory });
if (discovery.state !== 'discovered' || discovery.checkout_sha !== sha || discovery.check_set_digest !== checkSetDigest) {
  throw new Error('Missing current approved discovery');
}
if (discovery.source !== identity.source || identity.source === 'local' && JSON.stringify(discovery.workspace) !== JSON.stringify(identity.workspace)) {
  throw new Error('Discovery workspace snapshot or execution source changed');
}
if (current.state !== 'discovered' || JSON.stringify(current.targets) !== JSON.stringify(discovery.targets) ||
    JSON.stringify(inventory) !== JSON.stringify(discovery.discovered_files) ||
    manifest.engineering_targets.some((target: { command: string }) => target.command !== 'ci:contracts')) {
  throw new Error('Discovery differs from the current approved executable set');
}
const commandIndex = process.argv.indexOf('--command');
const targetIndex = process.argv.indexOf('--target');
const selectedTarget = targetIndex >= 0 ? coreTargets.find((target: { id: string }) => target.id === process.argv[targetIndex + 1]) : undefined;
if (targetIndex >= 0 && (!selectedTarget || commandIndex >= 0)) throw new Error('Selected target is missing, unregistered or mixed with a command');
const command = selectedTarget?.command || (commandIndex >= 0 ? process.argv[commandIndex + 1] : undefined);
if (commandIndex >= 0 && (typeof command !== 'string' || !coreTargets.some((target: { command: string }) => target.command === command))) {
  throw new Error('Selected command has no registered active core targets');
}
const group = command ? 'core' : process.env.CI_TARGET_GROUP || 'engineering';
if (!['engineering', 'core'].includes(group)) throw new Error('Unknown target execution group');
const selectedTargets = selectedTarget ? [selectedTarget] : group === 'core'
  ? coreTargets.filter((target: { command: string }) => !command || target.command === command) : manifest.engineering_targets;
const selectedFiles = selectedTargets.flatMap((target: { files: string[] }) => target.files);
const files = inventory.filter(file => selectedFiles.includes(file));
if (!files.length) throw new Error('An execution group must contain actual approved tests');
const args = ['--experimental-strip-types', '--test', '--test-reporter=tap', ...files];
const started_at = new Date().toISOString();
const result = spawnSync(process.execPath, args,
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const finished_at = new Date().toISOString();
const raw = result.stdout || '';
const assessment = normalizeExecution({ format: 'tap', raw, exit_code: result.status,
  expected_count: command ? selectedTargets.reduce((sum: number, target: { case_count: number }) => sum + target.case_count, 0)
    : group === 'core' ? manifest.core_case_count : manifest.engineering_case_count });
if (identity.source === 'local' && JSON.stringify(identity.workspace) !== JSON.stringify(snapshotWorkspace())) {
  assessment.state = 'blocked';
  (assessment.reason_codes as string[]).push('workspace_changed_during_execution');
}
mkdirSync(directory, { recursive: true });
const name = selectedTarget ? selectedTarget.id.replaceAll('.', '-') : command ? command.replaceAll(':', '-') : 'engineering';
writeFileSync(`${directory}/${name}.tap`, raw);
writeFileSync(`${directory}/${name}.stderr`, result.stderr || '');
writeFileSync(`${directory}/${command ? name : 'execution'}.json`, JSON.stringify({ ...identity, ...assessment,
  command: command || [process.execPath, ...args].join(' '), target_id: selectedTarget?.id,
  invocation: [process.execPath, ...args], started_at, finished_at, check_set_digest: checkSetDigest,
  toolchain_digest: createHash('sha256').update(readFileSync('infra/ci/toolchain-lock.json')).digest('hex'),
  executed_files: files.map(file => ({ path: file, sha256: createHash('sha256').update(readFileSync(file)).digest('hex') })),
  discovery_digest: createHash('sha256').update(readFileSync(`${directory}/discovery.json`)).digest('hex'),
  raw_report_sha256: createHash('sha256').update(raw).digest('hex'),
  scope: group === 'core' ? 'core-business-contracts' : 'engineering-bootstrap-contracts', readiness: 'not_evaluated',
}, null, 2) + '\n');
if (assessment.state !== 'passed') throw new Error(`Raw execution blocked: ${JSON.stringify(assessment.reason_codes)}`);
