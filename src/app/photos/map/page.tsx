import Link from "next/link";
import { Aperture } from "lucide-react";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { PHOTOS } from "../data";
import PhotosSwitch from "../PhotosSwitch";
import MapClient from "./MapClient";

export const metadata: Metadata = {
  title: "行摄地图 - Hank Wong's Web",
  description: "Hank Wong 的摄影足迹地图，记录旅途中的风景与瞬间。",
};

export default function PhotosMapPage() {
  const token = env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-5 select-none">
            <Aperture className="w-14 h-14 text-foreground stroke-[1.5]" />
            <div className="flex flex-col">
              <span className="text-[26px] font-semibold tracking-wide leading-none text-foreground">
                HANK WONG
              </span>
              <span className="text-xs tracking-[0.25em] text-muted uppercase leading-none mt-2">
                Photos
              </span>
            </div>
          </div>

          {/* Right: Nav */}
          <nav className="hidden sm:flex items-center gap-4">
            <PhotosSwitch active="map" />
            <Link
              href="/me"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              关于
            </Link>
            <Link
              href="/"
              className="text-sm py-2.5 px-3.5 text-[#505050] hover:text-foreground transition-colors duration-200"
            >
              主页
            </Link>
          </nav>
        </header>

        {/* Map */}
        <section>
          <MapClient photos={PHOTOS} mapboxToken={token} />
        </section>

        {/* Footer */}
        <footer className="pt-2 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} wilboerht</p>
        </footer>
      </div>
    </main>
  );
}
