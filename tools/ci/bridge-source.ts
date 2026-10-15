import { assessBridgeGate } from './gates.ts';

const object = (value: any) => value && typeof value === 'object' && !Array.isArray(value);
const hash = (value: any, length = 64) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const sameDigests = (left: any, right: any) => object(left) && object(right) && Object.keys(left).length > 0 &&
  Object.keys(left).length === Object.keys(right).length && Object.entries(left).every(([key, value]) => hash(value) && right[key] === value);

/** Callers authenticate original GitHub bytes and ancestry before supplying either source. */
export function deriveBridgeEvidence(input: Record<string, any>): Record<string, any> {
  const context = input.context || {};
  const init = input.initialization;
  const initial = init?.document;
  const ready = init?.authenticated === true && init.ancestor_verified === true && object(initial) &&
    initial.state === 'passed' && initial.ci_ready === true && initial.scope === 'bootstrap-only' &&
    initial.feature_complete === false && hash(initial.target_sha, 40) && initial.check_set_digest === context.expected_check_set_digest &&
    sameDigests(initial.initialization_digests, input.current_initialization_digests);
  const document = input.completion?.document;
  const ids = input.required_ids;
  const observed = document?.observed;
  const reportsValid = input.completion?.authenticated === true && object(document) &&
    document.state === 'passed' && document.target_sha === context.expected_sha &&
    document.check_set_digest === context.expected_check_set_digest && document.scope === context.mode &&
    Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length &&
    Array.isArray(observed) && observed.length === ids.length && ids.every((id: string) =>
      observed.filter((item: any) => item.id === id && item.state === 'passed' && item.source_verified === true &&
        item.source_job_conclusion === 'success' && item.source_sha === context.expected_sha &&
        item.check_set_digest === context.expected_check_set_digest && hash(item.raw_report_digest)).length === 1) &&
    document.reports_read === true && typeof document.read_by === 'string' && document.read_by.length > 0 &&
    typeof document.read_at === 'string' && Number.isFinite(Date.parse(document.read_at)) &&
    Array.isArray(document.unresolved_items) && document.unresolved_items.length === 0 && document.regressions_passed === true;
  const passed = (suffix: string) => reportsValid && observed.some((item: any) => item.id.endsWith(suffix) && item.state === 'passed');
  const derived = { ...context, ci_ready: ready, initialization_inputs_unchanged: ready,
    initialization_ancestor_verified: ready, required_results_passed: reportsValid, reports_read: reportsValid,
    tdd_passed: passed('.tdd'), reviews_passed: passed('.codex-code-review') && passed('.codex-visual-review'),
    regressions_passed: reportsValid, baseline_required: document?.baseline_required === true,
    baseline_confirmed: reportsValid && document?.baseline_confirmed === true };
  const result = assessBridgeGate(derived);
  if (context.transition === 'complete' && context.mode === 'full-release' && input.canonical_tasks_complete !== true) {
    result.state = 'blocked'; result.reason_codes.push('incomplete_canonical_tasks');
  }
  const bootstrapComplete = context.transition === 'complete' && context.mode === 'bootstrap-only' && result.state === 'passed';
  return { ...derived, ...result, ci_ready: bootstrapComplete || ready,
    feature_complete: result.state === 'passed' && context.transition === 'complete' && context.mode === 'full-release',
    record_kind: context.transition === 'complete' ? context.mode === 'bootstrap-only' ? 'bootstrap_completion' : 'increment_completion' :
      context.mode === 'bootstrap-only' ? 'bootstrap_start_only' : 'business_start',
    initialization_source_sha: ready ? initial.target_sha : undefined,
    completion_record: context.transition === 'complete' && result.state === 'passed' ? {
      target_sha: context.expected_sha, mode: context.mode, actor: context.actor, feature: context.feature,
      contract_digest: context.expected_contract_digest, check_set_digest: context.expected_check_set_digest,
      read_by: document.read_by, read_at: document.read_at,
      report_digests: Object.fromEntries(observed.map((item: any) => [item.id, item.raw_report_digest])),
      summary: context.mode === 'bootstrap-only' ? 'All frozen initialization reports verified and read; CI initialization is ready.' :
        'All frozen current increment reports verified and read.', unresolved_items: [],
    } : undefined };
}
