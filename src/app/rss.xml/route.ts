import { getAllBlogPosts } from "@/lib/blog-db";
import { env } from "@/lib/env";
import type { BlogPost } from "@/lib/types/blog";

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://wilboerht.com";

export async function GET() {
    let posts: BlogPost[];
    try {
        posts = await getAllBlogPosts(false);
    } catch {
        posts = [];
    }

    const lastDate = posts.length > 0 ? new Date(posts[0].date).toUTCString() : new Date().toUTCString();

    const items = posts.map((post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <guid>${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      ${post.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("")}
    </item>`).join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hank Wong's Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Hank Wong (wilboerht) 的博客 — 思考、笔记与创作。</description>
    <language>zh-CN</language>
    <lastBuildDate>${lastDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    return new Response(rss, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400",
        },
    });
}
