import path from 'node:path';

type Fields = Record<string, unknown>;
type Result = { state: 'passed' | 'blocked'; reason_codes: string[] };
const object = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const objects = (value: unknown): value is Fields[] => Array.isArray(value) && value.every(object);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const sha = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const covers = (required: unknown, actual: unknown) => strings(required) && required.length > 0 && strings(actual) && required.every(id => actual.includes(id));
const timestamp = (value: unknown) => text(value) && Number.isFinite(Date.parse(value));
const done = (reasons: Set<string>): Result => ({ state: reasons.size ? 'blocked' : 'passed', reason_codes: [...reasons] });
const blocked = (reason: string): Result => ({ state: 'blocked', reason_codes: [reason] });

// These functions assess supplied records. Source authentication and collection are separate.
export function assessOrchestration(input: unknown): Result {
  if (!object(input) || !objects(input.nodes) || !Array.isArray(input.edges)) return blocked('invalid_graph');
  const reasons = new Set<string>();
  if (!sha(input.expected_sha) || input.target_sha !== input.expected_sha || input.checkout_sha !== input.expected_sha ||
      !digest(input.expected_check_set_digest) || input.check_set_digest !== input.expected_check_set_digest ||
      input.profile !== input.expected_profile || !['bootstrap', 'business-increment', 'full-release'].includes(String(input.profile))) reasons.add('identity_mismatch');
  if (!['push', 'pull_request', 'workflow_dispatch', 'workflow_call'].includes(String(input.event)) || input.actual_dispatch !== true) reasons.add('not_dispatched');
  if (input.aggregate_condition !== 'always') reasons.add('conditional_aggregation');
  const requiredNodes = ['install', 'service', 'discover', 'admin', 'share', 'ios', 'android', 'reports', 'review', 'aggregate'];
  const nodeIds = input.nodes.map(node => node.id);
  if (new Set(nodeIds).size !== nodeIds.length || requiredNodes.some(id => !nodeIds.includes(id))) reasons.add('missing_executor');
  for (const node of input.nodes) {
    if (node.state !== 'passed' || node.checkout_sha !== input.expected_sha || node.check_set_digest !== input.expected_check_set_digest ||
        node.script_present !== true || !Number.isInteger(node.executed) || Number(node.executed) < 1 || !digest(node.report_digest)) reasons.add('incomplete_executor');
  }
  const edges = input.edges;
  if (edges.some(edge => !Array.isArray(edge) || edge.length !== 2 || !edge.every(text) || !edge.every(id => nodeIds.includes(id)))) return blocked('invalid_edge');
  const edgePairs = edges as string[][];
  const requiredEdges = [
    ['install', 'service'], ['service', 'discover'],
    ...['admin', 'share', 'ios', 'android'].map(id => ['discover', id]),
    ...['admin', 'share', 'ios', 'android'].map(id => [id, 'reports']),
    ['reports', 'review'], ['review', 'aggregate'],
  ];
  if (requiredEdges.some(([from, to]) => !edgePairs.some(edge => edge[0] === from && edge[1] === to))) reasons.add('missing_dependency');
  const visiting = new Set<string>();
  const visited = new Set<string>();
  function cycle(id: string): boolean {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const edge of edgePairs.filter(edge => edge[0] === id)) if (cycle(edge[1])) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  if (requiredNodes.some(cycle)) reasons.add('dependency_cycle');
  return done(reasons);
}

export function assessTddCycle(input: unknown): Result {
  if (!object(input) || !object(input.red) || !object(input.green) || !object(input.final) || !object(input.verified_ancestry)) return blocked('missing_tdd_record');
  const reasons = new Set<string>();
  const red = input.red, green = input.green, final = input.final;
  if (!text(input.behavior_id) || !sha(input.target_sha) || input.raw_red_preserved !== true) reasons.add('invalid_cycle_identity');
  if (red.state !== 'failed' || red.health !== 'passed' || red.failure_kind !== 'assertion' ||
      !['missing_behavior', 'real_defect'].includes(String(red.cause)) || red.implementation_present !== false ||
      !text(red.cause_read_by) || !timestamp(red.cause_read_at)) reasons.add('invalid_red');
  for (const record of [red, green, final]) {
    if (!sha(record.sha) || !text(record.run_id) || record.source !== 'github-actions' ||
        !Number.isInteger(record.discovered) || Number(record.discovered) < 1 || record.executed !== record.discovered) reasons.add('invalid_execution');
    for (const field of ['test_digest', 'oracle_digest', 'fixture_digest']) {
      if (!digest(record[field]) || record[field] !== red[field]) reasons.add('changed_red_inputs');
    }
  }
  if (green.state !== 'passed' || final.state !== 'passed' || green.regressions_passed !== true ||
      final.regressions_passed !== true || final.sha !== input.target_sha) reasons.add('incomplete_green');
  if (Object.keys(input.verified_ancestry).length !== 3 ||
      ['red_before_implementation', 'red_before_green', 'green_before_final'].some(key => (input.verified_ancestry as Fields)[key] !== true)) reasons.add('invalid_ancestry');
  return done(reasons);
}

function bootstrapPath(value: string): boolean {
  const normalized = value.replaceAll('\\', '/');
  if (path.posix.isAbsolute(normalized) || normalized.split('/').some(part => part === '..') || /^[A-Za-z]:/.test(normalized)) return false;
  const shellFiles = ['apps/admin/LICENSE', 'apps/admin/components.json', 'apps/admin/package.json', 'apps/admin/postcss.config.mjs',
    'apps/admin/src/app/globals.css', 'apps/admin/src/app/layout.tsx', 'apps/admin/src/app/page.tsx',
    'apps/admin/src/components/ui/button.tsx', 'apps/admin/src/lib/utils.ts', 'apps/admin/tsconfig.json',
    'apps/mobile/app.json', 'apps/mobile/app/_layout.tsx', 'apps/mobile/app/index.tsx', 'apps/mobile/package.json', 'apps/mobile/tsconfig.json',
    'apps/share/package.json', 'apps/share/src/app/globals.css', 'apps/share/src/app/layout.tsx', 'apps/share/src/app/page.tsx', 'apps/share/tsconfig.json'];
  return ['tools/ci/', 'tests/contract/ci/', 'tests/integration/ci/', 'tests/security/ci/', 'tests/fixtures/bootstrap/',
    'tests/e2e/bootstrap/', 'tests/e2e/ios/', 'tests/e2e/android/', '.github/workflows/', 'infra/ci/', 'supabase/upstream/',
    'docs/engineering/', '.specify/bridge-snapshots/', '.specify/extensions/agoraweave-ci/',
    '.agents/skills/agoraweave-ci-', '.claude/skills/agoraweave-ci-', 'specs/001-agoraweave-v1/'].some(prefix => normalized.startsWith(prefix)) ||
    [...shellFiles, 'package.json', 'package-lock.json', 'eslint.config.mjs', '.gitignore', '.gitmodules', 'superpowers-v7', '.specify/extensions.yml',
      '.specify/superpowers-handoff.json', '.specify/bridge-events.jsonl', '.specify/memory/constitution.md',
      '.specify/extensions/speckit-superpowers-bridge/scripts/powershell/update-handoff.ps1'].includes(normalized);
}

export function assessBridgeGate(input: unknown): Result {
  if (!object(input)) return blocked('missing_bridge_record');
  const reasons = new Set<string>();
  if (!text(input.actor) || input.actor !== input.expected_actor || !text(input.feature) || input.feature !== input.expected_feature ||
      !sha(input.expected_sha) || input.target_sha !== input.expected_sha ||
      !digest(input.expected_contract_digest) || input.contract_digest !== input.expected_contract_digest ||
      !digest(input.expected_check_set_digest) || input.check_set_digest !== input.expected_check_set_digest) reasons.add('identity_mismatch');
  if (input.source !== 'github-actions' || input.runner_environment !== 'github-hosted') reasons.add('invalid_execution_source');
  if (input.ownership_guard_passed !== true || input.required_hooks_ran !== true || input.working_tree_clean !== true ||
      !text(input.read_by) || !timestamp(input.read_at)) reasons.add('incomplete_gate_context');
  if (!['start', 'complete'].includes(String(input.transition))) reasons.add('invalid_transition');
  if (input.mode === 'bootstrap-only') {
    if (!strings(input.changed_paths) || input.changed_paths.some(file => !bootstrapPath(file))) reasons.add('outside_bootstrap_scope');
  } else if (['business-increment', 'full-release'].includes(String(input.mode))) {
    const formalReady = input.ci_ready === true && input.initialization_inputs_unchanged === true && input.initialization_ancestor_verified === true;
    const developmentReady = input.mode === 'business-increment' && input.transition === 'start' && input.development_ready === true &&
      input.development_inputs_unchanged === true && input.development_ancestor_verified === true;
    if (!formalReady && !developmentReady) reasons.add('not_ci_ready');
  } else reasons.add('invalid_mode');
  if (input.transition === 'complete') {
    for (const field of ['required_results_passed', 'reports_read', 'tdd_passed', 'reviews_passed', 'regressions_passed']) {
      if (input[field] !== true) reasons.add('incomplete_evidence');
    }
    if (input.baseline_required === true && input.baseline_confirmed !== true) reasons.add('unconfirmed_baseline');
  }
  return done(reasons);
}

export function assessReviewBaseline(input: unknown): Result {
  if (!object(input) || !objects(input.inputs) || !object(input.actual_checks) || !object(input.baseline)) return blocked('missing_review_record');
  const reasons = new Set<string>();
  if (!sha(input.expected_sha) || input.target_sha !== input.expected_sha || !digest(input.expected_contract_digest) ||
      input.contract_digest !== input.expected_contract_digest) reasons.add('identity_mismatch');
  if (input.reviewer !== 'current-codex' || !text(input.session_ref) || !timestamp(input.reviewed_at) ||
      input.execution_mode !== 'current-codex-reading' || !['visual', 'code'].includes(String(input.review_kind))) reasons.add('invalid_reviewer');
  const actualInputs = input.inputs;
  if (!covers(input.required_inputs, actualInputs.map(item => item.id)) || actualInputs.some(item => !digest(item.digest) ||
      item.digest !== item.verified_digest || item.read !== true)) reasons.add('incomplete_inputs');
  if (!covers(input.required_coverage, input.coverage)) reasons.add('incomplete_coverage');
  if (input.review_kind === 'visual' && (!covers(input.required_images, input.actual_images_read) ||
      !covers(input.required_images, actualInputs.map(item => item.id)))) reasons.add('missing_image');
  if (!objects(input.findings) || input.findings.some(finding => !['fixed_and_rechecked', 'disproved_with_evidence'].includes(String(finding.state)) ||
      !text(finding.evidence_ref)) || !Array.isArray(input.unresolved_items) || input.unresolved_items.length !== 0 || input.output_complete !== true) reasons.add('unresolved_review');
  if (!strings(input.input_data_classes) || input.input_data_classes.length === 0 ||
      input.input_data_classes.some(item => !['engineering', 'synthetic'].includes(item))) reasons.add('forbidden_review_data');
  if (input.actual_checks.source !== 'github-actions' || input.actual_checks.state !== 'passed' ||
      (input.review_kind === 'visual' && (input.actual_checks.interactions_passed !== true ||
        input.actual_checks.accessibility_passed !== true))) reasons.add('actual_checks_not_passed');
  const baseline = input.baseline;
  if (baseline.required === true && (baseline.state !== 'confirmed' || !digest(baseline.candidate_digest) ||
      baseline.candidate_digest !== baseline.confirmed_digest || baseline.approver !== 'user' || !text(baseline.authorization_ref) ||
      baseline.auto_updated !== false || !covers(input.required_coverage, baseline.coverage))) reasons.add('unconfirmed_baseline');
  return done(reasons);
}
