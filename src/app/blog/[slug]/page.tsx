import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Calendar, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAdjacentPosts } from "@/lib/blog-db";
import { env } from "@/lib/env";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    let post;
    try {
        post = await getBlogPostBySlug(slug);
    } catch {
        post = null;
    }

    if (!post) {
        return { title: "Not Found - Hank Wong's Web" };
    }

    return {
        title: `${post.title} - Hank Wong's Web`,
        description: post.excerpt,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    let post;
    try {
        post = await getBlogPostBySlug(slug);
    } catch {
        post = null;
    }

    if (!post) {
        notFound();
    }

    const { prev, next } = await getAdjacentPosts(slug);
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://wilboerht.com";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        author: {
            "@type": "Person",
            name: "Hank Wong",
            url: siteUrl,
        },
        publisher: {
            "@type": "Person",
            name: "Hank Wong",
        },
        keywords: post.tags.join(", "),
        url: `${siteUrl}/blog/${post.slug}`,
    };

    return (
        <main className="min-h-dvh flex flex-col justify-start px-6 py-12 pt-safe pb-safe">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-10">
                <nav>
                    <BackButton label="返回博客" fallbackHref="/blog" />
                </nav>

                <header className="space-y-5">
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
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <Link
                                            key={tag}
                                            href={`/blog?tag=${encodeURIComponent(tag)}`}
                                            className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                                        >
                                            {tag}
                                        </Link>
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

                <article className="article-body">
                    {renderMarkdown(post.content)}
                </article>

                {/* Adjacent Posts */}
                {(prev || next) && (
                    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/50">
                        {prev ? (
                            <Link
                                href={`/blog/${prev.slug}`}
                                className="group flex flex-col gap-1 p-4 rounded-xl border border-border/50 bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200"
                            >
                                <span className="text-xs text-muted flex items-center gap-1">
                                    <ArrowLeft className="w-3 h-3" />
                                    上一篇
                                </span>
                                <span className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                                    {prev.title}
                                </span>
                            </Link>
                        ) : (
                            <div />
                        )}
                        {next ? (
                            <Link
                                href={`/blog/${next.slug}`}
                                className="group flex flex-col gap-1 p-4 rounded-xl border border-border/50 bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 sm:text-right sm:items-end"
                            >
                                <span className="text-xs text-muted flex items-center gap-1 sm:flex-row-reverse">
                                    下一篇
                                    <ArrowRight className="w-3 h-3" />
                                </span>
                                <span className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                                    {next.title}
                                </span>
                            </Link>
                        ) : (
                            <div />
                        )}
                    </nav>
                )}

                <footer className="pt-6 text-sm text-muted border-t border-border/50">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
