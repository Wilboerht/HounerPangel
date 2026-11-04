import "server-only";

import { z } from "zod";
import { env } from "./env";
import { extractStoragePaths, getAllBlogPostsForBackup, importBlogPost, supabase } from "./supabase";
import { blogPostSchema } from "./validation";

const backupPostSchema = blogPostSchema.extend({
    updatedAt: z.string(),
    publishedAt: z.string().nullable().default(null),
    deletedAt: z.string().nullable(),
    markdown: z.string().max(110_000),
    media: z.array(z.object({ path: z.string(), url: z.string() })),
});

export const blogBackupSchema = z.object({
    format: z.literal("hank-blog-backup"),
    version: z.literal(1),
    exportedAt: z.string(),
    posts: z.array(backupPostSchema).max(5000),
}).superRefine((backup, ctx) => {
    const seen = new Set<string>();
    backup.posts.forEach((post, index) => {
        if (seen.has(post.slug)) {
            ctx.addIssue({ code: "custom", message: "备份中存在重复 slug", path: ["posts", index, "slug"] });
        }
        if (post.published && post.archivedAt !== null) {
            ctx.addIssue({ code: "custom", message: "已发布文章不能同时处于归档状态", path: ["posts", index, "archivedAt"] });
        }
        seen.add(post.slug);
    });
});

export type BlogBackup = z.infer<typeof blogBackupSchema>;
export type BackupConflictMode = "skip" | "overwrite";

function markdownWithFrontMatter(post: BlogBackup["posts"][number]): string {
    return `---
title: ${JSON.stringify(post.title)}
slug: ${JSON.stringify(post.slug)}
date: ${JSON.stringify(post.date)}
published: ${post.published}
tags: ${JSON.stringify(post.tags)}
archived_at: ${JSON.stringify(post.archivedAt)}
excerpt: ${JSON.stringify(post.excerpt)}
seo_title: ${JSON.stringify(post.seoTitle)}
seo_description: ${JSON.stringify(post.seoDescription)}
cover_image: ${JSON.stringify(post.coverImage)}
deleted_at: ${JSON.stringify(post.deletedAt)}
---

${post.content}`;
}

export async function createBlogBackup(slugs?: string[]): Promise<BlogBackup> {
    const selected = slugs ? new Set(slugs) : null;
    const posts = (await getAllBlogPostsForBackup()).filter((post) => !selected || selected.has(post.slug));
    const storageBase = `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/images/`;

    const backupPosts = posts.map((post) => {
        const value = {
            slug: post.slug,
            title: post.title,
            content: post.content,
            date: post.date,
            tags: post.tags,
            published: post.published,
            publishedAt: post.publishedAt,
            archivedAt: post.archivedAt,
            excerpt: post.excerpt,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
            coverImage: post.coverImage,
            updatedAt: post.updatedAt,
            deletedAt: post.deletedAt,
            media: extractStoragePaths(`${post.content}\n${post.coverImage ? `![](${post.coverImage})` : ""}`).map((path) => ({
                path,
                url: `${storageBase}${path.split("/").map(encodeURIComponent).join("/")}`,
            })),
        };
        return { ...value, markdown: markdownWithFrontMatter({ ...value, markdown: "", media: value.media }) };
    });

    return {
        format: "hank-blog-backup",
        version: 1,
        exportedAt: new Date().toISOString(),
        posts: backupPosts,
    };
}

export interface ImportPlanItem {
    slug: string;
    title: string;
    status: "create" | "conflict";
    deleted: boolean;
}

export async function previewBlogImport(backup: BlogBackup): Promise<ImportPlanItem[]> {
    const slugs = backup.posts.map((post) => post.slug);
    const existing = new Set<string>();

    for (let start = 0; start < slugs.length; start += 200) {
        const { data, error } = await supabase
            .from("blog_posts")
            .select("slug")
            .in("slug", slugs.slice(start, start + 200));
        if (error) throw error;
        for (const row of data ?? []) existing.add(row.slug);
    }

    return backup.posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        status: existing.has(post.slug) ? "conflict" : "create",
        deleted: post.deletedAt !== null,
    }));
}

export async function applyBlogImport(backup: BlogBackup, conflictMode: BackupConflictMode) {
    const results: { slug: string; status: "created" | "updated" | "skipped" | "failed"; error?: string }[] = [];

    for (const post of backup.posts) {
        try {
            const status = await importBlogPost({
                slug: post.slug,
                title: post.title,
                content: post.content,
                date: post.date,
                tags: post.tags,
                published: post.published,
                updatedAt: post.updatedAt,
                publishedAt: post.publishedAt,
                archivedAt: post.archivedAt,
                excerpt: post.excerpt,
                seoTitle: post.seoTitle,
                seoDescription: post.seoDescription,
                coverImage: post.coverImage,
                deletedAt: post.deletedAt,
            }, conflictMode === "overwrite");
            results.push({ slug: post.slug, status });
        } catch (error) {
            console.error(`Failed to import blog post ${post.slug}:`, error);
            const message = error instanceof Error && error.name === "ImportConflictError" ? error.message : "数据库写入失败";
            results.push({ slug: post.slug, status: "failed", error: message });
        }
    }

    return results;
}
