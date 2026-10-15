import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { normalizeExecution } from './run-check-set.ts';

export const legacyTddBaseline = 'bb62b29a1c33c2940fdefa546a268463bfdda91c';
type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => !!value && typeof value === 'object' && !Array.isArray(value);
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');
const refused = () => ({ purpose_authenticated: false, applicable_set_verified: false, legacy_applicable_set_approved: false });
const git = (args: string[]) => execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] });

/** Called only after transport authentication; absence is distinguished from failed Git reads. */
export function resolveTddSourcePurpose(input: Fields): Fields {
  if (!object(input.source) || !object(input.cycle) || typeof input.raw !== 'string' ||
      typeof input.source.sha !== 'string' || !/^[a-f0-9]{40}$/.test(input.source.sha) ||
      !['red', 'green', 'final'].includes(String(input.label))) return refused();
  const source = input.source, cycle = input.cycle, label = String(input.label), sha = String(source.sha);
  try {
    const baselineBytes = git(['show', `${legacyTddBaseline}:infra/ci/tdd-source-catalog.json`]);
    const baseline = JSON.parse(baselineBytes.toString());
    const pinned = baseline.cycles.find((item: Fields) => item.cycle_id === cycle.cycle_id);
    const sourceTuple = pinned?.[label];
    const scope = ['cycle_id', 'behavior_id', 'test_file', 'fixture_file', 'case_ids', 'case_titles', 'requirements'];
    const approved = label !== 'final' && object(sourceTuple) &&
      ['sha', 'run_id', 'attempt'].every(key => sourceTuple[key] === source[key]) &&
      scope.every(key => JSON.stringify(pinned[key]) === JSON.stringify(cycle[key]));
    const read = (path: string): Buffer | undefined => {
      const listing = git(['ls-tree', '--name-only', sha, '--', path]).toString().trim();
      if (!listing) return undefined;
      if (listing !== path) throw new Error('Ambiguous source input');
      return git(['show', `${sha}:${path}`]);
    };
    const requestBytes = read('infra/ci/validation-request.json');
    const manifestBytes = read('tools/ci/validation-manifest.json');
    const manifest = manifestBytes ? JSON.parse(manifestBytes.toString()) : undefined;
    if (manifest && (manifest.schema_version !== 1 || !Number.isInteger(manifest.engineering_case_count) ||
      manifest.engineering_case_count < 1)) return refused();
    let purpose: Fields;
    if (requestBytes) {
      const request = JSON.parse(requestBytes.toString());
      if (request.schema_version !== 1 || !['feedback', 'green', 'completion'].includes(request.validation_intent)) return refused();
      purpose = { validation_intent: request.validation_intent, purpose_authenticated: true,
        intent_input_digest: hash(requestBytes), legacy_pre_intent_source: false };
    } else if (approved) {
      purpose = { validation_intent: 'green', purpose_authenticated: true, legacy_pre_intent_source: true,
        legacy_intent_baseline: legacyTddBaseline, legacy_catalog_digest: hash(baselineBytes),
        legacy_source_tuple_digest: hash(JSON.stringify({ cycle_id: cycle.cycle_id, label, source: sourceTuple })),
        legacy_approval_basis: 'exact_approved_baseline_catalog_tuple' };
    } else return refused();
    let expectedCount = manifest?.engineering_case_count;
    if (object(cycle.executor) && cycle.executor.kind === 'core') {
      if (!manifest || !['dev', 'test'].includes(String(cycle.executor.environment)) ||
          !Array.isArray(manifest.core_targets)) return refused();
      const targets = manifest.core_targets.filter((target: Fields) => target.command === cycle.executor.command);
      if (!targets.length || !targets.some((target: Fields) => Array.isArray(target.files) && target.files.includes(cycle.test_file)) ||
          targets.some((target: Fields) => !Number.isInteger(target.case_count) || Number(target.case_count) < 1)) return refused();
      expectedCount = targets.reduce((count: number, target: Fields) => count + Number(target.case_count), 0);
    }
    const applicable = !!manifest && normalizeExecution({ format: 'tap', raw: input.raw,
      expected_count: expectedCount, exit_code: 0 }).state === 'passed';
    // A pre-manifest historical approval is explicit; its observed plan is not a newly frozen set.
    const plans = [...input.raw.matchAll(/^1\.\.(\d+)\r?$/gm)];
    const legacyPlan = plans.length === 1 && Number(plans[0][1]) > 0 ? Number(plans[0][1]) : undefined;
    const legacyIntegrity = label === 'red' || legacyPlan !== undefined && normalizeExecution({ format: 'tap',
      raw: input.raw, expected_count: legacyPlan, exit_code: 0 }).state === 'passed';
    const legacySet = approved && !requestBytes && !manifestBytes && legacyIntegrity;
    if (!manifestBytes && !legacySet) return refused();
    return { ...purpose, applicable_set_verified: applicable,
      applicable_set_digest: manifestBytes ? hash(manifestBytes) : undefined,
      legacy_applicable_set_approved: legacySet, legacy_observed_plan_count: legacySet ? legacyPlan : undefined,
      legacy_raw_report_digest: legacySet ? hash(input.raw) : undefined };
  } catch {
    return refused();
  }
}
