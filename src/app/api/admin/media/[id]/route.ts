import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { deleteMediaAsset, updateMediaAsset } from "@/lib/media";
import { recordAudit } from "@/lib/audit";

interface Params {
    params: Promise<{ id: string }>;
}

const updateSchema = z.object({ alt: z.string().max(500), caption: z.string().max(1000) });

export async function PATCH(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const { id } = await params;
        const parsedId = z.string().uuid().safeParse(id);
        const parsedBody = updateSchema.safeParse(await request.json());
        if (!parsedId.success || !parsedBody.success) return NextResponse.json({ error: "参数不合法" }, { status: 400 });
        await updateMediaAsset(id, parsedBody.data.alt, parsedBody.data.caption);
        await recordAudit(request, "update", "media", id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update media:", error);
        return NextResponse.json({ error: "保存媒体信息失败" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    try {
        const { id } = await params;
        const validId = z.string().uuid().safeParse(id).success || /^blog\/[a-zA-Z0-9-]+\.[a-z0-9]+$/.test(id);
        if (!validId) return NextResponse.json({ error: "媒体 ID 不合法" }, { status: 400 });
        const result = await deleteMediaAsset(id);
        if (result === "missing") return NextResponse.json({ error: "媒体记录不存在" }, { status: 404 });
        if (result === "in-use") return NextResponse.json({ error: "媒体仍被文章或历史版本引用，不能删除" }, { status: 409 });
        await recordAudit(request, "delete", "media", id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete media:", error);
        return NextResponse.json({ error: "删除媒体失败" }, { status: 500 });
    }
}
