import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { BlogPost, BlogPostSummary } from "./types/blog";
import { env } from "./env";

const POST_COLUMNS = "slug, title, content, date, updated_at, tags, published, deleted_at";
const SUMMARY_COLUMNS = "slug, title, date, updated_at, tags, published, deleted_at";

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

function mapPost<T extends { updated_at: string; deleted_at: string | null; tags: string[] | null; published: boolean | null }>(row: T) {
    return {
        ...row,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
        tags: row.tags ?? [],
        published: row.published ?? false,
    };
}

export async function getAllBlogPosts(includeUnpublished = false): Promise<BlogPost[]> {
    let query = supabase
        .from("blog_posts")
        .select(POST_COLUMNS)
        .is("deleted_at", null)
        .order("date", { ascending: false });

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapPost);
}

// RSS 等场景只需要最新 N 篇：在数据库侧 limit，避免全表传输后再截断
export async function getRecentBlogPosts(limit: number): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select(POST_COLUMNS)
        .eq("published", true)
        .is("deleted_at", null)
        .order("date", { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data || []).map(mapPost);
}

export async function getAllBlogPostSummaries(includeUnpublished = false): Promise<BlogPostSummary[]> {
    let query = supabase
        .from("blog_posts")
        .select(SUMMARY_COLUMNS)
        .is("deleted_at", null)
        .order("date", { ascending: false });

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapPost);
}

export async function getBlogPostBySlug(slug: string, includeUnpublished = false): Promise<BlogPost | null> {
    let query = supabase
        .from("blog_posts")
        .select(POST_COLUMNS)
        .eq("slug", slug)
        .is("deleted_at", null);

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query.single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data ? mapPost(data) : null;
}

export async function createBlogPost(
    post: Omit<BlogPost, "tags" | "updatedAt" | "deletedAt"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").insert(post);
    if (error) throw error;
}

export async function updateBlogPost(
    slug: string,
    post: Omit<BlogPost, "tags" | "slug" | "updatedAt" | "deletedAt"> & { tags: string[] },
    expectedUpdatedAt: string
): Promise<BlogPost | null> {
    const { data: oldPost, error: fetchError } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .is("deleted_at", null)
        .maybeSingle();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from("blog_posts")
        .update(post)
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .is("deleted_at", null)
        .select(POST_COLUMNS)
        .maybeSingle();
    if (error) throw error;

    if (data && oldPost) {
        const newPaths = new Set(extractStoragePaths(data.content));
        const stalePaths = extractStoragePaths(oldPost.content).filter((p) => !newPaths.has(p));
        await removeUnreferencedMedia(stalePaths, slug);
    }

    return data ? mapPost(data) : null;
}

export async function setBlogPostPublished(
    slug: string,
    published: boolean,
    expectedUpdatedAt: string
): Promise<string | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .update({ published })
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .is("deleted_at", null)
        .select("updated_at")
        .maybeSingle();
    if (error) throw error;
    return data?.updated_at ?? null;
}

export function extractStoragePaths(content: string): string[] {
    const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!baseUrl) return [];

    const prefix = `${baseUrl}/storage/v1/object/public/images/`;
    const paths = new Set<string>();
    // 编辑器插入的图片/视频/附件扩展名（附件是 [文件名](url) 链接形式）。
    // 与 upload-url API 的 EXT_TO_MIME / bucket allowed_mime_types 白名单保持一致，
    // 不含 avif/svg（上传通道不支持，列入会误删手工引用的同 bucket 文件）。
    const mediaExt = /\.(png|jpe?g|gif|webp|mp4|webm|mov|avi|mkv|pdf|txt|md|csv|zip|docx?|xlsx?|pptx?)$/i;
    const regexes = [
        /!\[[^\]]*\]\(([^)\s]+)(?:\s+=\d+x\d+)?\)/g, // Markdown image/video, with optional =WxH
        /(?<!!)\[[^\]]*\]\(([^)\s]+)\)/g, // Markdown link/attachment: [name](url)
        /(?:src|poster)\s*=\s*["']([^"']+)["']/g, // HTML img/video src
    ];

    for (const regex of regexes) {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(content)) !== null) {
            const url = match[1].split("?")[0].split("#")[0];
            if (mediaExt.test(url) && url.startsWith(prefix)) {
                try {
                    const path = decodeURIComponent(url.slice(prefix.length));
                    if (path) paths.add(path);
                } catch {
                    // Skip URLs with invalid percent-encoding
                }
            }
        }
    }

    return Array.from(paths);
}

// 历史版本也可能包含待恢复内容，因此只有所有当前文章与历史快照都不再引用时才删除文件。
async function removeUnreferencedMedia(candidatePaths: string[], excludeSlug: string): Promise<void> {
    if (candidatePaths.length === 0) return;

    const [postsResult, revisionsResult] = await Promise.all([
        supabase.from("blog_posts").select("content").neq("slug", excludeSlug),
        supabase.from("post_revisions").select("content"),
    ]);
    if (postsResult.error || revisionsResult.error) {
        console.error("Failed to check media references, skipping cleanup:", postsResult.error || revisionsResult.error);
        return;
    }

    const stillReferenced = new Set<string>();
    for (const row of [...(postsResult.data ?? []), ...(revisionsResult.data ?? [])]) {
        for (const p of extractStoragePaths(row.content)) stillReferenced.add(p);
    }
    const orphaned = candidatePaths.filter((p) => !stillReferenced.has(p));
    if (orphaned.length === 0) return;

    const { error: storageError } = await supabase.storage.from("images").remove(orphaned);
    if (storageError) {
        console.error("Failed to delete unreferenced media:", storageError);
    }
}

export async function deleteBlogPost(slug: string, expectedUpdatedAt: string): Promise<string | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .is("deleted_at", null)
        .select("updated_at")
        .maybeSingle();
    if (error) throw error;
    return data?.updated_at ?? null;
}

export async function getTrashBlogPostSummaries(): Promise<BlogPostSummary[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select(SUMMARY_COLUMNS)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPost);
}

export async function restoreBlogPost(slug: string, expectedUpdatedAt: string): Promise<string | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .update({ deleted_at: null })
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .not("deleted_at", "is", null)
        .select("updated_at")
        .maybeSingle();
    if (error) throw error;
    return data?.updated_at ?? null;
}

export async function purgeBlogPost(slug: string, expectedUpdatedAt: string): Promise<boolean> {
    const { data: post, error: fetchError } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .not("deleted_at", "is", null)
        .maybeSingle();
    if (fetchError) throw fetchError;
    if (!post) return false;

    const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("slug", slug)
        .eq("updated_at", expectedUpdatedAt)
        .not("deleted_at", "is", null);
    if (error) throw error;

    await removeUnreferencedMedia(extractStoragePaths(post.content), slug);
    return true;
}

export async function getAllBlogPostsForBackup(): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select(POST_COLUMNS)
        .order("date", { ascending: false });
    if (error) throw error;
    return (data || []).map(mapPost);
}

export async function importBlogPost(
    post: Omit<BlogPost, "updatedAt">,
    overwrite: boolean
): Promise<"created" | "updated" | "skipped"> {
    const values = {
        slug: post.slug,
        title: post.title,
        content: post.content,
        date: post.date,
        tags: post.tags,
        published: post.published,
        deleted_at: post.deletedAt,
    };
    const { data: existing, error: fetchError } = await supabase
        .from("blog_posts")
        .select("slug")
        .eq("slug", post.slug)
        .maybeSingle();
    if (fetchError) throw fetchError;

    if (!existing) {
        const { error } = await supabase.from("blog_posts").insert(values);
        if (error) throw error;
        return "created";
    }
    if (!overwrite) return "skipped";

    const { error } = await supabase.from("blog_posts").update(values).eq("slug", post.slug);
    if (error) throw error;
    return "updated";
}

