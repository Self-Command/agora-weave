import type { components as ManagementComponents } from '../../../../../packages/contracts/src/generated/management';
import type { components as CoreComponents } from '../../../../../packages/contracts/src/generated/core-admin';

type Schemas = ManagementComponents['schemas'];
export type Administrator = CoreComponents['schemas']['Administrator'];
export type CoreSession = CoreComponents['schemas']['SessionTokens'];
export type ApiEnvelope<T> = { request_id: string; config_version: string; operation_id?: string; data: T };
export type ApiFailure = Schemas['Error'];
export type MfaFactor = Schemas['MfaFactor'];
export type MfaEnrollment = Schemas['MfaEnrollment'];
export type MfaChallenge = Schemas['MfaChallenge'];
export type ManagedAccount = Schemas['ManagedAccount'];
export type AccountList = Schemas['ManagedAccountPage'];
export type RevisionList = Schemas['RevisionPage'];
export type CaseList = Schemas['AdminCasePage'];
export type AppealList = Schemas['AppealPage'];
export const OTP_KEYS = [
  'auth.otp_lifetime_seconds', 'auth.otp_resend_seconds', 'auth.otp_max_failures',
  'auth.otp_phone_hourly', 'auth.otp_phone_daily', 'auth.otp_ip_hourly'
] as const;
export type OtpKey = Schemas['OtpKey'];
export type OtpValues = Schemas['OtpValues'];
export type OtpDefinition = Schemas['OtpDefinition'];
export type OtpConfiguration = Schemas['OtpConfiguration'];
export type ConfigPreview = Schemas['ConfigPreview'];
export type ConfigRelease = Schemas['ConfigRelease'];
