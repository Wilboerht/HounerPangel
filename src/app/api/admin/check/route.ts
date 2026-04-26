import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = request.cookies.get("admin-session");
    const isAuth = session?.value === "authenticated";
    return NextResponse.json({ authenticated: isAuth });
}
