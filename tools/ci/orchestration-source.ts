import { createHash } from 'node:crypto';
import { assessOrchestration } from './gates.ts';

type Fields = Record<string, any>;
const fields = (value: unknown): value is Fields => !!value && typeof value === 'object' && !Array.isArray(value);
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason], readiness: 'not_evaluated' });
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const hash = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Invocation of the always aggregator is observed here; this never declares its readiness result passed. */
export function deriveOrchestrationSource(input: unknown): Record<string, unknown> {
  if (!fields(input) || input.source_authenticated !== true || !fields(input.run) ||
    input.run.head_sha !== input.expected_sha || input.run.repository?.full_name !== input.repository ||
    String(input.run.id) !== input.source_run_id || input.run.path !== '.github/workflows/verify-release.yml' ||
    !Number.isInteger(input.actual_case_count) || input.actual_case_count < 1 || input.reports_complete !== true ||
    !Array.isArray(input.jobs) || !input.jobs.every(fields) || !Array.isArray(input.checks) || !input.checks.every(fields) ||
    !fields(input.review) || !fields(input.scripts) || typeof input.workflow !== 'string' || typeof input.dispatcher !== 'string' ||
    !input.dispatcher.includes('uses: ./.github/workflows/verify-increment.yml')) return deny('invalid_orchestration_source');
  const dependencies: Record<string, string[]> = {};
  const conditions: Record<string, string> = {};
  let current = '';
  for (const line of input.workflow.split(/\r?\n/)) {
    const job = line.match(/^  ([\w-]+):$/);
    if (job) { current = job[1]; dependencies[current] = []; continue; }
    const needs = line.match(/^    needs: ([\w-]+|\[[\w, -]+\])$/);
    if (needs && current) dependencies[current] = needs[1].replace(/[\[\]]/g, '').split(/, */);
    const condition = line.match(/^    if: (.+)$/);
    if (condition && current) conditions[current] = condition[1];
  }
  if (['reports', 'review', 'gate'].some(job => conditions[job] !== '${{ always() }}')) return deny('conditional_source_aggregation');
  const aliases: Record<string, string[]> = { install: ['install'], service: ['service'], discover: ['discover'],
    web: ['admin', 'share'], native: ['ios', 'minimum-ios', 'android', 'minimum-android'],
    reports: ['reports'], review: ['review'], gate: ['aggregate'] };
  const edges: string[][] = [];
  for (const [to, sources] of Object.entries(dependencies)) {
    for (const from of sources) for (const a of aliases[from] || []) for (const b of aliases[to] || []) edges.push([a, b]);
  }
  const selected = (id: string) => input.checks.filter((check: Fields) => check.id === 'bootstrap.' + id);
  const real = (id: string) => {
    const records = selected(id);
    return records.length === 1 && records[0].state === 'passed' && records[0].source_verified === true &&
      records[0].source_sha === input.expected_sha && records[0].check_set_digest === input.expected_check_set_digest && digest(records[0].raw_report_digest);
  };
  const patterns: Record<string, string[]> = { install: [' / install'], service: [' / service / Official Compose (dev', ' / service / Official Compose (test'],
    discover: [' / discover'], admin: [' / web / web'], share: [' / web / web'], ios: [' / native / iOS shell 26.4'],
    'minimum-ios': [' / native / iOS shell 16.4'], android: [' / native / Android shell API 36'],
    'minimum-android': [' / native / Android shell API 24'], reports: [' / reports'],
    review: [' / review / records'], aggregate: [' / agoraweave/ci-gate'] };
  const requiredScripts = ['ci:install', 'ci:discover', 'ci:run', 'ci:contracts', 'ci:e2e:web', 'ci:evidence', 'ci:review'];
  const scriptsPresent = requiredScripts.every(script => typeof input.scripts[script] === 'string' && input.scripts[script].trim());
  const nodes = Object.entries(patterns).map(([id, expressions]) => {
    const jobs = expressions.map(pattern => input.jobs.filter((job: Fields) => String(job.name).includes(pattern)));
    const jobsObserved = jobs.every(matches => matches.length === 1 && (id === 'aggregate' ?
      matches[0].status === 'in_progress' || matches[0].status === 'completed' && ['success', 'failure'].includes(matches[0].conclusion) :
      matches[0].status === 'completed' && matches[0].conclusion === 'success'));
    const recordsObserved = id === 'service' ? real('dev-services') && real('test-services') :
      id === 'discover' ? real('discovery') : id === 'review' ? input.review.code === 'passed' && input.review.visual === 'passed' && digest(input.review.report_digest) :
      ['reports', 'aggregate'].includes(id) ? input.reports_complete === true : real(id);
    return { id, state: jobsObserved && recordsObserved ? 'passed' : 'blocked', checkout_sha: input.expected_sha,
      check_set_digest: input.expected_check_set_digest, script_present: scriptsPresent,
      executed: jobsObserved && recordsObserved ? id === 'discover' ? input.actual_case_count : 1 : 0,
      report_digest: hash({ jobs, records: id === 'service' ? [...selected('dev-services'), ...selected('test-services')] : selected(id),
        review: id === 'review' ? input.review : undefined }),
      evidence_kind: id === 'aggregate' ? 'observed_invocation_readiness_not_evaluated' : 'completed_original_executor' };
  });
  const result = assessOrchestration({ expected_sha: input.expected_sha, target_sha: input.run.head_sha, checkout_sha: input.expected_sha,
    expected_check_set_digest: input.expected_check_set_digest, check_set_digest: input.expected_check_set_digest,
    expected_profile: 'bootstrap', profile: 'bootstrap', event: input.run.event, actual_dispatch: true,
    aggregate_condition: 'always', nodes, edges });
  return { ...result, nodes, edges, source_run_id: input.source_run_id, workflow_digest: hash(input.workflow),
    dispatcher_digest: hash(input.dispatcher), readiness: 'not_evaluated', feature_complete: false };
}
