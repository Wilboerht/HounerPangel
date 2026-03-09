"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
    title: string;
    text: string;
}

export function ShareButton({ title, text }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';

        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: text,
                    url,
                });
            } catch (err) {
                // User might have cancelled or share failed, just quietly fallback or ignore
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to copying URL to clipboard if Web Share API is not supported
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-colors duration-200"
            title="Share this article"
            aria-label="Share this article"
        >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Share"}</span>
        </button>
    );
}
