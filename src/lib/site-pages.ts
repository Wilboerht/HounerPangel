import "server-only";

import { supabase } from "./supabase";
import { SITE_PAGE_REVISION_LIMIT } from "./site-page-config";
import type {
    SitePage,
    SitePageContent,
    SitePageRevision,
    SitePageRevisionSummary,
} from "./types/site-page";

// 注意：这段兜底文案与 supabase/migrations/20261106000000_site_pages.sql、
// supabase/reset.sql 中的 about 种子数据保持一致；修改时请同步三处。
export const DEFAULT_ABOUT_PAGE: SitePage = {
    slug: "about",
    title: "关于我",
    description: "了解 Hank Wong (wilboerht) —— 开发者、旅行爱好者及超级个体。",
    content: [
        "嗨，欢迎访达我的主页，很高兴能在互联网的茫茫大海里与你相遇。",
        "我喜欢科技、旅行、美食和户外运动，也是 city walk 轻度爱好者。已经走遍了 20 余个城市，并用相机记录下了许多美好的瞬间，你可以查看我的社交平台账号，希望能与你分享这些美好。",
        "Genius programmer @ Vanto & @ Moidas.",
    ].join("\n\n"),
    seoTitle: null,
    coverImage: null,
    updatedAt: "",
};

const PAGE_COLUMNS = "slug, title, description, content, seo_title, cover_image, updated_at";
const REVISION_SUMMARY_COLUMNS = "id, page_slug, title, source_updated_at, created_at";
const REVISION_COLUMNS = "id, page_slug, title, description, content, seo_title, cover_image, source_updated_at, created_at";

function isMissingTable(error: unknown) {
    if (typeof error !== "object" || error === null || !("code" in error)) return false;
    const code = (error as { code?: unknown }).code;
    return code === "42P01" || code === "PGRST205";
}

function isMissingColumn(error: unknown) {
    return typeof error === "object" && error !== null && "code" in error &&
        (error as { code?: unknown }).code === "42703";
}

function mapPage(row: Record<string, unknown>): SitePage {
    return {
        slug: row.slug as string,
        title: row.title as string,
        description: (row.description as string | null) ?? "",
        content: (row.content as string | null) ?? "",
        seoTitle: (row.seo_title as string | null) ?? null,
        coverImage: (row.cover_image as string | null) ?? null,
        updatedAt: row.updated_at as string,
    };
}

function mapRevisionSummary(row: Record<string, unknown>): SitePageRevisionSummary {
    return {
        id: row.id as string,
        pageSlug: row.page_slug as string,
        title: row.title as string,
        updatedAt: row.source_updated_at as string,
        createdAt: row.created_at as string,
    };
}

function mapRevision(row: Record<string, unknown>): SitePageRevision {
    return {
        ...mapRevisionSummary(row),
        description: (row.description as string | null) ?? "",
        content: (row.content as string | null) ?? "",
        seoTitle: (row.seo_title as string | null) ?? null,
        coverImage: (row.cover_image as string | null) ?? null,
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
        seo_title: input.seoTitle?.trim() || null,
        cover_image: input.coverImage?.trim() || null,
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
    if (data?.updated_at) await pruneSitePageRevisions(slug);
    return data?.updated_at ?? null;
}

// 版本历史是有限的恢复窗口：只保留最近 N 个快照，避免内容、媒体引用无限增长。
// 清理失败不阻断保存（例如历史表迁移尚未执行）。
async function pruneSitePageRevisions(slug: string): Promise<void> {
    try {
        for (let batch = 0; batch < 10; batch += 1) {
            const { data, error } = await supabase
                .from("site_page_revisions")
                .select("id")
                .eq("page_slug", slug)
                .order("created_at", { ascending: false })
                .order("id", { ascending: true })
                .range(SITE_PAGE_REVISION_LIMIT, SITE_PAGE_REVISION_LIMIT + 999);
            if (error) throw error;
            if (!data || data.length === 0) return;
            const { error: deleteError } = await supabase
                .from("site_page_revisions")
                .delete()
                .in("id", data.map((row) => row.id));
            if (deleteError) throw deleteError;
            if (data.length < 1000) return;
        }
    } catch (error) {
        if (!isMissingTable(error)) {
            console.error("Failed to prune site page revisions:", error);
        }
    }
}

export async function getSitePageRevisions(slug: string): Promise<SitePageRevisionSummary[]> {
    const { data, error } = await supabase
        .from("site_page_revisions")
        .select(REVISION_SUMMARY_COLUMNS)
        .eq("page_slug", slug)
        .order("created_at", { ascending: false })
        .limit(SITE_PAGE_REVISION_LIMIT);
    if (error) throw error;
    return (data ?? []).map(mapRevisionSummary);
}

export async function getSitePageRevision(
    slug: string,
    revisionId: string
): Promise<SitePageRevision | null> {
    const { data, error } = await supabase
        .from("site_page_revisions")
        .select(REVISION_COLUMNS)
        .eq("page_slug", slug)
        .eq("id", revisionId)
        .maybeSingle();
    if (error) throw error;
    return data ? mapRevision(data) : null;
}

export async function restoreSitePageRevision(
    slug: string,
    revisionId: string,
    expectedUpdatedAt: string
): Promise<string | null> {
    const revision = await getSitePageRevision(slug, revisionId);
    if (!revision) return null;
    return saveSitePage(slug, revision, expectedUpdatedAt);
}

// 备份导出用。迁移尚未执行时返回空列表，避免旧环境无法导出博客备份。
export async function getAllSitePages(): Promise<SitePage[]> {
    try {
        const { data, error } = await supabase
            .from("site_pages")
            .select(PAGE_COLUMNS)
            .order("slug", { ascending: true });
        if (error) throw error;
        return (data ?? []).map(mapPage);
    } catch (error) {
        if (isMissingTable(error)) return [];
        if (!isMissingColumn(error)) throw error;
        // SEO 迁移尚未执行时仍允许导出当前页面内容
        const { data, error: fallbackError } = await supabase
            .from("site_pages")
            .select("slug, title, description, content, updated_at")
            .order("slug", { ascending: true });
        if (fallbackError) throw fallbackError;
        return (data ?? []).map(mapPage);
    }
}

// 备份恢复用：显式覆盖现有页面（触发器会先保存当前内容的快照）。
export async function importSitePage(page: SitePageContent & { slug: string }): Promise<void> {
    const { error } = await supabase
        .from("site_pages")
        .upsert({ slug: page.slug, ...values(page) }, { onConflict: "slug" });
    if (error) throw error;
    await pruneSitePageRevisions(page.slug);
}
