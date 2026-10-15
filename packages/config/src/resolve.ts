/** Resolve one registered immutable configuration bundle for the requested consumer. */
export function resolveConfiguration(_input: unknown): Record<string, unknown> {
  return { state: 'blocked', code: 'CONFIG_UNAVAILABLE' };
}
