import { assessTddCycle } from './gates.ts';

type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const sha = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason] });

/** The caller authenticates executions and reads Git objects before constructing this context. */
export function deriveTddCycle(input: unknown): Record<string, unknown> {
  if (!fields(input) || !fields(input.red) || !fields(input.green) || !fields(input.final) ||
    !fields(input.history) || input.history.source !== 'git-objects' || !fields(input.history.ancestors) ||
    !sha(input.implementation_sha) || !sha(input.red.sha) || !sha(input.green.sha) || !sha(input.final.sha) ||
    ![input.red, input.green, input.final].every(record => record.source_authenticated === true) ||
    !Number.isInteger(input.red.failed) || Number(input.red.failed) < 1 ||
    input.green.failed !== 0 || input.final.failed !== 0) return deny('invalid_authenticated_tdd_source');
  const ancestors = input.history.ancestors;
  const ancestor = (before: string, after: string) => before !== after &&
    Array.isArray(ancestors[after]) && (ancestors[after] as unknown[]).every(sha) && (ancestors[after] as string[]).includes(before);
  const inputIdentity = [input.red, input.green, input.final].every(record =>
    ['test_digest', 'fixture_digest', 'oracle_digest'].every(key => record[key] === input.red[key]));
  if (!inputIdentity) return deny('changed_authenticated_tdd_inputs');
  const assessment = assessTddCycle({ ...input, verified_ancestry: {
    red_before_implementation: ancestor(input.red.sha, input.implementation_sha),
    red_before_green: ancestor(input.red.sha, input.green.sha),
    green_before_final: input.green.sha === input.final.sha || ancestor(input.green.sha, input.final.sha),
  } });
  return { ...assessment, raw_red_state: input.red.state, green_sha: input.green.sha,
    final_sha: input.final.sha, readiness: 'not_evaluated' };
}
