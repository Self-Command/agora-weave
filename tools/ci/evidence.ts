type Fields = Record<string, unknown>;
type Assessment = { state: 'passed' | 'blocked'; reason_codes: string[] };

function fields(value: unknown): value is Fields {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function records(value: unknown): value is Fields[] {
  return Array.isArray(value) && value.every(fields);
}

function identifiers(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0 &&
    value.every(id => typeof id === 'string' && id.length > 0) &&
    new Set(value).size === value.length;
}

function digest(value: unknown, length = 64): value is string {
  return typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
}

function assessment(reasons: Set<string>): Assessment {
  return { state: reasons.size === 0 ? 'passed' : 'blocked', reason_codes: [...reasons] };
}

/** Checks report content; callers must independently fetch and authenticate its source. */
export function assessReport(input: unknown): Assessment {
  const reasons = new Set<string>();
  if (!fields(input) || !fields(input.report)) {
    return { state: 'blocked', reason_codes: ['missing_report'] };
  }
  const report = input.report;
  if (!digest(input.expected_sha, 40) || !digest(input.expected_check_set_digest) ||
      !digest(input.expected_toolchain_digest) ||
      report.target_sha !== input.expected_sha || report.checkout_sha !== input.expected_sha ||
      report.check_set_digest !== input.expected_check_set_digest ||
      report.toolchain_digest !== input.expected_toolchain_digest ||
      (input.expected_check_id !== undefined && report.check_id !== input.expected_check_id)) {
    reasons.add('identity_mismatch');
  }
  if (report.source !== 'github-actions' || report.runner_environment !== 'github-hosted') {
    reasons.add('invalid_execution_source');
  }
  if (report.state !== 'passed' || report.applicability !== 'required') reasons.add('execution_not_passed');
  if (typeof report.run_id !== 'string' || !/^\d+$/.test(report.run_id) ||
      !Number.isInteger(report.attempt) || (report.attempt as number) < 1) reasons.add('invalid_run');
  if (!Number.isInteger(report.discovered) || (report.discovered as number) < 1 ||
      report.discovered !== report.executed) reasons.add('incomplete_execution');
  if (!records(report.scripts) || report.scripts.length === 0 ||
      report.scripts.some(script => typeof script.name !== 'string' || script.name.length === 0 ||
        script.present !== true || script.exit_code !== 0)) reasons.add('script_not_passed');
  if (!identifiers(input.required_case_ids) || !records(report.cases)) {
    reasons.add('missing_cases');
  } else {
    const cases = report.cases;
    const caseIds = cases.map(item => item.id);
    if (new Set(caseIds).size !== caseIds.length || cases.length !== report.executed ||
        cases.some(item => typeof item.id !== 'string' || item.state !== 'passed') ||
        input.required_case_ids.some(id => !cases.some(item => item.id === id && item.state === 'passed'))) {
      reasons.add('incomplete_cases');
    }
  }
  if (!records(report.artifacts) || report.artifacts.length === 0 ||
      report.artifacts.some(artifact => typeof artifact.id !== 'string' || !/^\d+$/.test(artifact.id) ||
        !digest(artifact.sha256) || artifact.sha256 !== artifact.downloaded_sha256)) reasons.add('invalid_artifact');
  const start = typeof report.started_at === 'string' ? Date.parse(report.started_at) : NaN;
  const end = typeof report.finished_at === 'string' ? Date.parse(report.finished_at) : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) reasons.add('invalid_execution_time');
  return assessment(reasons);
}

/** Requires every frozen check; a successful retry alone cannot resolve an earlier failure. */
export function assessAggregate(input: unknown): Assessment {
  const reasons = new Set<string>();
  if (!fields(input) || !records(input.required_checks) || input.required_checks.length === 0 ||
      !records(input.attempts) || input.attempts.length === 0) {
    return { state: 'blocked', reason_codes: ['missing_check'] };
  }
  const ids = input.required_checks.map(check => check.id);
  if (new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || id.length === 0)) {
    reasons.add('invalid_check_set');
  }
  for (const check of input.required_checks) {
    const attempts = input.attempts.filter(attempt => attempt.check_id === check.id);
    if (attempts.length === 0) {
      reasons.add('missing_check');
      continue;
    }
    for (const attempt of attempts) {
      const result = assessReport({
        expected_sha: input.expected_sha,
        expected_check_set_digest: input.expected_check_set_digest,
        expected_toolchain_digest: check.toolchain_digest,
        expected_check_id: check.id,
        required_case_ids: check.required_case_ids,
        report: attempt,
      });
      for (const reason of result.reason_codes) reasons.add(reason);
      if (attempt.state !== 'passed') reasons.add('unresolved_attempt');
      if (attempt.outcome_class !== 'verification') reasons.add('not_green_verification');
    }
  }
  return assessment(reasons);
}
