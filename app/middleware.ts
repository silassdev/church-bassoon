import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // public paths
    if (['/api/auth/register', '/api/auth/verify', '/auth', '/auth/signin', '/api/posts/preview'].some(p => pathname.startsWith(p))) return NextResponse.next();

    if (!token) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
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

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/admin/:path*',
        '/api/posts/:path*',
        /* We can be specific, or just let middleware run and handle "public" paths inside. 
           But current logic redirects everything else to signin.
           For correct API behavior with 401 instead of 307, we should handle API paths differently or exclude them if they handle their own auth.
        */
    ]
};