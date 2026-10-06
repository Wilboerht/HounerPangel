import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./session";

export async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
    const session = request.cookies.get("admin-session");
    if (!session) return false;
    return verifySessionToken(session.value);
}
