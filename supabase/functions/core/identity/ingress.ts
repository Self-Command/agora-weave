/** Only the official gateway can supply the socket-peer IP used for anonymous quotas. */
export function trustedClientIp(request: Request,secret: string | undefined): string | null {
  const supplied=request.headers.get('X-Core-Ingress-Token') || '';
  if (!secret || !/^[a-f0-9]{64}$/.test(secret) || !/^[a-f0-9]{64}$/.test(supplied)) return null;
  let different=0;
  for (let i=0;i<secret.length;i++) different|=secret.charCodeAt(i)^supplied.charCodeAt(i);
  if (different) return null;
  const value=request.headers.get('X-Core-Client-IP');
  if (!value || value.length>45 || !/^[0-9a-fA-F:.]+$/.test(value)) return null;
  // inet parsing remains authoritative inside the private SQL reservation function.
  return value;
}
