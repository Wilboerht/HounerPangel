import { Calendar } from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import type { BlogPost } from "@/lib/types/blog";

// 文章正文渲染（头部 + Markdown 正文），公开详情页与管理端草稿预览页共用
export function BlogPostArticle({ post }: { post: BlogPost }) {
    return (
        <section className="space-y-10">
            <header className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <div className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("zh-CN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                // 纯日期串按 UTC 解析，固定 UTC 渲染避免服务器/客户端时区差导致的水合不匹配
                                timeZone: "UTC",
                            })}
                        </time>
                    </div>
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-sm text-muted/70"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    {post.title}
                </h1>
            </header>

            <article className="article-body">
                {renderMarkdown(post.content)}
            </article>
        </section>
    );
}
