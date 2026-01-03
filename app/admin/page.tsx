import AdminShell from '@/app/components/admin/AdminShell';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Admin dashboard' };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    return redirect('/auth/signin');
  }

  return <AdminShell />;
}
