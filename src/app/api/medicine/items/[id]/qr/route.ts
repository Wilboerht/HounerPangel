import { NextRequest, NextResponse } from "next/server";
import { ensureQrToken, revokeQrToken } from "@/lib/medicine-db";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// 生成（或取回）二维码 token；二维码内容 = <站点>/q/{token}
export async function POST(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:qr");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = parseId((await params).id);
        if (!id) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

        const token = await ensureQrToken(id);
        if (!token) return NextResponse.json({ error: "药品不存在" }, { status: 404 });
        return NextResponse.json({ token });
    } catch (error) {
        console.error("Failed to create qr token:", error);
        return NextResponse.json({ error: "生成二维码失败" }, { status: 500 });
    }
}

// 撤销：旧标签扫码将提示"二维码已失效"
export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:qr");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = parseId((await params).id);
        if (!id) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

        await revokeQrToken(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to revoke qr token:", error);
        return NextResponse.json({ error: "撤销二维码失败" }, { status: 500 });
    }
}
