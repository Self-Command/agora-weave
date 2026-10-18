const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digest = /^[a-f0-9]{64}$/;
const imageBytes = 10_000_000;

export type CreateImageUpload = {
  operation_id: string;
  intent: 'post' | 'profile';
  kind: 'image';
  size_bytes: number;
  sha256: string;
};

export function createImageUploadCommand(input: Record<string, unknown>): CreateImageUpload | null {
  if (Object.keys(input).length !== 5 ||
      Object.keys(input).some(key => !['operation_id', 'intent', 'kind', 'size_bytes', 'sha256'].includes(key)) ||
      typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      !['post','profile'].includes(String(input.intent)) || input.kind !== 'image' ||
      !Number.isSafeInteger(input.size_bytes) || Number(input.size_bytes) < 1 || Number(input.size_bytes) > imageBytes ||
      typeof input.sha256 !== 'string' || !digest.test(input.sha256)) return null;
  return { operation_id: input.operation_id.toLowerCase(), intent: input.intent as CreateImageUpload['intent'], kind: 'image',
    size_bytes: input.size_bytes as number, sha256: input.sha256 };
}

export function completeImageUploadCommand(input: Record<string, unknown>): { operation_id: string; sha256: string } | null {
  if (Object.keys(input).length !== 2 || typeof input.operation_id !== 'string' || !uuid.test(input.operation_id) ||
      typeof input.sha256 !== 'string' || !digest.test(input.sha256)) return null;
  return { operation_id: input.operation_id.toLowerCase(), sha256: input.sha256 };
}

export function imagePartCommand(uploadId: string, part: string, operationId: string | null,
  contentType: string | null, contentLength: string | null): { upload_id: string; part: number; operation_id: string; size_bytes: number | null } | null {
  if (!uuid.test(uploadId) || !/^(0|[1-9][0-9]*)$/.test(part) || !Number.isSafeInteger(Number(part)) ||
      !operationId || !uuid.test(operationId) ||
      contentType !== 'application/octet-stream' || contentLength !== null && !/^[1-9][0-9]*$/.test(contentLength)) return null;
  const size = contentLength === null ? null : Number(contentLength);
  if (size !== null && (!Number.isSafeInteger(size) || size > imageBytes)) return null;
  return { upload_id: uploadId.toLowerCase(), part: Number(part), operation_id: operationId.toLowerCase(), size_bytes: size };
}
