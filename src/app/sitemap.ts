import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog-db";
import { SITE_URL } from "@/lib/site";

const siteUrl = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let posts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];
    try {
        posts = await getAllBlogPosts();
    } catch {
        // If Supabase is unavailable during build, skip blog posts
    }

    const staticRoutes = [
        "/",
        "/me",
        "/blog",
        "/map",
    ];

    // 静态路由的 lastModified 用最新文章的日期；没有文章时省略，避免每次请求都变
    const latestPostDate = posts.length > 0 ? new Date(posts[0].date) : undefined;

    const routes: MetadataRoute.Sitemap = [
        ...staticRoutes.map((route) => ({
            url: `${siteUrl}${route}`,
            ...(latestPostDate ? { lastModified: latestPostDate } : {}),
            changeFrequency: "weekly" as const,
            priority: route === "/" ? 1 : 0.8,
        })),
        ...posts.map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: new Date(post.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
    ];

    return routes;
}
