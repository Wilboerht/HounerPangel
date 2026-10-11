import { NextRequest, NextResponse } from "next/server";
import { deleteMedLocation } from "@/lib/medicine-db";
import { checkAuth } from "@/lib/auth";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:location:delete");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = Number((await params).id);
        if (!Number.isInteger(id) || id <= 0) {
            return NextResponse.json({ error: "ID 不合法" }, { status: 400 });
        }

        const result = await deleteMedLocation(id);
        if (result === "referenced") {
            return NextResponse.json({ error: "该位置下还有药品，请先迁走" }, { status: 409 });
        }
        if (result === "has-children") {
            return NextResponse.json({ error: "该房间下还有容器，请先删除容器" }, { status: 409 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete med location:", error);
        return NextResponse.json({ error: "删除位置失败" }, { status: 500 });
    }
}
