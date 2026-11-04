import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { createCity, getCities } from "@/lib/cities";
import { recordAudit } from "@/lib/audit";

export const citySchema = z.object({
    name: z.string().trim().min(1).max(100),
    coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
    status: z.enum(["visited", "planned"]),
    visitDate: z.string().regex(/^\d{4}-\d{2}$/).refine((value) => Number(value.slice(5)) >= 1 && Number(value.slice(5)) <= 12, "月份不合法").nullable().default(null),
    note: z.string().max(1000).nullable().default(null),
});

export const cityVersionSchema = z.object({ expectedUpdatedAt: z.string().min(1) });

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try { return NextResponse.json(await getCities()); }
    catch (error) { console.error("Failed to load cities:", error); return NextResponse.json({ error: "加载足迹失败" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const parsed = citySchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "城市信息不合法" }, { status: 400 });
        await createCity(parsed.data);
        await recordAudit(request, "create", "city", parsed.data.name);
        revalidatePath("/map");
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create city:", error);
        return NextResponse.json({ error: "新增城市失败，名称可能已存在" }, { status: 500 });
    }
}
