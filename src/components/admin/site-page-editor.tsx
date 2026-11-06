"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, History, Save } from "lucide-react";
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
import { useLocalDraft } from "@/lib/use-local-draft";
import { useDraftRestore } from "@/lib/use-draft-restore";
import { SITE_PAGE_DRAFT_KEY } from "@/lib/site-page-draft";
import type { SitePage } from "@/lib/types/site-page";

const SLUG = "about";
const PUBLIC_HREF = "/me";

type FormState = Pick<SitePage, "title" | "description" | "content">;

function sameForm(a: FormState, b: FormState) {
    return a.title === b.title && a.description === b.description && a.content === b.content;
}

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
    const [pendingDestination, setPendingDestination] = useState<string | null>(null);
    const draftCheckedRef = useRef(false);
    const draftReadyRef = useRef(false);
    const {
        read: readDraft,
        clear: clearDraft,
        scheduleSave: scheduleDraftSave,
    } = useLocalDraft<FormState>(SITE_PAGE_DRAFT_KEY);
    const draftRestore = useDraftRestore<FormState>({
        apply: (draft) => setForm(draft),
        discard: clearDraft,
    });

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

    // 加载完成后检查本地草稿：与服务器内容一致则直接清理，不一致才询问恢复
    useEffect(() => {
        if (!saved || draftCheckedRef.current) return;
        draftCheckedRef.current = true;
        const stored = readDraft();
        if (!stored) return;
        if (
            typeof stored.title !== "string" ||
            typeof stored.description !== "string" ||
            typeof stored.content !== "string"
        ) {
            clearDraft();
            return;
        }
        if (sameForm(stored, saved)) {
            clearDraft();
            return;
        }
        draftRestore.setDraftPrompt(stored);
    }, [clearDraft, draftRestore, readDraft, saved]);

    // 表单变化后防抖写入本地草稿；与已保存内容一致时清除草稿
    useEffect(() => {
        if (!saved) return;
        if (!draftReadyRef.current) {
            draftReadyRef.current = true;
            return;
        }
        if (sameForm(form, saved)) {
            clearDraft();
            return;
        }
        scheduleDraftSave(form);
    }, [clearDraft, form, saved, scheduleDraftSave]);

    const dirty = saved !== null && (
        form.title !== saved.title ||
        form.description !== saved.description ||
        form.content !== saved.content
    );

    useDirtyGuard(dirty, () => setPendingDestination("/admin"));

    const handleHistoryClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (!dirty) return;
        event.preventDefault();
        setPendingDestination("/admin/about/history");
    };

    const updateField = (patch: Partial<FormState>) => {
        setForm((current) => ({ ...current, ...patch }));
    };

    const handleSave = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (saving || uploading || !saved || !dirty) return;
        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            content: form.content,
        };
        if (!payload.title) {
            toast.error("页面标题不能为空");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/pages/${SLUG}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...payload, expectedUpdatedAt: updatedAt }),
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
            setForm(payload);
            setSaved({ slug: SLUG, ...payload, updatedAt: nextUpdatedAt });
            clearDraft();
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
        clearDraft();
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
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/admin/about/history"
                            onClick={handleHistoryClick}
                            className={buttonClassName({ variant: "secondary", size: "lg" })}
                        >
                            <History className="h-4 w-4" />历史版本
                        </Link>
                        <Link
                            href={PUBLIC_HREF}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="打开已保存的公开页面（新标签页）"
                            className={buttonClassName({ variant: "secondary", size: "lg" })}
                        >
                            <ExternalLink className="h-4 w-4" />查看已保存页面
                        </Link>
                    </div>
                }
            />

            {loading ? (
                <LoadingRows count={3} className="h-16" />
            ) : loadFailed ? (
                <ErrorState
                    title="页面内容加载失败"
                    description="请确认已应用 supabase/migrations 下的 site_pages 与 site_page_revisions 迁移"
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
                isOpen={pendingDestination !== null}
                onClose={() => setPendingDestination(null)}
                onConfirm={() => {
                    const href = pendingDestination ?? "/admin";
                    setPendingDestination(null);
                    router.push(href);
                }}
                title="离开编辑"
                message="有未保存的页面内容，确定离开吗？未保存内容会保留为本地草稿。"
                confirmLabel="确定离开"
                danger={false}
            />

            <ConfirmDialog
                isOpen={draftRestore.draftPrompt !== null}
                onClose={draftRestore.cancelRestore}
                onConfirm={draftRestore.confirmRestore}
                title="恢复草稿"
                message="检测到未保存的本地草稿，是否恢复？"
                confirmLabel="恢复"
                danger={false}
            />
        </div>
    );
}
