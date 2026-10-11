import { NextRequest, NextResponse } from "next/server";
import { listMedItems, createMedItem } from "@/lib/medicine-db";
import { normalizeExpiry } from "@/lib/medicine";
import { checkAuth } from "@/lib/auth";
import { medItemSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const trash = request.nextUrl.searchParams.get("trash") === "1";
        const items = await listMedItems(trash);
        return NextResponse.json(items);
    } catch (error) {
        console.error("Failed to fetch med items:", error);
        return NextResponse.json({ error: "加载药品列表失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:create");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
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

        const id = await createMedItem({
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

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error("Failed to create med item:", error);
        return NextResponse.json({ error: "创建药品失败" }, { status: 500 });
    }
}
