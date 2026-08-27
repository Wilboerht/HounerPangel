import { NextRequest, NextResponse } from "next/server";
import { revokeSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
    // Revoke the server-side session before clearing the cookie
    const session = request.cookies.get("admin-session");
    if (session) {
        try {
            await revokeSessionToken(session.value);
        } catch (error) {
            console.error("Failed to revoke session:", error);
        }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin-session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 0,
        path: "/",
    });
    return response;
}
