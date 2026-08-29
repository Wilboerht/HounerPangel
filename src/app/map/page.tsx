import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { FootprintMapLazy } from "@/components/footprint-map-lazy";
import { cities } from "@/data/cities";

export const metadata: Metadata = {
    title: "足迹",
    description: "Hank Wong (wilboerht) 走过的城市足迹地图。",
};

export default function Footprints() {
    return (
        <main className="relative h-dvh w-full">
            <h1 className="sr-only">足迹地图</h1>
            {/* Warm up the connection to the CARTO basemap CDN and start the
                style fetch while the map bundle is still downloading */}
            <link rel="preconnect" href="https://basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles-a.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles-b.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles-c.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://tiles-d.basemaps.cartocdn.com" crossOrigin="anonymous" />
            <link
                rel="preload"
                href="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                as="fetch"
                crossOrigin="anonymous"
            />
            <Link
                href="/"
                aria-label="返回主页"
                className="absolute left-4 top-4 z-10 flex h-11 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-white/60 bg-white/40 px-4 text-sm font-medium text-foreground/80 shadow-[0_8px_24px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 before:pointer-events-none before:absolute before:inset-x-2 before:top-0.5 before:h-1/2 before:rounded-full before:bg-gradient-to-b before:from-white/50 before:to-transparent hover:bg-white/55 hover:text-foreground hover:shadow-[0_10px_32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.75)] active:scale-95"
            >
                <ArrowLeft className="h-4 w-4" />
                返回
            </Link>
            <FootprintMapLazy cities={cities} />
        </main>
    );
}
