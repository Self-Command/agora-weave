import { database } from '../database.ts';
import { principal } from '../identity.ts';
import { jsonOutput,outputIsOpen } from '../output.ts';

export function accountOperation(request: Request,command: string,failure: (code: string,status: number) => Response): Promise<Response> {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(command) ||
    new URL(request.url).search) return Promise.resolve(failure('INVALID_INPUT',422));
  const environment = Deno.env.get('CORE_ENVIRONMENT');
  if (!environment || !['dev','test','production'].includes(environment)) return Promise.resolve(failure('SERVICE_UNAVAILABLE',503));
  return new Promise(resolve => {
    let delivered = false;
    const deliver = (response: Response) => { if (!delivered) { delivered = true; resolve(response); } };
    void database().begin(async tx => {
      await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
      if (!await outputIsOpen(tx)) { deliver(failure('SERVICE_UNAVAILABLE',503)); return; }
      const actor = await principal(request);
      if (!actor || actor.audience !== 'authenticated') { deliver(failure('SESSION_INVALID',401)); return; }
      const [row] = await tx`SELECT core.account_operation_result(${actor.account}::uuid,${actor.session}::uuid,${command}::uuid,${environment}) AS result`;
      if (row.result.code !== 'OK') { deliver(failure(row.result.code,row.result.code === 'SESSION_INVALID' ? 401 : row.result.code === 'NOT_FOUND' ? 404 : row.result.code === 'CONFLICT' ? 409 : 422)); return; }
      const output = await jsonOutput(tx,row.result.data),bytes=output.bytes!;
      let done!: () => void;
      const handedOff = new Promise<void>(finish => { done = finish; });
      let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
      const timer = setTimeout(() => { try { controller?.error(new Error('Output admission expired')); } finally { done(); } },2000);
      const stream = new ReadableStream<Uint8Array>({
        start(value) { controller = value; },
        pull(value) { try { value.enqueue(bytes); value.close(); } finally { clearTimeout(timer); done(); } },
        cancel() { clearTimeout(timer); done(); },
      },{ highWaterMark: 0 });
      deliver(new Response(stream,{ headers: { 'Content-Type': 'application/json; charset=utf-8','Cache-Control': 'no-store' } }));
      await handedOff;
    }).catch(error => deliver(failure(error instanceof Error && error.message==='CONFIG_UNAVAILABLE' ? 'CONFIG_UNAVAILABLE' : 'SERVICE_UNAVAILABLE',503)));
  });
}
