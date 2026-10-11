import { NextRequest, NextResponse } from "next/server";
import { purgeMedItem } from "@/lib/medicine-db";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:purge");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = Number((await params).id);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ error: "ID 不合法" }, { status: 400 });
        }

        const purged = await purgeMedItem(id);
        if (!purged) {
            return NextResponse.json({ error: "药品不存在或不在回收站" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to purge med item:", error);
        return NextResponse.json({ error: "彻底删除失败" }, { status: 500 });
    }
}
