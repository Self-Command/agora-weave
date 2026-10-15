export function deriveBridgeEvidence(_input: Record<string, any>): Record<string, any> {
  return { state: 'blocked', reason_codes: ['bridge_source_not_implemented'] };
}
