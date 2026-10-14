import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { assessBridgeGate } from './gates.ts';

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Bridge assessment requires GitHub-hosted Actions');
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
if (sha !== (process.env.GITHUB_HEAD_SHA || process.env.GITHUB_SHA)) throw new Error('Bridge checkout changed');
const required = ['.specify/memory/constitution.md', 'specs/001-agoraweave-v1/spec.md',
  'specs/001-agoraweave-v1/plan.md', 'specs/001-agoraweave-v1/tasks.md',
  'tools/ci/validation-manifest.json', 'infra/ci/toolchain-lock.json', 'tools/ci/gates.ts', 'tools/ci/bridge-transition.ps1'];
const inputDigests = Object.fromEntries(required.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const contractDigest = createHash('sha256').update(JSON.stringify(inputDigests)).digest('hex');
const handoff = JSON.parse(readFileSync('.specify/superpowers-handoff.json', 'utf8'));
const constitution = readFileSync('.specify/memory/constitution.md', 'utf8');
if (!constitution.includes('3.0.1') || handoff.artifact_owner !== 'codex' || handoff.status !== 'executing') throw new Error('Unapproved bootstrap ownership or lifecycle');
const scopeBase = '665fffada2dd4fb908b53ad7ca16159ce5e263d8';
const changedPaths = execFileSync('git', ['diff', '--name-only', scopeBase, sha], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const input = { actor: 'codex', expected_actor: 'codex', feature: 'specs/001-agoraweave-v1', expected_feature: 'specs/001-agoraweave-v1',
  expected_sha: sha, target_sha: sha, expected_contract_digest: contractDigest, contract_digest: contractDigest,
  expected_check_set_digest: inputDigests['tools/ci/validation-manifest.json'], check_set_digest: inputDigests['tools/ci/validation-manifest.json'],
  source: 'github-actions', runner_environment: 'github-hosted', transition: 'start', mode: 'bootstrap-only',
  ownership_guard_passed: handoff.artifact_owner === 'codex', required_hooks_ran: process.env.ACTUAL_PRE_HOOK === 'success',
  working_tree_clean: !execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  changed_paths: changedPaths,
  read_by: 'actions-bootstrap-scope-and-ownership-check', read_at: new Date().toISOString() };
const result = assessBridgeGate(input);
mkdirSync('bridge-output', { recursive: true });
writeFileSync('bridge-output/bridge-admission.json', JSON.stringify({ ...result, ...input,
  input_digests: inputDigests, run_id: process.env.GITHUB_RUN_ID, attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
  record_kind: 'bootstrap_start_only', scope_base_sha: scopeBase, ci_ready: false, feature_complete: false,
}, null, 2) + '\n');
if (result.state !== 'passed') throw new Error(`Cloud bootstrap start refused: ${result.reason_codes.join(',')}`);
