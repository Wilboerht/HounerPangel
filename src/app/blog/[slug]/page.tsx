import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog-db";
import { env } from "@/lib/env";
import { renderMarkdown } from "@/lib/markdown";

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
    try {
        const slugs = await getAllBlogSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

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
        <main className="min-h-dvh flex flex-col justify-start px-6 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-12">
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
