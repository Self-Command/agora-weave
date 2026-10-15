import { existsSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

export async function waitForReviewRecords(input: {
  directory: string; timeout_ms: number; poll_ms: number; refresh: () => Promise<void>;
}): Promise<{ state: string }> {
  if (!Number.isInteger(input.timeout_ms) || input.timeout_ms < 1 || input.timeout_ms > 1800000 ||
      !Number.isInteger(input.poll_ms) || input.poll_ms < 1 || input.poll_ms > input.timeout_ms) {
    throw new Error('A bounded current review wait is required');
  }
  const files = ['code.json', 'visual.json'].map(file => join(input.directory, file));
  const clear = () => files.forEach(file => rmSync(file, { force: true }));
  const deadline = Date.now() + input.timeout_ms;
  while (Date.now() < deadline) {
    clear();
    try {
      await input.refresh();
      if (files.every(file => existsSync(file) && statSync(file).isFile() && statSync(file).size > 0)) {
        return { state: 'available' };
      }
    } catch { /* A failed transfer cannot make stale or partially transferred records available. */ }
    clear();
    const remaining = deadline - Date.now();
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, Math.min(input.poll_ms, remaining)));
  }
  clear();
  return { state: 'missing' };
}
