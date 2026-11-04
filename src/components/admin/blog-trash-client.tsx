"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/admin/badge";
import { IconButton } from "@/components/admin/icon-button";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import type { BlogPostSummary } from "@/lib/types/blog";

interface PendingAction {
    type: "restore" | "purge";
    post: BlogPostSummary;
}

export function BlogTrashClient() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const [posts, setPosts] = useState<BlogPostSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch("/api/admin/blog/trash", { signal });
            if (res.status === 401) {
                authExpired();
                return;
            }
            if (!res.ok) throw new Error("加载失败");
            setPosts(await res.json());
            setLoadFailed(false);
        } catch {
            if (!signal?.aborted) setLoadFailed(true);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [authExpired]);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载远端数据，状态更新发生在请求完成后
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const executeAction = async () => {
        if (!pendingAction) return;
        const { type, post } = pendingAction;
        try {
            const res = await fetch(`/api/admin/blog/trash/${post.slug}`, {
                method: type === "restore" ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expectedUpdatedAt: post.updatedAt }),
            });
            if (res.status === 401) {
                authExpired();
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error || "操作失败");
                return;
            }
            setPosts((items) => items.filter((item) => item.slug !== post.slug));
            setPendingAction(null);
            toast.success(type === "restore" ? "文章已恢复" : "文章及其历史版本已彻底删除");
        } catch {
            toast.error("网络错误，请检查连接后重试");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <Link href="/admin/blog" className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />返回博客
            </Link>
            <PageHeader title="回收站" description="恢复误删文章，或彻底删除不再需要的内容" />

            {loading ? (
                <div className="flex flex-col gap-2" aria-busy="true" aria-label="加载回收站">
                    {[0, 1, 2].map((item) => <div key={item} className="h-[72px] rounded-lg bg-foreground/[0.03] motion-safe:animate-pulse" />)}
                </div>
            ) : loadFailed ? (
                <div className="flex flex-col items-center gap-3 py-16">
                    <p className="text-sm text-muted">回收站加载失败</p>
                    <button onClick={() => { setLoading(true); load(); }} className="rounded-lg bg-foreground px-4 py-2 text-sm text-background">重试</button>
                </div>
            ) : posts.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted">回收站为空</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {posts.map((post) => (
                        <div key={post.slug} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-4 py-3">
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                <div className="flex min-w-0 items-center gap-2">
                                    <h2 className="truncate text-sm font-medium">{post.title}</h2>
                                    {!post.published && <Badge variant="warning">草稿</Badge>}
                                </div>
                                <p className="text-xs text-muted">
                                    删除于 {post.deletedAt ? new Date(post.deletedAt).toLocaleString("zh-CN", { hour12: false }) : "未知时间"}
                                </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-1">
                                <IconButton label={`恢复 ${post.title}`} title="恢复文章" size="lg" onClick={() => setPendingAction({ type: "restore", post })}>
                                    <RotateCcw className="h-4 w-4" />
                                </IconButton>
                                <IconButton label={`彻底删除 ${post.title}`} title="彻底删除" size="lg" variant="danger" onClick={() => setPendingAction({ type: "purge", post })}>
                                    <Trash2 className="h-4 w-4" />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={pendingAction !== null}
                onClose={() => setPendingAction(null)}
                onConfirm={executeAction}
                title={pendingAction?.type === "purge" ? "彻底删除文章" : "恢复文章"}
                message={pendingAction?.type === "purge"
                    ? `确定彻底删除「${pendingAction.post.title}」吗？文章及全部历史版本将被删除；仍被其他文章或历史版本引用的媒体会保留。此操作不可撤销。`
                    : `确定将「${pendingAction?.post.title ?? ""}」恢复到博客列表吗？文章会保持删除前的发布状态。`}
                confirmLabel={pendingAction?.type === "purge" ? "彻底删除" : "确认恢复"}
                danger={pendingAction?.type === "purge"}
            />
        </div>
    );
}
