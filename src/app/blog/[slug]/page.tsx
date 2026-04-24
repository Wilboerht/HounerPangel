import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/data/blog";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    const slugs = getAllBlogSlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);

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
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={i} className="font-semibold text-foreground">
                    {part.slice(2, -2)}
                </strong>
            );
        }
        return part;
    });
}

function renderMarkdown(content: string): React.ReactNode {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let unorderedItems: React.ReactNode[] = [];
    let orderedItems: React.ReactNode[] = [];

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

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("## ")) {
            flushUnordered();
            flushOrdered();
            elements.push(
                <h2 key={index} className="text-xl font-semibold tracking-tight text-foreground mt-10 mb-3">
                    {renderInline(trimmed.replace("## ", ""))}
                </h2>
            );
            return;
        }

        if (trimmed.startsWith("### ")) {
            flushUnordered();
            flushOrdered();
            elements.push(
                <h3 key={index} className="text-lg font-semibold tracking-tight text-foreground mt-8 mb-2">
                    {renderInline(trimmed.replace("### ", ""))}
                </h3>
            );
            return;
        }

        if (trimmed.startsWith("- ")) {
            flushOrdered();
            if (!inUnorderedList) inUnorderedList = true;
            unorderedItems.push(
                <li key={index}>{renderInline(trimmed.replace("- ", ""))}</li>
            );
            return;
        }

        if (trimmed.match(/^\d+\.\s/)) {
            flushUnordered();
            if (!inOrderedList) inOrderedList = true;
            orderedItems.push(
                <li key={index}>{renderInline(trimmed.replace(/^\d+\.\s/, ""))}</li>
            );
            return;
        }

        if (trimmed.length === 0) {
            flushUnordered();
            flushOrdered();
            return;
        }

        flushUnordered();
        flushOrdered();
        elements.push(
            <p key={index} className="text-muted leading-relaxed">
                {renderInline(trimmed)}
            </p>
        );
    });

    flushUnordered();
    flushOrdered();
    return elements;
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = getBlogPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full flex flex-col gap-12">
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

                {/* Header */}
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

                {/* Content */}
                <article className="space-y-5">
                    {renderMarkdown(post.content)}
                </article>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
