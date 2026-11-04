import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { listMediaAssets, registerMediaAsset } from "@/lib/media";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";

const registerSchema = z.object({
    path: z.string().max(1000).regex(/^blog\/[a-zA-Z0-9-]+\.[a-z0-9]+$/),
    fileName: z.string().min(1).max(500),
    kind: z.enum(["image", "video", "attachment"]),
    mimeType: z.string().min(1).max(200),
    size: z.number().int().min(1).max(100 * 1024 * 1024),
    width: z.number().int().min(1).max(100000).nullable().default(null),
    height: z.number().int().min(1).max(100000).nullable().default(null),
    alt: z.string().max(500).default(""),
    caption: z.string().max(1000).default(""),
});

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        return NextResponse.json(await listMediaAssets());
    } catch (error) {
        console.error("Failed to list media:", error);
        return NextResponse.json({ error: "加载媒体库失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    const limit = await rateLimit(getRateLimitKey(request) + ":media:register");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const parsed = registerSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "媒体元数据不合法" }, { status: 400 });
        await registerMediaAsset(parsed.data);
        await recordAudit(request, "create", "media", parsed.data.path, { size: parsed.data.size, kind: parsed.data.kind });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to register media:", error);
        return NextResponse.json({ error: "登记媒体失败" }, { status: 500 });
    }
}
