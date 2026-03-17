import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAdmin = pathname.startsWith('/admin');

    // Admin Security: Simple session check
    if (isAdmin && pathname !== '/admin/login') {
        const session = request.cookies.get('admin-session');
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
