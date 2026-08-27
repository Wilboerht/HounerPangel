import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_API = ["/api/admin/login", "/api/admin/check", "/api/admin/logout"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/api/admin/") && !PUBLIC_API.includes(pathname)) {
        const session = request.cookies.get("admin-session");
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    // First line of defense only: check cookie presence here. The real
    // token validation happens in the API routes (proxy runs in a restricted
    // runtime and cannot access the database).
    if (pathname.startsWith("/admin/")) {
        const session = request.cookies.get("admin-session");
        if (!session) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
