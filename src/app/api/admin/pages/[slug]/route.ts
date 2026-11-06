import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkAuth } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getDefaultSitePage, getSitePage, saveSitePage } from "@/lib/site-pages";

interface Params {
    params: Promise<{ slug: string }>;
}

const slugSchema = z.literal("about");

const sitePageSchema = z.object({
    title: z.string().trim().min(1, "标题不能为空").max(200, "标题过长"),
    description: z.string().trim().max(500, "描述过长").default(""),
    content: z.string().max(100_000, "正文过长").default(""),
    seoTitle: z.string().trim().max(200, "SEO 标题过长").nullable().default(null),
    coverImage: z.string().trim().max(2000, "分享图地址过长").nullable().default(null),
    expectedUpdatedAt: z.string().max(100).default(""),
});

const PUBLIC_PATH_BY_SLUG: Record<string, string> = {
    about: "/me",
};

export async function GET(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const parsedSlug = slugSchema.safeParse((await params).slug);
    if (!parsedSlug.success) return NextResponse.json({ error: "页面不存在" }, { status: 404 });

    try {
        const page = (await getSitePage(parsedSlug.data)) ?? getDefaultSitePage(parsedSlug.data);
        if (!page) return NextResponse.json({ error: "页面不存在" }, { status: 404 });
        return NextResponse.json(page);
    } catch (error) {
        console.error("Failed to load site page:", error);
        return NextResponse.json({ error: "页面内容加载失败，请确认已应用最新数据库迁移" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const authError = await checkAuth(request);
    if (authError) return authError;

    const limit = await rateLimit(getRateLimitKey(request) + ":site-page:save");
    if (!limit.success) return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });

    const parsedSlug = slugSchema.safeParse((await params).slug);
    if (!parsedSlug.success) return NextResponse.json({ error: "页面不存在" }, { status: 404 });

    try {
        const parsed = sitePageSchema.safeParse(await request.json());
        if (!parsed.success) return NextResponse.json({ error: "页面内容不合法" }, { status: 400 });

        const { expectedUpdatedAt, ...input } = parsed.data;
        const updatedAt = await saveSitePage(parsedSlug.data, input, expectedUpdatedAt);
        if (!updatedAt) {
            return NextResponse.json(
                { error: "页面已被其他会话修改，请刷新后重试" },
                { status: 409 }
            );
        }

        await recordAudit(request, "update", "site_page", parsedSlug.data, {
            title: input.title,
        });
        revalidatePath(PUBLIC_PATH_BY_SLUG[parsedSlug.data] ?? "/");
        return NextResponse.json({ success: true, updatedAt });
    } catch (error) {
        console.error("Failed to save site page:", error);
        return NextResponse.json({ error: "保存页面失败" }, { status: 500 });
    }
}
