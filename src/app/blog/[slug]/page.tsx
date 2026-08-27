import BackButton from "@/components/BackButton";
import { Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog-db";
import { env } from "@/lib/env";
import { renderMarkdown } from "@/lib/markdown";
import type { BlogPost } from "@/lib/types/blog";

interface Props {
    params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

async function fetchPost(slug: string): Promise<BlogPost | null> {
    try {
        const post = await getBlogPostBySlug(slug);
        if (post) return post;
    } catch {
        // ignore db errors and treat as not found
    }
    return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        return { title: "Not Found - Hank Wong's Web" };
    }

    return {
        title: `${post.title} - Hank Wong's Web`,
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        notFound();
    }

    const siteUrl = env.NEXT_PUBLIC_SITE_URL || "https://wilboerht.com";

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.content.slice(0, 160),
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
        <main className="min-h-dvh flex flex-col items-center justify-center px-6 pt-content pb-content">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-10">
                <nav>
                    <BackButton label="返回博客" fallbackHref="/blog" />
                </nav>

                <section className="space-y-10">
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

                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                            {post.title}
                        </h1>
                    </header>

                    <article className="article-body">
                        {renderMarkdown(post.content)}
                    </article>
                </section>

                <footer className="pt-6 text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
