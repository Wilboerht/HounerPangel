import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/lib/blog-db";
import { cnPlans, jpPlans } from "@/data/travel";
import { env } from "@/lib/env";

const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://wilboerht.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    let posts: Awaited<ReturnType<typeof getAllBlogPosts>> = [];
    try {
        posts = await getAllBlogPosts();
    } catch {
        // If Supabase is unavailable during build, skip blog posts
    }
    const allPlans = [...cnPlans, ...jpPlans];

    const staticRoutes = [
        "/",
        "/me",
        "/blog",
        "/projects",
        "/design",
        "/travel/plan",
    ];

    const routes: MetadataRoute.Sitemap = [
        ...staticRoutes.map((route) => ({
            url: `${siteUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: route === "/" ? 1 : 0.8,
        })),
        ...posts.map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: new Date(post.date),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
        ...allPlans.map((plan) => ({
            url: `${siteUrl}/travel/plan/${plan.slug}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.5,
        })),
    ];

    return routes;
}
