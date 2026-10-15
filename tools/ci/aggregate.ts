type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value: unknown, length = 64) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason], feature_complete: false });

/** The workflow freezes required IDs from the committed manifest, independently of observed results. */
export function aggregateBootstrap(input: unknown): Record<string, unknown> {
  if (!fields(input) || input.profile !== 'bootstrap' || input.source_authenticated !== true ||
    !hash(input.expected_sha, 40) || input.expected_sha !== input.target_sha ||
    !hash(input.expected_check_set_digest) || input.expected_check_set_digest !== input.check_set_digest ||
    !Array.isArray(input.frozen_required_ids) || !input.frozen_required_ids.length ||
    input.frozen_required_ids.some(id => typeof id !== 'string' || !id.trim()) ||
    new Set(input.frozen_required_ids).size !== input.frozen_required_ids.length ||
    !Array.isArray(input.observed) || !input.observed.every(fields) ||
    !Array.isArray(input.previous_attempts) || !input.previous_attempts.every(fields)) return deny('invalid_frozen_aggregate');
  const reasons = new Set<string>();
  if (input.validation_intent !== undefined || input.required_intent !== undefined) {
    const rank: Record<string, number> = { feedback: 0, green: 1, completion: 2 };
    const actual = rank[String(input.validation_intent)], required = rank[String(input.required_intent)];
    if (actual === undefined || required === undefined || actual < required || actual === 0) reasons.add('insufficient_validation_intent');
  }
  const observed = input.observed;
  for (const id of input.frozen_required_ids) {
    const checks = observed.filter(check => check.id === id);
    if (checks.length !== 1) { reasons.add(`${id}:missing_or_ambiguous`); continue; }
    const check = checks[0];
    if (check.state !== 'passed' || check.source_job_conclusion !== 'success' || check.source_verified !== true ||
      check.source_sha !== input.expected_sha || check.check_set_digest !== input.expected_check_set_digest ||
      !hash(check.raw_report_digest)) reasons.add(`${id}:${String(check.state)}`);
  }
  if (observed.some(check => !(input.frozen_required_ids as unknown[]).includes(check.id))) reasons.add('unexpected_check');
  for (const attempt of input.previous_attempts) {
    if (attempt.state === 'passed') continue;
    if (!['expected_red_observed', 'expected_refusal_observed', 'fixed_and_reverified'].includes(String(attempt.resolution)) ||
      attempt.observation_source_verified !== true || attempt.raw_preserved !== true ||
      (attempt.resolution === 'fixed_and_reverified' && !hash(attempt.current_resolution_digest))) reasons.add('unresolved_prior_attempt');
  }
  if (input.collection_complete !== true) reasons.add('incomplete_source_collection');
  if (input.reports_read !== true) reasons.add('reports_not_read');
  for (const key of ['code_review', 'visual_review', 'tdd', 'private_archive', 'cleanup', 'orchestration', 'bridge']) {
    if (input[key] !== 'passed') reasons.add(`${key}:${String(input[key] || 'missing')}`);
  }
  return { state: reasons.size ? 'blocked' : 'passed', reason_codes: [...reasons], target_sha: input.target_sha,
    check_set_digest: input.check_set_digest, feature_complete: false, scope: 'bootstrap-only' };
}
