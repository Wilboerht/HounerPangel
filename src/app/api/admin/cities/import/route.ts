import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { importCities } from "@/lib/cities";
import { citySchema } from "../route";
import { recordAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const parsed = z.array(citySchema).min(1).max(1000).safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "CSV 内容不合法，请检查名称、坐标和日期格式" }, { status: 400 });
        await importCities(parsed.data);
        await recordAudit(request, "import", "city", undefined, { count: parsed.data.length });
        revalidatePath("/map");
        return NextResponse.json({ success: true, count: parsed.data.length });
    } catch (error) { console.error("Failed to import cities:", error); return NextResponse.json({ error: "批量导入失败" }, { status: 500 }); }
}
