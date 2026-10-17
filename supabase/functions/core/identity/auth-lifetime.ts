/** Auth expiry starts when Auth generated the OTP, never when a slow provider returns. */
export function authLifetimeCompatible(expiresAt:unknown,issuedAt:unknown,upperSeconds:unknown):boolean {
  if (typeof expiresAt!=='string'||typeof issuedAt!=='string'||typeof upperSeconds!=='string'||!/^\d+$/.test(upperSeconds)) return false;
  const bound=Number(upperSeconds),expires=Date.parse(expiresAt),issued=Date.parse(issuedAt);
  return Number.isSafeInteger(bound)&&bound>0&&Number.isFinite(expires)&&Number.isFinite(issued)&&expires>issued&&expires<=issued+bound*1000;
}
