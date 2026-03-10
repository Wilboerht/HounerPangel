"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ListTree, X, ChevronRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SeriesItem {
    title: string;
    slug: string;
    index: number;
}

export interface Series {
    name: string;
    current: number;
    total: number;
    items: SeriesItem[];
}

export function SeriesOutlineDrawer({ series, currentSlug }: { series: Series; currentSlug: string }) {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-all border border-border/50 active:scale-95"
            >
                <ListTree className="w-3.5 h-3.5 text-muted" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Outline</span>
            </button>

            {/* Drawer Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                        />

                        {/* Bottom Sheet Drawer */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-card border-t border-border rounded-t-[2.5rem] z-[101] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Handle */}
                            <div className="w-full flex justify-center py-4">
                                <div className="w-12 h-1.5 rounded-full bg-border" />
                            </div>

                            {/* Header */}
                            <div className="px-8 pt-2 pb-6 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground line-clamp-1 pr-4">
                                        {series.name}
                                    </h2>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 rounded-full bg-foreground/5"
                                    >
                                        <X className="w-4 h-4 text-muted" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted uppercase tracking-widest font-bold opacity-60">Full Series Outline</p>
                            </div>

                            {/* Series List */}
                            <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar">
                                <div className="flex flex-col gap-2">
                                    {series.items.map((item) => {
                                        const isActive = item.slug === currentSlug;
                                        return (
                                            <Link
                                                key={item.index}
                                                href={`/blog/${item.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${isActive
                                                        ? "bg-foreground/[0.03] border-foreground/20"
                                                        : "bg-transparent border-transparent active:bg-foreground/5"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold font-mono transition-all ${isActive
                                                            ? "bg-foreground text-background border-foreground shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                                                            : "bg-background border-border text-muted"
                                                        }`}>
                                                        {String(item.index).padStart(2, '0')}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={`text-sm tracking-tight transition-colors ${isActive ? "font-bold text-foreground" : "font-medium text-muted/80"}`}>
                                                            {item.title}
                                                        </span>
                                                        {isActive && (
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">Currently Reading</span>
                                                        )}
                                                    </div>
                                                </div>
                                                {!isActive && (
                                                    <ChevronRight className="w-4 h-4 text-muted/30 group-active:translate-x-1 transition-transform" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Progress Summary Footer Inside Drawer */}
                                <div className="mt-8 p-4 rounded-2xl bg-foreground/[0.02] border border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-muted/60" />
                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Series Progress</span>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-foreground/60">{series.current} / {series.total}</span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
