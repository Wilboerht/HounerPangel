import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./session";

export async function checkAuth(request: NextRequest): Promise<NextResponse | null> {
    const session = request.cookies.get("admin-session");
    if (!session || !(await verifySessionToken(session.value))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return null;
}
