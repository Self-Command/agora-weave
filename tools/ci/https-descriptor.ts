import type { IngressIdentity } from './https-ingress.ts';
export function validateHttpsDescriptor(value: unknown, expected: IngressIdentity, now: number): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const descriptor = value as Record<string, unknown>;
  const fields = ['run_id', 'attempt', 'target_sha', 'environment', 'schema_version', 'source', 'runner_environment', 'url', 'started_at', 'expires_at'];
  if (Object.keys(descriptor).length !== fields.length || Object.keys(descriptor).some(key => !fields.includes(key)) ||
      descriptor.schema_version !== 1 || descriptor.source !== 'github-actions' || descriptor.runner_environment !== 'github-hosted' ||
      descriptor.run_id !== expected.run_id || descriptor.attempt !== expected.attempt || descriptor.target_sha !== expected.target_sha ||
      descriptor.environment !== expected.environment || typeof descriptor.url !== 'string' ||
      !/^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(descriptor.url) ||
      typeof descriptor.started_at !== 'number' || !Number.isFinite(descriptor.started_at) ||
      typeof descriptor.expires_at !== 'number' || !Number.isFinite(descriptor.expires_at) || !Number.isFinite(now)) return false;
  return descriptor.started_at <= now && now < descriptor.expires_at &&
    descriptor.expires_at > descriptor.started_at && descriptor.expires_at - descriptor.started_at <= 75 * 60000;
}
