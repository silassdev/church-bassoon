import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  await dbConnect();

  const user = await User.findById((session as any).user.id)
    .select('email name houseAddress dob state city role status createdAt')
    .lean();

  if (!user) redirect('/auth/signin');

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <a
          href="/profile/edit"
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
        >
          Edit Profile
        </a>
      </div>

      <div className="bg-white rounded shadow divide-y">
        <Row label="Email" value={user.email} />
        <Row label="Full Name" value={user.name || '—'} />
        <Row label="House Address" value={user.houseAddress || '—'} />
        <Row
          label="Date of Birth"
          value={user.dob ? new Date(user.dob).toLocaleDateString() : '—'}
        />
        <Row label="State" value={user.state || '—'} />
        <Row label="City" value={user.city || '—'} />
        <Row label="Role" value={user.role} />
        <Row label="Account Status" value={user.status} />
        <Row
          label="Joined"
          value={new Date(user.createdAt).toLocaleDateString()}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-4 py-3">
      <div className="w-40 text-sm text-slate-500">{label}</div>
      <div className="flex-1 text-sm">{value}</div>
    </div>
  );
}
