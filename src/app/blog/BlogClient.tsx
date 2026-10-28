import Link from "next/link";
import { Rss } from "lucide-react";
import type { BlogPostSummary } from "@/lib/types/blog";

interface Props {
    posts: BlogPostSummary[];
}

// 无交互，保持为 server component：避免把全部文章数据序列化进 RSC payload 参与水合
export default function BlogClient({ posts }: Props) {
    const groupedPosts: Record<string, BlogPostSummary[]> = {};
    posts.forEach((post) => {
        const year = new Date(post.date).getUTCFullYear().toString();
        if (!groupedPosts[year]) groupedPosts[year] = [];
        groupedPosts[year].push(post);
    });
    Object.values(groupedPosts).forEach((group) => {
        group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    // 数据库 date 是 'YYYY-MM-DD' 纯日期串，按 UTC 解析，格式化也固定用 UTC，
    // 避免负时区用户本地格式化差一天、导致水合不匹配
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
            timeZone: "UTC",
        });

    return (
        <>
            <section className="space-y-10">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        博客
                    </h1>
                    <a
                        href="/rss.xml"
                        aria-label="订阅 RSS"
                        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
                    >
                        <Rss className="h-4 w-4" aria-hidden="true" />
                        RSS 订阅
                    </a>
                </div>

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
                                                className="group flex items-baseline gap-3"
                                            >
                                                <span className="min-w-0 text-base text-foreground break-words group-hover:text-accent transition-colors duration-200">
                                                    {post.title}
                                                </span>
                                                <time
                                                    dateTime={post.date}
                                                    className="text-sm text-muted shrink-0"
                                                >
                                                    {formatDate(post.date)}
                                                </time>
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
            <footer className="mt-auto text-sm text-muted">
                <p>&copy; {new Date().getFullYear()} wilboerht</p>
            </footer>
        </>
    );
}
