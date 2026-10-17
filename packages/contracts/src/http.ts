import { countVisibleCharacters } from './graphemes.ts';

export type Fields = Record<string, unknown>;
export const isRecord = (value: unknown): value is Fields => value !== null && typeof value === 'object' && !Array.isArray(value);
export const isUuid = (value: unknown): value is string => typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) >= 0;
const text = (value: unknown, maximum: number): value is string => typeof value === 'string' && value.length > 0 && value.length <= maximum;
const closed = (value: Fields, required: string[], optional: string[] = []) =>
  required.every(key => Object.hasOwn(value, key)) && Object.keys(value).every(key => [...required, ...optional].includes(key));

export function validateCommand(value: unknown): boolean {
  return isRecord(value) && closed(value, ['operation_id', 'base_version'], ['body']) &&
    isUuid(value.operation_id) && integer(value.base_version) &&
    (value.body === undefined || typeof value.body === 'string' && countVisibleCharacters(value.body) <= 10000);
}

export function validateError(value: unknown): boolean {
  if (!isRecord(value) || !closed(value, ['request_id', 'code', 'message', 'retryable'],
    ['retry_after_seconds', 'operation_id', 'current_config_version', 'field_errors']) || !isUuid(value.request_id) ||
    !text(value.code, 64) || !/^[A-Z][A-Z0-9_]*$/.test(value.code) || !text(value.message, 1024) || typeof value.retryable !== 'boolean') return false;
  if (value.retry_after_seconds !== undefined && !integer(value.retry_after_seconds) ||
      value.operation_id !== undefined && !isUuid(value.operation_id) ||
      value.current_config_version !== undefined && !text(value.current_config_version, 128)) return false;
  return value.field_errors === undefined || isRecord(value.field_errors) && Object.keys(value.field_errors).length <= 50 &&
    Object.entries(value.field_errors).every(([key, message]) => /^[a-z][a-z0-9_]{0,63}$/.test(key) && text(message, 1024));
}

export function validatePage(value: unknown): boolean {
  return isRecord(value) && closed(value, ['items', 'next_cursor', 'has_more']) && Array.isArray(value.items) && value.items.length <= 50 &&
    typeof value.has_more === 'boolean' && (value.next_cursor === null && !value.has_more ||
      text(value.next_cursor, 2048) && /^[A-Za-z0-9_-]+$/.test(value.next_cursor));
}

export function validatePreferencesPatch(value: unknown): boolean {
  if (!isRecord(value) || !closed(value, ['operation_id', 'base_version'], ['video_policy', 'preload', 'typing']) ||
    !isUuid(value.operation_id) || !integer(value.base_version)) return false;
  return (value.video_policy === undefined || typeof value.video_policy === 'string' && ['always', 'wifi_only', 'never'].includes(value.video_policy)) &&
    ['preload', 'typing'].every(key => value[key] === undefined || typeof value[key] === 'boolean');
}
