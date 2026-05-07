import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./session";

export function checkAuth(request: NextRequest): NextResponse | null {
    const session = request.cookies.get("admin-session");
    if (!session || !verifySessionToken(session.value)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
