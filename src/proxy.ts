import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin-session")?.value;

  if (!token || !verifySessionToken(token)) {
    if (pathname.startsWith("/admin")) {
      const blogUrl = new URL("/blog", request.url);
      return NextResponse.redirect(blogUrl);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
