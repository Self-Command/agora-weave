import { principal } from '../identity.ts';
import { admittedOutput, jsonOutput, type Failure } from '../output.ts';
import { database } from '../database.ts';
export async function events(request: Request,failure: Failure) {
  if (request.method!=='GET') return failure('METHOD_NOT_ALLOWED',405);
  const url = new URL(request.url),after=Number(url.searchParams.get('after') || '0'),limit=Number(url.searchParams.get('limit') || '20');
  if ([...url.searchParams.keys()].some(key=>!['after','limit'].includes(key) || url.searchParams.getAll(key).length!==1) ||
    !Number.isSafeInteger(after) || after<0 || !Number.isSafeInteger(limit) || limit<1 || limit>50) return failure('INVALID_INPUT',422);
  const actor=await principal(request);
  if (!actor || actor.audience!=='authenticated') return failure('SESSION_INVALID',401);
  const currentBatch=async(tx:ReturnType<typeof database>,cursor:number)=>{
    const current=await principal(request);
    if (!current || current.audience!=='authenticated') return {code:'SESSION_INVALID'};
    const [gate]=await tx`SELECT core.policy_context_result(${current.account}::uuid,${current.session}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''}) AS result`;
    if(gate.result.code!=='OK')return gate.result;
    const [row]=await tx`SELECT core.read_events_result(${current.account}::uuid,${current.session}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''},${cursor},${limit}) AS result`;
    return row.result;
  };
  if(request.headers.get('Upgrade')?.toLowerCase()==='websocket'){
    const initial=await currentBatch(database(),after);
    if(initial.code!=='OK')return failure(initial.code,initial.code==='SESSION_INVALID'?401:503);
    const {socket,response}=Deno.upgradeWebSocket(request);
    let cursor=after,busy=false,timer:ReturnType<typeof setInterval>|undefined;
    const stop=()=>{if(timer)clearInterval(timer);timer=undefined;};
    const tick=async()=>{
      if(busy || socket.readyState!==WebSocket.OPEN)return;busy=true;
      try{await database().begin(async tx=>{
        await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
        const result=await currentBatch(tx,cursor);
        if(result.code!=='OK'){socket.close(1008,'Access changed');stop();return;}
        for(const item of result.data.items){
          if(socket.bufferedAmount>64*1024){socket.close(1013,'Reconnect required');stop();return;}
          socket.send(JSON.stringify(item));
        }
        cursor=result.data.cursor;
      });}catch{socket.close(1011,'Service unavailable');stop();}finally{busy=false;}
    };
    socket.onopen=()=>{timer=setInterval(()=>void tick(),250);void tick();};socket.onclose=stop;socket.onerror=stop;
    return response;
  }
  if(request.headers.get('Accept')?.includes('text/event-stream')){
    const initial=await currentBatch(database(),after);
    if(initial.code!=='OK')return failure(initial.code,initial.code==='SESSION_INVALID'?401:503);
    let cursor=after,cancelled=false;
    const stream=new ReadableStream<Uint8Array>({
      async pull(controller){
        while(!cancelled){
          try{
            const emitted=await database().begin(async tx=>{
              await tx`SELECT pg_advisory_xact_lock_shared(17013,1)`;
              const result=await currentBatch(tx,cursor);
              if(result.code!=='OK')throw new Error('ACCESS_CHANGED');
              cursor=result.data.cursor;
              if(!result.data.items.length)return false;
              const bytes=new TextEncoder().encode(result.data.items.map((item:{sequence:number})=>`id: ${item.sequence}\nevent: changed\ndata: ${JSON.stringify(item)}\n\n`).join(''));
              if(bytes.length>64*1024)throw new Error('EVENT_BOUNDS');
              if(!cancelled)controller.enqueue(bytes);return true;
            });
            if(emitted)return;
            await new Promise(done=>setTimeout(done,250));
          }catch{if(!cancelled)controller.error(new Error('EVENTS_UNAVAILABLE'));return;}
        }
      },cancel(){cancelled=true;},
    },{highWaterMark:0});
    return new Response(stream,{headers:{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-store','X-Accel-Buffering':'no','X-Robots-Tag':'noindex'}});
  }
  return admittedOutput(failure,async tx => {
    const actor=await principal(request);
    if (!actor || actor.audience!=='authenticated') return failure('SESSION_INVALID',401);
    const [row]=await tx`SELECT core.read_events_result(${actor.account}::uuid,${actor.session}::uuid,${Deno.env.get('CORE_ENVIRONMENT') || ''},${after},${limit}) AS result`;
    if (row.result.code!=='OK') return failure(row.result.code,row.result.code==='SESSION_INVALID'?401:503);
    return jsonOutput(tx,row.result.data);
  });
}
