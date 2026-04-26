import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    // Admin pages are no longer protected by middleware.
    // Authentication is handled client-side via modal on the blog page.
    // API routes have their own auth checks.
    return NextResponse.next();
}

export const config = {
    matcher: [],
};
