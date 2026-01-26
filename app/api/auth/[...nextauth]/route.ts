import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import { UserRole, AuthProvider } from '@/lib/constants';

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt' },
    providers: [
        CredentialsProvider({
            name: 'Email',
            credentials: { email: { label: 'Email', type: 'text' }, password: { label: 'Password', type: 'password' } },
            async authorize(credentials) {
                await dbConnect();
                const email = credentials?.email?.toLowerCase?.();
                if (!email || !credentials?.password) throw new Error('Missing credentials');
                const user = await User.findOne({ email });
                console.log('--- Auth Debug ---');
                console.log('Email:', email);
                console.log('User found:', !!user);

                if (!user) throw new Error('No account found');

                const dbProvider = user.provider || AuthProvider.CREDENTIALS;
                console.log('Provider in DB (effective):', dbProvider);
                console.log('Status in DB:', user.status);


                if (!user.passwordHash) {
                    console.log('Auth check failed: No password set for this account');
                    throw new Error('Please sign in with Google or set a password in your account settings');
                }

                if (user.status !== 'active' && user.status !== 'approved') {
                    console.log('Auth check failed: Status not active/approved');
                    throw new Error('Account not active');
                }

                const valid = user.passwordHash ? await bcrypt.compare(credentials.password, user.passwordHash) : false;
                console.log('Password valid:', valid);

                if (!valid) throw new Error('Invalid credentials');

                return { id: user._id.toString(), email: user.email, name: user.name, role: user.role, status: user.status, provider: user.provider };
            },
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],

    callbacks: {
        // signIn is called after getting user/account info — use it to create/validate DB user for OAuth
        async signIn({ user, account }) {
            await dbConnect();

            // Google OAuth flow
            if (account?.provider === AuthProvider.GOOGLE) {
                const email = (user.email || '').toLowerCase();
                if (!email) return false;

                const existing = await User.findOne({ email });

                // If existing user created with credentials, upgrade their account to support Google OAuth
                if (existing && existing.provider === AuthProvider.CREDENTIALS) {
                    // Update the provider to Google and activate the account
                    existing.provider = AuthProvider.GOOGLE;
                    if (existing.status !== 'active') {
                        existing.status = 'active'; // Google verifies email, so activate account
                    }
                    await existing.save();
                    return true; // Allow sign in and complete the Google OAuth flow
                }

                if (!existing) {
                    // create new user from Google — default role member, active
                    await User.create({
                        email,
                        name: user.name,
                        role: UserRole.MEMBER,
                        status: 'active',
                        provider: AuthProvider.GOOGLE,
                        verificationToken: null,
                    });
                    return true;
                }

                // existing and provider === 'google'
                if (existing.status !== 'active') {
                    // activate since Google verified email
                    existing.status = 'active';
                    await existing.save();
                }
                return true;
            }

            // Credentials sign in handled in authorize
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id || token.id;
                token.role = (user as any).role || token.role;
                token.status = (user as any).status || token.status;
                token.provider = (user as any).provider || token.provider;
            }
            return token;
        },

        async session({ session, token }) {
            (session as any).user.id = token.id;
            (session as any).user.role = token.role;
            (session as any).user.status = token.status;
            (session as any).user.provider = token.provider;
            return session;
        },
    },

    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };