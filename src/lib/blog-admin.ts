import "server-only";

import { supabase } from "./supabase";
import type { BlogPostSummary } from "./types/blog";

const SUMMARY_COLUMNS = "slug, title, date, updated_at, tags, published, deleted_at, scheduled_at, published_at, archived_at, excerpt, seo_title, seo_description, cover_image";

export interface BlogListQuery {
    search: string;
    status: "all" | "published" | "draft" | "scheduled" | "archived";
    tag: string;
    sort: "date" | "updated";
    page: number;
    pageSize: number;
}

function mapSummary(row: Record<string, unknown>): BlogPostSummary {
    return {
        slug: row.slug as string,
        title: row.title as string,
        date: row.date as string,
        updatedAt: row.updated_at as string,
        tags: (row.tags as string[] | null) ?? [],
        published: Boolean(row.published),
        deletedAt: row.deleted_at as string | null,
        scheduledAt: row.scheduled_at as string | null,
        publishedAt: row.published_at as string | null,
        archivedAt: row.archived_at as string | null,
        excerpt: row.excerpt as string | null,
        seoTitle: row.seo_title as string | null,
        seoDescription: row.seo_description as string | null,
        coverImage: row.cover_image as string | null,
    };
}

export async function queryBlogPostSummaries(options: BlogListQuery) {
    let query = supabase
        .from("blog_posts")
        .select(SUMMARY_COLUMNS, { count: "exact" })
        .is("deleted_at", null);

    if (options.status === "published") query = query.eq("published", true).is("archived_at", null);
    if (options.status === "draft") query = query.eq("published", false).is("scheduled_at", null).is("archived_at", null);
    if (options.status === "scheduled") query = query.eq("published", false).not("scheduled_at", "is", null).is("archived_at", null);
    if (options.status === "archived") query = query.not("archived_at", "is", null);
    if (options.tag) query = query.contains("tags", [options.tag]);
    if (options.search) {
        const search = options.search.replace(/[%(),]/g, " ").trim();
        if (search) query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const from = (options.page - 1) * options.pageSize;
    const { data, error, count } = await query
        .order(options.sort === "updated" ? "updated_at" : "date", { ascending: false })
        .range(from, from + options.pageSize - 1);
    if (error) throw error;

    const { data: tagRows, error: tagError } = await supabase
        .from("blog_posts")
        .select("tags")
        .is("deleted_at", null);
    if (tagError) throw tagError;

    return {
        items: (data || []).map((row) => mapSummary(row)),
        total: count ?? 0,
        page: options.page,
        pageSize: options.pageSize,
        tags: Array.from(new Set((tagRows || []).flatMap((row) => row.tags ?? []))).sort((a, b) => a.localeCompare(b, "zh-CN")),
    };
}

export type BlogBulkAction = "publish" | "unpublish" | "archive" | "unarchive" | "delete" | "addTags";

export async function bulkUpdateBlogPosts(slugs: string[], action: BlogBulkAction, tags: string[] = []) {
    const results: { slug: string; success: boolean; error?: string }[] = [];
    for (const slug of slugs) {
        try {
            let values: Record<string, unknown>;
            if (action === "publish") {
                values = { published: true, scheduled_at: null, archived_at: null, published_at: new Date().toISOString() };
            } else if (action === "unpublish") {
                values = { published: false, scheduled_at: null, archived_at: null, published_at: null };
            } else if (action === "archive") {
                values = { published: false, scheduled_at: null, archived_at: new Date().toISOString(), published_at: null };
            } else if (action === "unarchive") {
                values = { archived_at: null };
            } else if (action === "delete") {
                values = { deleted_at: new Date().toISOString() };
            } else {
                const { data, error } = await supabase.from("blog_posts").select("tags").eq("slug", slug).is("deleted_at", null).single();
                if (error) throw error;
                values = { tags: Array.from(new Set([...(data.tags ?? []), ...tags])).slice(0, 20) };
            }
            const { data, error } = await supabase
                .from("blog_posts")
                .update(values)
                .eq("slug", slug)
                .is("deleted_at", null)
                .select("slug")
                .maybeSingle();
            if (error) throw error;
            results.push({ slug, success: data !== null });
        } catch (error) {
            console.error(`Bulk blog action ${action} failed for ${slug}:`, error);
            results.push({ slug, success: false, error: "数据库操作失败" });
        }
    }
    return results;
}

export async function publishDueBlogPosts(): Promise<string[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("published", false)
        .is("deleted_at", null)
        .is("archived_at", null)
        .not("scheduled_at", "is", null)
        .lte("scheduled_at", new Date().toISOString())
        .limit(200);
    if (error) throw error;
    if (!data || data.length === 0) return [];

    const slugs = data.map((row) => row.slug);
    const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
            published: true,
            published_at: new Date().toISOString(),
            scheduled_at: null,
        })
        .in("slug", slugs)
        .eq("published", false)
        .is("deleted_at", null)
        .is("archived_at", null)
        .lte("scheduled_at", new Date().toISOString());
    if (updateError) throw updateError;
    return slugs;
}
