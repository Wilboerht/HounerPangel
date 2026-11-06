"use client";

import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { File, Film, Image as ImageIcon, Search } from "lucide-react";
import { Dialog } from "@/components/admin/dialog";
import { Button } from "@/components/admin/button";
import { EmptyState, ErrorState, LoadingRows } from "@/components/admin/states";
import { fieldClass, fieldSearchClass } from "@/components/admin/field-classes";
import { useAuthExpired } from "@/lib/use-auth-expired";
import type { MediaAsset } from "@/lib/types/media";

export function MediaPicker({ onSelect, onClose }: { onSelect: (asset: MediaAsset) => void; onClose: () => void }) {
    const authExpired = useAuthExpired();
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [search, setSearch] = useState("");
    const [kind, setKind] = useState("all");
    const loadedRef = useRef(false);

    const load = useCallback(() => {
        setLoading(true);
        setFailed(false);
        fetch("/api/admin/media")
            .then(async (res) => {
                if (res.status === 401) { authExpired(); return null; }
                if (!res.ok) throw new Error("加载失败");
                return await res.json() as MediaAsset[];
            })
            .then((items) => { if (items) setAssets(items); })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, [authExpired]);

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        load();
    }, [load]);

    const filtered = assets.filter((asset) =>
        (kind === "all" || asset.kind === kind) &&
        (!search || `${asset.fileName} ${asset.alt} ${asset.path}`.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Dialog
            open
            onClose={onClose}
            title="从媒体库选择"
            closeLabel="关闭媒体库"
            size="2xl"
            zIndex={120}
            bodyScroll={false}
            bodyClassName="flex flex-col gap-3 py-4"
        >
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input
                        aria-label="搜索媒体"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            // 媒体选择器嵌在文章表单里，避免回车触发表单提交
                            if (event.key === "Enter") event.preventDefault();
                        }}
                        placeholder="搜索文件名或替代文本"
                        className={fieldSearchClass}
                    />
                </div>
                <select aria-label="媒体类型" value={kind} onChange={(event) => setKind(event.target.value)} className={`${fieldClass} sm:max-w-36`}>
                    <option value="all">全部类型</option><option value="image">图片</option><option value="video">视频</option><option value="attachment">附件</option>
                </select>
                <div className="flex items-center gap-2 sm:ml-auto">
                    {(search || kind !== "all") && (
                        <Button variant="ghost" onClick={() => { setSearch(""); setKind("all"); }}>清除筛选</Button>
                    )}
                    <Button variant="secondary" onClick={load}>刷新</Button>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                {loading ? (
                    <LoadingRows count={4} className="h-24" />
                ) : failed ? (
                    <ErrorState title="媒体加载失败" onRetry={load} />
                ) : filtered.length === 0 ? (
                    <EmptyState title="暂无匹配媒体" description="试试调整搜索词或媒体类型" />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {filtered.map((asset) => (
                            <button key={asset.id} type="button" onClick={() => onSelect(asset)} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/50 text-left transition-colors hover:border-accent/60">
                                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-foreground/5">
                                    {asset.kind === "image" ? <NextImage src={asset.url} alt="" fill sizes="(max-width: 640px) 45vw, 200px" className="object-cover" /> : asset.kind === "video" ? <Film className="h-8 w-8 text-muted" /> : <File className="h-8 w-8 text-muted" />}
                                </div>
                                <div className="w-full p-2">
                                    <p className="truncate text-xs font-medium">{asset.alt || asset.fileName}</p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted"><ImageIcon className="h-3 w-3" />引用 {asset.references}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Dialog>
    );
}
