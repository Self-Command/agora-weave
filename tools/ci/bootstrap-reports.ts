import { normalizeExecution } from './run-check-set.ts';
import { assessBridgeGate } from './gates.ts';

type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const deny = (reason: string): Fields => ({ state: 'blocked', reason_codes: [reason], executed: 0 });
const passed = (cases: string[]): Fields => ({ state: 'passed', reason_codes: [], executed: cases.length, cases });

export function assessBootstrapRaw(input: unknown): Fields {
  if (!object(input) || !object(input.identity) || !object(input.raw)) return deny('missing_original_report');
  const identity = input.identity, raw = input.raw;
  if (input.source_authenticated !== true || input.source_job_state !== 'success' ||
      typeof input.target_sha !== 'string' || !/^[a-f0-9]{40}$/.test(input.target_sha) ||
      !digest(input.check_set_digest) || !digest(input.toolchain_digest) ||
      identity.checkout_sha !== input.target_sha || identity.check_set_digest !== input.check_set_digest ||
      identity.toolchain_digest !== input.toolchain_digest || identity.source !== 'github-actions' ||
      identity.runner_environment !== 'github-hosted' || identity.run_id !== input.run_id ||
      !Number.isSafeInteger(input.attempt) || Number(input.attempt) < 1 || identity.attempt !== input.attempt) return deny('unbound_original_execution');
  if (input.kind === 'engineering') {
    const result = normalizeExecution({ format: 'tap', raw: raw.tap, expected_count: raw.expected_count, exit_code: 0 });
    return result.state === 'passed' ? passed(Array.from({ length: Number(raw.expected_count) }, (_, index) => `engineering:${index + 1}`)) : deny('raw_engineering_not_passed');
  }
  if (input.kind === 'web') {
    const report = raw.report;
    if (!object(report) || !object(report.stats) || !Array.isArray(report.errors) || report.errors.length ||
        !Array.isArray(report.suites) || !Number.isSafeInteger(raw.expected_count) || Number(raw.expected_count) < 1 ||
        report.stats.expected !== raw.expected_count || ['unexpected', 'flaky', 'skipped'].some(key => (report.stats as Fields)[key] !== 0)) return deny('raw_web_not_passed');
    const cases: string[] = [];
    let invalid = false;
    function visit(suite: unknown) {
      if (!object(suite)) { invalid = true; return; }
      if (suite.suites !== undefined) {
        if (!Array.isArray(suite.suites)) invalid = true;
        else suite.suites.forEach(visit);
      }
      if (suite.specs !== undefined) {
        if (!Array.isArray(suite.specs)) { invalid = true; return; }
        for (const spec of suite.specs) {
          if (!object(spec) || !nonempty(spec.title) || !Array.isArray(spec.tests) || !spec.tests.length) { invalid = true; continue; }
          for (const test of spec.tests) {
            if (!object(test) || test.expectedStatus !== 'passed' || !Array.isArray(test.results) || test.results.length !== 1 ||
                !object(test.results[0]) || test.results[0].status !== 'passed' ||
                (test.results[0].errors !== undefined && (!Array.isArray(test.results[0].errors) || test.results[0].errors.length))) invalid = true;
            else cases.push(`${spec.title}:${String(test.projectName || 'default')}`);
          }
        }
      }
    }
    report.suites.forEach(visit);
    return !invalid && cases.length === raw.expected_count && new Set(cases).size === cases.length ? passed(cases) : deny('incomplete_raw_web_cases');
  }
  if (input.kind === 'service') {
    const required = ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor'];
    const healthy = required.filter(name => !['functions', 'meta', 'rest'].includes(name));
    const config = raw.configuration, outcome = raw.outcome;
    if (!object(config) || config.internal_network !== true || !['dev', 'test'].includes(String(config.environment)) ||
        !Array.isArray(config.published_ports) || config.published_ports.length || !Array.isArray(config.services) ||
        config.services.length !== required.length || !required.every(name => (config.services as unknown[]).includes(name)) ||
        !object(outcome) || outcome.health !== 'success' || outcome.cleanup !== 'success' ||
        !Array.isArray(raw.containers) || raw.containers.length !== required.length || !raw.containers.every(object)) return deny('incomplete_official_services');
    const containers = raw.containers;
    if (!required.every(name => containers.filter(item => item.Service === name && item.State === 'running' &&
        (!healthy.includes(name) || item.Health === 'healthy')).length === 1) ||
        ![raw.schema_seed, raw.schema_seed_repeat].every(value => typeof value === 'string' &&
          /CREATE SCHEMA/.test(value) && /CREATE TABLE/.test(value) && /INSERT 0 1/.test(value) && /DO/.test(value) && /ROLLBACK/.test(value))) return deny('raw_services_not_passed');
    return passed(required);
  }
  if (input.kind === 'android') {
    if (![raw.light_log, raw.dark_log].every(value => typeof value === 'string' && /OK \(1 test\)/.test(value) &&
      /INSTRUMENTATION_CODE: -1/.test(value) && !/FAILURES|Exception|INSTRUMENTATION_FAILED/.test(value)) ||
      typeof raw.hierarchy !== 'string' || !/<node\b[^>]*package="org\.agoraweave\.app"[^>]*text="AgoraWeave"/.test(raw.hierarchy) ||
      raw.light_theme !== 'light:16' || raw.dark_theme !== 'dark:32' || !Array.isArray(raw.images) ||
      raw.images.length !== 2 || !raw.images.every(digest)) return deny('raw_android_not_passed');
    return passed(['android:light', 'android:dark']);
  }
  if (input.kind === 'ios') {
    const valid = (value: unknown) => object(value) && value.result === 'Passed' && value.totalTestCount === 1 &&
      value.passedTests === 1 && value.failedTests === 0 && value.skippedTests === 0 && value.expectedFailures === 0 &&
      Array.isArray(value.testFailures) && value.testFailures.length === 0;
    return valid(raw.light) && valid(raw.dark) && Array.isArray(raw.images) && raw.images.length === 4 && raw.images.every(digest)
      ? passed(['ios:light', 'ios:dark']) : deny('raw_ios_not_passed');
  }
  if (input.kind === 'bridge') {
    const admission = raw.admission;
    if (!object(admission) || admission.target_sha !== input.target_sha || admission.expected_sha !== input.target_sha ||
        admission.check_set_digest !== input.check_set_digest || admission.expected_check_set_digest !== input.check_set_digest ||
        admission.mode !== 'bootstrap-only' || admission.transition !== 'start' || admission.ci_ready !== false || admission.feature_complete !== false) return deny('unbound_bridge_admission');
    return assessBridgeGate(admission).state === 'passed' ? passed(['bridge:start']) : deny('raw_bridge_not_passed');
  }
  if (input.kind === 'cleanup') {
    if (!Array.isArray(raw.environments) || raw.environments.length !== 2 || !raw.environments.every(object)) return deny('missing_cleanup_postconditions');
    const environments = raw.environments;
    if (!['dev', 'test'].every(name => environments.filter(environment => environment.environment === name &&
      environment.cleanup === 'success' && environment.temporary_files_removed === true &&
      ['remaining_containers', 'remaining_volumes', 'remaining_networks'].every(key =>
        Array.isArray(environment[key]) && (environment[key] as unknown[]).length === 0)).length === 1)) return deny('cleanup_residual_resources');
    return passed(['cleanup:dev', 'cleanup:test']);
  }
  if (input.kind === 'tdd') {
    const journal = raw.journal;
    if (!object(journal) || journal.target_sha !== input.target_sha || journal.coverage !== 'complete' ||
        journal.state !== 'recorded_cycles_verified' || !Array.isArray(journal.records) || !journal.records.length ||
        journal.records.some(record => !object(record) || !object(record.assessment) || record.assessment.state !== 'passed' ||
          record.target_sha !== input.target_sha || !nonempty(record.cycle_id))) return deny('incomplete_tdd_catalog');
    return passed(journal.records.map(record => String((record as Fields).cycle_id)));
  }
  if (input.kind === 'tooling') {
    const mapping = raw.mapping, refusal = raw.refusal;
    if (!object(mapping) || !object(refusal) || mapping.checkout_sha !== input.target_sha || mapping.run_id !== input.run_id ||
        mapping.attempt !== input.attempt || mapping.source !== 'github-actions' || mapping.runner_environment !== 'github-hosted' ||
        mapping.check_set_digest !== input.check_set_digest || mapping.toolchain_digest !== input.toolchain_digest ||
        mapping.spec_kit !== '1.0.12' || mapping.superpowers !== '7.0.0' ||
        mapping.superpowers_commit !== 'bb92a77741419a4ab5f06e711a283343f1ada0c3' || !digest(raw.tasks_sha256) ||
        mapping.tasks_sha256 !== raw.tasks_sha256 || mapping.expected_completion !== 'refused' ||
        !Array.isArray(raw.canonical_task_ids) || !raw.canonical_task_ids.length || new Set(raw.canonical_task_ids).size !== raw.canonical_task_ids.length ||
        !Array.isArray(mapping.mapping) || mapping.mapping.length !== raw.canonical_task_ids.length ||
        !mapping.mapping.every((item, index) => object(item) && item.id === (raw.canonical_task_ids as unknown[])[index] && item.task === index + 1) ||
        refusal.source !== 'github-actions' || refusal.run_id !== input.run_id || refusal.attempt !== input.attempt ||
        refusal.target_sha !== input.target_sha || refusal.state !== 'blocked' || refusal.effective_completion !== false ||
        refusal.raw_native_completion !== 'preserved' || !Array.isArray(refusal.canonical_tasks_completed) || refusal.canonical_tasks_completed.length ||
        ![raw.first_brief, raw.last_brief, raw.ledger, raw.command].every(nonempty)) return deny('incomplete_native_tooling_refusal');
    return passed(raw.canonical_task_ids.map(String));
  }
  return deny('unsupported_original_report');
}
