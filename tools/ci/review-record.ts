import { assessReviewBaseline } from './gates.ts';

type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const hash = (value: unknown, length = 64) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const strings = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim()) && new Set(value).size === value.length;
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason] });

/** Context is built by the authenticated collector, never taken from a review's declarations. */
export function bindReviewRecord(record: unknown, context: unknown): Record<string, unknown> {
  if (!fields(record) || !fields(context) || context.source_authenticated !== true ||
    context.source !== 'github-actions' || context.runner_environment !== 'github-hosted' ||
    !hash(context.expected_sha, 40) || !hash(context.contract_digest) ||
    record.target_sha !== context.expected_sha || record.contract_digest !== context.contract_digest ||
    !['code', 'visual'].includes(String(context.review_kind)) || record.review_kind !== context.review_kind ||
    !strings(context.required_coverage) || !context.required_coverage.length || !strings(context.required_images) ||
    !Array.isArray(context.verified_inputs) || !context.verified_inputs.length || !context.verified_inputs.every(fields) ||
    !Array.isArray(record.inputs) || !record.inputs.every(fields) || !fields(context.actual_checks) || !fields(context.baseline)) {
    return deny('invalid_authenticated_review_context');
  }
  const actualInputs = context.verified_inputs;
  const recordInputs = record.inputs;
  const ids = actualInputs.map(item => item.id);
  if (!strings(ids) || actualInputs.some(item => !hash(item.digest)) ||
    actualInputs.some(actual => !recordInputs.some(input => input.id === actual.id && input.digest === actual.digest && input.read === true)) ||
    recordInputs.some(input => !actualInputs.some(actual => actual.id === input.id && actual.digest === input.digest))) {
    return deny('review_input_bytes_mismatch');
  }
  const bound = { ...record, expected_sha: context.expected_sha, expected_contract_digest: context.contract_digest,
    required_inputs: ids, required_coverage: context.required_coverage, required_images: context.required_images,
    inputs: recordInputs.map(input => ({ ...input, verified_digest: actualInputs.find(actual => actual.id === input.id)?.digest })),
    actual_checks: context.actual_checks, baseline: context.baseline };
  return assessReviewBaseline(bound);
}
