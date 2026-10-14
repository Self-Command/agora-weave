import { targetSha, checkSetDigest, artifactDigest } from './evidence.ts';

export function orchestrationFixture() {
  return {
    target_sha: targetSha, checkout_sha: targetSha, profile: 'bootstrap', check_set_digest: checkSetDigest,
    expected_sha: targetSha, expected_profile: 'bootstrap', expected_check_set_digest: checkSetDigest,
    event: 'push', actual_dispatch: true,
    nodes: ['install', 'service', 'discover', 'admin', 'share', 'ios', 'android', 'reports', 'review', 'aggregate'].map(id => ({
      id, state: 'passed', checkout_sha: targetSha, check_set_digest: checkSetDigest,
      script_present: true, executed: 1, report_digest: artifactDigest,
    })),
    edges: [
      ['install', 'service'], ['service', 'discover'],
      ['discover', 'admin'], ['discover', 'share'], ['discover', 'ios'], ['discover', 'android'],
      ['admin', 'reports'], ['share', 'reports'], ['ios', 'reports'], ['android', 'reports'],
      ['reports', 'review'], ['review', 'aggregate'],
    ],
    aggregate_condition: 'always',
  };
}

export function tddFixture() {
  const bindings = { test_digest: artifactDigest, fixture_digest: checkSetDigest, oracle_digest: 'd'.repeat(64) };
  return {
    target_sha: targetSha, behavior_id: 'ci.required-check-aggregation',
    red: { ...bindings, sha: '1'.repeat(40), run_id: '101', state: 'failed', health: 'passed',
      discovered: 2, executed: 2, failure_kind: 'assertion', cause: 'missing_behavior',
      cause_read_by: 'current-codex', cause_read_at: '2026-10-15T01:00:00Z',
      implementation_present: false, source: 'github-actions' },
    green: { ...bindings, sha: '2'.repeat(40), run_id: '102', state: 'passed',
      discovered: 2, executed: 2, regressions_passed: true, source: 'github-actions' },
    final: { ...bindings, sha: targetSha, run_id: '103', state: 'passed',
      discovered: 2, executed: 2, regressions_passed: true, source: 'github-actions' },
    verified_ancestry: { red_before_implementation: true, red_before_green: true, green_before_final: true },
    raw_red_preserved: true,
  };
}

export function bridgeFixture() {
  return {
    actor: 'codex', expected_actor: 'codex', feature: 'specs/001-agoraweave-v1', expected_feature: 'specs/001-agoraweave-v1',
    target_sha: targetSha, expected_sha: targetSha, contract_digest: artifactDigest, expected_contract_digest: artifactDigest,
    check_set_digest: checkSetDigest, expected_check_set_digest: checkSetDigest,
    mode: 'bootstrap-only', transition: 'start', source: 'github-actions', runner_environment: 'github-hosted',
    ownership_guard_passed: true, required_hooks_ran: true, working_tree_clean: true,
    changed_paths: ['tools/ci/evidence.ts', '.github/workflows/ci-bootstrap.yml'],
    ci_ready: false, initialization_inputs_unchanged: true, initialization_ancestor_verified: true,
    required_results_passed: false, reports_read: false, tdd_passed: false,
    reviews_passed: false, baseline_required: false, baseline_confirmed: false, regressions_passed: false,
    read_by: 'current-codex', read_at: '2026-10-15T01:10:00Z', raw_handoff_status: 'executing',
  };
}

export function reviewFixture() {
  return {
    target_sha: targetSha, expected_sha: targetSha, contract_digest: artifactDigest, expected_contract_digest: artifactDigest,
    reviewer: 'current-codex', session_ref: 'agoraweave-ci-bootstrap', reviewed_at: '2026-10-15T01:10:00Z',
    review_kind: 'visual', execution_mode: 'current-codex-reading',
    required_inputs: ['source.diff', 'test-report.json', 'ios.png', 'android.png'],
    inputs: ['source.diff', 'test-report.json', 'ios.png', 'android.png'].map(id => ({ id, digest: artifactDigest, verified_digest: artifactDigest, read: true })),
    required_images: ['ios.png', 'android.png'], actual_images_read: ['ios.png', 'android.png'],
    required_coverage: ['ios:loading', 'android:error'], coverage: ['ios:loading', 'android:error'],
    findings: [], unresolved_items: [], output_complete: true,
    input_data_classes: ['engineering', 'synthetic'],
    actual_checks: { source: 'github-actions', state: 'passed', interactions_passed: true, accessibility_passed: true },
    baseline: { required: true, state: 'confirmed', candidate_digest: artifactDigest, confirmed_digest: artifactDigest,
      approver: 'user', authorization_ref: 'explicit-user-confirmation', coverage: ['ios:loading', 'android:error'], auto_updated: false },
    pixel_difference_ratio: 0.001,
  };
}
