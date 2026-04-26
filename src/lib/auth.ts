import { NextRequest, NextResponse } from "next/server";

export function checkAuth(request: NextRequest): NextResponse | null {
    const session = request.cookies.get("admin-session");
    if (!session || session.value !== "authenticated") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
