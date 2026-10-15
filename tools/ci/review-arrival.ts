export async function waitForReviewRecords(_input: {
  directory: string; timeout_ms: number; poll_ms: number; refresh: () => Promise<void>;
}): Promise<{ state: string }> {
  return { state: 'missing' };
}
