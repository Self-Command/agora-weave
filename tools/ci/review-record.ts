import { assessReviewBaseline } from './gates.ts';

type Document = Record<string, unknown>;
const isDocument = (value: unknown): value is Document => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const deny = (reason: string): Document => ({ state: 'blocked', reason_codes: [reason] });
function sameRequired(left: unknown, right: unknown): boolean {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length &&
    left.every(value => typeof value === 'string' && value.trim().length > 0) &&
    right.every(value => typeof value === 'string' && value.trim().length > 0) &&
    new Set(left).size === left.length && new Set(right).size === right.length && left.every(value => right.includes(value));
}

export function bindReviewRecord(record: unknown, context: unknown): Document {
  if (!isDocument(record) || !isDocument(context) || context.source_authenticated !== true || context.source !== 'github-actions' ||
      context.runner_environment !== 'github-hosted' || typeof context.expected_sha !== 'string' ||
      !/^[a-f0-9]{40}$/.test(context.expected_sha) || record.target_sha !== context.expected_sha ||
      !digest(context.contract_digest) || record.contract_digest !== context.contract_digest || record.review_kind !== context.review_kind ||
      !sameRequired(record.required_coverage, context.required_coverage) || !sameRequired(record.required_images, context.required_images)) return deny('unbound_review_contract');
  if (!Array.isArray(context.verified_inputs) || !context.verified_inputs.length || !context.verified_inputs.every(isDocument) ||
      !Array.isArray(record.inputs) || !record.inputs.every(isDocument)) return deny('missing_verified_review_inputs');
  const original = context.verified_inputs, read = record.inputs;
  if (!sameRequired(read.map(input => input.id), original.map(input => input.id)) ||
      !sameRequired(record.required_inputs, original.map(input => input.id)) || original.some(input => !digest(input.digest)) ||
      read.some(input => !original.some(source => source.id === input.id && source.digest === input.digest))) return deny('review_input_differs_from_source');
  if (context.review_kind === 'visual' && record.images !== undefined) {
    if (!Array.isArray(record.images) || !record.images.every(isDocument) ||
        !sameRequired(record.images.map(image => image.id), context.required_images) ||
        record.images.some(image => !original.some(source => source.id === image.id && source.digest === image.sha256))) {
      return deny('visual_image_inventory_differs_from_source');
    }
  }
  return assessReviewBaseline({ ...record, expected_sha: context.expected_sha, expected_contract_digest: context.contract_digest,
    actual_checks: context.actual_checks, baseline: context.baseline });
}
