import { database } from './database.ts';
import { principal } from './identity.ts';

/** One bounded JSON body is handed to the HTTP stream while its read admission remains held. */
export function admittedResource(request: Request, target: string, failure: (code: string, status: number) => Response): Promise<Response> {
  return new Promise<Response>(resolve => {
    let resolved = false;
    const deliver = (response: Response) => { if (!resolved) { resolved = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      let actor;
      try { actor = await principal(request); }
      catch { deliver(failure('SESSION_INVALID', 401)); return; }
      const [row] = await tx`SELECT core.read_resource_result(${actor?.account ?? null}::uuid,
        ${actor?.session ?? null}::uuid,${target}::uuid) AS result`;
      if (row.result.code !== 'OK') { deliver(failure(row.result.code, row.result.code === 'SESSION_INVALID' ? 401 : 404)); return; }
      const bytes = new TextEncoder().encode(JSON.stringify({ data: row.result.data }));
      if (bytes.length > 1024 * 1024) { deliver(failure('SERVICE_UNAVAILABLE', 503)); return; }
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } }, 2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) {
          try { value.enqueue(bytes); value.close(); }
          finally { clearTimeout(timer); done(); }
        },
        cancel() { clearTimeout(timer); done(); },
      }, { highWaterMark: 0 });
      deliver(new Response(stream, { headers: { 'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } }));
      await handedOff;
    }).catch(() => deliver(failure('SERVICE_UNAVAILABLE', 503)));
  });
}
