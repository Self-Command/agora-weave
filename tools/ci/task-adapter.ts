export function deriveTaskAdapter(_tasks: string) {
  return { state: 'unknown', mapping: [] as Array<{ id: string; task: number }>, adapter: '' };
}
