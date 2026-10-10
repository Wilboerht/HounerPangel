import Link from "next/link";
import { ArrowUpRight, FileText, Plus } from "lucide-react";
import { getAllBlogPostSummaries } from "@/lib/supabase";
import { DashboardCard } from "@/components/admin/dashboard-card";
import type { BlogPostSummary } from "@/lib/types/blog";

export default async function AdminDashboardPage() {
    // 数据获取失败时优雅降级：显示 0 / 空态 + 提示，不整页 crash
    let posts: BlogPostSummary[] = [];
    let loadFailed = false;
    try {
        posts = await getAllBlogPostSummaries(true);
    } catch {
        loadFailed = true;
    }

    const publishedCount = posts.filter((p) => p.published).length;
    const stats = [
        { label: "文章总数", value: posts.length },
        { label: "已发布", value: publishedCount },
        { label: "草稿", value: posts.length - publishedCount },
    ];
    const recent = posts.slice(0, 5);

    const quickActionCls =
        "flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-foreground/[0.03]";

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">仪表盘</h1>
                <p className="mt-1 text-sm text-muted">站点数据概览与快捷入口</p>
            </div>

            {loadFailed && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                    数据加载失败，以下显示为默认值，请稍后刷新重试
                </p>
            )}

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {stats.map((s) => (
                    <div
                        key={s.label}
                        className="rounded-xl border border-border/50 px-4 py-3 sm:px-5 sm:py-4"
                    >
                        <p className="text-xs text-muted sm:text-sm">{s.label}</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                            {s.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
                <DashboardCard
                    title="最近文章"
                    className="lg:col-span-3"
                    action={
                        <Link
                            href="/admin/blog"
                            className="text-xs text-muted transition-colors hover:text-foreground"
                        >
                            全部文章
                        </Link>
                    }
                >
                    {recent.length > 0 ? (
                        <ul className="flex flex-col">
                            {recent.map((post) => (
                                <li key={post.slug}>
                                    <Link
                                        href={`/admin/blog/edit/${post.slug}`}
                                        className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-foreground/[0.03]"
                                    >
                                        <span className="flex min-w-0 items-center gap-2">
                                            <span className="truncate text-sm text-foreground">
                                                {post.title}
                                            </span>
                                            {!post.published && (
                                                <span className="flex-shrink-0 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                                                    草稿
                                                </span>
                                            )}
                                        </span>
                                        <span className="flex-shrink-0 text-xs text-muted">
                                            {post.date}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-8 text-center text-sm text-muted">暂无文章</p>
                    )}
                </DashboardCard>

                <DashboardCard title="快速操作" className="lg:col-span-2">
                    <div className="flex flex-col gap-2">
                        <Link href="/admin/blog?new=1" className={quickActionCls}>
                            <Plus className="h-4 w-4 flex-shrink-0 text-muted" />
                            新建文章
                        </Link>
                        <Link href="/admin/blog" className={quickActionCls}>
                            <FileText className="h-4 w-4 flex-shrink-0 text-muted" />
                            管理博客
                        </Link>
                        <Link href="/" className={quickActionCls}>
                            <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-muted" />
                            查看站点
                        </Link>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
}
