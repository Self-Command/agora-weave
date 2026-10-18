'use client';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
export function ManagementCodeField({ value, onChange, disabled, label = '认证器验证码' }: { value: string; onChange: (value: string) => void; disabled?: boolean; label?: string }) {
  return <Field><FieldLabel htmlFor='management-code'>{label}</FieldLabel><InputOTP id='management-code' maxLength={6} value={value} onChange={onChange} disabled={disabled} inputMode='numeric' pattern='[0-9]*' autoComplete='one-time-code' aria-label={label}>
    <InputOTPGroup>{[0, 1, 2].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup><InputOTPSeparator /><InputOTPGroup>{[3, 4, 5].map(index => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup>
  </InputOTP></Field>;
}
