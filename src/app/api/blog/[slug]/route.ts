import { NextRequest, NextResponse } from "next/server";
import { getBlogPostBySlug, updateBlogPost, deleteBlogPost } from "@/lib/blog-db";

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
    try {
        const { slug } = await params;
        const body = await request.json();
        const { title, excerpt, content, date, tags } = body;

        if (!title || !excerpt || !content || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await updateBlogPost(slug, {
            slug,
            title,
            excerpt,
            content,
            date,
            tags: tags || [],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update blog post:", error);
        return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
    }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    try {
        const { slug } = await params;
        await deleteBlogPost(slug);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete blog post:", error);
        return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
    }
}
