export type CollectionRequest = {
  repository: string;
  run_id: string;
  expected_sha: string;
  expected_attempt: number;
  workflow_path: string;
  artifact_name: string;
  token: string;
};
export type CollectionResult = {
  state: string;
  reason_codes: string[];
  archive?: Uint8Array;
  archive_sha256?: string;
  attempts?: Record<string, unknown>[];
  artifact_id?: number;
  original_conclusion?: string;
};

// Callable interface for the source-authentication Red cycle; no acceptance behavior yet.
export async function collectEvidence(_request: CollectionRequest, _fetcher: typeof fetch = fetch): Promise<CollectionResult> {
  return { state: 'unknown', reason_codes: ['not_implemented'] };
}
