import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlug, updateBlogPost, setBlogPostPublished, deleteBlogPost } from "@/lib/blog-db";
import { checkAuth, isAdminRequest } from "@/lib/auth";
import { blogPostUpdateSchema, blogPostPublishSchema, slugParamSchema } from "@/lib/validation";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";
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
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const slugResult = slugParamSchema.safeParse({ slug });
        if (!slugResult.success) {
            return NextResponse.json({ error: "Slug 不合法" }, { status: 400 });
        }

        const body = await request.json();
        const parseResult = blogPostUpdateSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json({ error: "输入不合法" }, { status: 400 });
        }

        const { title, content, date, tags, published, expectedUpdatedAt } = parseResult.data;

        const updated = await updateBlogPost(slug, {
            title,
            content,
            date,
            tags,
            published,
        }, expectedUpdatedAt);

        if (!updated) {
            return NextResponse.json({ error: "文章已被其他会话修改，请刷新后重试" }, { status: 409 });
        }

        revalidateBlogPaths(slug);

        return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "更新文章失败" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:publish");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const slugResult = slugParamSchema.safeParse({ slug });
        if (!slugResult.success) {
            return NextResponse.json({ error: "Slug 不合法" }, { status: 400 });
        }

        const body = await request.json();
        const parseResult = blogPostPublishSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: "输入不合法" }, { status: 400 });
        }

        const { published, expectedUpdatedAt } = parseResult.data;
        const updatedAt = await setBlogPostPublished(slug, published, expectedUpdatedAt);
        if (!updatedAt) {
            return NextResponse.json({ error: "文章已被其他会话修改，请刷新后重试" }, { status: 409 });
        }

        revalidateBlogPaths(slug);
        return NextResponse.json({ success: true, updatedAt });
    } catch (error) {
        console.error("Failed to update publish status:", error);
        return NextResponse.json({ error: "更新发布状态失败" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":blog:delete");
    if (!limit.success) {
        return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const parseResult = slugParamSchema.safeParse({ slug });
        if (!parseResult.success) {
            return NextResponse.json({ error: "Slug 不合法" }, { status: 400 });
        }
        await deleteBlogPost(slug);

        revalidateBlogPaths(slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "删除文章失败" }, { status: 500 });
    }
}
