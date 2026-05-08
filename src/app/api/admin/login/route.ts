import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
    const limit = rateLimit(getRateLimitKey(request) + ":login");
    if (!limit.success) {
        return NextResponse.json({ error: "Too many attempts, please try again later" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parseResult = loginSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const { password } = parseResult.data;
        const adminPassword = env.ADMIN_PASSWORD;

        if (password !== adminPassword) {
            return NextResponse.json({ error: "密码错误" }, { status: 401 });
        }

        const token = createSessionToken();
        const response = NextResponse.json({ success: true });
        response.cookies.set("admin-session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
