"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BlogPost } from "@/lib/types/blog";

interface Props {
    posts: BlogPost[];
}

export default function BlogClient({ posts }: Props) {
    const groupedPosts = useMemo(() => {
        const groups: Record<string, BlogPost[]> = {};
        posts.forEach((post) => {
            const year = new Date(post.date).getFullYear().toString();
            if (!groups[year]) groups[year] = [];
            groups[year].push(post);
        });
        Object.values(groups).forEach((group) => {
            group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        return groups;
    }, [posts]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
        });

    return (
        <>
            <section className="space-y-10">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    博客
                </h1>

                {/* Blog List */}
                <div className="space-y-10">
                    {posts.length > 0 ? (
                        Object.entries(groupedPosts)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([year, yearPosts]) => (
                                <div key={year} className="space-y-4">
                                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                        {year}
                                    </h2>
                                    <div className="space-y-3">
                                        {yearPosts.map((post) => (
                                            <Link
                                                key={post.slug}
                                                href={`/blog/${post.slug}`}
                                                className="group flex items-baseline gap-4 sm:gap-6"
                                            >
                                                <time
                                                    dateTime={post.date}
                                                    className="text-sm text-muted shrink-0 w-20 sm:w-24"
                                                >
                                                    {formatDate(post.date)}
                                                </time>
                                                <span className="text-base text-foreground group-hover:text-accent transition-colors duration-200">
                                                    {post.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-sm text-muted/50 tracking-wide">内容正在整理中</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 text-sm text-muted">
                <p suppressHydrationWarning>&copy; {new Date().getFullYear()} wilboerht</p>
            </footer>
        </>
    );
}
