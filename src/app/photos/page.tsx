"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Aperture, Menu, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { useSafeMotion, safeAnimate } from "@/lib/animation";
import type { Photo } from "./data";

function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/photos", label: "摄影" },
    { href: "/travel", label: "旅行" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.05)] pt-safe ${
        scrolled ? "bg-white" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12">
        <nav className="flex h-[72px] md:h-[120px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/Portfolio.svg"
              alt="Portfolio"
              width={100}
              height={30}
              className="h-8 md:h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              priority
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium tracking-wide transition-colors duration-300 ${
                  pathname === link.href ? "text-black" : "text-[#888888]"
                } hover:text-black group`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-[1px] bg-black transition-all duration-300 ${
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
          </div>

          <button
            className="md:hidden text-black min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{ originY: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-black/5 overflow-hidden"
          >
            <div className="px-5 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-lg font-medium ${
                    pathname === link.href ? "text-black" : "text-[#888888]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-[#888888]">
          © {new Date().getFullYear()} Hank Wong. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-[#dddddd] border-t-[#888888] rounded-full animate-spin" />
    </div>
  );
}

export default function PhotographyPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const reduce = useSafeMotion();
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data: Photo[]) => {
        setPhotos(data || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i === 0 ? photos.length - 1 : i - 1
    );
  }, [photos.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i === photos.length - 1 ? 0 : i + 1
    );
  }, [photos.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    touchRef.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0) prevImage();
    else nextImage();
  }, [prevImage, nextImage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  useEffect(() => {
    if (lightboxIndex !== null) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [lightboxIndex]);

  return (
    <>
      <Navbar />

      {/* Gallery */}
      <section className="mx-auto max-w-6xl px-5 md:px-8 lg:px-12 pt-[92px] md:pt-[180px] pb-24 md:pb-40">
        {error ? (
          <div className="py-20 text-center">
            <p className="text-sm text-[#888888] mb-3">加载失败</p>
            <button
              onClick={() => { setError(false); setLoading(true); fetch("/api/photos").then(res => res.json()).then(data => { setPhotos(data || []); setLoading(false); }).catch(() => { setError(true); setLoading(false); }); }}
              className="text-sm text-[#888888] hover:text-black transition-colors"
            >
              重试
            </button>
          </div>
        ) : loading ? (
          <Spinner />
        ) : photos.length === 0 ? (
          <p className="text-center text-[#888888] py-20">暂无照片</p>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {photos.map((photo, i) => (
              <ScrollReveal key={photo.id || photo.src} delay={i * 0.05}>
              <button
                onClick={() => setLightboxIndex(i)}
                aria-label={photo.title}
                className="group relative block w-full overflow-hidden rounded text-left"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover transition-all duration-500 brightness-90 group-hover:brightness-100 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium text-base">{photo.title}</p>
                  <p className="text-white/70 text-sm mt-1">{photo.location}</p>
                </div>
              </button>
            </ScrollReveal>
          ))}
          </div>
        )}
      </section>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={safeAnimate(reduce, { opacity: 0 })}
            animate={{ opacity: 1 }}
            exit={safeAnimate(reduce, { opacity: 0 })}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#f5f5f5] flex flex-col h-dvh"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute right-4 md:right-8 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center text-[#888888] hover:text-black transition-colors"
              style={{ top: `calc(0.5rem + env(safe-area-inset-top, 0px))` }}
              aria-label="关闭"
            >
              <X size={24} />
            </button>

            {/* Counter */}
            <div className="absolute left-1/2 -translate-x-1/2 z-10 min-h-[44px] flex items-center"
              style={{ top: `calc(0.5rem + env(safe-area-inset-top, 0px))` }}>
              <span className="text-sm text-[#888888]">{lightboxIndex + 1} / {photos.length}</span>
            </div>

            {/* Prev */}
            <button
              onClick={prevImage}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-[#555555] hover:text-black transition-colors"
              aria-label="上一张"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Next */}
            <button
              onClick={nextImage}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-[#555555] hover:text-black transition-colors"
              aria-label="下一张"
            >
              <ChevronRight size={28} />
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center w-full min-h-0 px-12 md:px-20 pt-12 pb-4">
              <motion.div
                key={lightboxIndex}
                initial={safeAnimate(reduce, { opacity: 0, scale: 0.98 })}
                animate={{ opacity: 1, scale: 1 }}
                exit={safeAnimate(reduce, { opacity: 0, scale: 0.98 })}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full max-w-5xl flex items-center justify-center"
              >
                <Image
                  src={photos[lightboxIndex].src}
                  alt={photos[lightboxIndex].title}
                  width={1600}
                  height={1200}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                  style={{ boxShadow: "0 12px 48px rgba(0,0,0,0.15)" }}
                  unoptimized
                />
              </motion.div>
            </div>

            {/* Info Bar */}
            <div className="shrink-0 px-5 md:px-8 lg:px-16 py-4 md:py-6 pb-safe">
              <div className="mx-auto max-w-5xl flex flex-wrap items-start justify-center gap-x-6 md:gap-x-10 gap-y-4 text-center">
                <div>
                  <p className="text-sm text-[#aaaaaa] mb-1.5">参数</p>
                  <div className="flex items-center gap-2.5 text-sm text-[#555555]">
                    {photos[lightboxIndex].exif?.aperture && (
                      <span className="flex items-center gap-1">
                        <Aperture size={12} />
                        {photos[lightboxIndex].exif.aperture}
                      </span>
                    )}
                    {photos[lightboxIndex].exif?.shutter && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {photos[lightboxIndex].exif.shutter}
                      </span>
                    )}
                    {photos[lightboxIndex].exif?.iso && (
                      <span className="flex items-center gap-1">
                        <span className="text-[13px] font-semibold border border-current rounded px-0.5 leading-none py-[1px]">ISO</span>
                        {photos[lightboxIndex].exif.iso}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#aaaaaa] mb-1.5">地点</p>
                  <p className="text-sm text-[#555555]">{photos[lightboxIndex].location}</p>
                </div>

                {photos[lightboxIndex].exif?.camera && (
                  <div>
                    <p className="text-sm text-[#aaaaaa] mb-1.5">相机</p>
                    <p className="text-sm text-[#555555]">{photos[lightboxIndex].exif.camera}</p>
                  </div>
                )}

                {photos[lightboxIndex].exif?.lens && (
                  <div>
                    <p className="text-sm text-[#aaaaaa] mb-1.5">镜头</p>
                    <p className="text-sm text-[#555555]">{photos[lightboxIndex].exif.lens}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
