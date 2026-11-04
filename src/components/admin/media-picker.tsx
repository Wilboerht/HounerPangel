"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { File, Film, Image as ImageIcon, Search, X } from "lucide-react";
import { IconButton } from "@/components/admin/icon-button";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import type { MediaAsset } from "@/lib/types/media";

export function MediaPicker({ onSelect, onClose }: { onSelect: (asset: MediaAsset) => void; onClose: () => void }) {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [search, setSearch] = useState("");
    const [kind, setKind] = useState("all");
    const trapRef = useFocusTrap(true, onClose);
    useScrollLock(true);
    const loadedRef = useRef(false);

    const load = () => {
        setLoading(true);
        setFailed(false);
        fetch("/api/admin/media")
            .then(async (res) => {
                if (!res.ok) throw new Error("加载失败");
                return await res.json() as MediaAsset[];
            })
            .then((items) => setAssets(items))
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (loadedRef.current) return;
        loadedRef.current = true;
        load();
    }, []);

    const filtered = assets.filter((asset) =>
        (kind === "all" || asset.kind === kind) &&
        (!search || `${asset.fileName} ${asset.alt} ${asset.path}`.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
            <div ref={trapRef} role="dialog" aria-modal="true" aria-label="选择媒体" className="flex max-h-[85dvh] w-full max-w-4xl flex-col rounded-xl border border-border/50 bg-background p-4 shadow-xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-base font-semibold">从媒体库选择</h2>
                    <IconButton label="关闭媒体库" onClick={onClose}><X className="h-4 w-4" /></IconButton>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input aria-label="搜索媒体" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索文件名或替代文本" className="w-full rounded-lg border border-border/50 bg-foreground/5 py-2 pl-9 pr-3 text-sm" />
                    </div>
                    <select aria-label="媒体类型" value={kind} onChange={(event) => setKind(event.target.value)} className="rounded-lg border border-border/50 bg-foreground/5 px-3 py-2 text-sm">
                        <option value="all">全部类型</option><option value="image">图片</option><option value="video">视频</option><option value="attachment">附件</option>
                    </select>
                </div>
                <div className="mt-4 min-h-48 overflow-y-auto">
                    {loading ? <p className="py-16 text-center text-sm text-muted">加载中...</p> : failed ? (
                        <div className="py-16 text-center"><p className="text-sm text-muted">媒体加载失败</p><button onClick={load} className="mt-3 rounded-lg border border-border/50 px-4 py-2 text-sm">重试</button></div>
                    ) : filtered.length === 0 ? <p className="py-16 text-center text-sm text-muted">暂无匹配媒体</p> : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {filtered.map((asset) => (
                                <button key={asset.id} onClick={() => onSelect(asset)} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border/50 text-left hover:border-accent/50">
                                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-foreground/5">
                                        {asset.kind === "image" ? <img src={asset.url} alt="" className="h-full w-full object-cover" /> : asset.kind === "video" ? <Film className="h-8 w-8 text-muted" /> : <File className="h-8 w-8 text-muted" />}
                                    </div>
                                    <div className="w-full p-2">
                                        <p className="truncate text-xs font-medium">{asset.alt || asset.fileName}</p>
                                        <p className="mt-1 flex items-center gap-1 text-[10px] text-muted"><ImageIcon className="h-3 w-3" />引用 {asset.references}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
