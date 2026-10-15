import { assessReviewBaseline } from './gates.ts';

type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const deny = (reason: string): Fields => ({ state: 'blocked', reason_codes: [reason] });
const equalSet = (left: unknown, right: unknown) => Array.isArray(left) && Array.isArray(right) &&
  left.every(value => typeof value === 'string') && right.every(value => typeof value === 'string') &&
  new Set(left).size === left.length && new Set(right).size === right.length &&
  left.length === right.length && left.every(value => right.includes(value));

export function bindReviewRecord(record: unknown, context: unknown): Fields {
  if (!object(record) || !object(context) || context.source_authenticated !== true ||
      context.source !== 'github-actions' || context.runner_environment !== 'github-hosted' ||
      typeof context.expected_sha !== 'string' || !/^[a-f0-9]{40}$/.test(context.expected_sha) ||
      record.target_sha !== context.expected_sha || !digest(context.contract_digest) ||
      record.contract_digest !== context.contract_digest || record.review_kind !== context.review_kind ||
      !equalSet(record.required_coverage, context.required_coverage) ||
      !equalSet(record.required_images, context.required_images)) return deny('review_context_mismatch');
  if (!Array.isArray(context.verified_inputs) || !context.verified_inputs.length || !context.verified_inputs.every(object) ||
      !Array.isArray(record.inputs) || !record.inputs.every(object)) return deny('missing_authenticated_inputs');
  const expectedInputs = context.verified_inputs, actualInputs = record.inputs;
  if (!equalSet(expectedInputs.map(input => input.id), actualInputs.map(input => input.id)) ||
      !equalSet(record.required_inputs, expectedInputs.map(input => input.id)) || expectedInputs.some(input => !digest(input.digest)) ||
      actualInputs.some(input => !expectedInputs.some(expected => expected.id === input.id && expected.digest === input.digest))) return deny('review_input_digest_mismatch');
  return assessReviewBaseline({ ...record, expected_sha: context.expected_sha,
    expected_contract_digest: context.contract_digest, actual_checks: context.actual_checks, baseline: context.baseline });
}
