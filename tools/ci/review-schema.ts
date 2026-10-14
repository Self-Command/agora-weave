/** The schema result describes record integrity; it never approves a semantic review. */
export function validateReviewSchema(_kind: string, _record: unknown): Record<string, unknown> {
  return { state: 'blocked', reason_codes: ['review_schema_validator_unimplemented'] };
}
