"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export interface Photo {
  src: string;
  title: string;
  location?: string;
  date?: string;
  aspectRatio?: string;
  category?: string;
}

const CATEGORIES = ["全部", "精选", "城市", "自然"];

function SafeImage({
  src,
  alt,
  className,
  fill,
  priority,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className={`${className} bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center`}
      >
        <Camera className="w-6 h-6 text-neutral-300" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onError={() => setError(true)}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={className}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}

export default function PhotosClient({ photos }: { photos: Photo[] }) {
  const [activeCategory, setActiveCategory] = useState("全部");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === "全部") return photos;
    return photos.filter((p) => p.category === activeCategory);
  }, [activeCategory, photos]);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredPhotos.length);
  }, [lightboxIndex, filteredPhotos.length]);
  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    );
  }, [lightboxIndex, filteredPhotos.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, goNext, goPrev]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [lightboxIndex]);

  const currentPhoto =
    lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <>
      {/* Category Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 pb-0 mb-8 relative">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`relative text-base px-4 py-3 transition-colors duration-200 ${
              activeCategory === cat
                ? "text-foreground font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {cat}
            {activeCategory === cat && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {filteredPhotos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {filteredPhotos.map((photo, idx) => (
                <button
                  key={`${photo.src}-${idx}`}
                  onClick={() => setLightboxIndex(idx)}
                  className="block w-full text-left group break-inside-avoid"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-lg bg-neutral-100"
                    style={{ aspectRatio: photo.aspectRatio || "3/2" }}
                  >
                    <SafeImage
                      src={photo.src}
                      alt={photo.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={idx < 6}
                    />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="p-4 rounded-full bg-neutral-100 text-neutral-300">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-muted">相册为空</p>
                <p className="text-sm text-muted/70">
                  将照片放入{" "}
                  <code className="px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/70 text-xs">
                    public/images/photos/
                  </code>{" "}
                  并在{" "}
                  <code className="px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/70 text-xs">
                    src/app/photos/data.ts
                  </code>{" "}
                  中添加数据即可展示。
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Lightbox */}
      {currentPhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 p-2 text-white/60 hover:text-white transition-colors z-50"
            aria-label="关闭"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors z-50"
              aria-label="上一张"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Next */}
          {filteredPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white transition-colors z-50"
              aria-label="下一张"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[80vh] flex flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <SafeImage
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
              priority
            />
            <div className="text-center text-white/70 text-sm">
              <span>{currentPhoto.title}</span>
              {currentPhoto.location && (
                <span className="text-white/40"> · {currentPhoto.location}</span>
              )}
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-wider">
            {lightboxIndex + 1} / {filteredPhotos.length}
          </div>
        </div>
      )}
    </>
  );
}
