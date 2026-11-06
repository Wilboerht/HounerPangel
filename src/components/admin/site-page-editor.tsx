"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/admin/badge";
import { Button, buttonClassName } from "@/components/admin/button";
import { ErrorState, LoadingRows } from "@/components/admin/states";
import { fieldClass } from "@/components/admin/field-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { MarkdownEditor } from "@/components/markdown-editor";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import type { SitePage } from "@/lib/types/site-page";

const SLUG = "about";
const PUBLIC_HREF = "/me";

type FormState = Pick<SitePage, "title" | "description" | "content">;

export function SitePageEditor() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const router = useRouter();
    const abortRef = useRef<AbortController | null>(null);

    const [loading, setLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState<SitePage | null>(null);
    const [form, setForm] = useState<FormState>({ title: "", description: "", content: "" });
    const [updatedAt, setUpdatedAt] = useState("");
    const [pendingLeave, setPendingLeave] = useState(false);

    const load = useCallback(() => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setLoading(true);
        setLoadFailed(false);

        fetch(`/api/admin/pages/${SLUG}`, { signal: controller.signal })
            .then(async (res) => {
                if (controller.signal.aborted) return null;
                if (res.status === 401) {
                    authExpired();
                    return null;
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json() as SitePage;
            })
            .then((page) => {
                if (!page || controller.signal.aborted) return;
                setSaved(page);
                setForm({ title: page.title, description: page.description, content: page.content });
                setUpdatedAt(page.updatedAt);
                setLoading(false);
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setLoading(false);
                setLoadFailed(true);
            });
    }, [authExpired]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载远端页面内容，状态更新发生在请求完成后
        load();
        return () => abortRef.current?.abort();
    }, [load]);

    const dirty = saved !== null && (
        form.title !== saved.title ||
        form.description !== saved.description ||
        form.content !== saved.content
    );

    useDirtyGuard(dirty, () => setPendingLeave(true));

    const updateField = (patch: Partial<FormState>) => {
        setForm((current) => ({ ...current, ...patch }));
    };

    const handleSave = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (saving || uploading || !saved || !dirty) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/pages/${SLUG}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, expectedUpdatedAt: updatedAt }),
            });
            if (res.status === 401) {
                authExpired();
                return;
            }
            const data = await res.json().catch(() => ({}));
            if (res.status === 409) {
                toast.error(data.error || "页面已被其他会话修改，请刷新后重试");
                return;
            }
            if (!res.ok) {
                toast.error(data.error || "保存页面失败");
                return;
            }
            const nextUpdatedAt = typeof data.updatedAt === "string" ? data.updatedAt : updatedAt;
            setUpdatedAt(nextUpdatedAt);
            setSaved({ slug: SLUG, ...form, updatedAt: nextUpdatedAt });
            toast.success("关于我页面已保存");
        } catch (error) {
            toast.error(error instanceof TypeError ? "网络错误，请检查连接后重试" : "保存页面失败");
        } finally {
            setSaving(false);
        }
    };

    const resetToSaved = () => {
        if (!saved) return;
        setForm({ title: saved.title, description: saved.description, content: saved.content });
    };

    const description = updatedAt
        ? `编辑公开 /me 页面内容 · 最近保存 ${new Date(updatedAt).toLocaleString("zh-CN", { hour12: false })}`
        : "编辑公开 /me 页面内容";

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="关于我"
                description={description}
                accessory={dirty ? <Badge variant="warning">未保存</Badge> : undefined}
                actions={
                    <Link
                        href={PUBLIC_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClassName({ variant: "secondary", size: "lg" })}
                    >
                        <ExternalLink className="h-4 w-4" />查看页面
                    </Link>
                }
            />

            {loading ? (
                <LoadingRows count={3} className="h-16" />
            ) : loadFailed ? (
                <ErrorState
                    title="页面内容加载失败"
                    description="请确认已应用最新的 site_pages 数据库迁移"
                    onRetry={load}
                />
            ) : (
                <form
                    onSubmit={handleSave}
                    onKeyDown={(event) => {
                        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
                            event.preventDefault();
                            event.currentTarget.requestSubmit();
                        }
                    }}
                    className="flex flex-col gap-4"
                >
                    <fieldset disabled={saving} className="flex min-w-0 flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="site-page-title" className="text-sm font-medium text-foreground">
                                页面标题 <span className="text-xs text-muted">({form.title.length}/200)</span>
                            </label>
                            <input
                                id="site-page-title"
                                type="text"
                                required
                                maxLength={200}
                                value={form.title}
                                onChange={(event) => updateField({ title: event.target.value })}
                                placeholder="关于我"
                                className={fieldClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="site-page-description" className="text-sm font-medium text-foreground">
                                页面描述 <span className="text-xs text-muted">({form.description.length}/500)</span>
                            </label>
                            <textarea
                                id="site-page-description"
                                rows={3}
                                maxLength={500}
                                value={form.description}
                                onChange={(event) => updateField({ description: event.target.value })}
                                placeholder="用于搜索结果和分享卡片"
                                className={fieldClass}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="site-page-content" className="text-sm font-medium text-foreground">
                                正文（Markdown）
                            </label>
                            <MarkdownEditor
                                id="site-page-content"
                                value={form.content}
                                onChange={(content) => updateField({ content })}
                                rows={18}
                                onAuthExpired={authExpired}
                                onUploadingChange={setUploading}
                            />
                        </div>
                    </fieldset>

                    <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-background pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                        <Button
                            type="button"
                            variant="secondary"
                            size="lg"
                            disabled={!dirty || saving}
                            onClick={resetToSaved}
                        >
                            恢复已保存内容
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={saving || uploading || !dirty}
                            title="保存 (Ctrl+S)"
                            className="px-6"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "保存中..." : uploading ? "上传中..." : "保存"}
                        </Button>
                    </div>
                </form>
            )}

            <ConfirmDialog
                isOpen={pendingLeave}
                onClose={() => setPendingLeave(false)}
                onConfirm={() => {
                    setPendingLeave(false);
                    router.push("/admin");
                }}
                title="离开编辑"
                message="有未保存的页面内容，确定离开吗？未保存内容将丢失。"
                confirmLabel="确定离开"
                danger={false}
            />
        </div>
    );
}
