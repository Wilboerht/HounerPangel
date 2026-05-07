import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function GET(request: NextRequest) {
    const session = request.cookies.get("admin-session");
    const isAuth = session ? verifySessionToken(session.value) : false;
    return NextResponse.json({ authenticated: isAuth });
}
