/** Gate implementations must hold the current policy admission until one bounded unit is handed off. */
export type OutputGate = <T>(operation: () => Promise<T>) => Promise<T>;
export async function admittedUnit<T>(gate: OutputGate,authorize: () => Promise<boolean>,output: () => Promise<T>): Promise<T> {
  return gate(async () => { if (!await authorize()) throw new Error('FORBIDDEN'); return output(); });
}
