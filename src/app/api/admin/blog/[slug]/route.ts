import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { getBlogPostBySlug } from "@/lib/blog-db";
import { slugParamSchema } from "@/lib/validation";

interface Params {
    params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    try {
        const { slug } = await params;
        const parsed = slugParamSchema.safeParse({ slug });
        if (!parsed.success) {
            return NextResponse.json({ error: "Slug 不合法" }, { status: 400 });
        }

        const post = await getBlogPostBySlug(slug, true);
        if (!post) {
            return NextResponse.json({ error: "文章不存在" }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        console.error("Failed to fetch admin blog post:", error);
        return NextResponse.json({ error: "加载文章失败" }, { status: 500 });
    }
}
