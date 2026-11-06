"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, File, Film, Image as ImageIcon, Pencil, Search, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { Button } from "@/components/admin/button";
import { Dialog } from "@/components/admin/dialog";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/states";
import { fieldClass, fieldSearchClass } from "@/components/admin/field-classes";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import type { MediaAsset, MediaKind } from "@/lib/types/media";

const MIME_BY_EXTENSION: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", avi: "video/x-msvideo", mkv: "video/x-matroska",
    pdf: "application/pdf", txt: "text/plain", md: "text/markdown", csv: "text/csv", zip: "application/zip",
    doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function fileExtension(file: File) { return file.name.split(".").pop()?.toLowerCase() ?? ""; }
function fileKind(file: File): MediaKind | null {
    const mimeType = MIME_BY_EXTENSION[fileExtension(file)];
    if (!mimeType) return null;
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "attachment";
}

function imageDimensions(file: File): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => { resolve({ width: image.naturalWidth, height: image.naturalHeight }); URL.revokeObjectURL(url); };
        image.onerror = () => { resolve(null); URL.revokeObjectURL(url); };
        image.src = url;
    });
}

function formatSize(size: number) {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

type MediaSort = "newest" | "oldest" | "name" | "references" | "size";

export function MediaAdminClient() {
    const toast = useToast();
    const authExpired = useAuthExpired();
    const fileRef = useRef<HTMLInputElement>(null);
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [search, setSearch] = useState("");
    const [kind, setKind] = useState("all");
    const [onlyOrphans, setOnlyOrphans] = useState(false);
    const [sort, setSort] = useState<MediaSort>("newest");
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deletingMany, setDeletingMany] = useState(false);
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState<MediaAsset | null>(null);
    const [alt, setAlt] = useState("");
    const [caption, setCaption] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<MediaAsset | null>(null);
    const [pendingClose, setPendingClose] = useState(false);

    const load = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch("/api/admin/media", { signal });
            if (res.status === 401) { authExpired(); return; }
            if (!res.ok) throw new Error("加载失败");
            setAssets(await res.json());
            setFailed(false);
        } catch {
            if (!signal?.aborted) setFailed(true);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, [authExpired]);

    useEffect(() => {
        const controller = new AbortController();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载时加载远端媒体列表
        load(controller.signal);
        return () => controller.abort();
    }, [load]);

    const metadataDirty = editing !== null && (alt !== editing.alt || caption !== editing.caption);
    const dismissMetadata = () => {
        setPendingClose(false);
        setEditing(null);
    };
    const closeMetadata = () => {
        if (saving) return;
        if (metadataDirty) {
            setPendingClose(true);
            return;
        }
        dismissMetadata();
    };
    useDirtyGuard(metadataDirty, () => setPendingClose(true));

    const upload = async (file: File | undefined) => {
        if (!file || uploading) return;
        const mediaKind = fileKind(file);
        if (!mediaKind) { toast.error("不支持的文件类型"); return; }
        setUploading(true);
        try {
            const contentType = MIME_BY_EXTENSION[fileExtension(file)];
            const urlRes = await fetch("/api/admin/upload-url", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: file.name, contentType, size: file.size }),
            });
            if (urlRes.status === 401) { authExpired(); return; }
            const urlData = await urlRes.json();
            if (!urlRes.ok) throw new Error(urlData.error || "生成上传链接失败");
            const uploadRes = await fetch(urlData.signedUrl, { method: "PUT", headers: { "Content-Type": contentType }, body: file });
            if (!uploadRes.ok) throw new Error("文件上传失败");
            const dimensions = mediaKind === "image" ? await imageDimensions(file) : null;
            const registerRes = await fetch("/api/admin/media", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: urlData.filePath, fileName: file.name, kind: mediaKind, mimeType: contentType, size: file.size, width: dimensions?.width ?? null, height: dimensions?.height ?? null }),
            });
            if (!registerRes.ok) throw new Error("文件已上传，但媒体信息登记失败");
            toast.success("媒体已上传");
            setPage(1);
            await load();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "上传失败");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        for (const file of files) {
            await upload(file);
        }
    };

    const saveMetadata = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const isRegistered = /^[0-9a-f-]{36}$/.test(editing.id);
            const res = await fetch(isRegistered ? `/api/admin/media/${editing.id}` : "/api/admin/media", {
                method: isRegistered ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(isRegistered ? { alt, caption } : {
                    path: editing.path,
                    fileName: editing.fileName,
                    kind: editing.kind,
                    mimeType: editing.mimeType,
                    size: editing.size,
                    width: editing.width,
                    height: editing.height,
                    alt,
                    caption,
                }),
            });
            if (res.status === 401) { authExpired(); return; }
            if (!res.ok) { toast.error("保存媒体信息失败"); return; }
            await load();
            setEditing(null);
            toast.success("媒体信息已保存");
        } catch { toast.error("网络错误，请重试"); } finally { setSaving(false); }
    };

    const remove = async () => {
        if (!deleting) return;
        try {
            const res = await fetch(`/api/admin/media/${encodeURIComponent(deleting.id)}`, { method: "DELETE" });
            if (res.status === 401) { authExpired(); return; }
            const data = await res.json();
            if (!res.ok) { toast.error(data.error || "删除失败"); return; }
            setAssets((items) => items.filter((item) => item.id !== deleting.id));
            setSelectedIds((current) => {
                const next = new Set(current);
                next.delete(deleting.id);
                return next;
            });
            setDeleting(null);
            toast.success("零引用媒体已删除");
        } catch { toast.error("网络错误，请重试"); }
    };

    const removeSelected = async () => {
        if (selectedIds.size === 0 || deletingMany) return;
        const targets = assets.filter((asset) => selectedIds.has(asset.id));
        const deletable = targets.filter((asset) => asset.references === 0);
        let deleted = 0;
        let failed = 0;
        setDeletingMany(true);
        try {
            for (const asset of deletable) {
                const res = await fetch(`/api/admin/media/${encodeURIComponent(asset.id)}`, { method: "DELETE" });
                if (res.status === 401) { authExpired(); return; }
                if (res.ok) deleted += 1;
                else failed += 1;
            }
            await load();
            setSelectedIds(new Set());
            setConfirmBulkDelete(false);
            const skipped = targets.length - deletable.length;
            if (failed > 0) toast.error(`已删除 ${deleted} 个，失败 ${failed} 个，跳过 ${skipped} 个`);
            else if (skipped > 0) toast.info(`已删除 ${deleted} 个，跳过 ${skipped} 个仍有引用的媒体`);
            else toast.success(`已删除 ${deleted} 个媒体`);
        } catch {
            toast.error("网络错误，请重试");
        } finally {
            setDeletingMany(false);
        }
    };

    const filtered = assets.filter((asset) =>
        (kind === "all" || asset.kind === kind) && (!onlyOrphans || asset.references === 0) &&
        (!search || `${asset.fileName} ${asset.alt} ${asset.path}`.toLowerCase().includes(search.toLowerCase()))
    );
    const sorted = [...filtered].sort((a, b) => {
        switch (sort) {
            case "oldest": return a.createdAt.localeCompare(b.createdAt);
            case "name": return (a.alt || a.fileName).localeCompare(b.alt || b.fileName, "zh-CN");
            case "references": return b.references - a.references;
            case "size": return b.size - a.size;
            default: return b.createdAt.localeCompare(a.createdAt);
        }
    });
    const maxPage = Math.max(1, Math.ceil(sorted.length / pageSize));
    const currentPage = Math.min(page, maxPage);
    const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const allPageSelected = paged.length > 0 && paged.every((asset) => selectedIds.has(asset.id));
    const somePageSelected = paged.some((asset) => selectedIds.has(asset.id)) && !allPageSelected;

    const hasFilters = Boolean(search) || kind !== "all" || onlyOrphans;

    return (
        <div
            className="flex flex-col gap-6"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
        >
            <PageHeader title="媒体库" description="管理、复用媒体并清理零引用文件，支持拖拽上传" actions={
                <>
                    <input ref={fileRef} type="file" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
                    <Button variant="primary" size="lg" disabled={uploading} onClick={() => fileRef.current?.click()}>
                        <Upload className="h-4 w-4" />{uploading ? "上传中..." : "上传媒体"}
                    </Button>
                </>
            } />

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input aria-label="搜索媒体" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="搜索文件名或替代文本" className={fieldSearchClass} />
                </div>
                <select aria-label="媒体类型" value={kind} onChange={(event) => { setKind(event.target.value); setPage(1); }} className={`${fieldClass} sm:max-w-36`}>
                    <option value="all">全部类型</option><option value="image">图片</option><option value="video">视频</option><option value="attachment">附件</option>
                </select>
                <select aria-label="排序方式" value={sort} onChange={(event) => { setSort(event.target.value as MediaSort); setPage(1); }} className={`${fieldClass} sm:max-w-40`}>
                    <option value="newest">最新上传</option>
                    <option value="oldest">最早上传</option>
                    <option value="name">按名称</option>
                    <option value="references">按引用数</option>
                    <option value="size">按文件大小</option>
                </select>
                <label className="flex min-h-[44px] items-center gap-2 px-2 text-sm">
                    <input type="checkbox" checked={onlyOrphans} onChange={(event) => { setOnlyOrphans(event.target.checked); setPage(1); }} className="h-4 w-4" />
                    仅看零引用
                </label>
            </div>

            {loading ? (
                <LoadingRows count={4} />
            ) : failed ? (
                <ErrorState title="媒体库加载失败" onRetry={() => { setLoading(true); load(); }} />
            ) : filtered.length === 0 ? (
                <EmptyState
                    icon={ImageIcon}
                    title={hasFilters ? "暂无匹配媒体" : "媒体库为空"}
                    description={hasFilters ? "试试调整搜索词或筛选条件" : "上传图片、视频或附件后会出现在这里"}
                    action={hasFilters ? (
                        <Button onClick={() => { setSearch(""); setKind("all"); setOnlyOrphans(false); setSort("newest"); setPage(1); }}>清除筛选</Button>
                    ) : (
                        <Button variant="primary" onClick={() => fileRef.current?.click()}>
                            <Upload className="h-4 w-4" />上传媒体
                        </Button>
                    )}
                />
            ) : (
                <div className="flex flex-col gap-2">
                    <label className="flex min-h-[44px] items-center gap-2 px-2 text-sm text-muted sm:min-h-[36px]">
                        <input
                            type="checkbox"
                            aria-label="选择当前页全部媒体"
                            checked={allPageSelected}
                            ref={(element) => {
                                if (element) element.indeterminate = somePageSelected;
                            }}
                            onChange={(event) => setSelectedIds(event.target.checked ? new Set(paged.map((asset) => asset.id)) : new Set())}
                            className="h-4 w-4"
                        />
                        选择本页
                    </label>

                    {selectedIds.size > 0 && (
                        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm">
                            <span className="mr-auto">已选 {selectedIds.size} 个 · 仅零引用媒体可删除</span>
                            <Button variant="danger" disabled={deletingMany} onClick={() => setConfirmBulkDelete(true)}>删除所选</Button>
                            <Button variant="ghost" onClick={() => setSelectedIds(new Set())}>清除选择</Button>
                        </div>
                    )}

                    {paged.map((asset) => (
                        <div key={asset.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2 rounded-lg border border-border/50 p-3 transition-colors hover:bg-foreground/[0.03] sm:flex sm:items-center">
                            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground/5">
                                {asset.kind === "image" ? <NextImage src={asset.url} alt="" fill sizes="56px" className="object-cover" /> : asset.kind === "video" ? <Film className="h-5 w-5 text-muted" /> : <File className="h-5 w-5 text-muted" />}
                                <label className="absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-md bg-background/90 shadow-sm backdrop-blur-sm">
                                    <input
                                        type="checkbox"
                                        aria-label={`选择 ${asset.fileName}`}
                                        checked={selectedIds.has(asset.id)}
                                        onChange={() => setSelectedIds((current) => {
                                            const next = new Set(current);
                                            if (next.has(asset.id)) next.delete(asset.id); else next.add(asset.id);
                                            return next;
                                        })}
                                        className="h-4 w-4"
                                    />
                                </label>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{asset.alt || asset.fileName}</p>
                                <p className="mt-1 truncate text-xs text-muted">{formatSize(asset.size)} · 引用 {asset.references}{asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}</p>
                                {asset.caption && <p className="mt-1 truncate text-xs text-muted">{asset.caption}</p>}
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1 sm:col-auto">
                                <IconButton size="adaptive" label="复制媒体地址" onClick={async () => { try { await navigator.clipboard.writeText(asset.url); toast.success("地址已复制"); } catch { toast.error("复制失败，请检查浏览器剪贴板权限"); } }}><Copy className="h-4 w-4" /></IconButton>
                                <IconButton size="adaptive" label="编辑媒体信息" onClick={() => { setEditing(asset); setAlt(asset.alt); setCaption(asset.caption); }}><Pencil className="h-4 w-4" /></IconButton>
                                <IconButton
                                    size="adaptive"
                                    label="删除零引用媒体"
                                    title={asset.references > 0 ? "仍有引用，无法删除" : "删除零引用媒体"}
                                    variant="danger"
                                    disabled={asset.references > 0}
                                    onClick={() => setDeleting(asset)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm text-muted">
                        <span>共 {sorted.length} 个媒体 · 第 {currentPage} / {maxPage} 页</span>
                        <div className="flex gap-2">
                            <Button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>上一页</Button>
                            <Button disabled={currentPage >= maxPage} onClick={() => setPage(currentPage + 1)}>下一页</Button>
                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={editing !== null}
                onClose={closeMetadata}
                title={<span className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />编辑媒体信息</span>}
                size="md"
                closeDisabled={saving}
                footer={
                    <>
                        <Button onClick={closeMetadata}>取消</Button>
                        <Button variant="primary" onClick={saveMetadata} disabled={saving}>
                            {saving ? "保存中..." : "保存"}
                        </Button>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <label className="flex flex-col gap-2 text-sm">
                        图片替代文本
                        <input value={alt} maxLength={500} onChange={(event) => setAlt(event.target.value)} className={fieldClass} />
                    </label>
                    <label className="flex flex-col gap-2 text-sm">
                        说明文字
                        <textarea value={caption} maxLength={1000} onChange={(event) => setCaption(event.target.value)} rows={3} className={fieldClass} />
                    </label>
                </div>
            </Dialog>

            <ConfirmDialog isOpen={deleting !== null} onClose={() => setDeleting(null)} onConfirm={remove} title="删除零引用媒体" message={`确定删除「${deleting?.fileName ?? ""}」吗？该操作会移除 Storage 文件，且不可撤销。`} confirmLabel="彻底删除" />
            <ConfirmDialog
                isOpen={confirmBulkDelete}
                onClose={() => setConfirmBulkDelete(false)}
                onConfirm={removeSelected}
                title="批量删除媒体"
                message={`确定删除已选的 ${selectedIds.size} 个媒体吗？仅零引用文件会被删除，仍有引用的会自动跳过。`}
                confirmLabel="删除所选"
            />
            <ConfirmDialog
                isOpen={pendingClose}
                onClose={() => setPendingClose(false)}
                onConfirm={dismissMetadata}
                title="放弃媒体信息更改"
                message="有尚未保存的媒体信息，确定关闭并丢弃这些更改吗？"
                confirmLabel="放弃更改"
                danger={false}
            />
        </div>
    );
}
