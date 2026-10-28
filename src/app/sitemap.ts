import type { MetadataRoute } from "next";
import { getAllBlogPostSummaries } from "@/lib/blog-db";
import { SITE_URL } from "@/lib/site";

const siteUrl = SITE_URL;

// ISR：1 小时内复用缓存，与管理端 revalidatePath("/sitemap.xml") 语义一致
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let posts: Awaited<ReturnType<typeof getAllBlogPostSummaries>> = [];
    try {
        posts = await getAllBlogPostSummaries();
    } catch (error) {
        if (process.env.NEXT_PHASE !== "phase-production-build") throw error;
        console.error("生成 sitemap 失败，构建期跳过博客文章：", error);
    }

    const staticRoutes = [
        "/",
        "/me",
        "/blog",
        "/map",
    ];

    const latestPostDate = posts.length > 0
        ? new Date(Math.max(...posts.map((post) => new Date(post.updatedAt || post.date).getTime())))
        : undefined;

    const routes: MetadataRoute.Sitemap = [
        ...staticRoutes.map((route) => ({
            url: `${siteUrl}${route}`,
            ...(route === "/blog" && latestPostDate ? { lastModified: latestPostDate } : {}),
            changeFrequency: "weekly" as const,
            priority: route === "/" ? 1 : 0.8,
        })),
        ...posts.map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt || post.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
    ];

    return routes;
}
