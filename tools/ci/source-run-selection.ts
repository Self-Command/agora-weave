/** The caller supplies authenticated GitHub run metadata, never reviewer declarations. */
export function selectEngineeringSource(input: unknown): Record<string, unknown> {
  type Fields = Record<string, unknown>;
  const fields = (value: unknown): value is Fields => !!value && typeof value === 'object' && !Array.isArray(value);
  const deny = () => ({ state: 'blocked', reason_codes: ['missing_or_ambiguous_event_bound_source'] });
  if (!fields(input) || typeof input.target_sha !== 'string' || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
    typeof input.repository !== 'string' || !/^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(input.repository) ||
    typeof input.branch !== 'string' || !input.branch.trim() ||
    !['push', 'pull_request', 'workflow_dispatch'].includes(String(input.event)) ||
    !Array.isArray(input.runs) || !input.runs.every(fields)) return deny();
  const candidates = input.runs.filter(run => run.head_sha === input.target_sha && run.event === input.event &&
    run.head_branch === input.branch && run.path === '.github/workflows/ci-bootstrap.yml' &&
    fields(run.repository) && run.repository.full_name === input.repository &&
    fields(run.head_repository) && run.head_repository.full_name === input.repository);
  if (candidates.length !== 1 || !Number.isSafeInteger(candidates[0].id) || Number(candidates[0].id) < 1 ||
    !Number.isInteger(candidates[0].run_attempt) || Number(candidates[0].run_attempt) < 1) return deny();
  return { state: 'selected', reason_codes: [], run_id: String(candidates[0].id),
    attempt: candidates[0].run_attempt, target_sha: input.target_sha, event: input.event, branch: input.branch };
}
