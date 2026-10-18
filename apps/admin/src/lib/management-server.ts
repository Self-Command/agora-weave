import { cookies } from 'next/headers';
import type { Administrator } from '../features/management/contracts';
import { isAdministrator, managementConfiguration } from './management-policy';
import { managementCookie, openManagementSession } from './management-session';
import { callManagementCore, managementFailure } from './management-upstream';

export async function readManagementIdentity(requireMfa = true) {
  const config = managementConfiguration(process.env);
  if (!config) return { ...managementFailure('SERVICE_UNAVAILABLE', 503), administrator: null };
  let session;
  try { session = openManagementSession((await cookies()).get(managementCookie().name)?.value); }
  catch { return { ...managementFailure('SERVICE_UNAVAILABLE', 503), administrator: null }; }
  if (!session) return { ...managementFailure('SESSION_INVALID', 401), administrator: null };
  const result = await callManagementCore('/admin/session', { token: session.access_token });
  const data = (result.body as Record<string, unknown>).data;
  if (result.status !== 200) return { ...result, administrator: null };
  if (!isAdministrator(data, config.environment)) return { ...managementFailure('FORBIDDEN', 403), administrator: null };
  if (requireMfa && (data.mfa.aal !== 'aal2' || !data.mfa.verified)) return { ...managementFailure('MFA_REQUIRED', 403), administrator: null };
  return { ...result, administrator: data as Administrator };
}
