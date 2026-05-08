import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from "@/lib/blog-db";
import { checkAuth } from "@/lib/auth";
import { blogPostUpdateSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

interface Params {
    params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        const post = await getBlogPostBySlug(slug);
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
    const authError = checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":blog:update");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const { slug } = await params;
        const body = await request.json();
        const parseResult = blogPostUpdateSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const { title, excerpt, content, date, tags } = parseResult.data;

        await updateBlogPost(slug, {
            slug,
            title,
            excerpt,
            content,
            date,
            tags,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = checkAuth(request);
    if (authError) return authError;

    try {
        const { slug } = await params;
        await deleteBlogPost(slug);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
