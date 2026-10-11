import { NextRequest, NextResponse } from "next/server";
import { updateMedItem, softDeleteMedItem } from "@/lib/medicine-db";
import { normalizeExpiry } from "@/lib/medicine";
import { checkAuth } from "@/lib/auth";
import { medItemSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ id: string }>;
}

function parseId(raw: string): number | null {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PUT(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:update");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = parseId((await params).id);
        if (!id) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

        const body = await request.json();
        const parseResult = medItemSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: "输入不合法" }, { status: 400 });
        }

        const { expiry, ...rest } = parseResult.data;
        const normalized = normalizeExpiry(expiry);
        if (!normalized) {
            return NextResponse.json({ error: "效期不合法" }, { status: 400 });
        }

        const updated = await updateMedItem(id, {
            ...rest,
            tradeName: rest.tradeName ?? null,
            spec: rest.spec ?? null,
            dosageForm: rest.dosageForm ?? null,
            category: rest.category ?? null,
            quantity: rest.quantity ?? null,
            openedAt: rest.openedAt ?? null,
            afterOpeningExpiry: rest.afterOpeningExpiry ?? null,
            usageText: rest.usageText ?? null,
            note: rest.note ?? null,
            expiryDate: normalized.date,
            expiryPrecision: normalized.precision,
        });
        if (!updated) {
            return NextResponse.json({ error: "药品不存在" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update med item:", error);
        return NextResponse.json({ error: "更新药品失败" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:delete");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const id = parseId((await params).id);
        if (!id) return NextResponse.json({ error: "ID 不合法" }, { status: 400 });

        const deleted = await softDeleteMedItem(id);
        if (!deleted) {
            return NextResponse.json({ error: "药品不存在" }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete med item:", error);
        return NextResponse.json({ error: "删除药品失败" }, { status: 500 });
    }
}
