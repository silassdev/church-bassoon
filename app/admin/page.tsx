import AdminShell from '@/app/components/admin/';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Admin dashboard' };

export default async function AdminPage() {
  // strict server-side session check
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') {
    // redirect to sign-in or unauthorized page
    return redirect('/auth/signin');
  }

  // safe to render client AdminShell
  return <AdminShell />;
}
