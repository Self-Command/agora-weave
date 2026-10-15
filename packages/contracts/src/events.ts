import { isRecord, isUuid } from './http.ts';

export const eventTypes = ['resource.changed', 'revision.changed', 'batch.changed', 'relation.changed', 'message.saved', 'access.changed',
  'request.changed', 'notification.changed', 'ai.source.changed', 'index.policy.changed', 'document.publication.changed',
  'config.activated', 'plugin.lifecycle.changed', 'release.changed', 'purge.changed', 'service.health.changed'] as const;
const envelopeFields = ['event_id', 'type', 'schema_version', 'aggregate_ref', 'aggregate_version', 'owner_plugin', 'environment_id',
  'request_id', 'operation_id', 'effect_key', 'occurred_at', 'policy_epoch', 'lifecycle_epoch', 'payload'];

export function validateEvent(value: unknown): boolean {
  if (!isRecord(value) || Object.keys(value).length !== envelopeFields.length || !envelopeFields.every(key => Object.hasOwn(value, key)) ||
    !eventTypes.some(type => type === value.type) || value.schema_version !== 1 ||
    !['event_id', 'aggregate_ref', 'request_id', 'operation_id'].every(key => isUuid(value[key])) ||
    !['aggregate_version', 'policy_epoch', 'lifecycle_epoch'].every(key => Number.isSafeInteger(value[key]) && Number(value[key]) >= 1) ||
    !['owner_plugin', 'environment_id'].every(key => typeof value[key] === 'string' && /^[a-z][a-z0-9_.-]{0,63}$/.test(value[key])) ||
    typeof value.effect_key !== 'string' || value.effect_key.length < 1 || value.effect_key.length > 256 ||
    typeof value.occurred_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value.occurred_at) ||
    !Number.isFinite(Date.parse(value.occurred_at)) || !isRecord(value.payload)) return false;
  return Object.keys(value.payload).length === 2 && typeof value.payload.state === 'string' &&
    /^[a-z][a-z0-9_]{0,63}$/.test(value.payload.state) && isUuid(value.payload.target_ref);
}

/** Internal references are consumed only after the gateway's current recipient admission. */
export function projectEvent(_value: unknown, _audience: string): null { return null; }
