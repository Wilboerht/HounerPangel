"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageViewTracker() {
    const pathname = usePathname();
    useEffect(() => {
        if (pathname.startsWith("/admin")) return;
        let referrerHost: string | null = null;
        try {
            if (document.referrer && new URL(document.referrer).host !== window.location.host) referrerHost = new URL(document.referrer).host;
        } catch {}
        const body = JSON.stringify({ path: pathname, referrerHost });
        navigator.sendBeacon("/api/analytics/track", new Blob([body], { type: "application/json" }));
    }, [pathname]);
    return null;
}
