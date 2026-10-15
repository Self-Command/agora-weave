import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { deriveBridgeEvidence } from './bridge-source.ts';
import { initializationDigests } from './bridge-inputs.ts';
import { collectEvidence } from './collect-evidence.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Bridge assessment requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== (process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA)) throw new Error('Bridge checkout changed');
const required = ['.specify/memory/constitution.md', 'specs/001-agoraweave-v1/spec.md',
  'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/tasks.md',
  'tools/ci/validation-manifest.json', 'infra/ci/toolchain-lock.json', 'tools/ci/gates.ts', 'tools/ci/bridge-transition.ps1',
  'tools/ci/bridge-gate.ts', 'tools/ci/bridge-source.ts', 'tools/ci/bridge-inputs.ts', 'tools/ci/schemas/bridge-result.schema.json'];
const inputDigests = Object.fromEntries(required.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const contractDigest = createHash('sha256').update(JSON.stringify(inputDigests)).digest('hex');
const handoff = JSON.parse(readFileSync('.specify/superpowers-handoff.json', 'utf8'));
const constitution = readFileSync('.specify/memory/constitution.md', 'utf8');
if (!constitution.includes('3.0.1') || handoff.artifact_owner !== 'codex' || handoff.status !== 'executing') throw new Error('Unapproved bootstrap ownership or lifecycle');
const scopeBase = '665fffada2dd4fb908b53ad7ca16159ce5e263d8';
const changedPaths = execFileSync('git', ['diff', '--name-only', scopeBase, sha], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const mode = process.env.BRIDGE_MODE || 'bootstrap-only';
const transition = process.env.BRIDGE_TRANSITION || 'start';
const input = { actor: 'codex', expected_actor: 'codex', feature: 'specs/001-agoraweave-v1', expected_feature: 'specs/001-agoraweave-v1',
  expected_sha: sha, target_sha: sha, expected_contract_digest: contractDigest, contract_digest: contractDigest,
  expected_check_set_digest: inputDigests['tools/ci/validation-manifest.json'], check_set_digest: inputDigests['tools/ci/validation-manifest.json'],
  source: 'github-actions', runner_environment: 'github-hosted', transition, mode,
  ownership_guard_passed: handoff.artifact_owner === 'codex', required_hooks_ran: process.env.ACTUAL_PRE_HOOK === 'success',
  working_tree_clean: !execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  changed_paths: changedPaths,
  read_by: 'actions-bootstrap-scope-and-ownership-check', read_at: new Date().toISOString() };
async function authenticatedReadiness(runId: string | undefined) {
  if (!runId || !/^[1-9]\d*$/.test(runId)) return undefined;
  const response = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/actions/runs/${runId}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
    redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Bridge source run unavailable');
  const run = await response.json() as Record<string, any>;
  const source = await collectEvidence({ repository: process.env.GITHUB_REPOSITORY!, token: process.env.GH_TOKEN!,
    run_id: runId, expected_sha: run.head_sha, expected_attempt: run.run_attempt,
    workflow_path: '.github/workflows/verify-release.yml', artifact_name: `verify-readiness-${runId}-${run.run_attempt}` });
  if (source.state !== 'verified_source' || !source.archive || source.original_conclusion !== 'success') throw new Error('Bridge requires a successful authenticated complete source run');
  const root = `${process.env.RUNNER_TEMP}/bridge-source-${runId}-${run.run_attempt}`;
  mkdirSync(root, { recursive: true });
  writeFileSync(`${root}/source.zip`, source.archive);
  execFileSync('python3', ['tools/ci/index-archive.py', `${root}/source.zip`, `${root}/index.json`, `${root}/raw`]);
  const document = JSON.parse(readFileSync(`${root}/raw/readiness.json`, 'utf8'));
  if (document.target_sha !== run.head_sha || document.source_run_id !== runId) throw new Error('Readiness body differs from its authenticated run');
  let ancestor = false;
  try { execFileSync('git', ['merge-base', '--is-ancestor', run.head_sha, sha]); ancestor = true; } catch { /* Unrelated source remains refused. */ }
  return { authenticated: true, ancestor_verified: ancestor, document, run_id: runId, attempt: run.run_attempt,
    archive_digest: source.archive_sha256 };
}
const initialization = mode === 'bootstrap-only' ? undefined : await authenticatedReadiness(process.env.INITIALIZATION_RUN_ID);
const completion = transition === 'complete' ? await authenticatedReadiness(process.env.COMPLETION_RUN_ID) : undefined;
const manifest = JSON.parse(readFileSync('tools/ci/validation-manifest.json', 'utf8'));
const result = deriveBridgeEvidence({ context: input, initialization, completion,
  current_initialization_digests: initializationDigests(),
  required_ids: mode === 'bootstrap-only' ? manifest.bootstrap_checks.filter((check: Record<string, any>) => check.bootstrap_applicability === 'required').map((check: Record<string, any>) => check.id) :
    manifest.frozen_profiles?.[mode]?.required_ids || [],
  canonical_tasks_complete: !/^- \[ \] T\d+/m.test(readFileSync('specs/001-agoraweave-v1/tasks.md', 'utf8')) });
mkdirSync('bridge-output', { recursive: true });
const record = { ...input, ...result,
  input_digests: inputDigests, run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  checkout_sha: sha, toolchain_digest: inputDigests['infra/ci/toolchain-lock.json'],
  scope_base_sha: scopeBase, initialization_source: initialization, completion_source: completion };
writeFileSync('bridge-output/bridge-admission.json', JSON.stringify(record, null, 2) + '\n');
if (result.state !== 'passed') throw new Error(`Cloud bridge transition refused: ${result.reason_codes.join(',')}`);
const require = createRequire(import.meta.url);
const Ajv = require('ajv/dist/2020').default;
const ajv = new Ajv({ strict: true, allErrors: true });
require('ajv-formats')(ajv);
const validate = ajv.compile(JSON.parse(readFileSync('tools/ci/schemas/bridge-result.schema.json', 'utf8')));
if (!validate(record)) throw new Error('Bridge result schema refused its record');
if (result.completion_record) {
  mkdirSync('bridge-output/completion-records', { recursive: true });
  writeFileSync(`bridge-output/completion-records/${sha}.json`, JSON.stringify(result.completion_record, null, 2) + '\n');
}
