// inside your payment creation handler after session check
await dbConnect();
const user = await User.findById((session as any).user.id).select('profileComplete').lean();
if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
if (!user.profileComplete) return NextResponse.json({ error: 'Complete your profile before making payments', code: 'profile_incomplete' }, { status: 403 });

// proceed to create payment...
