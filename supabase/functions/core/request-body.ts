/** Bound bytes and elapsed time before parsing untrusted command bodies. */
export async function readCommandJson(request: Request, maximum: number, timeoutMs = 5000): Promise<Record<string,unknown>> {
  const length = request.headers.get('Content-Length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maximum)) {
    void request.body?.cancel().catch(() => {});
    throw new Error('INVALID_INPUT');
  }
  if (!request.body) throw new Error('INVALID_INPUT');
  const reader = request.body.getReader();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_resolve,reject) => {
    timer = setTimeout(() => reject(new Error('INVALID_INPUT')),timeoutMs);
  });
  try {
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const part = await Promise.race([reader.read(),deadline]);
      if (part.done) break;
      total += part.value.byteLength;
      if (total > maximum) throw new Error('INVALID_INPUT');
      chunks.push(part.value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk,offset); offset += chunk.byteLength; }
    const value = JSON.parse(new TextDecoder('utf-8',{ fatal: true }).decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('INVALID_INPUT');
    return value;
  } catch {
    void reader.cancel().catch(() => {});
    throw new Error('INVALID_INPUT');
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
