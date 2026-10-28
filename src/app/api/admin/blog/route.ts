import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getAllBlogPostSummaries } from "@/lib/blog-db";

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const posts = await getAllBlogPostSummaries(true);
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch admin blog posts:", error);
        return NextResponse.json({ error: "加载文章列表失败" }, { status: 500 });
    }
}
