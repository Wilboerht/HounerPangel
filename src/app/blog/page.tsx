import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { Metadata } from "next";
import { BLOG_POSTS } from "@/data/blog";

export const metadata: Metadata = {
    title: "Blog - Hank Wong's Web",
    description: "Hank Wong 的思考、笔记与创作。",
};

export default function Blog() {
    const sortedPosts = [...BLOG_POSTS].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full flex flex-col gap-12">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回主页</span>
                    </Link>
                </nav>

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            Blog
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Thoughts, notes, and creations along the way.
                        </p>
                    </div>

                    {/* Blog List */}
                    <div className="flex flex-col gap-6">
                        {sortedPosts.map((post) => (
                            <article
                                key={post.slug}
                                className="group flex flex-col gap-3 p-4 -mx-4 rounded-xl hover:bg-foreground/[0.02] transition-colors duration-200"
                            >
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

                                <Link href={`/blog/${post.slug}`} className="block space-y-2">
                                    <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
                                        {post.title}
                                    </h2>
                                    <p className="text-muted leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
