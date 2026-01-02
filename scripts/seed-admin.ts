import 'dotenv/config';
import bcrypt from 'bcrypt';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { UserRole, AuthProvider } from '@/lib/constants';

async function seed() {
    await dbConnect();

    const email = process.env.SEED_ADMIN_EMAIL || 'admin@church.com';
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

    const hash = await bcrypt.hash(password, 12);
    const userData = {
        name: 'Super Admin',
        email: email.toLowerCase(),
        passwordHash: hash,
        role: UserRole.ADMIN,
        status: 'active',
        provider: AuthProvider.CREDENTIALS,
        verificationToken: null,
        approvedBy: null,
    };

    const doc = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { $set: userData },
        { upsert: true, new: true }
    );

    console.log(doc.wasNew ? 'Admin seeded:' : 'Admin updated:', email);
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
