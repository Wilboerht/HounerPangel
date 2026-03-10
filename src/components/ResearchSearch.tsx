"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function ResearchSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState(searchParams.get("rq") || "");

    const handleSearch = (term: string) => {
        setQuery(term);
        startTransition(() => {
            const params = new URLSearchParams(searchParams);
            if (term) {
                params.set("rq", term);
                params.set("page", "1"); // Reset to page 1 on search
            } else {
                params.delete("rq");
            }
            router.push(`/research?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="relative group w-full max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isPending ? "text-primary animate-pulse" : "text-muted group-focus-within:text-foreground"}`} />
            <input
                type="text"
                placeholder="Search topics, tags..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-foreground/[0.03] border border-border/50 rounded-2xl py-3 pl-12 pr-10 text-sm outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/20 transition-all placeholder:text-muted/50"
            />
            {query && (
                <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/5 transition-colors"
                >
                    <X className="w-3 h-3 text-muted" />
                </button>
            )}
        </div>
    );
}
