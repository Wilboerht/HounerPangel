import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { createSessionToken } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";

function passwordsMatch(password: string, adminPassword: string): boolean {
    // Hash both sides so timingSafeEqual never leaks length information
    const passwordHash = createHash("sha256").update(password).digest();
    const adminHash = createHash("sha256").update(adminPassword).digest();
    return timingSafeEqual(passwordHash, adminHash);
}

export async function POST(request: NextRequest) {
    const limit = rateLimit(getRateLimitKey(request) + ":login");
    if (!limit.success) {
        return NextResponse.json({ error: "Too many attempts, please try again later" }, { status: 429 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    try {
        const parseResult = loginSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { password } = parseResult.data;

        if (!passwordsMatch(password, env.ADMIN_PASSWORD)) {
            return NextResponse.json({ error: "密码错误" }, { status: 401 });
        }

        const token = await createSessionToken();
        const response = NextResponse.json({ success: true });
        response.cookies.set("admin-session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return response;
    } catch (error) {
        console.error("Login failed:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
