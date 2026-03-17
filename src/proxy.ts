import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase for Proxy (Edge compatible)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Filter out static assets and internal requests
    const isPublicFile = /\.(.*)$/.test(pathname);
    const isNextInternal = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('favicon.ico');
    const isAdmin = pathname.startsWith('/admin');

    // 2. Logging logic - only for actual page views (GET requests)
    if (request.method === 'GET' && !isPublicFile && !isNextInternal && !isAdmin) {
        const host = request.headers.get('host') || 'unknown';
        const url = pathname;
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Background logging
        supabase
            .from('activity_logs')
            .insert([{ 
                url, 
                host, 
                ip, 
                user_agent: userAgent 
            }])
            .then(({ error }) => {
                if (error) {
                    // console.error('Logging error:', error);
                }
            });
    }

    // 3. Admin Security: Simple session check
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
