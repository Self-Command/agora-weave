export interface AccountLifecycle {
  isActive(): boolean;
  subscribe(listener: () => void): () => void;
}

export function controllerState<State extends object>(initial: State) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    update(patch: Partial<State>) {
      snapshot = { ...snapshot,...patch };
      listeners.forEach(listener => listener());
    },
  };
}
