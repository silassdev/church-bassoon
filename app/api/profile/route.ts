import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type PatchBody = {
  name?: string;
  houseAddress?: string;
  dob?: string; // ISO date string
  state?: string;
  city?: string;
};

function validateProfileInput(data: PatchBody) {
  const errors: Record<string, string> = {};
  if (data.name !== undefined && String(data.name).length > 100) errors.name = 'Name too long';
  if (data.houseAddress !== undefined && String(data.houseAddress).length > 500) errors.houseAddress = 'Address too long';
  if (data.state !== undefined && String(data.state).length > 100) errors.state = 'State too long';
  if (data.city !== undefined && String(data.city).length > 100) errors.city = 'City too long';
  if (data.dob !== undefined) {
    const d = new Date(String(data.dob));
    if (isNaN(d.getTime())) errors.dob = 'Invalid date';
    else {
      // optional: reject DOB in the future
      if (d.getTime() > Date.now()) errors.dob = 'DOB cannot be in the future';
    }
  }
  return errors;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const user = await User.findById((session as any).user.id).select('email name role status houseAddress dob state city avatarUrl profileComplete createdAt').lean();
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Return safe profile data
  return NextResponse.json({
    email: user.email,
    name: user.name || '',
    role: user.role,
    status: user.status,
    houseAddress: user.houseAddress || '',
    dob: user.dob ? user.dob.toISOString().split('T')[0] : null, // yyyy-mm-dd
    state: user.state || '',
    city: user.city || '',
    avatarUrl: user.avatarUrl || null,
    profileComplete: !!user.profileComplete,
    createdAt: user.createdAt,
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: PatchBody = await req.json().catch(() => ({}));
  const errors = validateProfileInput(body);
  if (Object.keys(errors).length > 0) return NextResponse.json({ error: 'validation', details: errors }, { status: 400 });

  await dbConnect();
  const user = await User.findById((session as any).user.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (body.name !== undefined) user.name = String(body.name).trim();
  if (body.houseAddress !== undefined) user.houseAddress = String(body.houseAddress).trim() || null;
  if (body.state !== undefined) user.state = String(body.state).trim() || null;
  if (body.city !== undefined) user.city = String(body.city).trim() || null;
  if (body.dob !== undefined) {
    user.dob = body.dob ? new Date(String(body.dob)) : null;
  }

  await user.save();

  return NextResponse.json({ ok: true });
}