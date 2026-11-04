import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { deleteCity, updateCity } from "@/lib/cities";
import { citySchema } from "../route";
import { recordAudit } from "@/lib/audit";

interface Params { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const { id } = await params;
        const parsedId = z.string().uuid().safeParse(id);
        const parsed = citySchema.safeParse(await request.json());
        if (!parsedId.success || !parsed.success) return NextResponse.json({ error: "城市信息不合法" }, { status: 400 });
        if (!(await updateCity(id, parsed.data))) return NextResponse.json({ error: "城市不存在" }, { status: 404 });
        await recordAudit(request, "update", "city", id, { name: parsed.data.name });
        revalidatePath("/map");
        return NextResponse.json({ success: true });
    } catch (error) { console.error("Failed to update city:", error); return NextResponse.json({ error: "保存城市失败，名称可能已存在" }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const { id } = await params;
        if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "城市 ID 不合法" }, { status: 400 });
        if (!(await deleteCity(id))) return NextResponse.json({ error: "城市不存在" }, { status: 404 });
        await recordAudit(request, "delete", "city", id);
        revalidatePath("/map");
        return NextResponse.json({ success: true });
    } catch (error) { console.error("Failed to delete city:", error); return NextResponse.json({ error: "删除城市失败" }, { status: 500 }); }
}
