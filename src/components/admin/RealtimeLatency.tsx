"use client";

import { useEffect, useState } from "react";

export default function RealtimeLatency() {
    const [latency, setLatency] = useState<number | null>(null);

    useEffect(() => {
        const checkLatency = async () => {
            const start = performance.now();
            try {
                // We use a HEAD request to minimize data transfer
                await fetch("/", { 
                    method: "HEAD", 
                    cache: "no-store" 
                });
                const end = performance.now();
                setLatency(Math.round(end - start));
            } catch (e) {
                // Silently fallback if fetch fails
                setLatency(null);
            }
        };

        checkLatency();
        const timer = setInterval(checkLatency, 10000); // Update every 10 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <span className="text-sm font-black tabular-nums text-zinc-900">
            {latency !== null ? `${latency}ms` : "测量中..."}
        </span>
    );
}
