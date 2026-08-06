import { NextRequest, NextResponse } from "next/server";
import { getAllBlogPosts, createBlogPost, getBlogPostBySlug } from "@/lib/blog-db";
import { checkAuth } from "@/lib/auth";
import { verifySessionToken } from "@/lib/session";
import { blogPostSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

function isAdmin(request: NextRequest): boolean {
    const session = request.cookies.get("admin-session");
    if (!session) return false;
    return verifySessionToken(session.value);
}

export async function GET(request: NextRequest) {
    try {
        const includeUnpublished = isAdmin(request);
        const posts = await getAllBlogPosts(includeUnpublished);
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch blog posts:", error);
        return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const authError = checkAuth(request);
    if (authError) return authError;

    const limit = rateLimit(getRateLimitKey(request) + ":blog:create");
    if (!limit.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parseResult = blogPostSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: parseResult.error.issues },
                { status: 400 }
            );
        }

        const { slug, title, content, date, tags, published } = parseResult.data;

        const existing = await getBlogPostBySlug(slug);
        if (existing) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        await createBlogPost({
            slug,
            title,
            content,
            date,
            tags,
            published,
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
