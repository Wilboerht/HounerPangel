import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getPostBySlug, getPublishedPosts } from "@/data/posts";
import type { Post } from "@/types/content";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Not Found",
        };
    }

    return {
        title: `${post.title} - Hank Wong's Web`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        },
    };
}

export async function generateStaticParams() {
    const posts = await getPublishedPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const post = await getPostBySlug(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    const allPosts = await getPublishedPosts();
    const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
    const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20">
            <div className="max-w-2xl w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回博客</span>
                    </Link>
                </nav>

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
                        {post.readTime && (
                            <>
                                <span>&middot;</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {post.readTime}
                                </span>
                            </>
                        )}
                    </div>
                </header>

                {/* Article Content */}
                <article className="-mt-4 prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
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
                    {/* Navigation for next/previous posts */}
                    {(previousPost || nextPost) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                            {previousPost ? (
                                <Link
                                    href={`/blog/${previousPost.slug}`}
                                    className="group p-6 rounded-2xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-300 flex flex-col gap-2"
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground/40 transition-colors">
                                        <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> 上一篇
                                    </div>
                                    <span className="text-sm font-bold text-foreground/80 line-clamp-1">
                                        {previousPost.title}
                                    </span>
                                </Link>
                            ) : (
                                <div className="hidden sm:block" />
                            )}

                            {nextPost ? (
                                <Link
                                    href={`/blog/${nextPost.slug}`}
                                    className="group p-6 rounded-2xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all duration-300 flex flex-col gap-2 items-end text-right"
                                >
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-foreground/40 transition-colors">
                                        下一篇 <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                    <span className="text-sm font-bold text-foreground/80 line-clamp-1">
                                        {nextPost.title}
                                    </span>
                                </Link>
                            ) : (
                                <div className="hidden sm:block" />
                            )}
                        </div>
                    )}

                    {/* Author Info */}
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
                </div>

                {/* Footer */}
                <footer className="pt-12 pb-6 text-sm text-center text-muted border-t border-border/10 mt-8">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
