"use client";

import Link from "next/link";
import { LayoutGrid, Map } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  active: "gallery" | "map";
}

export default function PhotosSwitch({ active }: Props) {
  return (
    <div className="relative flex items-center rounded-full bg-neutral-100 p-1 w-[156px]">
      {/* Sliding background */}
      <motion.div
        className="absolute top-1 bottom-1 left-1 rounded-full bg-white shadow-sm"
        style={{ width: "calc(50% - 4px)" }}
        initial={false}
        animate={{ x: active === "gallery" ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />

      <Link
        href="/photos"
        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 transition-colors duration-200 ${
          active === "gallery"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        图库
      </Link>
      <Link
        href="/photos/map"
        className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 text-sm py-1.5 transition-colors duration-200 ${
          active === "map"
            ? "text-foreground"
            : "text-muted hover:text-foreground"
        }`}
      >
        <Map className="w-3.5 h-3.5" />
        地图
      </Link>
    </div>
  );
}
