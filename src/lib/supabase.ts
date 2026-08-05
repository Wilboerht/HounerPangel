import { createClient } from "@supabase/supabase-js";
import type { BlogPost } from "./types/blog";
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
        .select("slug, title, content, date, tags, published")
        .order("date", { ascending: false });

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map((row) => ({
        ...row,
        tags: row.tags ?? [],
        published: row.published ?? false,
    }));
}

export async function getBlogPostBySlug(slug: string, includeUnpublished = false): Promise<BlogPost | null> {
    let query = supabase
        .from("blog_posts")
        .select("slug, title, content, date, tags, published")
        .eq("slug", slug);

    if (!includeUnpublished) query = query.eq("published", true);

    const { data, error } = await query.single();

    if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
    }
    return data ? { ...data, tags: data.tags ?? [], published: data.published ?? false } : null;
}

export async function getAdjacentPosts(slug: string, includeUnpublished = false): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
    const all = await getAllBlogPosts(includeUnpublished);
    const index = all.findIndex((post) => post.slug === slug);
    if (index === -1) return { prev: null, next: null };

    return {
        prev: index < all.length - 1 ? all[index + 1] : null,
        next: index > 0 ? all[index - 1] : null,
    };
}

export async function createBlogPost(
    post: Omit<BlogPost, "tags"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").insert(post);
    if (error) throw error;
}

export async function updateBlogPost(
    slug: string,
    post: Omit<BlogPost, "tags" | "slug"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").update(post).eq("slug", slug);
    if (error) throw error;
}

function extractStoragePaths(content: string): string[] {
    const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!baseUrl) return [];

    const prefix = `${baseUrl}/storage/v1/object/public/images/`;
    const paths = new Set<string>();
    const regexes = [
        /!\[[^\]]*\]\(([^)\s]+)\)/g, // Markdown image: ![alt](url)
        /(?:src|poster)\s*=\s*["']([^"']+)["']/g, // HTML img/video src
    ];

    for (const regex of regexes) {
        let match: RegExpExecArray | null;
        while ((match = regex.exec(content)) !== null) {
            const url = match[1].split("?")[0].split("#")[0];
            if (url.startsWith(prefix)) {
                const path = decodeURIComponent(url.slice(prefix.length));
                if (path) paths.add(path);
            }
        }
    }

    return Array.from(paths);
}

export async function deleteBlogPost(slug: string): Promise<void> {
    // Fetch post content to clean up associated media before deleting the row
    const { data: post, error: fetchError } = await supabase
        .from("blog_posts")
        .select("content")
        .eq("slug", slug)
        .maybeSingle();

    if (fetchError) throw fetchError;

    const paths = post ? extractStoragePaths(post.content) : [];

    const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
    if (error) throw error;

    // Best-effort cleanup of uploaded images/videos
    if (paths.length > 0) {
        const { error: storageError } = await supabase.storage.from("images").remove(paths);
        if (storageError) {
            console.error("Failed to delete associated media:", storageError);
        }
    }
}


