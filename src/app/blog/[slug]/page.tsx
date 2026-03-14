import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock, Library, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SeriesOutlineDrawer, Series, SeriesItem } from "@/components/SeriesOutlineDrawer";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { ViewTracker } from "@/components/ViewTracker";
import { FeedbackButton } from "@/components/FeedbackButton";
import { CommentsSection } from "@/components/CommentsSection";
import { MotionWrapper } from "@/components/MotionWrapper";
interface Post {
    slug: string;
    title: string;
    series: Series | null;
    date: string;
    readTime: string;
    content: string;
}

import { getSinglePost } from "@/lib/notion";

// Remove the getMockPost definition since we use getSinglePost now.

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Use actual post title if you fetch it
    const post = await getSinglePost(slug);
    
    // Fallback: format slug as title
    const title = post?.title || decodeURIComponent(slug)
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return {
        title: title,
        description: `阅读这篇文章 - wilboerht博客.`,
        openGraph: {
            title: title,
            description: `阅读这篇文章 - wilboerht博客.`,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: `阅读这篇文章 - wilboerht博客.`,
        },
    };
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const post = await getSinglePost(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20 relative overflow-hidden">
            <ViewTracker pageId={post.id} />
            {/* Layout Wrapper with Sidebars */}
            <MotionWrapper>
            <div className="max-w-[1312px] w-full flex flex-col lg:flex-row lg:items-start gap-16 relative">

                {/* Left Sidebar: Navigation (Only show if series exists to balance layout) */}
                {post.series && (
                    <aside className="hidden lg:block lg:w-48 xl:w-64 lg:sticky lg:top-20">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span>返回博客</span>
                        </Link>
                    </aside>
                )}

                {/* Main Content Area */}
                <div className={`flex-1 max-w-2xl flex flex-col gap-10 ${!post.series ? "lg:mx-auto" : ""}`}>
                    {/* Inline Back Link for Non-Series Posts OR Mobile */}
                    <nav className={`${post.series ? "lg:hidden" : ""}`}>
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span>返回博客</span>
                        </Link>
                    </nav>

                    {/* Mobile Only: Component Series Info with Drawer */}
                    {post.series && (
                        <div className="lg:hidden p-4 rounded-2xl bg-foreground/[0.03] border border-border/50 flex items-center justify-between">
                            <div className="flex flex-col gap-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/30 line-clamp-1">
                                    <Library className="w-3.5 h-3.5" /> {post.series.name}
                                </div>
                                <div className="text-xs font-bold text-foreground/80">
                                    第 {post.series.current} / {post.series.total} 部分
                                </div>
                            </div>

                            <SeriesOutlineDrawer series={post.series} currentSlug={post.slug} />
                        </div>
                    )}

                    {/* Article Header */}
                    <header className="space-y-6">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted pt-2 border-b border-border/50 pb-8">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4" />
                                {post.date}
                            </span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {post.readTime}
                            </span>
                            <span>&middot;</span>
                            <span className="flex items-center gap-1.5 opacity-60">
                                <Eye className="w-4 h-4" />
                                阅读 {post.views} 次
                            </span>
                        </div>
                    </header>

                    {/* Article Content */}
                    <article className="-mt-4 prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-2xl mt-8 mb-4 text-foreground font-semibold" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl mt-6 mb-3 text-foreground font-semibold" {...props} />,
                                p: ({ node, ...props }) => <div className="my-4 text-muted leading-relaxed" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 my-4 text-muted" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 my-4 text-muted" {...props} />,
                                li: ({ node, ...props }) => <li className="text-muted leading-relaxed" {...props} />,
                                pre: ({ node, ...props }) => {
                                    const { ref, ...rest } = props as any;
                                    return <div {...rest} />;
                                },
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-foreground/30 pl-4 py-1 my-6 text-foreground/80 italic font-medium" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-foreground/90" {...props} />,
                                del: ({ node, ...props }) => <del className="line-through opacity-70" {...props} />,
                                a: ({ node, ...props }) => <a className="text-muted underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-foreground transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                img: ({ node, ...props }) => <img className="rounded-xl my-8 border border-border/50 max-w-full shadow-sm" loading="lazy" {...props} />,
                                hr: ({ node, ...props }) => <hr className="my-10 border-border/50" {...props} />,
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="w-full text-left border-collapse" {...props} /></div>,
                                th: ({ node, ...props }) => <th className="border-b border-border/50 py-3 px-4 font-semibold text-foreground bg-foreground/5 first:rounded-tl-lg last:rounded-tr-lg" {...props} />,
                                td: ({ node, ...props }) => <td className="border-b border-border/10 py-3 px-4 text-muted" {...props} />,
                                code: ({ node, inline, className, children, ...props }: any) => {
                                    return inline ? (
                                        <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <div className="my-6 rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                                <span className="text-xs text-muted font-mono">示例代码</span>
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                                </div>
                                            </div>
                                            <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-zinc-300">
                                                <code {...props}>{children}</code>
                                            </pre>
                                        </div>
                                    );
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </article>

                    {/* Article Footer */}
                    <div className="mt-12 pt-8 border-t border-border/50">
                        {/* Classic Split Pagination for Series */}
                        {post.series && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                                {/* Previous Page */}
                                {post.series.current > 1 ? (
                                    <Link
                                        href={`/blog/${post.series.items[post.series.current - 2].slug}`}
                                        className="group p-6 rounded-2xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-300 flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground/40 transition-colors">
                                            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 上一篇
                                        </div>
                                        <span className="text-sm font-bold text-foreground/80 line-clamp-1">
                                            {post.series.items[post.series.current - 2].title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="hidden sm:block" /> // Space filler
                                )}

                                {/* Next Page */}
                                {post.series.current < post.series.total ? (
                                    <Link
                                        href={`/blog/${post.series.items[post.series.current].slug}`}
                                        className="group p-6 rounded-2xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-300 flex flex-col gap-2 items-end text-right"
                                    >
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground/40 transition-colors">
                                            下一篇 <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground/80 line-clamp-1">
                                            {post.series.items[post.series.current].title}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="hidden sm:block" /> // Space filler
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-foreground/10">
                                    <Image
                                        src="/avatar.jpg"
                                        alt="Hank Wong"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-foreground">Hank Wong</span>
                                    <span className="text-xs text-muted">作者</span>
                                </div>
                            </div>
                            <ShareButton title={post.title} text={`查看这篇文章：${post.title}`} />
                        </div>
                        
                        {/* Extensibility Area */}
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-dashed border-border/30">
                            <FeedbackButton articleTitle={post.title} />
                        </div>
                    </div>

                    {/* Integrated Comments Section */}
                    <CommentsSection pageId={post.id} />

                    {/* SEO Schema Data */}
                    {post.series && (
                        <script
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{
                                __html: JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "BreadcrumbList",
                                    "itemListElement": [
                                        {
                                            "@type": "ListItem",
                                            "position": 1,
                                            "name": "Blog",
                                            "item": "https://wilboerht.com/blog"
                                        },
                                        {
                                            "@type": "ListItem",
                                            "position": 2,
                                            "name": post.series.name,
                                            "item": `https://wilboerht.com/blog/${post.series.items[0].slug}`
                                        },
                                        {
                                            "@type": "ListItem",
                                            "position": 3,
                                            "name": post.title
                                        }
                                    ]
                                })
                            }}
                        />
                    )}

                    <footer className="pt-12 pb-6 text-sm text-center text-muted border-t border-border/10 mt-8">
                        <p>&copy; {new Date().getFullYear()} wilboerht</p>
                    </footer>
                </div>

                {/* Right Sidebar: 系列内容（如果没有系列则隐藏） */}
                {post.series && (
                    <aside className="hidden lg:block lg:w-48 xl:w-64 lg:sticky lg:top-20">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/30 px-1 mb-4">
                                <Library className="w-3.5 h-3.5" /> 系列内容
                            </div>

                            <div className="relative pl-0.5 max-h-[calc(100vh-280px)] overflow-y-auto no-scrollbar scroll-smooth">
                                {/* Vertical Timeline Line - Perfectly centered on 16px (w-4) dot column */}
                                <div className="absolute left-[7.5px] top-2 bottom-2 w-px bg-border/40"></div>

                                <div className="flex flex-col gap-6 pr-4 pb-2">
                                    {post.series.items.map((item) => {
                                        const isActive = item.slug === post.slug;
                                        return (
                                            <Link
                                                key={item.index}
                                                href={`/blog/${item.slug}`}
                                                className={`relative flex items-start gap-4 transition-all duration-300 ${isActive ? "text-foreground" : "text-muted hover:text-foreground/80"}`}
                                            >
                                                {/* Indicator Dot Container - Fixed width 16px for stable alignment */}
                                                <div className="relative flex items-center justify-center w-4 mt-[6px] shrink-0">
                                                    {isActive ? (
                                                        <div className="relative flex items-center justify-center w-3 h-3">
                                                            {/* 外层轻微圆环 */}
                                                            <div className="absolute inset-0 rounded-full border border-foreground/10"></div>
                                                            {/* 跳动的内部圆点 */}
                                                            <div className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-1.5 h-1.5 rounded-full border border-border bg-background transition-colors duration-300 group-hover:border-muted"></div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-tight">第 {item.index} 部分</span>
                                                    <span className={`text-xs font-medium leading-tight line-clamp-2 ${isActive ? "font-semibold" : ""}`}>
                                                        {item.title}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
            </MotionWrapper>
        </main>
    );
}
