import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from "@/lib/blog-db";
import { checkAuth } from "@/lib/auth";
import { verifySessionToken } from "@/lib/session";
import { blogPostUpdateSchema, slugParamSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

async function isAdmin(request: NextRequest): Promise<boolean> {
    const session = request.cookies.get("admin-session");
    if (!session) return false;
    return verifySessionToken(session.value);
}

interface Params {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        const includeUnpublished = await isAdmin(request);
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

    const limit = rateLimit(getRateLimitKey(request) + ":blog:update");
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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":blog:delete");
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
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
