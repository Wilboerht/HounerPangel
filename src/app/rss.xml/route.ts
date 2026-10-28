import { Fragment, isValidElement, type ReactNode } from "react";
import { getRecentBlogPosts } from "@/lib/blog-db";
import { SITE_URL } from "@/lib/site";
import { plainTextExcerpt, renderMarkdown } from "@/lib/markdown";
import type { BlogPost } from "@/lib/types/blog";

const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

// Safely embed text in CDATA by splitting any "]]>" sequence.
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

const siteUrl = SITE_URL;

const RSS_ITEM_COUNT = 20;
const VOID_ELEMENTS = new Set(["br", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const ATTRIBUTE_NAMES: Record<string, string> = {
    className: "class",
    allowFullScreen: "allowfullscreen",
    referrerPolicy: "referrerpolicy",
    srcSet: "srcset",
    strokeWidth: "stroke-width",
};

function renderNode(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") {
        return escapeXml(String(node));
    }
    if (Array.isArray(node)) return node.map(renderNode).join("");
    if (!isValidElement(node)) return "";

    const props = node.props as Record<string, unknown>;
    if (node.type === Fragment) return renderNode(props.children as ReactNode);
    if (typeof node.type !== "string") throw new Error("RSS renderer only supports intrinsic elements");

    const attributes = Object.entries(props).flatMap(([name, value]) => {
        if (name === "children" || name === "dangerouslySetInnerHTML" || value === null || value === undefined || value === false) {
            return [];
        }
        const attributeName = ATTRIBUTE_NAMES[name] ?? name;
        if (value === true) return [`${attributeName}=""`];
        if (typeof value !== "string" && typeof value !== "number") {
            throw new Error(`Unsupported RSS attribute: ${name}`);
        }
        return [`${attributeName}="${escapeXml(String(value))}"`];
    });
    const openingTag = `<${node.type}${attributes.length > 0 ? ` ${attributes.join(" ")}` : ""}>`;
    if (VOID_ELEMENTS.has(node.type)) return openingTag;

    const rawHtml = (props.dangerouslySetInnerHTML as { __html?: string } | undefined)?.__html;
    const content = rawHtml !== undefined ? rawHtml : renderNode(props.children as ReactNode);
    return `${openingTag}${content}</${node.type}>`;
}

function absoluteUrl(url: string): string {
    return url.startsWith("/") && !url.startsWith("//") ? `${siteUrl}${url}` : url;
}

function renderPostContent(content: string): string {
    const html = renderNode(renderMarkdown(content, { forRss: true }));
    return html
        .replace(/\b(href|src|poster)="([^"]*)"/g, (_match, attribute: string, url: string) =>
            `${attribute}="${absoluteUrl(url)}"`
        )
        .replace(/\bsrcset="([^"]*)"/g, (_match, srcset: string) => {
            const absoluteSrcset = srcset.split(",").map((candidate) => {
                const [url, ...descriptor] = candidate.trim().split(/\s+/);
                return [absoluteUrl(url), ...descriptor].join(" ");
            }).join(", ");
            return `srcset="${absoluteSrcset}"`;
        });
}

// ISR：30 分钟内复用缓存，与管理端 revalidatePath("/rss.xml") 语义一致
export const revalidate = 1800;

export async function GET() {
    let posts: BlogPost[];
    try {
        posts = await getRecentBlogPosts(RSS_ITEM_COUNT);
    } catch (error) {
        if (process.env.NEXT_PHASE !== "phase-production-build") {
            return new Response("RSS temporarily unavailable", {
                status: 503,
                headers: { "Cache-Control": "no-store" },
            });
        }
        console.error("生成 RSS 失败，构建期降级为空 feed：", error);
        posts = [];
    }

    const lastModified = posts.length > 0
        ? Math.max(...posts.map((post) => new Date(post.updatedAt || post.date).getTime()))
        : Date.now();
    const lastDate = new Date(lastModified).toUTCString();

    const items = posts.map((post) => `
    <item>
      <title>${cdata(post.title)}</title>
      <link>${siteUrl}/blog/${escapeXml(post.slug)}</link>
      <guid>${siteUrl}/blog/${escapeXml(post.slug)}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${cdata(plainTextExcerpt(post.content))}</description>
      <content:encoded>${cdata(renderPostContent(post.content))}</content:encoded>
      ${post.tags.map((t) => `<category>${escapeXml(t)}</category>`).join("")}
    </item>`).join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
