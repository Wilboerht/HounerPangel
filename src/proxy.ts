import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_API = ["/api/admin/login", "/api/admin/logout"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // First line of defense only: check cookie presence here. The real
    // token validation happens in the API routes (proxy runs in a restricted
    // runtime and cannot access the database).
    // Admin pages are intentionally NOT guarded here: they validate the
    // session server-side and render a login form in place when unauthenticated.
    // Redirecting them would create a /admin -> /admin/blog -> /admin redirect loop.
    if (pathname.startsWith("/api/admin/") && !PUBLIC_API.includes(pathname)) {
        const session = request.cookies.get("admin-session");
        if (!session) {
            return NextResponse.json({ error: "未登录或会话已过期" }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/api/admin/:path*"],
};
