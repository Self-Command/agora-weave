import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default async function Dashboard() {
  redirect((await headers()).get('x-agoraweave-admin-surface') === 'preview' ? '/dashboard/overview' : '/dashboard/identity');
}
