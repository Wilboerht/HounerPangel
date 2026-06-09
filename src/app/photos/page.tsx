"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Aperture, Menu, ArrowLeft } from "lucide-react";
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.05)] ${
        scrolled ? "bg-white" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16">
        <nav className="flex h-[96px] items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/photo-logo.svg"
              alt="Hank Wong Photography"
              width={120}
              height={36}
              className="h-7 w-auto opacity-90 hover:opacity-100 transition-opacity"
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
            className="md:hidden text-black"
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
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [lightboxIndex]);

  return (
    <>
      <Navbar />

      {/* Gallery */}
      <section className="mx-auto max-w-[1440px] px-5 md:px-8 lg:px-16 pt-[140px] md:pt-[180px] pb-24 md:pb-40">
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

      {/* Lightbox - white background style like camarts.cn/c9a */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-[#f5f5f5] flex flex-col"
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-5 right-5 md:top-8 md:right-8 z-10 p-2 text-[#888888] hover:text-black transition-colors"
              aria-label="关闭"
            >
              <X size={24} />
            </button>

            {/* Prev */}
            <button
              onClick={prevImage}
              className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 z-10 p-2 text-[#888888] hover:text-black transition-colors"
              aria-label="上一张"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Next */}
            <button
              onClick={nextImage}
              className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 z-10 p-2 text-[#888888] hover:text-black transition-colors"
              aria-label="下一张"
            >
              <ChevronRight size={32} />
            </button>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center w-full min-h-0 px-4 md:px-8 pt-8 pb-4">
              <motion.div
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="relative max-w-full h-full flex items-center justify-center"
              >
                <Image
                  src={PHOTOS[lightboxIndex].src}
                  alt={PHOTOS[lightboxIndex].title}
                  width={1400}
                  height={1000}
                  className="max-w-full max-h-full w-auto h-auto object-contain shadow-[0_12px_48px_rgba(0,0,0,0.15)]"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  priority
                />
              </motion.div>
            </div>

            {/* Info Bar */}
            <div className="shrink-0 px-5 md:px-8 lg:px-16 py-3 md:py-4">
              <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[13px] text-[#666666]">
                {PHOTOS[lightboxIndex].exif?.aperture && (
                  <span>{PHOTOS[lightboxIndex].exif.aperture}</span>
                )}
                {PHOTOS[lightboxIndex].exif?.shutter && (
                  <span>{PHOTOS[lightboxIndex].exif.shutter}</span>
                )}
                {PHOTOS[lightboxIndex].exif?.iso && (
                  <span>ISO {PHOTOS[lightboxIndex].exif.iso}</span>
                )}
                <span>{PHOTOS[lightboxIndex].location}</span>
                {PHOTOS[lightboxIndex].exif?.camera && (
                  <span className="flex items-center gap-1">
                    <Camera size={11} />
                    {PHOTOS[lightboxIndex].exif.camera}
                  </span>
                )}
                {PHOTOS[lightboxIndex].exif?.lens && (
                  <span>{PHOTOS[lightboxIndex].exif.lens}</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
