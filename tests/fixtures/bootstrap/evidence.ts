// Synthetic evaluator inputs exercise evidence semantics, never product acceptance.
export const targetSha = 'a'.repeat(40);
export const checkSetDigest = 'b'.repeat(64);
export const artifactDigest = 'c'.repeat(64);
export const toolchainDigest = 'd'.repeat(64);

export function reportFixture() {
  return {
    check_id: 'bootstrap.transport',
    target_sha: targetSha,
    checkout_sha: targetSha,
    check_set_digest: checkSetDigest,
    run_id: '12345', attempt: 1,
    source: 'github-actions', runner_environment: 'github-hosted',
    state: 'passed', applicability: 'required',
    discovered: 2, executed: 2,
    scripts: [{ name: 'ci:contracts', present: true, exit_code: 0 }],
    cases: [
      { id: 'bootstrap.identity', state: 'passed' },
      { id: 'bootstrap.health', state: 'passed' },
    ],
    artifacts: [{ id: '67890', sha256: artifactDigest, downloaded_sha256: artifactDigest }],
    toolchain_digest: toolchainDigest,
    started_at: '2026-10-14T15:00:00Z', finished_at: '2026-10-14T15:01:00Z',
  };
}

export function reportRequest(report = reportFixture()) {
  return {
    expected_sha: targetSha,
    expected_check_set_digest: checkSetDigest,
    required_case_ids: ['bootstrap.identity', 'bootstrap.health'],
    expected_toolchain_digest: toolchainDigest,
    report,
  };
}

export function aggregateRequest() {
  return {
    expected_sha: targetSha,
    expected_check_set_digest: checkSetDigest,
    required_checks: [{
      id: 'bootstrap.transport',
      required_case_ids: ['bootstrap.identity', 'bootstrap.health'],
      toolchain_digest: toolchainDigest,
    }],
    attempts: [{ ...reportFixture(), outcome_class: 'verification' }],
    resolutions: [],
  };
}
