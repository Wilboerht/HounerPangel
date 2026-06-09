"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Aperture, Menu } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";
import { PHOTOS } from "./data";

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
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16">
        <nav className="flex h-[72px] items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.1em] text-black uppercase"
          >
            HANK WONG
          </Link>

          {/* Desktop links */}
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

          {/* Mobile toggle */}
          <button
            className="md:hidden text-black"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
    <footer className="border-t border-[#e5e5e5]">
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-[#888888]">
          © {new Date().getFullYear()} Hank Wong. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function PhotographyPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i === 0 ? PHOTOS.length - 1 : i - 1
    );
  }, []);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : i === PHOTOS.length - 1 ? 0 : i + 1
    );
  }, []);

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
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="pt-[72px]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16 py-16 md:py-24">
          <ScrollReveal>
            <p className="text-xs tracking-[0.15em] text-[#888888] uppercase mb-4">
              Photography
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-black">
              光影集
            </h1>
            <p className="text-lg text-[#888888] max-w-xl">
              记录那些稍纵即逝的瞬间
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16 pb-24 md:pb-40">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {PHOTOS.map((photo, i) => (
            <ScrollReveal key={photo.title + i} delay={i * 0.05}>
              <button
                onClick={() => setLightboxIndex(i)}
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
      </section>

      <Footer />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 md:top-8 md:right-8 z-10 p-2 text-[#888888] hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X size={28} />
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 md:left-8 z-10 p-2 text-[#888888] hover:text-white transition-colors"
              aria-label="上一张"
            >
              <ChevronLeft size={36} />
            </button>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 md:right-8 z-10 p-2 text-[#888888] hover:text-white transition-colors"
              aria-label="下一张"
            >
              <ChevronRight size={36} />
            </button>

            {/* Image + Info */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-auto max-w-full max-h-[75vh]">
                <Image
                  src={PHOTOS[lightboxIndex].src}
                  alt={PHOTOS[lightboxIndex].title}
                  width={1400}
                  height={1000}
                  className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded"
                  priority
                />
              </div>

              <div className="mt-6 text-center max-w-2xl px-4">
                <h3 className="text-xl md:text-2xl font-semibold text-white">
                  {PHOTOS[lightboxIndex].title}
                </h3>
                <p className="text-[#888888] mt-1">
                  {PHOTOS[lightboxIndex].location}
                </p>
                {PHOTOS[lightboxIndex].description && (
                  <p className="text-[#aaaaaa] mt-3 text-sm md:text-base">
                    {PHOTOS[lightboxIndex].description}
                  </p>
                )}
                {PHOTOS[lightboxIndex].exif && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-[#666666]">
                    {PHOTOS[lightboxIndex].exif.camera && (
                      <span className="flex items-center gap-1">
                        <Camera size={12} />
                        {PHOTOS[lightboxIndex].exif.camera}
                      </span>
                    )}
                    {PHOTOS[lightboxIndex].exif.lens && (
                      <span>{PHOTOS[lightboxIndex].exif.lens}</span>
                    )}
                    {PHOTOS[lightboxIndex].exif.aperture && (
                      <span className="flex items-center gap-1">
                        <Aperture size={12} />
                        {PHOTOS[lightboxIndex].exif.aperture}
                      </span>
                    )}
                    {PHOTOS[lightboxIndex].exif.shutter && (
                      <span>{PHOTOS[lightboxIndex].exif.shutter}</span>
                    )}
                    {PHOTOS[lightboxIndex].exif.iso && (
                      <span>ISO {PHOTOS[lightboxIndex].exif.iso}</span>
                    )}
                  </div>
                )}
                <p className="text-[#555555] text-xs mt-4">
                  {lightboxIndex + 1} / {PHOTOS.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
