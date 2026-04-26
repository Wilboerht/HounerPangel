import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/data/blog";

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        return {
            title: "Not Found - Hank Wong's Web",
        };
    }

    return {
        title: `${post.title} - Hank Wong's Web`,
        description: post.excerpt,
    };
}

function renderInline(text: string): React.ReactNode {
    const tokens: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    const push = (node: React.ReactNode) => {
        tokens.push(<span key={key++}>{node}</span>);
    };

    while (remaining.length > 0) {
        const codeMatch = remaining.match(/^`([^`]+)`/);
        if (codeMatch) {
            push(
                <code className="px-1.5 py-0.5 rounded-md bg-foreground/10 text-foreground text-sm font-mono">
                    {codeMatch[1]}
                </code>
            );
            remaining = remaining.slice(codeMatch[0].length);
            continue;
        }

        const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
            push(
                <a
                    href={linkMatch[2]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline underline-offset-2"
                >
                    {renderInline(linkMatch[1])}
                </a>
            );
            remaining = remaining.slice(linkMatch[0].length);
            continue;
        }

        const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
        if (boldMatch) {
            push(
                <strong className="font-semibold text-foreground">
                    {renderInline(boldMatch[1])}
                </strong>
            );
            remaining = remaining.slice(boldMatch[0].length);
            continue;
        }

        const italicMatch = remaining.match(/^(?:\*|_)([^*_]+)(?:\*|_)/);
        if (italicMatch) {
            push(
                <em className="italic text-foreground/90">
                    {renderInline(italicMatch[1])}
                </em>
            );
            remaining = remaining.slice(italicMatch[0].length);
            continue;
        }

        const strikeMatch = remaining.match(/^~~([^~]+)~~/);
        if (strikeMatch) {
            push(
                <del className="line-through text-muted">
                    {renderInline(strikeMatch[1])}
                </del>
            );
            remaining = remaining.slice(strikeMatch[0].length);
            continue;
        }

        push(remaining[0]);
        remaining = remaining.slice(1);
    }

    return tokens;
}

function renderMarkdown(content: string): React.ReactNode {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let inCodeBlock = false;
    let inQuote = false;
    let inIframe = false;
    let codeLines: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let codeLang = "";
    let iframeLines: string[] = [];
    let unorderedItems: React.ReactNode[] = [];
    let orderedItems: React.ReactNode[] = [];
    let quoteLines: string[] = [];

    const flushUnordered = () => {
        if (inUnorderedList && unorderedItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-5 space-y-2 text-muted leading-relaxed">
                    {unorderedItems}
                </ul>
            );
            unorderedItems = [];
            inUnorderedList = false;
        }
    };

    const flushOrdered = () => {
        if (inOrderedList && orderedItems.length > 0) {
            elements.push(
                <ol key={`ol-${elements.length}`} className="list-decimal pl-5 space-y-2 text-muted leading-relaxed">
                    {orderedItems}
                </ol>
            );
            orderedItems = [];
            inOrderedList = false;
        }
    };

    const flushQuote = () => {
        if (inQuote && quoteLines.length > 0) {
            elements.push(
                <blockquote
                    key={`bq-${elements.length}`}
                    className="border-l-2 border-accent/40 pl-4 py-1 text-muted italic"
                >
                    {quoteLines.map((q, i) => (
                        <p key={i} className="leading-relaxed">
                            {renderInline(q)}
                        </p>
                    ))}
                </blockquote>
            );
            quoteLines = [];
            inQuote = false;
        }
    };

    const flushCodeBlock = () => {
        if (inCodeBlock && codeLines.length > 0) {
            elements.push(
                <pre
                    key={`pre-${elements.length}`}
                    className="rounded-xl bg-foreground/5 p-4 overflow-x-auto"
                >
                    <code className="text-sm font-mono text-foreground/80 leading-relaxed">
                        {codeLines.join("\n")}
                    </code>
                </pre>
            );
            codeLines = [];
            codeLang = "";
            inCodeBlock = false;
        }
    };

    const flushIframe = () => {
        if (inIframe && iframeLines.length > 0) {
            const iframeHtml = iframeLines.join("\n").trim();
            // Security: only allow iframe from trusted domains
            const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/i);
            const allowedDomains = ["embed.music.apple.com", "open.spotify.com", "bandcamp.com", "www.youtube.com", "youtube.com", "player.bilibili.com", "music.163.com", "y.qq.com", "platform.twitter.com", "twitter.com", "x.com", "www.instagram.com", "instagram.com"];
            const isAllowed = srcMatch ? allowedDomains.some((d) => srcMatch[1].includes(d)) : false;

            if (isAllowed) {
                elements.push(
                    <div key={`iframe-${elements.length}`} className="my-4">
                        <div dangerouslySetInnerHTML={{ __html: iframeHtml }} />
                    </div>
                );
            } else {
                elements.push(
                    <pre key={`iframe-${elements.length}`} className="rounded-xl bg-foreground/5 p-4 overflow-x-auto text-sm text-muted">
                        <code>{iframeHtml}</code>
                    </pre>
                );
            }
            iframeLines = [];
            inIframe = false;
        }
    };

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            if (!inCodeBlock) {
                flushUnordered();
                flushOrdered();
                flushQuote();
                inCodeBlock = true;
                codeLang = trimmed.slice(3).trim();
            } else {
                flushCodeBlock();
            }
            continue;
        }

        if (inCodeBlock) {
            codeLines.push(line);
            continue;
        }

        // iframe embed (Apple Music, Spotify, etc.)
        if (trimmed.toLowerCase().startsWith("<iframe")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            inIframe = true;
            iframeLines.push(line);
            continue;
        }
        if (inIframe) {
            iframeLines.push(line);
            if (trimmed.toLowerCase().includes("</iframe>")) {
                flushIframe();
            }
            continue;
        }

        if (/^(---+|___+|\*\*\*+)$/.test(trimmed)) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <hr key={`hr-${elements.length}`} className="border-border my-6" />
            );
            continue;
        }

        if (trimmed.startsWith("## ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground mt-10 mb-3">
                    {renderInline(trimmed.replace("## ", ""))}
                </h2>
            );
            continue;
        }

        if (trimmed.startsWith("### ")) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            elements.push(
                <h3 key={index} className="text-lg font-semibold tracking-tight text-foreground mt-8 mb-2">
                    {renderInline(trimmed.replace("### ", ""))}
                </h3>
            );
            continue;
        }

        if (trimmed.startsWith("> ")) {
            flushUnordered();
            flushOrdered();
            if (!inQuote) inQuote = true;
            quoteLines.push(trimmed.replace("> ", ""));
            continue;
        } else if (inQuote && trimmed.length === 0) {
            flushQuote();
            continue;
        }

        if (trimmed.startsWith("- ")) {
            flushOrdered();
            flushQuote();
            if (!inUnorderedList) inUnorderedList = true;
            unorderedItems.push(
                <li key={index}>{renderInline(trimmed.replace("- ", ""))}</li>
            );
            continue;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            flushUnordered();
            flushQuote();
            if (!inOrderedList) inOrderedList = true;
            orderedItems.push(
                <li key={index}>{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</li>
            );
            continue;
        }

        if (trimmed.length === 0) {
            flushUnordered();
            flushOrdered();
            flushQuote();
            continue;
        }

        flushUnordered();
        flushOrdered();
        flushQuote();

        // standalone link card: [text](url) on its own line
        const standaloneLinkMatch = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (standaloneLinkMatch) {
            const [, cardText, cardUrl] = standaloneLinkMatch;
            elements.push(
                <a
                    key={`card-${index}`}
                    href={cardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-accent/40 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group"
                >
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 tracking-wide">
                            {cardText}
                        </span>
                        <svg
                            className="w-4 h-4 text-slate-300 group-hover:text-accent transition-colors"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                    </div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mt-1 truncate">
                        {cardUrl}
                    </p>
                </a>
            );
            continue;
        }

        elements.push(
            <p key={index} className="text-muted leading-relaxed">
                {renderInline(trimmed)}
            </p>
        );
    }

    flushUnordered();
    flushOrdered();
    flushQuote();
    flushCodeBlock();
    flushIframe();
    return elements;
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full flex flex-col gap-12">
                <nav>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回博客</span>
                    </Link>
                </nav>

                <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                        <div className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <time dateTime={post.date}>
                                {new Date(post.date).toLocaleDateString("zh-CN", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </time>
                        </div>
                        {post.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5" />
                                <div className="flex gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        {post.title}
                    </h1>

                    <p className="text-lg text-muted leading-relaxed">
                        {post.excerpt}
                    </p>
                </header>

                <article className="space-y-5">
                    {renderMarkdown(post.content)}
                </article>

                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
