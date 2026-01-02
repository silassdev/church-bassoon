import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  await dbConnect();

  const user = await User.findById((session as any).user.id)
    .select('email name houseAddress dob state city')
    .lean();

  if (!user) redirect('/profile');

  async function updateProfile(formData: FormData) {
    'use server';

    const payload = {
      name: formData.get('name'),
      houseAddress: formData.get('houseAddress'),
      dob: formData.get('dob'),
      state: formData.get('state'),
      city: formData.get('city'),
    };

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/profile`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: '' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Profile update failed');
    }

    redirect('/profile');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>

      <form action={updateProfile} className="space-y-4 bg-white p-6 rounded shadow">
        <Field label="Email">
          <input
            value={user.email}
            disabled
            className="w-full p-2 border rounded bg-slate-100"
          />
        </Field>

        <Field label="Full Name">
          <input
            name="name"
            defaultValue={user.name || ''}
            className="w-full p-2 border rounded"
          />
        </Field>

        <Field label="House Address">
          <textarea
            name="houseAddress"
            defaultValue={user.houseAddress || ''}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-3 gap-4">
          <Field label="DOB">
            <input
              type="date"
              name="dob"
              defaultValue={
                user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
              }
              className="w-full p-2 border rounded"
            />
          </Field>

          <Field label="State">
            <input
              name="state"
              defaultValue={user.state || ''}
              className="w-full p-2 border rounded"
            />
          </Field>

          <Field label="City">
            <input
              name="city"
              defaultValue={user.city || ''}
              className="w-full p-2 border rounded"
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <a href="/profile" className="px-4 py-2 border rounded">
            Cancel
          </a>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      {children}
    </div>
  );
}
