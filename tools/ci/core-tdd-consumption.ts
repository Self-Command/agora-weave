import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { selectEngineeringSource } from './source-run-selection.ts';
import { deriveTddCycle } from './tdd-cycle.ts';
import { assessTddCoverage } from './tdd-coverage.ts';
import { normalizeExecution } from './run-check-set.ts';
import { selectTddCases } from './tdd-cases.ts';

type Fields = Record<string, any>;
const object = (value: unknown): value is Fields => !!value && typeof value === 'object' && !Array.isArray(value);
const hash = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
const git = (sha: string, file: string) => execFileSync('git', ['show', `${sha}:${file}`], { stdio: ['ignore', 'pipe', 'ignore'] });
const deny = (reason: string) => ({ state: 'blocked', coverage: 'partial', reason_codes: [reason],
  readiness: 'not_evaluated', task_complete: false });
const commands = ['ci:core:contracts', 'ci:service', 'ci:security', 'ci:concurrency', 'ci:recovery'];

/** Validate the original complete stream, including assertions outside a selected business cycle. */
function originalExecution(cycle: Fields, phase: string, environment: string, command: string): boolean {
  const execution = cycle[phase];
  if (!object(execution) || execution.source !== 'github-actions' || execution.source_authenticated !== true ||
      !/^[a-f0-9]{40}$/.test(execution.sha) || !/^[1-9]\d*$/.test(execution.run_id) ||
      !Number.isInteger(execution.attempt) || execution.attempt < 1 || execution.environment !== environment || execution.command !== command ||
      ['health', 'migration_state', 'seed_state', 'cleanup_state'].some(key => execution[key] !== 'passed')) return false;
  const fixturePaths = coreCycleFixtureFiles(cycle);
  const sourceBytes = git(execution.sha, 'tools/ci/validation-manifest.json');
  const sourceManifest = JSON.parse(sourceBytes.toString());
  const sourceTargets = sourceManifest.core_targets.filter((target: Fields) => target.command === command);
  const files = sourceTargets.flatMap((target: Fields) => target.files);
  const fixtures = fixturePaths.map(path => ({ path, sha256: hash(git(execution.sha, path)) }));
  if (!sourceTargets.some((target: Fields) => target.files.includes(cycle.test_file)) ||
      fixturePaths.some(path => !sourceManifest.core_fixture_files?.includes(path)) || execution.check_set_digest !== hash(sourceBytes) ||
      JSON.stringify(execution.fixture_files) !== JSON.stringify(fixtures) || execution.fixture_digest !== hash(JSON.stringify(fixtures)) ||
      execution.test_digest !== hash(git(execution.sha, cycle.test_file)) || execution.oracle_digest !== execution.test_digest ||
      JSON.stringify(execution.executed_files) !== JSON.stringify(files.map((path: string) => ({ path, sha256: hash(git(execution.sha, path)) }))) ||
      typeof execution.raw_tap !== 'string' || execution.raw_report_digest !== hash(execution.raw_tap) ||
      JSON.stringify(execution.selected_assertions) !== JSON.stringify(selectTddCases(execution.raw_tap, cycle))) return false;
  const normalized = normalizeExecution({ format: 'tap', raw: execution.raw_tap,
    expected_count: sourceTargets.reduce((sum: number, target: Fields) => sum + target.case_count, 0), exit_code: execution.exit_code });
  return !(normalized.reason_codes as string[]).some(reason => phase !== 'red' || reason !== 'execution_not_passed') &&
    ['skipped', 'cancelled', 'todo'].every(key => normalized[key] === 0) &&
    (phase !== 'red' || execution.selected_assertions.length > 0 && execution.selected_assertions.every((assertion: Fields) => assertion.failed));
}

/** Healthy prerequisites bind to the earliest qualified business Red; they never acquire an invented Red. */
export function assessCoreBaselineCoverage(input: unknown): Record<string, any> {
  if (!object(input) || input.source_authenticated !== true || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
      !object(input.manifest) || !Array.isArray(input.manifest.core_targets) || !Array.isArray(input.groups) ||
      !Array.isArray(input.baseline_declarations) || !input.baseline_declarations.length) return deny('core_baseline_not_bound');
  try {
    const manifestBytes = git(input.target_sha, 'tools/ci/validation-manifest.json');
    if (hash(manifestBytes) !== input.check_set_digest || JSON.stringify(JSON.parse(manifestBytes.toString())) !== JSON.stringify(input.manifest)) {
      return deny('core_baseline_manifest_differs');
    }
    const seen = new Set<string>(), assertions = new Map<string, Set<string>>();
    for (const declaration of input.baseline_declarations) {
      if (!object(declaration) || declaration.kind !== 'environment-precondition' || typeof declaration.baseline_id !== 'string' ||
          !declaration.baseline_id.trim() || seen.has(declaration.baseline_id) || !commands.includes(declaration.command) ||
          !input.manifest.core_targets.some((target: Fields) => target.command === declaration.command && target.files?.includes(declaration.test_file)) ||
          !object(declaration.anchor)) return deny('core_baseline_declaration_invalid');
      seen.add(declaration.baseline_id);
      for (const environment of ['dev', 'test']) {
        const matches = input.groups.filter((group: Fields) => group.environment === environment && group.command === declaration.command);
        if (matches.length !== 1) return deny('core_baseline_stream_missing');
        const group = matches[0];
        if (group.source_authenticated !== true || group.target_sha !== input.target_sha || !Array.isArray(group.records) || !group.records.length) {
          return deny('core_baseline_stream_not_bound');
        }
        const candidates = group.records.filter((cycle: Fields) => cycle.test_file === declaration.test_file);
        if (!candidates.length) return deny('core_baseline_business_anchor_missing');
        for (const cycle of candidates) {
          if (cycle.executor?.kind !== 'core' || cycle.executor.environment !== environment || cycle.executor.command !== declaration.command ||
              cycle.target_sha !== input.target_sha || deriveTddCycle(cycle).state !== 'passed') return deny('core_baseline_business_chain_invalid');
          for (const phase of ['red', 'green', 'final']) {
            if (!originalExecution(cycle, phase, environment, declaration.command)) return deny('core_baseline_original_inputs_differ');
            const execution = cycle[phase], selected = selectTddCases(execution.raw_tap, declaration);
            if (!selected.length || selected.some(assertion => assertion.failed) ||
                execution.oracle_digest !== declaration.oracle_digest || execution.fixture_digest !== declaration.fixture_digest ||
                JSON.stringify(execution.fixture_files) !== JSON.stringify(declaration.fixture_files) ||
                selected.some(assertion => execution.selected_assertions.some((business: Fields) => business.title === assertion.title))) {
              return deny('core_baseline_not_healthy_or_disjoint');
            }
            if (phase === 'final') {
              if (execution.sha !== input.target_sha || execution.run_id !== group.run_id || execution.attempt !== group.attempt ||
                  execution.raw_tap !== group.raw_tap) return deny('core_baseline_final_stream_differs');
              const key = `${environment}:${declaration.command}`;
              const covered = assertions.get(key) ?? new Set<string>();
              // A declaration may appear in several cycles; overlap between different declarations is rejected below.
              selected.forEach(assertion => covered.add(assertion.title));
              assertions.set(key, covered);
            }
          }
        }
        const ancestor = (before: string, after: string) => before === after ||
          execFileSync('git', ['merge-base', '--is-ancestor', before, after], { stdio: 'ignore' }) !== undefined;
        const earliest = candidates.find((candidate: Fields) => candidates.every((other: Fields) => {
          try { return ancestor(candidate.red.sha, other.red.sha); } catch { return false; }
        }));
        if (!earliest || ['sha', 'run_id', 'attempt'].some(key => declaration.anchor[key] !== earliest.red[key])) {
          return deny('core_baseline_anchor_not_earliest_red');
        }
      }
    }
    // Disjointness covers all business cycles, not just cycles in the declaration's test file.
    for (const group of input.groups) {
      const titles = assertions.get(`${group.environment}:${group.command}`) ?? new Set<string>();
      if (group.records.some((cycle: Fields) => cycle.final?.selected_assertions?.some((assertion: Fields) => titles.has(assertion.title)))) {
        return deny('core_baseline_hides_business');
      }
      const declared = input.baseline_declarations.filter((entry: Fields) => entry.command === group.command)
        .flatMap((entry: Fields) => selectTddCases(group.raw_tap, entry).map(assertion => assertion.title));
      if (new Set(declared).size !== declared.length) return deny('core_baseline_assertion_duplicated');
    }
    return { state: 'passed', reason_codes: [], groups: [...assertions].map(([key, titles]) => ({ key, titles: [...titles] })),
      readiness: 'not_evaluated', task_complete: false };
  } catch { return deny('core_baseline_original_inputs_unavailable'); }
}

/** Select from authenticated metadata while preserving the event and repository boundary. */
export function selectTddExecutorSource(input: unknown): Record<string, unknown> {
  if (!object(input) || !object(input.cycle)) return deny('executor_source_not_bound');
  const executor = input.cycle.executor;
  if (executor === undefined || object(executor) && executor.kind === 'engineering') {
    const selected = selectEngineeringSource(input);
    return selected.state === 'selected' ? { ...selected, workflow_path: '.github/workflows/ci-bootstrap.yml',
      artifact_name: `bootstrap-transport-${selected.run_id}-${selected.attempt}`, report_name: 'engineering.tap' } : selected;
  }
  if (!object(executor) || executor.kind !== 'core' || !['dev', 'test'].includes(executor.environment) ||
      !commands.includes(executor.command) || !object(input.manifest) || !Array.isArray(input.manifest.core_targets) ||
      !input.manifest.core_targets.some((target: Fields) => target.command === executor.command &&
        Array.isArray(target.files) && target.files.includes(input.cycle.test_file)) || !Array.isArray(input.runs)) {
    return deny('unregistered_core_executor');
  }
  const selected = selectEngineeringSource({ ...input, runs: input.runs.filter((run: unknown) =>
    object(run) && run.path === '.github/workflows/verify-release.yml').map((run: Fields) =>
    ({ ...run, path: '.github/workflows/ci-bootstrap.yml' })) });
  return selected.state === 'selected' ? { ...selected, workflow_path: '.github/workflows/verify-release.yml',
    artifact_name: `core-services-${executor.environment}-${selected.run_id}-${selected.attempt}`,
    health_artifact_name: `bootstrap-services-${executor.environment}-${selected.run_id}-${selected.attempt}`,
    report_name: `${executor.command.replaceAll(':', '-')}.tap` } : selected;
}

/** Frozen dependencies come from Red; later unrelated fixtures do not rewrite that cycle. */
export function coreCycleFixtureFiles(cycle: Fields): string[] {
  const sourceManifest = JSON.parse(git(String(cycle.red.sha), 'tools/ci/validation-manifest.json').toString());
  const registered = sourceManifest.core_fixture_files;
  const files = cycle.fixture_files ?? registered;
  if (!Array.isArray(registered) || !Array.isArray(files) || !files.length || new Set(files).size !== files.length ||
      files.some(file => typeof file !== 'string' || !registered.includes(file) || !/^tests\/fixtures\/core\/[\w./-]+$/.test(file) || file.includes('..')) ||
      !files.includes('tests/fixtures/core/seed.sql') || !files.includes(cycle.fixture_file)) throw new Error('Core fixture set is not registered at Red');
  const target = sourceManifest.core_targets?.find((item: Fields) => item.command === cycle.executor.command && item.files?.includes(cycle.test_file));
  if (!target || cycle.fixture_files !== undefined && JSON.stringify(files) !== JSON.stringify(target.fixture_files ?? registered)) {
    throw new Error('Core fixture dependencies differ from the frozen target');
  }
  return files;
}

/** Consume complete original streams; observations alone never authorize completion. */
export function assessCoreTddJournal(input: unknown): Record<string, unknown> {
  if (!object(input) || input.source_authenticated !== true || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
      !object(input.manifest) || !Array.isArray(input.manifest.core_targets) || !input.manifest.core_targets.length ||
      !Array.isArray(input.groups)) return deny('core_cycles_not_bound');
  try {
    const bytes = git(input.target_sha, 'tools/ci/validation-manifest.json');
    if (hash(bytes) !== input.check_set_digest || JSON.stringify(JSON.parse(bytes.toString())) !== JSON.stringify(input.manifest)) {
      return deny('core_manifest_differs_from_commit');
    }
    const targets = input.manifest.core_targets;
    if (targets.some((target: Fields) => !commands.includes(target.command) || !Array.isArray(target.files) || !target.files.length ||
        !Number.isInteger(target.case_count) || target.case_count < 1) ||
        targets.reduce((sum: number, target: Fields) => sum + target.case_count, 0) !== input.manifest.core_case_count) return deny('core_inventory_incomplete');
    const active = [...new Set<string>(targets.map((target: Fields) => target.command))];
    if (input.groups.length !== 2 * active.length) return deny('core_streams_missing');
    const baselines = input.baseline_declarations?.length ? assessCoreBaselineCoverage(input) : undefined;
    if (baselines && baselines.state !== 'passed') return deny('core_baselines_not_verified');
    const groups: Fields[] = [];
    for (const environment of ['dev', 'test']) for (const command of active) {
      const matches = input.groups.filter((group: unknown) => object(group) && group.environment === environment && group.command === command);
      if (matches.length !== 1) return deny('core_streams_missing_or_duplicated');
      const group = matches[0], selectedTargets = targets.filter((target: Fields) => target.command === command);
      const expected = selectedTargets.reduce((sum: number, target: Fields) => sum + target.case_count, 0);
      if (group.target_sha !== input.target_sha || group.source_authenticated !== true || group.expected_count !== expected ||
          !Array.isArray(group.records) || !group.records.length) return deny('core_group_not_bound');
      const records: Fields[] = [];
      for (const cycle of group.records) {
        if (!object(cycle) || !object(cycle.executor) || cycle.executor.kind !== 'core' || cycle.executor.environment !== environment ||
            cycle.executor.command !== command || !selectedTargets.some((target: Fields) => target.files.includes(cycle.test_file))) return deny('core_cycle_executor_differs');
        for (const phase of ['red', 'green', 'final']) {
          if (!originalExecution(cycle, phase, environment, command)) return deny('core_original_execution_invalid');
        }
        const assessment = deriveTddCycle(cycle);
        if (assessment.state !== 'passed') return deny('core_cycle_not_verified');
        records.push({ ...cycle, assessment });
      }
      const baselineTitles = baselines?.groups.find((entry: Fields) => entry.key === `${environment}:${command}`)?.titles ?? [];
      const coverage = assessTddCoverage({ ...group, records }, baselineTitles);
      if (coverage.state !== 'passed') return deny('core_actual_assertions_not_covered');
      groups.push({ ...group, records, coverage_assessment: coverage });
    }
    return { ...input, groups, state: 'recorded_cycles_verified', coverage: 'complete', reason_codes: [],
      readiness: 'not_evaluated', task_complete: false };
  } catch {
    return deny('core_original_inputs_unavailable');
  }
}
