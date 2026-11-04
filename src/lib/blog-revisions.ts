import "server-only";

import { supabase, updateBlogPost } from "./supabase";
import type { BlogRevision, BlogRevisionAction, BlogRevisionSummary, BlogPost } from "./types/blog";

export async function getBlogRevisionSummaries(slug: string): Promise<BlogRevisionSummary[] | null> {
    const postId = await getPostId(slug);
    if (!postId) return null;

    const { data, error } = await supabase
        .from("post_revisions")
        .select("id, title, date, published, action, source_updated_at, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: false });
    if (error) throw error;

    return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        date: row.date,
        published: row.published,
        action: row.action as BlogRevisionAction,
        sourceUpdatedAt: row.source_updated_at,
        createdAt: row.created_at,
    }));
}

async function getPostId(slug: string): Promise<string | null> {
    const { data, error } = await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .is("deleted_at", null)
        .maybeSingle();
    if (error) throw error;
    return data?.id ?? null;
}

export async function getBlogRevision(slug: string, revisionId: string): Promise<BlogRevision | null> {
    const postId = await getPostId(slug);
    if (!postId) return null;

    const { data, error } = await supabase
        .from("post_revisions")
        .select("id, slug, title, content, date, tags, published, deleted_at, published_at, archived_at, excerpt, seo_title, seo_description, cover_image, action, source_updated_at, created_at")
        .eq("id", revisionId)
        .eq("post_id", postId)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        content: data.content,
        date: data.date,
        tags: data.tags ?? [],
        published: data.published,
        deletedAt: data.deleted_at,
        publishedAt: data.published_at,
        archivedAt: data.archived_at,
        excerpt: data.excerpt,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        coverImage: data.cover_image,
        action: data.action as BlogRevisionAction,
        sourceUpdatedAt: data.source_updated_at,
        createdAt: data.created_at,
    };
}

export async function restoreBlogRevision(
    revision: BlogRevision,
    expectedUpdatedAt: string
): Promise<BlogPost | null> {
    return updateBlogPost(revision.slug, {
        title: revision.title,
        content: revision.content,
        date: revision.date,
        tags: revision.tags,
        published: revision.published,
        archivedAt: revision.archivedAt,
        excerpt: revision.excerpt,
        seoTitle: revision.seoTitle,
        seoDescription: revision.seoDescription,
        coverImage: revision.coverImage,
    }, expectedUpdatedAt);
}
