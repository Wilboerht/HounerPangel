"use client";

import { useEffect, useRef } from "react";
import { incrementViewsAction } from "@/app/actions/supabase";

export function ViewTracker({ slug, type }: { slug: string, type: 'posts' | 'research' }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            incrementViewsAction(slug, type).catch(console.error);
        }
    }, [slug, type]);

    return null; // Silent component
}
