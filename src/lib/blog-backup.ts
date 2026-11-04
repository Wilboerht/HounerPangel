import "server-only";

import { z } from "zod";
import { env } from "./env";
import { extractStoragePaths, getAllBlogPostsForBackup, importBlogPost, supabase } from "./supabase";
import { blogPostSchema } from "./validation";

const backupPostSchema = blogPostSchema.extend({
    updatedAt: z.string(),
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
deleted_at: ${JSON.stringify(post.deletedAt)}
---

${post.content}`;
}

export async function createBlogBackup(): Promise<BlogBackup> {
    const posts = await getAllBlogPostsForBackup();
    const storageBase = `${env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/images/`;

    const backupPosts = posts.map((post) => {
        const value = {
            slug: post.slug,
            title: post.title,
            content: post.content,
            date: post.date,
            tags: post.tags,
            published: post.published,
            updatedAt: post.updatedAt,
            deletedAt: post.deletedAt,
            media: extractStoragePaths(post.content).map((path) => ({
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
                deletedAt: post.deletedAt,
            }, conflictMode === "overwrite");
            results.push({ slug: post.slug, status });
        } catch (error) {
            console.error(`Failed to import blog post ${post.slug}:`, error);
            results.push({ slug: post.slug, status: "failed", error: "数据库写入失败" });
        }
    }

    return results;
}
