export const developmentRequiredIds = Object.freeze(['development.install', 'development.engineering',
  'development.web', 'development.dev-services', 'development.test-services']);

type Fields = Record<string, any>;
const object = (value: unknown): value is Fields => !!value && typeof value === 'object' && !Array.isArray(value);
const hash = (value: unknown, length = 64) => typeof value === 'string' && new RegExp(`^[a-f0-9]{${length}}$`).test(value);
const sameDigests = (left: unknown, right: unknown) => object(left) && object(right) && Object.keys(left).length > 0 &&
  Object.keys(left).length === Object.keys(right).length && Object.entries(left).every(([key, value]) => hash(value) && right[key] === value);

/** The source envelope is constructed only after authenticating original GitHub archive bytes and ancestry. */
export function validDevelopmentReadiness(source: unknown, foundation: unknown, checkSetDigest: unknown): boolean {
  if (!object(source) || source.authenticated !== true || source.ancestor_verified !== true || !object(source.document)) return false;
  const document = source.document;
  const observed = document.observed;
  return document.state === 'passed' && document.development_ready === true && document.ci_ready === false &&
    document.readiness_kind === 'development-ready' && document.scope === 'development' &&
    ['green', 'completion'].includes(document.validation_intent) && document.feature_complete === false &&
    hash(document.target_sha, 40) && hash(checkSetDigest) && document.check_set_digest === checkSetDigest &&
    sameDigests(document.foundation_digests, foundation) && document.reports_read === true &&
    typeof document.read_by === 'string' && document.read_by.trim().length > 0 &&
    typeof document.read_at === 'string' && Number.isFinite(Date.parse(document.read_at)) && document.regressions_passed === true &&
    Array.isArray(document.required_ids) && document.required_ids.length === developmentRequiredIds.length &&
    developmentRequiredIds.every(id => document.required_ids.filter((item: unknown) => item === id).length === 1) &&
    Array.isArray(observed) && observed.length === developmentRequiredIds.length && developmentRequiredIds.every(id =>
      observed.filter((item: unknown) => object(item) && item.id === id && item.state === 'passed' &&
        item.source_verified === true && item.source_job_conclusion === 'success' && item.source_sha === document.target_sha &&
        item.check_set_digest === checkSetDigest && hash(item.raw_report_digest)).length === 1);
}
