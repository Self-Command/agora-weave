Deno.serve((request: Request) => {
  const unavailable = request.headers.has('Authorization');
  return Response.json({ request_id: crypto.randomUUID(), code: unavailable ? 'SERVICE_UNAVAILABLE' : 'SESSION_INVALID',
    message: unavailable ? '服务暂时不可用，请稍后重试' : '登录已失效，请重新登录', retryable: unavailable },
  { status: unavailable ? 503 : 401, headers: { 'Cache-Control': 'no-store' } });
});
