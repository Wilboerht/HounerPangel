import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { queryBlogPostSummaries } from "@/lib/blog-admin";

const querySchema = z.object({
    search: z.string().max(200).default(""),
    status: z.enum(["all", "published", "draft", "archived"]).default("all"),
    tag: z.string().max(50).default(""),
    sort: z.enum(["date", "updated"]).default("date"),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
        if (!parsed.success) return NextResponse.json({ error: "查询参数不合法" }, { status: 400 });
        const result = await queryBlogPostSummaries(parsed.data);
        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch admin blog posts:", error);
        return NextResponse.json({ error: "加载文章列表失败" }, { status: 500 });
    }
}
