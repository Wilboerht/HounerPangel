import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { purgeBlogPost, restoreBlogPost } from "@/lib/blog-db";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";
import { blogPostVersionSchema, slugParamSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

interface Params {
    params: Promise<{ slug: string }>;
}

async function parseRequest(request: NextRequest, slug: string) {
    const parsedSlug = slugParamSchema.safeParse({ slug });
    const parsedBody = blogPostVersionSchema.safeParse(await request.json());
    if (!parsedSlug.success || !parsedBody.success) return null;
    return parsedBody.data;
}

export async function POST(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:restore");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const { slug } = await params;
        const body = await parseRequest(request, slug);
        if (!body) return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });

        const updatedAt = await restoreBlogPost(slug, body.expectedUpdatedAt);
        if (!updatedAt) return NextResponse.json({ error: "文章已被修改或恢复，请刷新后重试" }, { status: 409 });

        await recordAudit(request, "restore", "blog_post", slug);
        revalidateBlogPaths(slug);
        return NextResponse.json({ success: true, updatedAt });
    } catch (error) {
        console.error("Failed to restore blog post:", error);
        return NextResponse.json({ error: "恢复文章失败" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:purge");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const { slug } = await params;
        const body = await parseRequest(request, slug);
        if (!body) return NextResponse.json({ error: "请求参数不合法" }, { status: 400 });

        const deleted = await purgeBlogPost(slug, body.expectedUpdatedAt);
        if (!deleted) return NextResponse.json({ error: "文章已被修改或删除，请刷新后重试" }, { status: 409 });

        await recordAudit(request, "purge", "blog_post", slug);
        revalidateBlogPaths(slug);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to purge blog post:", error);
        return NextResponse.json({ error: "彻底删除失败" }, { status: 500 });
    }
}
