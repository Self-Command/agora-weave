import { createHash } from 'node:crypto';
import { normalizeExecution } from './run-check-set.ts';

type Document = Record<string, any>;
const record = (value: unknown): value is Document => !!value && typeof value === 'object' && !Array.isArray(value);
const deny = (reason: string, missing: string[] = []) => ({ state: 'blocked', coverage: 'partial', reason_codes: [reason], missing_titles: missing });

export function assessTddCoverage(input: unknown): Record<string, unknown> {
  if (!record(input) || input.source_authenticated !== true || typeof input.target_sha !== 'string' ||
      !/^[a-f0-9]{40}$/.test(input.target_sha) || typeof input.run_id !== 'string' || !/^\d+$/.test(input.run_id) ||
      !Number.isInteger(input.attempt) || input.attempt < 1 || !Array.isArray(input.records) || !input.records.length ||
      !input.records.every(record)) return deny('unbound_final_coverage');
  if (normalizeExecution({ format: 'tap', raw: input.raw_tap, expected_count: input.expected_count, exit_code: 0 }).state !== 'passed') {
    return deny('final_execution_not_complete');
  }
  const titles = [...String(input.raw_tap).matchAll(/^ok \d+ - (.+)\r?$/gm)].map(match => match[1].replace(/\r$/, ''));
  if (new Set(titles).size !== titles.length) return deny('ambiguous_actual_titles');
  const rawDigest = createHash('sha256').update(input.raw_tap).digest('hex');
  const covered = new Set<string>(), cycles = new Set<string>();
  for (const cycle of input.records) {
    const final = cycle.final;
    if (typeof cycle.cycle_id !== 'string' || !cycle.cycle_id.trim() || cycles.has(cycle.cycle_id) || cycle.target_sha !== input.target_sha ||
        !record(cycle.assessment) || cycle.assessment.state !== 'passed' || !record(final) || final.source_authenticated !== true ||
        final.sha !== input.target_sha || final.run_id !== input.run_id || final.attempt !== input.attempt ||
        final.raw_report_digest !== rawDigest || !Array.isArray(final.selected_assertions) || !final.selected_assertions.length ||
        !final.selected_assertions.every(record)) return deny('covering_cycle_differs_from_final');
    cycles.add(cycle.cycle_id);
    const selected = final.selected_assertions;
    if (new Set(selected.map(item => item.title)).size !== selected.length || selected.some(item => item.failed !== false || !titles.includes(item.title))) {
      return deny('covering_assertion_not_actual');
    }
    selected.forEach(item => covered.add(item.title));
  }
  const missing = titles.filter(title => !covered.has(title));
  return missing.length ? deny('actual_assertions_not_covered', missing) :
    { state: 'passed', coverage: 'complete', reason_codes: [], missing_titles: [], actual_count: titles.length, covered_count: covered.size };
}
