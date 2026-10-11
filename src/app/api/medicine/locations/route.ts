import { NextRequest, NextResponse } from "next/server";
import { getMedLocations, createMedLocation } from "@/lib/medicine-db";
import { checkAuth } from "@/lib/auth";
import { medLocationSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

function isUniqueViolation(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const locations = await getMedLocations();
        return NextResponse.json(locations);
    } catch (error) {
        console.error("Failed to fetch med locations:", error);
        return NextResponse.json({ error: "加载位置列表失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":medicine:location:create");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parseResult = medLocationSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: "输入不合法" }, { status: 400 });
        }

        const { name, parentId } = parseResult.data;

        // 容器必须挂在已存在的房间下
        if (parentId != null) {
            const locations = await getMedLocations();
            const parent = locations.find((l) => l.id === parentId);
            if (!parent || parent.parentId !== null) {
                return NextResponse.json({ error: "父位置必须是房间" }, { status: 400 });
            }
        }

        try {
            await createMedLocation(name.trim(), parentId ?? null);
        } catch (error) {
            if (isUniqueViolation(error)) {
                return NextResponse.json({ error: "同名位置已存在" }, { status: 409 });
            }
            throw error;
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create med location:", error);
        return NextResponse.json({ error: "创建位置失败" }, { status: 500 });
    }
}
