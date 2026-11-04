import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { bulkUpdateBlogPosts } from "@/lib/blog-admin";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { revalidateBlogPaths } from "@/lib/revalidate-blog";
import { recordAudit } from "@/lib/audit";

const bulkSchema = z.object({
    slugs: z.array(z.string().min(1).max(255)).min(1).max(100),
    action: z.enum(["publish", "unpublish", "archive", "unarchive", "delete", "addTags"]),
    tags: z.array(z.string().min(1).max(50)).max(20).default([]),
    expectedUpdatedAt: z.record(z.string(), z.string().min(1)),
});

export async function POST(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;
    const limit = await rateLimit(getRateLimitKey(request) + ":blog:bulk");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    try {
        const parsed = bulkSchema.safeParse(await request.json());
        if (!parsed.success || (parsed.data.action === "addTags" && parsed.data.tags.length === 0)) {
            return NextResponse.json({ error: "批量操作参数不合法" }, { status: 400 });
        }
        const { slugs, action, tags, expectedUpdatedAt } = parsed.data;
        const results = await bulkUpdateBlogPosts(Array.from(new Set(slugs)), action, tags, expectedUpdatedAt);
        await recordAudit(request, "bulk", "blog_post", undefined, { action, slugs, success: results.filter((item) => item.success).length });
        for (const result of results) {
            if (result.success) revalidateBlogPaths(result.slug);
        }
        return NextResponse.json({ success: results.filter((item) => item.success).length, failed: results.filter((item) => !item.success).length, results });
    } catch (error) {
        console.error("Failed to execute bulk blog action:", error);
        return NextResponse.json({ error: "批量操作失败" }, { status: 500 });
    }
}
