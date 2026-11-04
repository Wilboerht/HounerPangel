import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getTrashBlogPostSummaries } from "@/lib/blog-db";

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const posts = await getTrashBlogPostSummaries();
        return NextResponse.json(posts);
    } catch (error) {
        console.error("Failed to fetch blog trash:", error);
        return NextResponse.json({ error: "加载回收站失败" }, { status: 500 });
    }
}
