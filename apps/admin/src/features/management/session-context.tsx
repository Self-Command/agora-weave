'use client';
import { createContext, useContext } from 'react';
import type { Administrator } from './contracts';
export const ManagementContext = createContext<Administrator | null>(null);
export const useManagement = () => useContext(ManagementContext);
export function ManagementProvider({ identity, children }: { identity: Administrator | null; children: React.ReactNode }) {
  return <ManagementContext value={identity}>{children}</ManagementContext>;
}
