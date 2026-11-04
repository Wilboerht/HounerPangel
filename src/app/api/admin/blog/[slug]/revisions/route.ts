import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { getBlogRevision, getBlogRevisionSummaries, restoreBlogRevision } from "@/lib/blog-revisions";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { revisionRestoreSchema, slugParamSchema } from "@/lib/validation";

interface Params {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const { slug } = await params;
        const parsed = slugParamSchema.safeParse({ slug });
        if (!parsed.success) return NextResponse.json({ error: "Slug 不合法" }, { status: 400 });

        const revisionId = request.nextUrl.searchParams.get("revisionId");
        if (revisionId) {
            if (!z.string().uuid().safeParse(revisionId).success) {
                return NextResponse.json({ error: "版本 ID 不合法" }, { status: 400 });
            }
            const revision = await getBlogRevision(slug, revisionId);
            if (!revision) return NextResponse.json({ error: "版本不存在" }, { status: 404 });
            return NextResponse.json(revision);
        }

        const revisions = await getBlogRevisionSummaries(slug);
        if (!revisions) return NextResponse.json({ error: "文章不存在" }, { status: 404 });
        return NextResponse.json(revisions);
    } catch (error) {
        console.error("Failed to load blog revisions:", error);
        return NextResponse.json({ error: "加载版本历史失败" }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:restore-revision");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const { slug } = await params;
        const parsedSlug = slugParamSchema.safeParse({ slug });
        const parsedBody = revisionRestoreSchema.safeParse(await request.json());
        if (!parsedSlug.success || !parsedBody.success) {
            return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });
        }

        const { revisionId, expectedUpdatedAt } = parsedBody.data;
        const revision = await getBlogRevision(slug, revisionId);
        if (!revision) return NextResponse.json({ error: "版本不存在" }, { status: 404 });

        const restored = await restoreBlogRevision(revision, expectedUpdatedAt);
        if (!restored) {
            return NextResponse.json({ error: "文章已被其他会话修改，请刷新后重试" }, { status: 409 });
        }
        revalidateBlogPaths(slug);
        return NextResponse.json({ success: true, updatedAt: restored.updatedAt });
    } catch (error) {
        console.error("Failed to restore blog revision:", error);
        return NextResponse.json({ error: "恢复版本失败" }, { status: 500 });
    }
}
