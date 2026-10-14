export function planArchive(_input: unknown): Record<string, unknown> {
  return { state: 'unknown', reason_codes: ['archive_not_implemented'] };
}

export function verifyReadback(_plan: unknown, _readback: unknown): Record<string, unknown> {
  return { state: 'unknown', reason_codes: ['readback_not_implemented'] };
}
