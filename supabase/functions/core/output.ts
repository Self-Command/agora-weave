import type postgres from 'npm:postgres@3.4.7';
import { database } from './database.ts';

export type Failure = (code: string, status: number) => Response;
export type Output = { bytes?: Uint8Array; status?: number; headers?: HeadersInit };
export async function responseConfigVersion(tx: postgres.TransactionSql): Promise<string> {
  const [row]=await tx`SELECT core.response_config_version(${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS version`;
  if (typeof row.version !== 'string' || !row.version.length) throw new Error('CONFIG_UNAVAILABLE');
  return row.version;
}
export async function jsonOutput(tx: postgres.TransactionSql,data: unknown): Promise<Output> {
  const config_version=await responseConfigVersion(tx);
  return { bytes: new TextEncoder().encode(JSON.stringify({ request_id: crypto.randomUUID(),config_version,data })),
    headers: { 'Content-Type': 'application/json; charset=utf-8' } };
}
export async function outputIsOpen(tx: postgres.TransactionSql): Promise<boolean> {
  const [gate]=await tx`SELECT core.policy_context_result(NULL::uuid,NULL::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
  return gate.result.code==='OK';
}

/** Keep the current-policy read lock until one bounded response enters the HTTP stream. */
export function admittedOutput(failure: Failure, read: (tx: postgres.TransactionSql) => Promise<Output | Response>): Promise<Response> {
  return new Promise(resolve => {
    let delivered = false;
    const deliver = (response: Response) => { if (!delivered) { delivered = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      if (!await outputIsOpen(tx)) { deliver(failure('SERVICE_UNAVAILABLE',503)); return; }
      const output = await read(tx);
      if (output instanceof Response) { deliver(output); return; }
      if (output.bytes && output.bytes.length > 1024 * 1024) { deliver(failure('SERVICE_UNAVAILABLE',503)); return; }
      const headers = new Headers(output.headers);
      headers.set('Cache-Control','no-store'); headers.set('X-Robots-Tag','noindex'); headers.set('X-Content-Type-Options','nosniff');
      if (!output.bytes) { deliver(new Response(null,{ status: output.status || 200, headers })); return; }
      let finish!: () => void;
      const handedOff = new Promise<void>(done => { finish = done; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('OUTPUT_EXPIRED')); } finally { finish(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(output.bytes!); value.close(); } finally { clearTimeout(timer); finish(); } },
        cancel() { clearTimeout(timer); finish(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ status: output.status || 200,headers }));
      await handedOff;
    }).catch(error => deliver(failure(error instanceof Error && error.message==='CONFIG_UNAVAILABLE' ? 'CONFIG_UNAVAILABLE' : 'SERVICE_UNAVAILABLE',503)));
  });
}
