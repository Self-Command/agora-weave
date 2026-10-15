export async function waitSharedExecution(_input: Record<string, any>, _read: () => Promise<Record<string, any>>,
  _sleep: (milliseconds: number) => Promise<void>, _now: () => number): Promise<Record<string, any>> {
  return { state: 'blocked', reason_codes: ['shared_wait_not_implemented'] };
}
