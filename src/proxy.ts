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

    if (pathname.startsWith("/admin/blog/edit/")) {
        const session = request.cookies.get("admin-session");
        if (!session) {
            return NextResponse.redirect(new URL("/blog", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/api/admin/:path*"],
};
