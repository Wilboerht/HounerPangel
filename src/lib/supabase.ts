import { createClient } from "@supabase/supabase-js";
import type { BlogPost } from "./types/blog";
import type { Photo } from "./types/photo";
import { env } from "./env";

export const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

export async function getAllBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, content, date, tags")
        .order("date", { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => ({
        ...row,
        tags: row.tags ?? [],
    }));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("slug, title, excerpt, content, date, tags")
        .eq("slug", slug)
        .single();

    if (error) {
        if (error.code === "PGRST116") return null; // not found
        throw error;
    }
    return data ? { ...data, tags: data.tags ?? [] } : null;
}

export async function getAllBlogSlugs(): Promise<string[]> {
    const { data, error } = await supabase.from("blog_posts").select("slug");
    if (error) throw error;
    return (data || []).map((row) => row.slug);
}

export async function createBlogPost(
    post: Omit<BlogPost, "tags"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").upsert(post, { onConflict: "slug" });
    if (error) throw error;
}

export async function updateBlogPost(
    slug: string,
    post: Omit<BlogPost, "tags"> & { tags: string[] }
): Promise<void> {
    const { error } = await supabase.from("blog_posts").update(post).eq("slug", slug);
    if (error) throw error;
}

export async function deleteBlogPost(slug: string): Promise<void> {
    const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
    if (error) throw error;
}

// Photos
export async function getAllPhotos(): Promise<Photo[]> {
    const { data, error } = await supabase
        .from("photos")
        .select("id, src, title, location, description, exif, created_at, updated_at")
        .order("created_at", { ascending: false });

    if (error) {
        // Gracefully return empty if the table doesn't exist yet
        if (error.code === "42P01") return [];
        throw error;
    }
    return (data || []).map((row) => ({
        ...row,
        exif: row.exif || undefined,
    })) as Photo[];
}

export async function createPhoto(photo: Omit<Photo, "id" | "created_at" | "updated_at">): Promise<Photo> {
    const { data, error } = await supabase
        .from("photos")
        .insert({
            src: photo.src,
            title: photo.title,
            location: photo.location,
            description: photo.description,
            exif: photo.exif || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data as Photo;
}

export async function updatePhoto(
    id: string,
    photo: Omit<Photo, "id" | "created_at" | "updated_at">
): Promise<Photo> {
    const { data, error } = await supabase
        .from("photos")
        .update({
            src: photo.src,
            title: photo.title,
            location: photo.location,
            description: photo.description,
            exif: photo.exif || null,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data as Photo;
}

export async function deletePhoto(id: string): Promise<void> {
    const { error } = await supabase.from("photos").delete().eq("id", id);
    if (error) throw error;
}
