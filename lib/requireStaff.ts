import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error('Unauthorized');

  const role = (session as any).user.role;
  if (!['admin', 'coordinator'].includes(role)) {
    throw new Error('Forbidden');
  }
  return session;
}