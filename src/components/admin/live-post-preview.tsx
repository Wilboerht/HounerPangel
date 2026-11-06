"use client";

import { useState } from "react";
import { Monitor, Smartphone, X } from "lucide-react";
import { BlogPostArticle } from "@/components/blog-post-article";
import { IconButton } from "@/components/admin/icon-button";
import { useFocusTrap } from "@/lib/focus-trap";
import { useScrollLock } from "@/lib/use-scroll-lock";
import type { BlogPost } from "@/lib/types/blog";
import type { PostFormValues } from "./post-form";

export function LivePostPreview({ values, updatedAt, onClose }: { values: PostFormValues; updatedAt: string; onClose: () => void }) {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const trapRef = useFocusTrap(true, onClose);
    useScrollLock(true);
    const post: BlogPost = {
        ...values,
        publishedAt: values.published ? updatedAt : null,
        updatedAt,
        deletedAt: null,
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm">
            <div ref={trapRef} role="dialog" aria-modal="true" aria-label="预览当前更改" className="flex h-dvh flex-col">
                <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-border/50 py-3 pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold">预览当前更改</h2>
                        <p className="text-xs text-muted">包含尚未保存的内容，不会影响公开页面</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                        <div className="flex rounded-lg border border-border/50 p-0.5">
                            <button type="button" onClick={() => setDevice("desktop")} aria-label="桌面预览" aria-pressed={device === "desktop"} className={`flex h-11 w-11 items-center justify-center rounded-md sm:h-9 sm:w-9 ${device === "desktop" ? "bg-foreground/10" : "text-muted"}`}><Monitor className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setDevice("mobile")} aria-label="移动预览" aria-pressed={device === "mobile"} className={`flex h-11 w-11 items-center justify-center rounded-md sm:h-9 sm:w-9 ${device === "mobile" ? "bg-foreground/10" : "text-muted"}`}><Smartphone className="h-4 w-4" /></button>
                        </div>
                        <IconButton size="adaptive" label="关闭预览" onClick={onClose}><X className="h-4 w-4" /></IconButton>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-[calc(1rem+env(safe-area-inset-left,0px))] py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))]">
                    <div className={`mx-auto rounded-xl border border-border/50 bg-background px-5 py-8 transition-[max-width] sm:px-8 ${device === "mobile" ? "max-w-sm" : "max-w-2xl"}`}>
                        <BlogPostArticle post={post} />
                    </div>
                </div>
            </div>
        </div>
    );
}
