import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { deleteCity, updateCity } from "@/lib/cities";
import { citySchema, cityVersionSchema } from "../route";
import { recordAudit } from "@/lib/audit";

interface Params { params: Promise<{ id: string }> }

const updateSchema = citySchema.extend(cityVersionSchema.shape);

export async function PUT(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const { id } = await params;
        const parsedId = z.string().uuid().safeParse(id);
        const parsed = updateSchema.safeParse(await request.json());
        if (!parsedId.success || !parsed.success) return NextResponse.json({ error: "城市信息不合法" }, { status: 400 });
        const { expectedUpdatedAt, ...input } = parsed.data;
        if (!(await updateCity(id, input, expectedUpdatedAt))) return NextResponse.json({ error: "城市已被其他会话修改或不存在，请刷新后重试" }, { status: 409 });
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
        const parsedId = z.string().uuid().safeParse(id);
        const parsedBody = cityVersionSchema.safeParse(await request.json());
        if (!parsedId.success || !parsedBody.success) return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });
        if (!(await deleteCity(id, parsedBody.data.expectedUpdatedAt))) return NextResponse.json({ error: "城市已被其他会话修改或不存在，请刷新后重试" }, { status: 409 });
        await recordAudit(request, "delete", "city", id);
        revalidatePath("/map");
        return NextResponse.json({ success: true });
    } catch (error) { console.error("Failed to delete city:", error); return NextResponse.json({ error: "删除城市失败" }, { status: 500 }); }
}
