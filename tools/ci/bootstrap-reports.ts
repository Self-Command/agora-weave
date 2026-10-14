import { normalizeExecution } from './run-check-set.ts';

type Fields = Record<string, unknown>;
const fields = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const hashes = (value: unknown): value is string[] => Array.isArray(value) && value.length >= 2 && value.every(item => typeof item === 'string' && /^[a-f0-9]{64}$/.test(item));
const deny = (reason: string) => ({ state: 'blocked', reason_codes: [reason], cases: [] });
const passed = (cases: string[]) => ({ state: 'passed', reason_codes: [], discovered: cases.length, executed: cases.length,
  cases: cases.map(id => ({ id, state: 'passed' })) });

export function assessBootstrapRaw(input: unknown): Record<string, unknown> {
  if (!fields(input) || !fields(input.identity) || !fields(input.raw) || input.source_authenticated !== true ||
    input.source_job_state !== 'success' || input.identity.source !== 'github-actions' || input.identity.runner_environment !== 'github-hosted' ||
    input.identity.checkout_sha !== input.target_sha || input.identity.check_set_digest !== input.check_set_digest ||
    input.identity.toolchain_digest !== input.toolchain_digest || input.identity.run_id !== input.run_id || input.identity.attempt !== input.attempt) {
    return deny('invalid_raw_source_identity');
  }
  const raw = input.raw;
  if (input.kind === 'engineering') {
    const result = normalizeExecution({ format: 'tap', raw: raw.tap, expected_count: raw.expected_count, exit_code: 0 });
    return result.state === 'passed' ? passed(Array.from({ length: Number(raw.expected_count) }, (_, index) => `engineering:${index + 1}`)) : deny('raw_engineering_not_passed');
  }
  if (input.kind === 'web') {
    if (!fields(raw.report) || !fields(raw.report.stats) || !Array.isArray(raw.report.errors) || raw.report.errors.length ||
      !Number.isInteger(raw.expected_count) || Number(raw.expected_count) < 1 || raw.report.stats.expected !== raw.expected_count ||
      ['unexpected', 'flaky', 'skipped'].some(key => (raw.report as Fields).stats && ((raw.report as Fields).stats as Fields)[key] !== 0)) return deny('raw_web_not_passed');
    const cases: string[] = [];
    let invalid = false;
    function walk(suites: unknown) {
      if (!Array.isArray(suites)) { invalid = true; return; }
      for (const suite of suites) {
        if (!fields(suite)) { invalid = true; continue; }
        if (suite.suites !== undefined) walk(suite.suites);
        if (suite.specs === undefined) continue;
        if (!Array.isArray(suite.specs)) { invalid = true; continue; }
        for (const spec of suite.specs) {
          if (!fields(spec) || typeof spec.title !== 'string' || !Array.isArray(spec.tests) || !spec.tests.length) { invalid = true; continue; }
          for (const test of spec.tests) {
            if (!fields(test) || test.expectedStatus !== 'passed' || !Array.isArray(test.results) || test.results.length !== 1 ||
              !fields(test.results[0]) || test.results[0].status !== 'passed' ||
              (Array.isArray(test.results[0].errors) && test.results[0].errors.length)) invalid = true;
            cases.push(spec.title);
          }
        }
      }
    }
    walk(raw.report.suites);
    return !invalid && cases.length === raw.expected_count && new Set(cases).size === cases.length ? passed(cases) : deny('incomplete_raw_web_cases');
  }
  if (input.kind === 'service') {
    const required = ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor'];
    const healthRequired = required.filter(id => !['functions', 'rest'].includes(id));
    if (!fields(raw.configuration) || raw.configuration.internal_network !== true ||
      !Array.isArray(raw.configuration.published_ports) || raw.configuration.published_ports.length ||
      !Array.isArray(raw.configuration.services) || raw.configuration.services.length !== required.length ||
      required.some(id => !(raw.configuration as Fields).services || !((raw.configuration as Fields).services as unknown[]).includes(id)) ||
      !fields(raw.outcome) || raw.outcome.health !== 'success' || raw.outcome.cleanup !== 'success' ||
      !Array.isArray(raw.containers) || raw.containers.length !== required.length || !raw.containers.every(fields)) return deny('invalid_raw_service');
    const containers = raw.containers;
    if (required.some(id => !containers.some(container => container.Service === id && container.State === 'running' &&
      (!healthRequired.includes(id) || container.Health === 'healthy'))) ||
      [raw.schema_seed, raw.schema_seed_repeat].some(value => typeof value !== 'string' ||
        !['BEGIN', 'CREATE SCHEMA', 'CREATE TABLE', 'INSERT 0 1', 'DO', 'ROLLBACK'].every(line => value.split(/\r?\n/).includes(line)))) return deny('incomplete_raw_service');
    return passed([...required.map(id => `service:${id}`), 'schema-seed', 'schema-seed-repeat', 'cleanup']);
  }
  if (input.kind === 'android') {
    if ([raw.light_log, raw.dark_log].some(log => typeof log !== 'string' ||
      !/^OK \(1 test\)\r?$/m.test(log) || /FAILURES|INSTRUMENTATION_FAILED|Exception|Error in /m.test(log)) ||
      typeof raw.hierarchy !== 'string' || !/package="org\.agoraweave\.app"/.test(raw.hierarchy) ||
      !/text="AgoraWeave"/.test(raw.hierarchy) || !hashes(raw.images)) return deny('incomplete_raw_android');
    return passed(['android:light:launch-resume', 'android:dark:launch-resume']);
  }
  return deny('unregistered_raw_report_kind');
}
