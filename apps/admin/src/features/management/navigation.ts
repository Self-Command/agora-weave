import type { NavGroup } from '@/types';
export const managementNavigation: NavGroup[] = [{ label: '管理', items: [
  { title: '管理身份', url: '/dashboard/identity', icon: 'teams', items: [] },
  { title: '账号列表', url: '/dashboard/accounts', icon: 'teams', items: [] },
  { title: '内容审核', url: '/dashboard/moderation/contents', icon: 'product', items: [] },
  { title: '举报案件', url: '/dashboard/moderation/cases', icon: 'forms', items: [] },
  { title: '处罚管理', url: '/dashboard/moderation/sanctions', icon: 'forms', items: [] },
  { title: '申诉复核', url: '/dashboard/moderation/appeals', icon: 'forms', items: [] },
  { title: '验证码配置', url: '/dashboard/configuration/otp', icon: 'forms', items: [] }
] }];
export function currentManagementNavigation(permissions: string[]): NavGroup[] {
  return managementNavigation.map(group => ({ ...group, items: group.items.filter(item =>
    item.url === '/dashboard/accounts' ? permissions.includes('admin.accounts.read') :
    item.url === '/dashboard/configuration/otp' ? permissions.includes('config.read') || permissions.includes('auth.config.write') : true) }));
}
