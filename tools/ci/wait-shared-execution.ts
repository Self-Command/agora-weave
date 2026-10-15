export async function waitSharedExecution(input: Record<string, any>, read: () => Promise<Record<string, any>>,
  sleep: (milliseconds: number) => Promise<void>, now: () => number): Promise<Record<string, any>> {
  const blocked = (reason: string) => ({ state: 'blocked', reason_codes: [reason], run_id: input.run_id, target_sha: input.expected_sha });
  if (!/^[a-f0-9]{40}$/.test(input.expected_sha) || !/^[1-9]\d*$/.test(input.run_id) ||
    !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(input.repository) || !input.branch ||
    !['push', 'pull_request', 'workflow_dispatch'].includes(input.event) ||
    !Number.isInteger(input.timeout_ms) || input.timeout_ms < 1 || input.timeout_ms > 90 * 60 * 1000 ||
    !Number.isInteger(input.interval_ms) || input.interval_ms < 1 || input.interval_ms > input.timeout_ms) return blocked('invalid_shared_wait');
  const deadline = now() + input.timeout_ms;
  const maximum = input.max_interval_ms ?? Math.max(input.interval_ms, 60000);
  if (!Number.isInteger(maximum) || maximum < input.interval_ms || maximum > 300000) return blocked('invalid_shared_wait');
  let previousState = '', interval = input.interval_ms;
  for (;;) {
    let run: Record<string, any>;
    try { run = await read(); } catch { return blocked('shared_executor_unavailable'); }
    if (String(run.id) !== input.run_id || run.head_sha !== input.expected_sha || run.head_branch !== input.branch ||
      run.path !== '.github/workflows/verify-release.yml' || run.event !== input.event ||
      run.repository?.full_name !== input.repository || run.head_repository?.full_name !== input.repository ||
      !Number.isInteger(run.run_attempt) || run.run_attempt < 1) return blocked('shared_executor_identity_mismatch');
    if (run.status === 'completed') return run.conclusion === 'success' ? {
      state: 'complete', reason_codes: [], run_id: input.run_id, target_sha: input.expected_sha, attempt: run.run_attempt,
    } : blocked('shared_executor_not_passed');
    if (!['queued', 'requested', 'pending', 'waiting', 'in_progress'].includes(run.status)) return blocked('shared_executor_not_passed');
    const remaining = deadline - now();
    if (remaining <= 0) return blocked('shared_executor_timeout');
    const state = `${run.status}:${run.run_attempt}`;
    interval = state === previousState ? Math.min(interval * 2, maximum) : input.interval_ms;
    previousState = state;
    await sleep(Math.min(interval, remaining));
  }
}
