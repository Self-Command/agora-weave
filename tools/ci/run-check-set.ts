export type DiscoveryInput = {
  profile: 'bootstrap' | 'business-increment' | 'full-release';
  approved: { id: string; command: string; files: string[] }[];
  scripts: Record<string, string>;
  available_files: string[];
};

/** Interface shell for the validation-request contract; admission is not yet implemented. */
export function resolveValidationRequest(_request: unknown, _context: unknown): Record<string, any> {
  return { state: 'not_evaluated' };
}

export function discoverApprovedTargets(input: DiscoveryInput): Record<string, unknown> {
  const reasons = new Set<string>();
  if (!['bootstrap', 'business-increment', 'full-release'].includes(input.profile) ||
    !Array.isArray(input.approved) || input.approved.length === 0 || !Array.isArray(input.available_files) ||
    !input.scripts || typeof input.scripts !== 'object') return { state: 'blocked', reason_codes: ['invalid_discovery'] };
  const ids = input.approved.map(target => target.id);
  if (ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) reasons.add('duplicate_or_empty_target');
  const selectedFiles: string[] = [];
  for (const target of input.approved) {
    if (!target.command || !input.scripts[target.command]?.trim()) reasons.add('missing_script');
    if (!Array.isArray(target.files) || target.files.length === 0 || target.files.some(file =>
      typeof file !== 'string' || !input.available_files.includes(file) || file.includes('..') || file.startsWith('/'))) {
      reasons.add('missing_or_invalid_file');
      continue;
    }
    if (input.profile === 'bootstrap' && target.files.some(file => !/^tests\/(contract|integration|security)\/ci\/.+\.spec\.ts$/.test(file))) reasons.add('business_in_bootstrap');
    selectedFiles.push(...target.files);
  }
  if (input.available_files.some(file => !selectedFiles.includes(file))) reasons.add('unmapped_actual_test');
  if (new Set(selectedFiles).size !== selectedFiles.length) reasons.add('duplicate_test_assignment');
  return reasons.size ? { state: 'blocked', reason_codes: [...reasons] } :
    { state: 'discovered', reason_codes: [], targets: input.approved.map(target => ({ ...target, files: [...target.files] })) };
}

/** Node TAP summary is retained independently of the command exit status. */
export function normalizeExecution(input: Record<string, unknown>): Record<string, unknown> {
  const reasons = new Set<string>();
  if (input.format !== 'tap' || typeof input.raw !== 'string' ||
    !Number.isInteger(input.expected_count) || Number(input.expected_count) < 1) return { state: 'blocked', reason_codes: ['invalid_raw_execution'] };
  const raw = input.raw;
  const values: Record<string, number> = {};
  for (const field of ['tests', 'pass', 'fail', 'cancelled', 'skipped', 'todo']) {
    const matches = [...raw.matchAll(new RegExp(`^# ${field} (\\d+)\\r?$`, 'gm'))];
    if (matches.length !== 1) reasons.add('missing_or_ambiguous_summary');
    else values[field] = Number(matches[0][1]);
  }
  const plan = [...raw.matchAll(/^1\.\.(\d+)\r?$/gm)];
  if (plan.length !== 1 || Number(plan[0]?.[1]) !== input.expected_count) reasons.add('incomplete_plan');
  const assertions = [...raw.matchAll(/^(not )?ok (\d+) - (.+)\r?$/gm)];
  if (assertions.length !== input.expected_count || new Set(assertions.map(item => item[2])).size !== assertions.length ||
    assertions.some((item, index) => Number(item[2]) !== index + 1)) reasons.add('incomplete_assertions');
  if (input.exit_code !== 0 || values.tests !== input.expected_count || values.pass !== input.expected_count ||
    ['fail', 'cancelled', 'skipped', 'todo'].some(field => values[field] !== 0) ||
    assertions.some(item => item[1] || /# (SKIP|TODO)\b/i.test(item[3]))) reasons.add('execution_not_passed');
  return { state: reasons.size ? 'blocked' : 'passed', reason_codes: [...reasons],
    discovered: input.expected_count, executed: assertions.length, passed: values.pass,
    failed: values.fail, cancelled: values.cancelled, skipped: values.skipped, todo: values.todo,
    exit_code: input.exit_code };
}
