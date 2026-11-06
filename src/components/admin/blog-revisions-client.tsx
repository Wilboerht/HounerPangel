"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { Badge } from "@/components/admin/badge";
import { PageHeader } from "@/components/admin/page-header";
import { BackLink } from "@/components/admin/back-link";
import { Button } from "@/components/admin/button";
import { EmptyState, ErrorState } from "@/components/admin/states";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { diffLines } from "@/lib/text-diff";
import type { BlogPost, BlogRevision, BlogRevisionAction, BlogRevisionSummary } from "@/lib/types/blog";

const ACTION_LABELS: Record<BlogRevisionAction, string> = {
    baseline: "初始快照",
    created: "创建版本",
    updated: "保存前版本",
    published: "发布前版本",
    unpublished: "下线前版本",
    deleted: "删除前版本",
    restored: "恢复前版本",
};

function formatTime(value: string) {
    return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

export function BlogRevisionsClient({ slug }: { slug: string }) {
    const router = useRouter();
    const toast = useToast();
    const authExpired = useAuthExpired();
    const [current, setCurrent] = useState<BlogPost | null>(null);
    const [revisions, setRevisions] = useState<BlogRevisionSummary[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selected, setSelected] = useState<BlogRevision | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<BlogRevision | null>(null);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const [postRes, revisionsRes] = await Promise.all([
                fetch(`/api/admin/blog/${slug}`, { signal }),
                fetch(`/api/admin/blog/${slug}/revisions`, { signal }),
            ]);
            if (postRes.status === 401 || revisionsRes.status === 401) {
                authExpired();
                return;
            }
            if (postRes.status === 404 || revisionsRes.status === 404) {
                toast.error("文章不存在或已被移入回收站");
                router.push("/admin/blog");
                return;
            }
            if (!postRes.ok || !revisionsRes.ok) throw new Error("加载失败");
            const post = await postRes.json() as BlogPost;
            const history = await revisionsRes.json() as BlogRevisionSummary[];
            setCurrent(post);
            setRevisions(history);
            setSelectedId((value) => value && history.some((item) => item.id === value) ? value : history[0]?.id ?? null);
            setLoadFailed(false);
        } catch {
            if (signal?.aborted) return;
            setLoadFailed(true);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [authExpired, router, slug, toast]);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载远端数据，状态更新发生在请求完成后
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    useEffect(() => {
        if (!selectedId) return;
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 切换版本时清空旧详情并显示加载态，后续状态更新由请求回调完成
        setSelected(null);
        setDetailLoading(true);
        fetch(`/api/admin/blog/${slug}/revisions?revisionId=${encodeURIComponent(selectedId)}`, { signal: controller.signal })
            .then(async (res) => {
                if (res.status === 401) {
                    authExpired();
                    return null;
                }
                if (!res.ok) throw new Error("加载版本失败");
                return await res.json() as BlogRevision;
            })
            .then((revision) => {
                if (revision) setSelected(revision);
            })
            .catch(() => {
                if (!controller.signal.aborted) toast.error("加载版本内容失败");
            })
            .finally(() => {
                if (!controller.signal.aborted) setDetailLoading(false);
            });
        return () => controller.abort();
    }, [authExpired, selectedId, slug, toast]);

    const restore = async () => {
        if (!restoreTarget || !current) return;
        try {
            const res = await fetch(`/api/admin/blog/${slug}/revisions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ revisionId: restoreTarget.id, expectedUpdatedAt: current.updatedAt }),
            });
            if (res.status === 401) {
                authExpired();
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "恢复版本失败");
                return;
            }
            toast.success("已恢复所选版本，恢复前的内容也已保留在历史记录中");
            setRestoreTarget(null);
            router.push(`/admin/blog/edit/${slug}`);
        } catch {
            toast.error("网络错误，请检查连接后重试");
        }
    };

    if (loading) {
        return <div className="h-96 rounded-xl bg-foreground/[0.03] motion-safe:animate-pulse" aria-label="加载版本历史" aria-busy="true" />;
    }

    if (loadFailed || !current) {
        return (
            <ErrorState
                title="版本历史加载失败"
                onRetry={() => { setLoading(true); load(); }}
            />
        );
    }

    const diff = selected ? diffLines(selected.content, current.content) : [];
    const metadataDiffs = selected ? [
        { label: "标题", before: selected.title, after: current.title },
        { label: "文章日期", before: selected.date, after: current.date },
        { label: "发布状态", before: selected.published ? "已发布" : "未发布", after: current.published ? "已发布" : "未发布" },
        { label: "归档时间", before: selected.archivedAt ?? "", after: current.archivedAt ?? "" },
        { label: "标签", before: selected.tags.join("、"), after: current.tags.join("、") },
        { label: "摘要", before: selected.excerpt ?? "", after: current.excerpt ?? "" },
        { label: "SEO 标题", before: selected.seoTitle ?? "", after: current.seoTitle ?? "" },
        { label: "SEO 描述", before: selected.seoDescription ?? "", after: current.seoDescription ?? "" },
        { label: "封面", before: selected.coverImage ?? "", after: current.coverImage ?? "" },
    ].filter((item) => item.before !== item.after) : [];

    return (
        <div className="flex flex-col gap-6">
            <BackLink href={`/admin/blog/edit/${slug}`} label="返回编辑" />
            <PageHeader title="版本历史" description={`${current.title} · 选择历史版本与当前内容对比`} />

            {revisions.length === 0 ? (
                <EmptyState
                    icon={History}
                    title="暂无历史版本"
                    description="保存文章后会在这里生成版本快照"
                />
            ) : (
                <div className="grid gap-4 lg:grid-cols-3">
                    <section className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-xl border border-border/50 p-3 lg:max-h-[70dvh]">
                        <h2 className="flex items-center gap-2 px-1 pb-2 text-sm font-medium"><History className="h-4 w-4" />历史快照</h2>
                        {revisions.map((revision) => (
                            <button
                                key={revision.id}
                                onClick={() => setSelectedId(revision.id)}
                                className={`flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${selectedId === revision.id ? "border-accent/40 bg-accent/5" : "border-border/50 hover:bg-foreground/[0.03]"}`}
                            >
                                <span className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-medium">{ACTION_LABELS[revision.action]}</span>
                                    {!revision.published && <Badge variant="warning">草稿</Badge>}
                                </span>
                                <span className="truncate text-xs text-muted">{revision.title}</span>
                                <time className="text-xs text-muted">{formatTime(revision.createdAt)}</time>
                            </button>
                        ))}
                    </section>

                    <section className="flex flex-col gap-4 rounded-xl border border-border/50 p-4 lg:col-span-2">
                        {detailLoading || !selected ? (
                            <div className="h-72 rounded-lg bg-foreground/[0.03] motion-safe:animate-pulse" aria-label="加载版本内容" aria-busy="true" />
                        ) : (
                            <>
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <h2 className="break-words text-base font-semibold">{selected.title}</h2>
                                        <p className="text-xs text-muted">快照记录于 {formatTime(selected.createdAt)} · 文章日期 {selected.date}</p>
                                    </div>
                                    <Button variant="primary" size="lg" onClick={() => setRestoreTarget(selected)}>
                                        <RotateCcw className="h-4 w-4" />恢复此版本
                                    </Button>
                                </div>
                                <div className="rounded-lg border border-border/50 bg-foreground/[0.02] px-3 py-2 text-xs text-muted">
                                    下方对比中，红色为历史版本内容，绿色为当前版本内容。恢复会生成新的历史快照，不会删除其他版本。
                                </div>
                                {metadataDiffs.length > 0 && (
                                    <div className="flex flex-col gap-2 rounded-lg border border-border/50 p-3">
                                        <h3 className="text-xs font-medium">字段差异</h3>
                                        {metadataDiffs.map((item) => (
                                            <div key={item.label} className="grid gap-2 text-xs sm:grid-cols-[6rem_1fr_1fr]">
                                                <span className="font-medium">{item.label}</span>
                                                <span className="whitespace-pre-wrap break-words rounded bg-red-500/10 px-2 py-1 text-red-700">{item.before || "（空）"}</span>
                                                <span className="whitespace-pre-wrap break-words rounded bg-green-500/10 px-2 py-1 text-green-700">{item.after || "（空）"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="max-h-[60dvh] overflow-auto rounded-lg border border-border/50 font-mono text-xs leading-6">
                                    {diff.map((line, index) => (
                                        <div key={index} className={`grid grid-cols-[2rem_1fr] border-b border-border/30 last:border-0 ${line.type === "added" ? "bg-green-500/10 text-green-700" : line.type === "removed" ? "bg-red-500/10 text-red-700" : "text-muted"}`}>
                                            <span className="select-none border-r border-border/30 px-2 text-right">{line.type === "added" ? "+" : line.type === "removed" ? "−" : ""}</span>
                                            <pre className="whitespace-pre-wrap break-words px-3 py-0.5">{line.text || " "}</pre>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}

            <ConfirmDialog
                isOpen={restoreTarget !== null}
                onClose={() => setRestoreTarget(null)}
                onConfirm={restore}
                title="恢复历史版本"
                message={`确定用 ${restoreTarget ? formatTime(restoreTarget.createdAt) : ""} 的版本覆盖当前内容吗？当前内容会自动保留为新的历史快照。`}
                confirmLabel="确认恢复"
                danger={false}
            />
        </div>
    );
}
