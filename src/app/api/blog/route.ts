import { NextRequest, NextResponse } from "next/server";
import { getAllBlogPosts, createBlogPost } from "@/lib/blog-db";
import { checkAuth } from "@/lib/auth";
import { blogPostSchema } from "@/lib/validation";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET() {
    try {
        const posts = await getAllBlogPosts();
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

        const { slug, title, excerpt, content, date, tags } = parseResult.data;

        await createBlogPost({
            slug,
            title,
            excerpt,
            content,
            date,
            tags,
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
