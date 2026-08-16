"use client";

import dynamic from "next/dynamic";

// Lazy-load the map: maplibre-gl is a large chunk, keep it out of the initial bundle
export const FootprintMapLazy = dynamic(
    () => import("@/components/footprint-map").then((m) => m.FootprintMap),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-background" />,
    }
);
