'use client';

import type { NavItem, NavGroup } from '@/types';
import { useManagement } from '@/features/management/session-context';
import { currentManagementNavigation } from '@/features/management/navigation';

export function useFilteredNavItems(items: NavItem[]) {
  const identity = useManagement();
  return identity ? currentManagementNavigation(identity.permissions).flatMap(group => group.items) : items;
}

export function useFilteredNavGroups(groups: NavGroup[]) {
  const identity = useManagement();
  return identity ? currentManagementNavigation(identity.permissions) : groups;
}
