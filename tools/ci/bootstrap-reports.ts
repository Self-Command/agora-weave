import { normalizeExecution } from './run-check-set.ts';
import { assessBridgeGate } from './gates.ts';

type Document = Record<string, unknown>;
const record = (value: unknown): value is Document => value !== null && typeof value === 'object' && !Array.isArray(value);
const digest = (value: unknown) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const deny = (reason: string): Document => ({ state: 'blocked', reason_codes: [reason], executed: 0 });
const accept = (cases: string[]): Document => ({ state: 'passed', reason_codes: [], executed: cases.length, cases });

export function assessBootstrapRaw(input: unknown): Document {
  if (!record(input) || !record(input.identity) || !record(input.raw)) return deny('missing_executor_bytes');
  const identity = input.identity, raw = input.raw;
  if (input.source_authenticated !== true || input.source_job_state !== 'success' || typeof input.target_sha !== 'string' ||
      !/^[a-f0-9]{40}$/.test(input.target_sha) || !digest(input.check_set_digest) || !digest(input.toolchain_digest) ||
      identity.checkout_sha !== input.target_sha || identity.check_set_digest !== input.check_set_digest ||
      identity.toolchain_digest !== input.toolchain_digest || identity.source !== 'github-actions' ||
      identity.runner_environment !== 'github-hosted' || identity.run_id !== input.run_id ||
      !Number.isInteger(input.attempt) || Number(input.attempt) < 1 || Number(identity.attempt) !== input.attempt) return deny('executor_identity_mismatch');
  switch (input.kind) {
    case 'native-https': {
      const report = raw.report, cleanup = raw.cleanup;
      const platform = String(identity.platform);
      const source = platform.startsWith('ios-') ? 'native-xctest-urlsession' : 'native-android-httpsurlconnection';
      if (!/^(ios-(16\.4|26\.4)|android-api(24|36))$/.test(platform) || !record(report) || report.source !== source ||
          report.target_sha !== input.target_sha || report.run_id !== input.run_id || report.attempt !== input.attempt ||
          !record(cleanup) || cleanup.temporary_config_removed !== true || !Array.isArray(report.environments) ||
          report.environments.length !== 2 || !report.environments.every(record)) return deny('native_https_identity_or_cleanup_missing');
      const environments = report.environments;
      return ['dev', 'test'].every(environment => environments.filter(item => item.environment === environment &&
        item.accepted === 200 && item.anonymous === 401 && item.other_environment === 401 && item.private_path === 404 &&
        digest(item.body_sha256)).length === 1) ? accept(['https:dev', 'https:test']) : deny('native_https_response_incomplete');
    }
    case 'native-accessibility': {
      const platform = String(identity.platform), ios = platform.startsWith('ios-');
      if (!/^(ios-(16\.4|26\.4)|android-api(24|36))$/.test(platform) || raw.source !== (ios ? 'native-xctest' : 'native-android-accessibility') ||
          !Array.isArray(raw.measurements) || raw.measurements.length !== 4 || !raw.measurements.every(record) ||
          !Array.isArray(raw.exclusions) || !raw.exclusions.length || !raw.exclusions.every(item => record(item) &&
            item.applicability === 'not_applicable' && item.decision_ref === 'ED-14' && text(item.reason) &&
            item.behavior === (ios ? 'voiceover-navigation' : 'talkback-navigation'))) return deny('native_accessibility_measurements_missing');
      const measurements = raw.measurements;
      const rectangle = (value: unknown): value is Document => record(value) && ['x', 'y', 'width', 'height'].every(key =>
        typeof value[key] === 'number' && Number.isFinite(value[key])) && Number(value.width) > 0 && Number(value.height) > 0;
      for (const item of measurements) {
        if (!['light', 'dark'].includes(String(item.theme)) || typeof item.font_scale !== 'number' || !Number.isFinite(item.font_scale) ||
            item.font_scale < 1 || item.font_scale > 4 || item.title !== 'AgoraWeave' || item.role !== (ios ? 'staticText' : 'android.widget.TextView') ||
            item.enabled !== true || item.title_count !== 1 || item.interactive_count !== 0 || item.editable_count !== 0 ||
            !digest(item.screenshot_sha256) || !digest(item.tree_sha256) || !rectangle(item.frame) || !rectangle(item.viewport) ||
            Number(item.frame.x) < Number(item.viewport.x) || Number(item.frame.y) < Number(item.viewport.y) ||
            Number(item.frame.x) + Number(item.frame.width) > Number(item.viewport.x) + Number(item.viewport.width) + 1 ||
            Number(item.frame.y) + Number(item.frame.height) > Number(item.viewport.y) + Number(item.viewport.height) + 1 ||
            !record(item.audit) || !Array.isArray(item.audit.issues) || item.audit.issues.length) return deny('native_accessibility_semantics_or_bounds_failed');
        if (ios && platform !== 'ios-16.4') {
          if (item.audit.method !== 'xctest-system-audit' || item.audit.executed !== true) return deny('supported_system_audit_missing');
        } else if (ios) {
          if (item.audit.method !== 'unavailable-before-ios17' || item.audit.executed !== false || item.audit.decision_ref !== 'ED-14') return deny('minimum_system_audit_misrepresented');
        } else if (item.audit.method !== 'native-semantic-focus' || item.audit.executed !== true || item.accessibility_focused !== true || item.heading !== true) {
          return deny('android_semantic_focus_missing');
        }
      }
      for (const theme of ['light', 'dark']) {
        const normal = measurements.filter(item => item.theme === theme && Number(item.font_scale) >= 1 && Number(item.font_scale) <= 1.05);
        const large = measurements.filter(item => item.theme === theme && Number(item.font_scale) >= 2);
        if (normal.length !== 1 || large.length !== 1 || Number((large[0].frame as Document).height) < Number((normal[0].frame as Document).height) * 1.95) {
          return deny('actual_large_font_growth_missing');
        }
      }
      return accept(['a11y:light:normal', 'a11y:dark:normal', 'a11y:light:large', 'a11y:dark:large']);
    }
    case 'engineering': {
      const actual = normalizeExecution({ format: 'tap', raw: raw.tap, expected_count: raw.expected_count, exit_code: 0 });
      return actual.state === 'passed' ? accept(Array.from({ length: Number(raw.expected_count) }, (_, i) => `engineering:${i + 1}`)) : deny('engineering_failed');
    }
    case 'web': {
      if (!record(raw.report) || !record(raw.report.stats) || !Array.isArray(raw.report.errors) || raw.report.errors.length ||
          !Array.isArray(raw.report.suites) || !Number.isInteger(raw.expected_count) || Number(raw.expected_count) < 1 ||
          raw.report.stats.expected !== raw.expected_count || raw.report.stats.unexpected !== 0 ||
          raw.report.stats.flaky !== 0 || raw.report.stats.skipped !== 0) return deny('web_result_not_complete');
      const cases: string[] = [];
      let failed = false;
      function visit(suite: unknown) {
        if (!record(suite)) { failed = true; return; }
        if (suite.suites !== undefined) {
          if (Array.isArray(suite.suites)) suite.suites.forEach(visit);
          else failed = true;
        }
        if (suite.specs === undefined) return;
        if (!Array.isArray(suite.specs)) { failed = true; return; }
        for (const spec of suite.specs) {
          if (!record(spec) || !text(spec.title) || !Array.isArray(spec.tests) || !spec.tests.length) { failed = true; continue; }
          for (const test of spec.tests) {
            if (!record(test) || test.expectedStatus !== 'passed' || !Array.isArray(test.results) || test.results.length !== 1 ||
                !record(test.results[0]) || test.results[0].status !== 'passed' ||
                (test.results[0].errors !== undefined && (!Array.isArray(test.results[0].errors) || test.results[0].errors.length))) failed = true;
            else cases.push(`${spec.title}:${String(test.projectName || 'default')}`);
          }
        }
      }
      raw.report.suites.forEach(visit);
      return !failed && cases.length === raw.expected_count && new Set(cases).size === cases.length ? accept(cases) : deny('web_cases_missing_or_retried');
    }
    case 'service': {
      const services = ['api-gw', 'auth', 'db', 'functions', 'imgproxy', 'meta', 'realtime', 'rest', 'storage', 'studio', 'supavisor'];
      const noHealthcheck = ['functions', 'meta', 'rest'];
      if (!record(raw.configuration) || raw.configuration.internal_network !== true || !['dev', 'test'].includes(String(raw.configuration.environment)) ||
          !Array.isArray(raw.configuration.published_ports) || raw.configuration.published_ports.length ||
          !Array.isArray(raw.configuration.services) || raw.configuration.services.length !== services.length ||
          !services.every(name => (raw.configuration as Document).services instanceof Array && ((raw.configuration as Document).services as unknown[]).includes(name)) ||
          !record(raw.outcome) || raw.outcome.health !== 'success' || raw.outcome.cleanup !== 'success' ||
          !Array.isArray(raw.containers) || raw.containers.length !== services.length || !raw.containers.every(record)) return deny('service_isolation_or_cleanup_failed');
      const containers = raw.containers;
      const seeded = (value: unknown) => typeof value === 'string' && /CREATE SCHEMA/.test(value) && /CREATE TABLE/.test(value) &&
        /INSERT 0 1/.test(value) && /\bDO\b/.test(value) && /ROLLBACK/.test(value);
      if (!seeded(raw.schema_seed) || !seeded(raw.schema_seed_repeat) || !services.every(name => containers.filter(item =>
        item.Service === name && item.State === 'running' && (noHealthcheck.includes(name) || item.Health === 'healthy')).length === 1)) return deny('official_services_incomplete');
      return accept(services);
    }
    case 'android': {
      const instrumentation = (value: unknown) => typeof value === 'string' && /OK \(1 test\)/.test(value) &&
        /INSTRUMENTATION_CODE: -1/.test(value) && !/FAILURES|INSTRUMENTATION_FAILED|Exception/.test(value);
      return instrumentation(raw.light_log) && instrumentation(raw.dark_log) && raw.light_theme === 'light:16' && raw.dark_theme === 'dark:32' &&
        typeof raw.hierarchy === 'string' && /<node\b[^>]*package="org\.agoraweave\.app"[^>]*text="AgoraWeave"/.test(raw.hierarchy) &&
        Array.isArray(raw.images) && raw.images.length === 2 && raw.images.every(digest) ? accept(['android:light', 'android:dark']) : deny('android_runtime_incomplete');
    }
    case 'ios': {
      const summary = (value: unknown) => record(value) && value.result === 'Passed' && value.totalTestCount === 1 && value.passedTests === 1 &&
        value.failedTests === 0 && value.skippedTests === 0 && value.expectedFailures === 0 && Array.isArray(value.testFailures) && !value.testFailures.length;
      return summary(raw.light) && summary(raw.dark) && Array.isArray(raw.images) && raw.images.length === 4 && raw.images.every(digest)
        ? accept(['ios:light', 'ios:dark']) : deny('ios_runtime_incomplete');
    }
    case 'bridge': {
      const admission = raw.admission;
      if (!record(admission) || admission.target_sha !== input.target_sha || admission.expected_sha !== input.target_sha ||
          admission.check_set_digest !== input.check_set_digest || admission.expected_check_set_digest !== input.check_set_digest ||
          admission.mode !== 'bootstrap-only' || admission.transition !== 'start' || admission.ci_ready !== false || admission.feature_complete !== false) return deny('bridge_source_mismatch');
      return assessBridgeGate(admission).state === 'passed' ? accept(['bridge:start']) : deny('bridge_refused');
    }
    case 'cleanup': {
      if (!Array.isArray(raw.environments) || raw.environments.length !== 2 || !raw.environments.every(record)) return deny('cleanup_postconditions_missing');
      const environments = raw.environments;
      return ['dev', 'test'].every(name => environments.filter(env => env.environment === name && env.cleanup === 'success' &&
        env.temporary_files_removed === true && ['remaining_containers', 'remaining_volumes', 'remaining_networks']
          .every(key => Array.isArray(env[key]) && (env[key] as unknown[]).length === 0)).length === 1)
        ? accept(['cleanup:dev', 'cleanup:test']) : deny('cleanup_resources_remain');
    }
    case 'tdd': {
      const journal = raw.journal;
      if (!record(journal) || journal.coverage !== 'complete' || journal.target_sha !== input.target_sha || journal.state !== 'recorded_cycles_verified' ||
          !Array.isArray(journal.records) || !journal.records.length || journal.records.some(item => !record(item) || !record(item.assessment) ||
            item.assessment.state !== 'passed' || item.target_sha !== input.target_sha || !text(item.cycle_id))) return deny('tdd_coverage_incomplete');
      return accept(journal.records.map(item => String((item as Document).cycle_id)));
    }
    case 'tooling': {
      const mapping = raw.mapping, refusal = raw.refusal, tasks = raw.canonical_task_ids;
      if (!record(mapping) || !record(refusal) || !Array.isArray(tasks) || !tasks.length || tasks.some(task => !text(task)) ||
          new Set(tasks).size !== tasks.length || !Array.isArray(mapping.mapping) || mapping.mapping.length !== tasks.length ||
          !mapping.mapping.every((item, index) => record(item) && item.id === tasks[index] && item.task === index + 1) ||
          mapping.checkout_sha !== input.target_sha || mapping.source !== 'github-actions' || mapping.runner_environment !== 'github-hosted' ||
          mapping.run_id !== input.run_id || Number(mapping.attempt) !== input.attempt || mapping.check_set_digest !== input.check_set_digest ||
          mapping.toolchain_digest !== input.toolchain_digest || mapping.spec_kit !== '1.0.12' || mapping.superpowers !== '7.0.0' ||
          mapping.superpowers_commit !== 'bb92a77741419a4ab5f06e711a283343f1ada0c3' || !digest(raw.tasks_sha256) ||
          mapping.tasks_sha256 !== raw.tasks_sha256 || mapping.expected_completion !== 'refused' ||
          refusal.source !== 'github-actions' || refusal.target_sha !== input.target_sha || refusal.run_id !== input.run_id ||
          Number(refusal.attempt) !== input.attempt || refusal.state !== 'blocked' || refusal.effective_completion !== false ||
          refusal.raw_native_completion !== 'preserved' || !Array.isArray(refusal.canonical_tasks_completed) || refusal.canonical_tasks_completed.length ||
          ![raw.first_brief, raw.last_brief, raw.ledger, raw.command].every(text)) return deny('native_tool_mapping_or_refusal_incomplete');
      return accept(tasks.map(String));
    }
    default: return deny('unsupported_report_kind');
  }
}
