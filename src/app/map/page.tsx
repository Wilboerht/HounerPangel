import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { FootprintMapLazy } from "@/components/footprint-map-lazy";
import { cities } from "@/data/cities";

export const metadata: Metadata = {
    title: "足迹 - Hank Wong's Web",
    description: "Hank Wong (wilboerht) 走过的城市足迹地图。",
};

export default function Footprints() {
    return (
        <main className="relative h-dvh w-screen">
            {/* Warm up the connection to the CARTO basemap CDN and start the
                style fetch while the map bundle is still downloading */}
            <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link
                rel="preload"
                href="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                as="fetch"
                crossOrigin="anonymous"
            />
            <Link
                href="/"
                aria-label="返回主页"
                className="absolute left-4 top-4 z-10 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card/90 px-3 text-sm text-muted shadow-sm backdrop-blur transition-colors duration-200 hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                返回
            </Link>
            <FootprintMapLazy cities={cities} />
        </main>
    );
}
