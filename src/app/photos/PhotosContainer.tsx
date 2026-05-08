"use client";

import { useState } from "react";
import Link from "next/link";
import { Aperture } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PhotosClient from "./PhotosClient";
import PhotosSwitch from "./PhotosSwitch";
import MapView from "./MapView";
import { Photo } from "./data";

interface Props {
  photos: Photo[];
  mapboxToken: string;
}

export default function PhotosContainer({ photos, mapboxToken }: Props) {
  const [view, setView] = useState<"gallery" | "map">("gallery");

  return (
    <div className="relative min-h-screen">
      {/* Header — always visible, floating on top */}
      <header className="relative z-40 px-6 py-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
          <nav className="hidden sm:flex items-center gap-2">
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
            <PhotosSwitch active={view} onChange={setView} />
          </nav>
        </div>
      </header>

      {/* Gallery View */}
      {view === "gallery" && (
        <main className="px-6 pb-12">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">
            <section>
              <PhotosClient photos={photos} />
            </section>
            <footer className="pt-6 text-sm text-muted">
              <p>&copy; {new Date().getFullYear()} wilboerht</p>
            </footer>
          </div>
        </main>
      )}

      {/* Map Modal — full screen overlay */}
      <AnimatePresence>
        {view === "map" && (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 bg-background"
          >
            <MapView photos={photos} mapboxToken={mapboxToken} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
