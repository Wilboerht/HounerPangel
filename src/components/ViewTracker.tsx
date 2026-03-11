"use client";

import { useEffect, useRef } from "react";
import { incrementViewsAction } from "@/app/actions/notion";

export function ViewTracker({ pageId }: { pageId: string }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            incrementViewsAction(pageId).catch(console.error);
        }
    }, [pageId]);

    return null; // Silent component
}
