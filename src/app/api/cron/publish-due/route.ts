import { NextRequest, NextResponse } from "next/server";
import { publishDueBlogPosts } from "@/lib/blog-admin";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
        return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    try {
        const slugs = await publishDueBlogPosts();
        for (const slug of slugs) revalidateBlogPaths(slug);
        return NextResponse.json({ published: slugs.length, slugs });
    } catch (error) {
        console.error("Failed to publish scheduled posts:", error);
        return NextResponse.json({ error: "定时发布执行失败" }, { status: 500 });
    }
}
