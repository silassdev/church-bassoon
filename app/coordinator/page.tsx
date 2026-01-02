import CoordinatorShell from '@/app/components/coordinator/CoordinatorShell';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function CoordinatorPage() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect('/auth/signin');
  if ((session as any).user.role !== 'coordinator') return redirect('/auth/signin');
  return <CoordinatorShell />;
}
