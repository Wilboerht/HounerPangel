import { NextRequest, NextResponse } from "next/server";
import { getAllBlogPosts, createBlogPost } from "@/lib/blog-db";

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
    try {
        const body = await request.json();
        const { slug, title, excerpt, content, date, tags } = body;

        if (!slug || !title || !excerpt || !content || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await createBlogPost({
            slug,
            title,
            excerpt,
            content,
            date,
            tags: tags || [],
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error("Failed to create blog post:", error);
        return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
    }
}
