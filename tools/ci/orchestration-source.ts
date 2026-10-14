export function deriveOrchestrationSource(input: unknown): Record<string, unknown> {
  return { state: 'blocked', reason_codes: ['orchestration_source_not_implemented'] };
}
