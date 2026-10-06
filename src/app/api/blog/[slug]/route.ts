import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from "@/lib/blog-db";
import { checkAuth, isAdminRequest } from "@/lib/auth";
import { blogPostUpdateSchema, slugParamSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        const includeUnpublished = await isAdminRequest(request);
        const post = await getBlogPostBySlug(slug, includeUnpublished);
        if (!post) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to fetch blog post:", error);
        return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:update");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const body = await request.json();
        const parseResult = blogPostUpdateSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { title, content, date, tags, published } = parseResult.data;

        const updated = await updateBlogPost(slug, {
            title,
            content,
            date,
            tags,
            published,
        });

        if (!updated) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // 刷新该文章详情页和列表页的 ISR 缓存
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);
        revalidatePath("/rss.xml");
        revalidatePath("/sitemap.xml");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:delete");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const parseResult = slugParamSchema.safeParse({ slug });
        if (!parseResult.success) {
            return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
        }
        await deleteBlogPost(slug);

        // 刷新列表页和被删文章详情页的 ISR 缓存（使其变为 404）
        revalidatePath("/blog");
        revalidatePath(`/blog/${slug}`);
        revalidatePath("/rss.xml");
        revalidatePath("/sitemap.xml");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
