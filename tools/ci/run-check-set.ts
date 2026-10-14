export type DiscoveryInput = {
  profile: 'bootstrap' | 'business-increment' | 'full-release';
  approved: { id: string; command: string; files: string[] }[];
  scripts: Record<string, string>;
  available_files: string[];
};

// Callable shell for nonempty approved target discovery; implementation follows observed Red.
export function discoverApprovedTargets(_input: DiscoveryInput): Record<string, unknown> {
  return { state: 'unknown', reason_codes: ['not_implemented'] };
}

// Callable shell for raw test result normalization, retaining missing/skipped/failing executions.
export function normalizeExecution(_input: Record<string, unknown>): Record<string, unknown> {
  return { state: 'unknown', reason_codes: ['not_implemented'] };
}
