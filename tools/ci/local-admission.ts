import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { delimiter, dirname } from 'node:path';
import { executionContext, executionDirectory, localHandoffAllowsActor, snapshotWorkspace } from './execution-context.ts';
import { localRuntime } from './local-services.ts';
import { normalizeExecution } from './run-check-set.ts';

const identity = executionContext();
if (identity.source !== 'local') throw new Error('Local admission cannot authorize a cloud transition');
const handoff = JSON.parse(readFileSync('.specify/superpowers-handoff.json', 'utf8'));
if (!localHandoffAllowsActor(handoff, 'codex')) {
  throw new Error('The current canonical feature is not available for execution');
}
const files = ['.specify/memory/constitution.md', 'specs/001-agoraweave-v1/spec.md',
  'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/tasks.md'];
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const contract_digests = Object.fromEntries(files.map(file => [file, hash(readFileSync(file))]));
const manifestBytes = readFileSync('tools/ci/validation-manifest.json');
const manifest = JSON.parse(manifestBytes.toString());
const targetIndex = process.argv.indexOf('--target');
const target = targetIndex >= 0 ? manifest.core_targets.find((entry: { id: string }) => entry.id === process.argv[targetIndex + 1]) : undefined;
if (!target || !Number.isInteger(target.case_count) || target.case_count < 1) throw new Error('Local admission requires one registered nonempty target');
if (target.requires_services !== false) localRuntime();
const directory = executionDirectory('bridge', identity);
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/admission.json`, JSON.stringify({ ...identity, state: 'blocked', target: target.id,
  reason: 'Current start assessment has not passed', ci_ready: false, task_complete: false, feature_complete: false }, null, 2) + '\n');
const env: NodeJS.ProcessEnv = { ...process.env, PATH: dirname(process.execPath) + delimiter + process.env.PATH };
delete env.NODE_TEST_CONTEXT;
const invoke = (name: string, args: string[]) => {
  const started_at = new Date().toISOString();
  const result = spawnSync(process.execPath, args, { env, encoding: 'utf8', timeout: 180000, maxBuffer: 8 * 1024 * 1024 });
  writeFileSync(`${directory}/${name}.stdout`, result.stdout || '');
  writeFileSync(`${directory}/${name}.stderr`, result.stderr || '');
  writeFileSync(`${directory}/${name}.json`, JSON.stringify({ ...identity, command: [process.execPath, ...args],
    started_at, finished_at: new Date().toISOString(), exit_code: result.status, signal: result.signal,
    stdout_digest: hash(result.stdout || ''), stderr_digest: hash(result.stderr || '') }, null, 2) + '\n');
  return result;
};
const typecheck = invoke('typecheck', [identity.tool_environment.npm_cli, 'run', 'ci:typecheck']);
if (typecheck.status !== 0) throw new Error('Local fixed dependency and typecheck precondition failed; this is not semantic Red');
if (target.requires_services !== false) {
  for (const [name, args] of [['health', ['tools/ci/service-health.ts']], ['migrate-clean', ['tools/ci/core-entry.ts', 'migrate']],
    ['migrate-incremental', ['tools/ci/core-entry.ts', 'migrate']], ['seed', ['tools/ci/core-entry.ts', 'seed']]] as const) {
    if (invoke(name, ['--experimental-strip-types', ...args]).status !== 0) throw new Error(`Local service precondition ${name} failed; this is not semantic Red`);
  }
}
if (invoke('discovery', ['--experimental-strip-types', 'tools/ci/discover-targets.ts']).status !== 0) throw new Error('Local target inventory is incomplete');
const name = target.id.replaceAll('.', '-');
const check = executionDirectory('check', identity);
for (const extension of ['json', 'tap', 'stderr']) rmSync(`${check}/${name}.${extension}`, { force: true });
const targetInvocation = invoke('target', ['--experimental-strip-types', 'tools/ci/test-harness.ts', '--target', target.id]);
if (targetInvocation.error || targetInvocation.signal || ![0, 1].includes(targetInvocation.status!)) {
  throw new Error('Current target launcher failed; previous reports cannot authorize local start');
}
const report = JSON.parse(readFileSync(`${check}/${name}.json`, 'utf8'));
const raw = readFileSync(`${check}/${name}.tap`, 'utf8');
const assessed = normalizeExecution({ format: 'tap', raw, expected_count: target.case_count, exit_code: report.exit_code });
const failures = [...raw.matchAll(/^not ok \d+ - .+\r?\n {2}---\r?\n[\s\S]*?^ {2}\.\.\./gm)];
const semanticRed = Number(assessed.failed) > 0 && failures.length === assessed.failed &&
  failures.every(failure => /^ {2}code: 'ERR_ASSERTION'\r?$/m.test(failure[0]));
if (report.source !== 'local' || report.target_id !== target.id || report.command !== target.command ||
    report.exit_code !== targetInvocation.status ||
    report.check_set_digest !== hash(manifestBytes) || report.raw_report_sha256 !== hash(raw) ||
    JSON.stringify(report.workspace) !== JSON.stringify(snapshotWorkspace()) ||
    JSON.stringify(report.workspace) !== JSON.stringify(identity.workspace) ||
    (assessed.reason_codes as string[]).some(reason => reason !== 'execution_not_passed') ||
    ['cancelled', 'skipped', 'todo'].some(key => assessed[key] !== 0) ||
    assessed.state !== 'passed' && !semanticRed) throw new Error('Local target result is not bound complete Green or semantic Red');
writeFileSync(`${directory}/admission.json`, JSON.stringify({ ...identity, state: 'local-development-ready', target: target.id,
  executed: assessed.executed, target_result: assessed.state === 'passed' ? 'green_observed' : 'red_observed',
  check_set_digest: hash(manifestBytes), contract_digests, raw_report_digest: hash(raw),
  requires_services: target.requires_services !== false, checked_at: new Date().toISOString(),
  ci_ready: false, task_complete: false, feature_complete: false }, null, 2) + '\n');
console.log(`Local start admitted for ${target.id}; independent Actions evidence and canonical completion remain required.`);
