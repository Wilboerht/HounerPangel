import { Children, isValidElement, type ReactNode } from "react";
import hljs from "highlight.js/lib/core";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import java from "highlight.js/lib/languages/java";
import diff from "highlight.js/lib/languages/diff";
import markdownLang from "highlight.js/lib/languages/markdown";
import plaintext from "highlight.js/lib/languages/plaintext";
import { MermaidDiagram } from "@/components/mermaid-diagram";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("css", css);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("go", go);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("c", c);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("java", java);
hljs.registerLanguage("diff", diff);
hljs.registerLanguage("markdown", markdownLang);
hljs.registerLanguage("plaintext", plaintext);

function mapFencedLines(
    content: string,
    outside: (line: string) => string,
    inside: (line: string) => string
): string {
    let fence: { marker: string; length: number } | null = null;
    return content.split("\n").map((line) => {
        if (fence) {
            const closing = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
            if (closing && closing[1][0] === fence.marker && closing[1].length >= fence.length) fence = null;
            return inside(line);
        }
        const opening = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (opening) fence = { marker: opening[1][0], length: opening[1].length };
        return opening ? inside(line) : outside(line);
    }).join("\n");
}

function stripFencedCodeBlocks(content: string): string {
    return mapFencedLines(content, (line) => line, () => "");
}

function mapInlineCode(line: string, transform: (text: string) => string): string {
    let inCode = false;
    return line.split(/(`+)/).map((part) => {
        if (/^`+$/.test(part)) {
            inCode = !inCode;
            return part;
        }
        return inCode ? part : transform(part);
    }).join("");
}

export function plainTextExcerpt(content: string, max = 160): string {
    return stripFencedCodeBlocks(content)
        .replace(/^\s*>\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)(?:\/[^\]]+)?\]\s*$/gim, "")
        .replace(/^\s*\[\^[^\]]+\]:.*$/gm, "")
        .replace(/\[\^[^\]]+\]/g, "")
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/<\/?[a-z][^>]*>/gi, " ")
        .replace(/^\s*>\s?/gm, "")
        .replace(/[#*`_~|]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max);
}

export function firstImageUrl(content: string): string | undefined {
    let url: string | undefined;
    mapFencedLines(content, (line) => mapInlineCode(line, (text) => {
        if (!url) url = text.match(/!\[[^\]]*\]\((\S+)(?:\s+[^)]*)?\)/)?.[1];
        return text;
    }), (line) => line);
    if (url && /\.(mp4|webm|mov|avi|mkv)(?:$|[?#])/i.test(url)) return undefined;
    return url;
}

function isSafeLinkUrl(url: string): boolean {
    return /^(https?:\/\/|mailto:|\/(?!\/\/)|#)/i.test(url.trim());
}

function isSafeMediaUrl(url: string): boolean {
    const trimmed = url.trim();
    if (/^\/(?!\/)/.test(trimmed)) return true;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === "https:" && (parsed.hostname === "supabase.co" || parsed.hostname.endsWith(".supabase.co"));
    } catch {
        return false;
    }
}

const ATTACHMENT_EXT_RE = /\.(pdf|txt|md|csv|zip|docx?|xlsx?|pptx?)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|mov|avi|mkv)($|\?|#)/i;

const SUPABASE_HOSTNAME = (() => {
    try {
        return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    } catch {
        return "";
    }
})();

function isCurrentSupabaseHost(url: string): boolean {
    if (!SUPABASE_HOSTNAME) return false;
    try {
        return new URL(url).hostname === SUPABASE_HOSTNAME;
    } catch {
        return false;
    }
}

const IFRAME_ALLOWED_DOMAINS = [
    "embed.music.apple.com",
    "open.spotify.com",
    "bandcamp.com",
    "www.youtube.com",
    "youtube.com",
    "player.bilibili.com",
    "music.163.com",
    "y.qq.com",
    "platform.twitter.com",
    "twitter.com",
    "x.com",
    "www.instagram.com",
    "instagram.com",
];

function isAllowedIframeSrc(src: string): boolean {
    try {
        const url = new URL(src);
        return url.protocol === "https:" && IFRAME_ALLOWED_DOMAINS.includes(url.hostname);
    } catch {
        return false;
    }
}

function normalizeMediaDimensions(content: string): string {
    return mapFencedLines(content, (line) => mapInlineCode(line, (text) => text.replace(/!\[([^\]]*)\]\((\S+)\s+=(\d+)x(\d+)\)/g, (_match, alt: string, url: string, width: string, height: string) =>
        `![${alt}](${url} "${width}x${height}")`
    )), (line) => line);
}

const sanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames ?? []), "iframe", "svg", "path"],
    attributes: {
        ...defaultSchema.attributes,
        "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
        iframe: ["src", "title", "allow", "allowFullScreen", "loading", "referrerPolicy", "className"],
        svg: ["viewBox", "width", "height", "ariaHidden", "className"],
        path: ["d", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin"],
    },
};

function highlightedCode(children: React.ReactNode, className: string | undefined) {
    const code = String(children).replace(/\n$/, "");
    const language = /language-([\w-]+)/.exec(className ?? "")?.[1]?.toLowerCase();
    if (!language) return null;
    try {
        return hljs.getLanguage(language)
            ? hljs.highlight(code, { language }).value
            : hljs.highlightAuto(code).value;
    } catch {
        return null;
    }
}

function reactText(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number" || typeof node === "bigint") return String(node);
    if (Array.isArray(node)) return node.map(reactText).join("");
    if (isValidElement(node)) return reactText((node.props as { children?: ReactNode }).children);
    return "";
}

const ALERT_LABELS: Record<string, string> = {
    NOTE: "注意",
    TIP: "提示",
    IMPORTANT: "重要",
    WARNING: "警告",
    CAUTION: "提醒",
};

interface MarkdownAstNode {
    type: string;
    tagName?: string;
    children?: MarkdownAstNode[];
}

function containsImage(node: MarkdownAstNode): boolean {
    return node.tagName === "img" || (node.children?.some(containsImage) ?? false);
}

function markdownComponents(forRss: boolean): Components {
    return {
        a({ href = "", children, title }) {
            if (!isSafeLinkUrl(href)) return <span>{children}</span>;
            const text = reactText(children);
            const cleanUrl = href.split("?")[0].split("#")[0];
            if (ATTACHMENT_EXT_RE.test(cleanUrl)) {
                let attachmentUrl = href;
                if (isCurrentSupabaseHost(href)) {
                    const url = new URL(href);
                    url.searchParams.set("download", text);
                    attachmentUrl = url.toString();
                }
                const extLabel = cleanUrl.match(/\.([a-z0-9]+)$/i)?.[1]?.toUpperCase() ?? "FILE";
                return (
                    <a href={attachmentUrl} download target="_blank" rel="noopener noreferrer" title={title} aria-label={`下载附件：${text}`} className="no-underline flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors">
                        <span className="flex-shrink-0 min-w-9 px-1.5 py-1 rounded-md bg-foreground/5 text-center text-[10px] font-mono font-medium leading-none text-muted uppercase">{extLabel}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">{children}</span>
                    </a>
                );
            }
            const newTab = /^(https?:\/\/|mailto:)/i.test(href);
            return <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined} title={title} className="markdown-link">{children}{!forRss && <span className="markdown-link-detail">{href}</span>}</a>;
        },
        img({ src = "", alt = "", width, height, title }) {
            const source = typeof src === "string" ? src : "";
            if (!isSafeMediaUrl(source)) return <span>{alt}</span>;
            if (VIDEO_EXT_RE.test(source)) {
                return (
                    <figure>
                        <video src={source} controls title={title} className="rounded-xl w-full" preload="metadata">您的浏览器不支持视频播放。</video>
                        {alt && <figcaption>{alt}</figcaption>}
                    </figure>
                );
            }
            const dimensions = /^(\d+)x(\d+)$/.exec(title ?? "");
            const displayTitle = dimensions ? undefined : title;
            const resolvedWidth = width ?? dimensions?.[1];
            const resolvedHeight = height ?? dimensions?.[2];
            const numericWidth = Number(resolvedWidth);
            const numericHeight = Number(resolvedHeight);
            const hasDimensions = Number.isFinite(numericWidth) && numericWidth > 0 && Number.isFinite(numericHeight) && numericHeight > 0;
            return (
                <figure>
                    {!forRss && hasDimensions && isCurrentSupabaseHost(source) ? (
                        <Image src={source} alt={alt} title={displayTitle} width={numericWidth} height={numericHeight} sizes="(max-width: 768px) 100vw, 672px" className="rounded-xl block mx-auto max-w-full h-auto" />
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={source} alt={alt} title={displayTitle} width={resolvedWidth} height={resolvedHeight} className="rounded-xl block mx-auto max-w-full h-auto" loading="lazy" />
                    )}
                    {alt && <figcaption>{alt}</figcaption>}
                </figure>
            );
        },
        iframe({ src = "" }) {
            if (!isAllowedIframeSrc(src)) return null;
            return (
                <div className="iframe-wrapper">
                    <iframe src={src} className="w-full aspect-video rounded-xl border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" referrerPolicy="no-referrer" title="嵌入内容" />
                </div>
            );
        },
        code({ children, className }) {
            if (!forRss && /language-mermaid/i.test(className ?? "")) {
                return <MermaidDiagram chart={reactText(children).replace(/\n$/, "")} />;
            }
            const highlighted = highlightedCode(children, className);
            if (highlighted) {
                return <code className={`${className ?? ""} hljs text-sm font-mono leading-relaxed`} dangerouslySetInnerHTML={{ __html: highlighted }} />;
            }
            return <code className={`${className ?? ""} rounded-md bg-foreground/10 px-1.5 py-0.5 text-foreground text-sm font-mono break-all`}>{children}</code>;
        },
        pre({ children }) {
            if (isValidElement(children) && children.type === MermaidDiagram) return children;
            return <pre className="rounded-xl bg-foreground/5 p-3 sm:p-4 overflow-x-auto">{children}</pre>;
        },
        p({ children, node, className }) {
            if (className?.includes("markdown-alert-title")) {
                const label = reactText(children).trim();
                const icon = Children.toArray(children).filter((child) => isValidElement(child) && child.type === "svg");
                return <p className={className}>{icon}<span>{ALERT_LABELS[label] ?? label}</span></p>;
            }
            return node && containsImage(node as MarkdownAstNode) ? <>{children}</> : <p>{children}</p>;
        },
        table({ children }) {
            return <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">{children}</table></div>;
        },
    };
}

export function renderMarkdown(content: string, options: { forRss?: boolean } = {}): React.ReactElement {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, [remarkAlert, { legacyTitle: true }]]}
            remarkRehypeOptions={{ allowDangerousHtml: true }}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            components={markdownComponents(options.forRss ?? false)}
        >
            {normalizeMediaDimensions(content)}
        </ReactMarkdown>
    );
}
