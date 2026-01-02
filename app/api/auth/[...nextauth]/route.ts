import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcrypt';

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
                if (!user) throw new Error('No account found');

                // enforce provider consistency: if account was created with Google, require Google unless password is set
                if (user.provider !== 'credentials') {
                    // no password set
                    throw new Error('Please sign in with Google or set a password in your account settings');
                }

                if (user.status !== 'active') {
                    throw new Error('Account not active');
                }

                const valid = user.passwordHash ? await bcrypt.compare(credentials.password, user.passwordHash) : false;
                if (!valid) throw new Error('Invalid credentials');

                return { id: user._id.toString(), email: user.email, name: user.name, role: user.role, provider: user.provider };
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
            if (account?.provider === 'google') {
                const email = (user.email || '').toLowerCase();
                if (!email) return false;

                const existing = await User.findOne({ email });

                // If existing user created with credentials (email/password) and provider === 'credentials', do not allow Google login automatically.
                if (existing && existing.provider === 'credentials') {
                    // Prevent OAuth sign in for an account created with credentials (unless the user links accounts separately)
                    return '/auth/error?error=use-credentials';
                }

                if (!existing) {
                    // create new user from Google — default role member, active
                    await User.create({
                        email,
                        name: user.name,
                        role: 'member',
                        status: 'active',
                        provider: 'google',
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
                token.provider = (user as any).provider || token.provider;
            }
            return token;
        },

        async session({ session, token }) {
            (session as any).user.id = token.id;
            (session as any).user.role = token.role;
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

export default NextAuth(authOptions);