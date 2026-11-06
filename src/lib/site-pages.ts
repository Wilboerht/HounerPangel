import "server-only";

import { supabase } from "./supabase";
import type { SitePage, SitePageContent } from "./types/site-page";

export const DEFAULT_ABOUT_PAGE: SitePage = {
    slug: "about",
    title: "关于我",
    description: "了解 Hank Wong (wilboerht) —— 开发者、旅行爱好者及超级个体。",
    content: [
        "嗨，欢迎访达我的主页，很高兴能在互联网的茫茫大海里与你相遇。",
        "我喜欢科技、旅行、美食和户外运动，也是 city walk 轻度爱好者。已经走遍了 20 余个城市，并用相机记录下了许多美好的瞬间，你可以查看我的社交平台账号，希望能与你分享这些美好。",
        "Genius programmer @ Vanto & @ Moidas.",
    ].join("\n\n"),
    updatedAt: "",
};

const PAGE_COLUMNS = "slug, title, description, content, updated_at";

function mapPage(row: Record<string, unknown>): SitePage {
    return {
        slug: row.slug as string,
        title: row.title as string,
        description: (row.description as string | null) ?? "",
        content: (row.content as string | null) ?? "",
        updatedAt: row.updated_at as string,
    };
}

export function getDefaultSitePage(slug: string): SitePage | null {
    return slug === "about" ? DEFAULT_ABOUT_PAGE : null;
}

export async function getSitePage(slug: string): Promise<SitePage | null> {
    const { data, error } = await supabase
        .from("site_pages")
        .select(PAGE_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
    if (error) throw error;
    return data ? mapPage(data) : null;
}

function values(input: SitePageContent) {
    return {
        title: input.title,
        description: input.description,
        content: input.content,
    };
}

// 返回新的 updatedAt；null 表示并发冲突（页面已被其他会话修改）。
// expectedUpdatedAt 为空时只允许插入，避免用默认内容覆盖已存在的页面。
export async function saveSitePage(
    slug: string,
    input: SitePageContent,
    expectedUpdatedAt: string
): Promise<string | null> {
    if (!expectedUpdatedAt) {
        const { data, error } = await supabase
            .from("site_pages")
            .insert({ slug, ...values(input) })
            .select("updated_at")
            .maybeSingle();
        if (error) {
            if (error.code === "23505") return null;
            throw error;
        }
        return data?.updated_at ?? null;
    }

    const { data, error } = await supabase
        .from("site_pages")
        .update(values(input))
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .select("updated_at")
        .maybeSingle();
    if (error) throw error;
    return data?.updated_at ?? null;
}
