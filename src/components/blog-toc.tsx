"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocHeading } from "@/lib/types/blog";

export function BlogToc({ variant, items }: { variant: "desktop" | "mobile"; items: TocHeading[] }) {
    const [activeId, setActiveId] = useState(items[0]?.id ?? "");

    useEffect(() => {
        if (!items.length) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            let current = items[0].id;
            for (const item of items) {
                const heading = document.getElementById(item.id);
                if (!heading) continue;
                if (heading.getBoundingClientRect().top <= 120) current = item.id;
                else break;
            }
            setActiveId((previous) => (previous === current ? previous : current));
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(update);
        };

        frame = window.requestAnimationFrame(update);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [items]);

    if (!items.length) return null;

    const list = (
        <ul className="toc-list">
            {items.map((item) => {
                const active = item.id === activeId;
                return (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className="toc-link"
                            data-depth={item.depth}
                            data-active={active ? "true" : undefined}
                            aria-current={active ? "location" : undefined}
                        >
                            {item.text}
                        </a>
                    </li>
                );
            })}
        </ul>
    );

    if (variant === "mobile") {
        return (
            <details className="blog-toc group rounded-xl border border-border/80 bg-foreground/[0.02] px-4 py-3 lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground">
                    <span>目录</span>
                    <ChevronDown className="blog-toc-icon h-4 w-4 text-muted transition-transform" aria-hidden="true" />
                </summary>
                <nav aria-label="文章目录" className="mt-3">
                    {list}
                </nav>
            </details>
        );
    }

    return (
        <aside className="hidden lg:block">
            <nav aria-label="文章目录" className="sticky top-8 max-h-[calc(100dvh-4rem)] overflow-y-auto pr-2">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">目录</p>
                {list}
            </nav>
        </aside>
    );
}
