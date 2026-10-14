/** The caller supplies authenticated GitHub run metadata, never reviewer declarations. */
export function selectEngineeringSource(_input: unknown): Record<string, unknown> {
  return { state: 'blocked', reason_codes: ['event_bound_source_selection_unimplemented'] };
}
