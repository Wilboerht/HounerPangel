import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { BlogPost, BlogPostSummary } from "./types/blog";
import { env } from "./env";

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function getAllBlogPosts(includeUnpublished = false): Promise<BlogPost[]> {
    let query = supabase
        .from("blog_posts")
        .select("slug, title, content, date, updated_at, tags, published")
        .order("date", { ascending: false });

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((row) => ({
        ...row,
        updatedAt: row.updated_at,
        tags: row.tags ?? [],
        published: row.published ?? false,
    }));
}

export async function getAllBlogPostSummaries(includeUnpublished = false): Promise<BlogPostSummary[]> {
    let query = supabase
        .from("blog_posts")
        .select("slug, title, date, updated_at, tags, published")
        .order("date", { ascending: false });

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((row) => ({
        ...row,
        updatedAt: row.updated_at,
        tags: row.tags ?? [],
        published: row.published ?? false,
    }));
}

export async function getBlogPostBySlug(slug: string, includeUnpublished = false): Promise<BlogPost | null> {
    let query = supabase
        .from("blog_posts")
        .select("slug, title, content, date, updated_at, tags, published")
        .eq("slug", slug);

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query.single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data ? { ...data, updatedAt: data.updated_at, tags: data.tags ?? [], published: data.published ?? false } : null;
}

export async function createBlogPost(
    post: Omit<BlogPost, "tags" | "updatedAt"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").insert(post);
    if (error) throw error;
}

export async function updateBlogPost(
    slug: string,
    post: Omit<BlogPost, "tags" | "slug" | "updatedAt"> & { tags: string[] }
): Promise<BlogPost | null> {
    const { data: oldPost, error: fetchError } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .maybeSingle();
    if (fetchError) throw fetchError;

    const { data, error } = await supabase
        .from("blog_posts")
        .update(post)
        .eq("slug", slug)
        .select("slug, title, content, date, updated_at, tags, published")
        .maybeSingle();
    if (error) throw error;

    if (data && oldPost) {
        const newPaths = new Set(extractStoragePaths(data.content));
        const stalePaths = extractStoragePaths(oldPost.content).filter((p) => !newPaths.has(p));
        if (stalePaths.length > 0) {
            const { error: storageError } = await supabase.storage.from("images").remove(stalePaths);
            if (storageError) {
                console.error("Failed to delete unreferenced media:", storageError);
            }
        }
    }

    return data ? { ...data, updatedAt: data.updated_at, tags: data.tags ?? [], published: data.published ?? false } : null;
}

function extractStoragePaths(content: string): string[] {
    const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!baseUrl) return [];

    const prefix = `${baseUrl}/storage/v1/object/public/images/`;
    const paths = new Set<string>();
    // Common image extensions plus video formats inserted by the editor.
    const mediaExt = /\.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|mkv)$/i;
    const regexes = [
        /!\[[^\]]*\]\(([^)\s]+)\)/g, // Markdown image/video: ![alt](url)
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

export async function deleteBlogPost(slug: string): Promise<void> {
    const { data: post, error: fetchError } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .maybeSingle();

    if (fetchError) throw fetchError;

    const paths = post ? extractStoragePaths(post.content) : [];

    if (paths.length > 0) {
        const { error: storageError } = await supabase.storage.from("images").remove(paths);
        if (storageError) {
            console.error("Failed to delete associated media:", storageError);
        }
    }

    const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
    if (error) throw error;
}


