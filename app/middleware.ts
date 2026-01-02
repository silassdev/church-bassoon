import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // public paths
    if (['/api/auth/register', '/api/auth/verify', '/auth', '/auth/signin'].some(p => pathname.startsWith(p))) return NextResponse.next();

    if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    // Role-based protection for dashboards
    if (pathname.startsWith('/dashboard/admin') && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    if (pathname.startsWith('/dashboard/coordinator') && token.role !== 'coordinator' && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    return NextResponse.next();
}