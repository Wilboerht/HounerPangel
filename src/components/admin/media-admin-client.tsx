"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, File, Film, Image as ImageIcon, Pencil, Search, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { IconButton } from "@/components/admin/icon-button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { useAuthExpired } from "@/lib/use-auth-expired";
import { useDirtyGuard } from "@/lib/use-dirty-guard";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
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

    const editingDirty = editing !== null && (alt !== editing.alt || caption !== editing.caption);
    const dismissMetadata = () => {
        setPendingClose(false);
        setEditing(null);
    };
    const closeMetadata = () => {
        if (saving) return;
        if (editingDirty) {
            setPendingClose(true);
            return;
        }
        dismissMetadata();
    };
    const metadataTrapRef = useFocusTrap(editing !== null, closeMetadata);
    useScrollLock(editing !== null);
    useDirtyGuard(editingDirty, () => setPendingClose(true));

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
            await load();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "上传失败");
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = "";
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
            setDeleting(null);
            toast.success("零引用媒体已删除");
        } catch { toast.error("网络错误，请重试"); }
    };

    const filtered = assets.filter((asset) =>
        (kind === "all" || asset.kind === kind) && (!onlyOrphans || asset.references === 0) &&
        (!search || `${asset.fileName} ${asset.alt} ${asset.path}`.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-6">
            <PageHeader title="媒体库" description="管理、复用媒体并清理零引用文件" actions={
                <>
                    <input ref={fileRef} type="file" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
                    <button disabled={uploading} onClick={() => fileRef.current?.click()} className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"><Upload className="h-4 w-4" />{uploading ? "上传中..." : "上传媒体"}</button>
                </>
            } />

            <div className="flex flex-col gap-2 rounded-lg border border-border/50 p-3 sm:flex-row">
                <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input aria-label="搜索媒体" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索文件名或替代文本" className="w-full rounded-lg bg-foreground/5 py-2 pl-9 pr-3 text-sm" /></div>
                <select aria-label="媒体类型" value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-lg border border-border/50 bg-foreground/5 px-3 py-2 text-sm"><option value="all">全部类型</option><option value="image">图片</option><option value="video">视频</option><option value="attachment">附件</option></select>
                <label className="flex min-h-[44px] items-center gap-2 px-2 text-sm"><input type="checkbox" checked={onlyOrphans} onChange={(event) => setOnlyOrphans(event.target.checked)} />仅看零引用</label>
            </div>

            {loading ? <p className="py-16 text-center text-sm text-muted">加载中...</p> : failed ? <div className="py-16 text-center"><p className="text-sm text-muted">媒体库加载失败</p><button onClick={() => { setLoading(true); load(); }} className="mt-3 rounded-lg border border-border/50 px-4 py-2 text-sm">重试</button></div> : filtered.length === 0 ? <p className="py-16 text-center text-sm text-muted">暂无匹配媒体</p> : (
                <div className="flex flex-col gap-2">
                    {filtered.map((asset) => (
                        <div key={asset.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground/5">
                                {asset.kind === "image" ? <img src={asset.url} alt="" className="h-full w-full object-cover" /> : asset.kind === "video" ? <Film className="h-5 w-5 text-muted" /> : <File className="h-5 w-5 text-muted" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{asset.alt || asset.fileName}</p>
                                <p className="mt-1 truncate text-xs text-muted">{formatSize(asset.size)} · 引用 {asset.references}{asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}</p>
                                {asset.caption && <p className="mt-1 truncate text-xs text-muted">{asset.caption}</p>}
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-1">
                                <IconButton label="复制媒体地址" onClick={async () => { try { await navigator.clipboard.writeText(asset.url); toast.success("地址已复制"); } catch { toast.error("复制失败，请检查浏览器剪贴板权限"); } }}><Copy className="h-4 w-4" /></IconButton>
                                <IconButton label="编辑媒体信息" onClick={() => { setEditing(asset); setAlt(asset.alt); setCaption(asset.caption); }}><Pencil className="h-4 w-4" /></IconButton>
                                <IconButton label="删除零引用媒体" variant="danger" disabled={asset.references > 0} onClick={() => setDeleting(asset)}><Trash2 className="h-4 w-4" /></IconButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={closeMetadata}>
                    <div ref={metadataTrapRef} role="dialog" aria-modal="true" aria-label="编辑媒体信息" className="flex w-full max-w-md flex-col gap-4 rounded-xl bg-background p-5" onClick={(event) => event.stopPropagation()}>
                        <h2 className="flex items-center gap-2 text-base font-semibold"><ImageIcon className="h-4 w-4" />编辑媒体信息</h2>
                        <label className="flex flex-col gap-2 text-sm">图片替代文本<input value={alt} maxLength={500} onChange={(event) => setAlt(event.target.value)} className="rounded-lg border border-border/50 bg-foreground/5 px-3 py-2" /></label>
                        <label className="flex flex-col gap-2 text-sm">说明文字<textarea value={caption} maxLength={1000} onChange={(event) => setCaption(event.target.value)} rows={3} className="rounded-lg border border-border/50 bg-foreground/5 px-3 py-2" /></label>
                        <div className="flex justify-end gap-2"><button onClick={closeMetadata} className="rounded-lg px-4 py-2 text-sm text-muted">取消</button><button disabled={saving} onClick={saveMetadata} className="rounded-lg bg-foreground px-4 py-2 text-sm text-background">{saving ? "保存中..." : "保存"}</button></div>
                    </div>
                </div>
            )}

            <ConfirmDialog isOpen={deleting !== null} onClose={() => setDeleting(null)} onConfirm={remove} title="删除零引用媒体" message={`确定删除「${deleting?.fileName ?? ""}」吗？该操作会移除 Storage 文件，且不可撤销。`} confirmLabel="彻底删除" />
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
