import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import {
    getSitePageRevision,
    getSitePageRevisions,
    restoreSitePageRevision,
} from "@/lib/site-pages";

interface Params {
    params: Promise<{ slug: string }>;
}

const slugSchema = z.literal("about");
const revisionIdSchema = z.string().uuid();
const restoreSchema = z.object({
    revisionId: revisionIdSchema,
    expectedUpdatedAt: z.string().min(1).max(100),
});

export async function GET(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const parsedSlug = slugSchema.safeParse((await params).slug);
    if (!parsedSlug.success) return NextResponse.json({ error: "页面不存在" }, { status: 404 });

    const revisionId = request.nextUrl.searchParams.get("revisionId");
    try {
        if (revisionId !== null) {
            const parsedRevisionId = revisionIdSchema.safeParse(revisionId);
            if (!parsedRevisionId.success) return NextResponse.json({ error: "版本不存在" }, { status: 404 });
            const revision = await getSitePageRevision(parsedSlug.data, parsedRevisionId.data);
            if (!revision) return NextResponse.json({ error: "版本不存在" }, { status: 404 });
            return NextResponse.json(revision);
        }

        return NextResponse.json(await getSitePageRevisions(parsedSlug.data));
    } catch (error) {
        console.error("Failed to load site page revisions:", error);
        return NextResponse.json({ error: "版本历史加载失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":site-page:restore");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    const parsedSlug = slugSchema.safeParse((await params).slug);
    if (!parsedSlug.success) return NextResponse.json({ error: "页面不存在" }, { status: 404 });

    try {
        const parsed = restoreSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });

        const updatedAt = await restoreSitePageRevision(
            parsedSlug.data,
            parsed.data.revisionId,
            parsed.data.expectedUpdatedAt
        );
        if (!updatedAt) {
            return NextResponse.json(
                { error: "页面已被其他会话修改或版本不存在，请刷新后重试" },
                { status: 409 }
            );
        }

        await recordAudit(request, "restore_revision", "site_page", parsedSlug.data, {
            revisionId: parsed.data.revisionId,
        });
        revalidatePath("/me");
        return NextResponse.json({ success: true, updatedAt });
    } catch (error) {
        console.error("Failed to restore site page revision:", error);
        return NextResponse.json({ error: "恢复版本失败" }, { status: 500 });
    }
}
