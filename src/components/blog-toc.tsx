"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocHeading } from "@/lib/types/blog";

const EMPTY_HEADINGS: TocHeading[] = [];

type Variant = "desktop" | "mobile" | "inline";

function normalizeText(text: string): string {
    return text.replace(/\s+/g, " ").replace(/\u200b/g, "").trim();
}

export function BlogToc({ variant, items, source }: { variant: Variant; items?: TocHeading[] | null; source?: string }) {
    const [autoItems, setAutoItems] = useState<TocHeading[] | null>(null);
    const [activeId, setActiveId] = useState(items?.[0]?.id ?? "");
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const resolvedItems = items ?? autoItems ?? EMPTY_HEADINGS;

    useEffect(() => {
        if (items != null) return;

        const article = document.querySelector<HTMLElement>(".article-body");
        if (!article) return;

        const headings = Array.from(article.querySelectorAll<HTMLElement>("h2[id], h3[id]"))
            .filter((heading) => !heading.closest("details"));

        const nextItems = headings
            .map((heading) => {
                const clone = heading.cloneNode(true) as HTMLElement;
                clone.querySelectorAll(".heading-anchor").forEach((node) => node.remove());
                clone.querySelectorAll("a").forEach((link) => link.replaceWith(...Array.from(link.childNodes)));
                clone.querySelectorAll("iframe, video, audio, img").forEach((node) => node.remove());
                return {
                    id: heading.id,
                    text: normalizeText(clone.textContent ?? ""),
                    depth: heading.tagName === "H3" ? 3 as const : 2 as const,
                    html: clone.innerHTML,
                };
            })
            .filter((item) => item.id && item.text);

        const frame = window.requestAnimationFrame(() => setAutoItems(nextItems));
        return () => window.cancelAnimationFrame(frame);
    }, [items, source]);

    useEffect(() => {
        if (!resolvedItems.length) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            let current = resolvedItems[0].id;
            for (const item of resolvedItems) {
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

        const article = document.querySelector<HTMLElement>(".article-body");
        const scrollTarget = article?.closest<HTMLElement>("[data-blog-scroll]") ?? window;

        frame = window.requestAnimationFrame(update);
        scrollTarget.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            if (frame) window.cancelAnimationFrame(frame);
            scrollTarget.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [resolvedItems]);

    if (!resolvedItems.length) return null;

    const closeMobileToc = () => {
        if (variant === "mobile") detailsRef.current?.removeAttribute("open");
    };

    const list = (
        <ul className="toc-list">
            {resolvedItems.map((item) => {
                const active = item.id === activeId;
                return (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className="toc-link"
                            data-depth={item.depth}
                            data-active={active ? "true" : undefined}
                            aria-current={active ? "location" : undefined}
                            onClick={closeMobileToc}
                        >
                            {item.html ? (
                                <span dangerouslySetInnerHTML={{ __html: item.html }} />
                            ) : (
                                item.text
                            )}
                        </a>
                    </li>
                );
            })}
        </ul>
    );

    if (variant === "inline") {
        return (
            <div className="blog-toc rounded-xl border border-border/80 bg-foreground/[0.02] px-4 py-3">
                <p className="text-sm font-semibold text-foreground">目录</p>
                <nav aria-label="文章目录" className="mt-3">
                    {list}
                </nav>
            </div>
        );
    }

    if (variant === "mobile") {
        return (
            <details ref={detailsRef} className="blog-toc group rounded-xl border border-border/80 bg-foreground/[0.02] px-4 py-3 xl:hidden">
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
        <aside className="hidden xl:block xl:col-start-3 xl:w-64 xl:justify-self-end">
            <nav aria-label="文章目录" className="blog-toc-sticky overflow-y-auto pr-2">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted">目录</p>
                {list}
            </nav>
        </aside>
    );
}
