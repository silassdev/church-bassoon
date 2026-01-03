import MemberShell from '@/app/components/member/MemberShell';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function MemberPage() {
  const session = await getServerSession(authOptions);
  if (!session) return redirect('/auth/signin');
  if ((session as any).user.role === 'admin') return redirect('/admin');
  if ((session as any).user.role !== 'member') return redirect('/auth/signin');
  return <MemberShell />;
}