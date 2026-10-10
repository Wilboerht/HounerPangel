import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAllBlogPostSummaries, createBlogPost } from "@/lib/blog-db";
import { checkAuth, isAdminRequest } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

function isUniqueViolation(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

export async function GET(request: NextRequest) {
    try {
        const includeUnpublished = await isAdminRequest(request);
        const posts = await getAllBlogPostSummaries(includeUnpublished);
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:create");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parseResult = blogPostSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: "输入不合法" }, { status: 400 });
        }

        const { slug, title, content, date, tags, published } = parseResult.data;

        try {
            // Rely on the database unique constraint for slug conflicts (TOCTOU-safe)
            await createBlogPost({
                slug,
                title,
                content,
                date,
                tags,
                published,
            });
        } catch (error) {
            if (isUniqueViolation(error)) {
                return NextResponse.json({ error: "Slug 已存在" }, { status: 409 });
            }
            throw error;
        }

        // 新建文章后立即刷新博客列表页的 ISR 缓存
        revalidatePath("/blog");
        revalidatePath("/rss.xml");
        revalidatePath("/sitemap.xml");

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "创建文章失败" }, { status: 500 });
    }
}
