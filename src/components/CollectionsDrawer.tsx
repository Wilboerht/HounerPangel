"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Library, Command } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Series {
    name: string;
    count: number;
    slug: string;
}

export function CollectionsDrawer({ seriesList }: { seriesList: Series[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSeries = seriesList.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                className="flex items-center gap-2 group"
            >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 group-hover:text-foreground/60 transition-colors">
                    <Library className="w-3.5 h-3.5" /> Collections
                </div>
                <div className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border/50 text-[9px] font-bold text-muted uppercase group-hover:border-foreground/20 transition-all">
                    Browse All
                </div>
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
                            className="fixed inset-x-0 bottom-0 top-[10%] bg-card border-t border-border rounded-t-[2.5rem] z-[101] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Handle */}
                            <div className="w-full flex justify-center py-4">
                                <div className="w-12 h-1.5 rounded-full bg-border" />
                            </div>

                            {/* Header */}
                            <div className="px-8 pt-2 pb-6 flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                            Collections
                                        </h2>
                                        <p className="text-xs text-muted uppercase tracking-widest font-medium">Explore series & topics</p>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-3 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-muted" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search by series name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-foreground/[0.03] border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-foreground/5 border border-border/20 text-[10px] text-muted">
                                        <Command className="w-3 h-3" /> F
                                    </div>
                                </div>
                            </div>

                            {/* Collections List */}
                            <div className="flex-1 overflow-y-auto px-8 pb-12 no-scrollbar">
                                <div className="grid grid-cols-1 gap-3">
                                    {filteredSeries.length > 0 ? (
                                        filteredSeries.map((series, i) => (
                                            <Link
                                                key={i}
                                                href={`/blog/${series.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="group flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-foreground/[0.02] active:scale-[0.98] transition-all duration-200"
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {series.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted uppercase font-bold tracking-[0.1em]">
                                                        {series.count} Articles in this series
                                                    </span>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                                                    <Library className="w-4 h-4" />
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                            <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <p className="text-sm text-muted">No collections found matching "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
