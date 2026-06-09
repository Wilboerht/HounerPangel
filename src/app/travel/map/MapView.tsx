"use client";

import { useState, useCallback, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Camera, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface Photo {
  src: string;
  title: string;
  location: string;
  date?: string;
  lat?: number;
  lng?: number;
  aspectRatio?: string;
  category?: string;
}

interface Props {
  photos: Photo[];
  mapboxToken: string;
}

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
      width={400}
      height={300}
      className={className}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}

export default function MapView({ photos, mapboxToken }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const selectedPhoto = selectedId !== null ? photos[selectedId] : null;
  const displayPhotos = selectedPhoto ? [selectedPhoto] : photos;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const goNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % displayPhotos.length);
  }, [lightboxIndex, displayPhotos.length]);
  const goPrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex(
      (lightboxIndex - 1 + displayPhotos.length) % displayPhotos.length
    );
  }, [lightboxIndex, displayPhotos.length]);

  const handleMarkerClick = useCallback(
    (idx: number) => {
      setSelectedId((prev) => (prev === idx ? null : idx));
      setPanelOpen(true);
    },
    []
  );

  const markerColor = useCallback((category?: string) => {
    if (category === "城市") return "#171717";
    if (category === "自然") return "#737373";
    return "#505050";
  }, []);

  const currentPhoto =
    lightboxIndex !== null ? displayPhotos[lightboxIndex] : null;

  return (
    <div className="relative w-full h-full">
      {!mapboxToken ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
          <Camera className="w-10 h-10" />
          <p>地图暂不可用</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
          <Camera className="w-10 h-10" />
          <p>地图暂无照片标记</p>
          <p className="text-sm text-muted/70">
            在{" "}
            <code className="px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/70 text-xs">
              src/app/photos/data.ts
            </code>{" "}
            中添加带坐标的照片数据即可展示。
          </p>
        </div>
      ) : (
        <>
          <Map
            mapboxAccessToken={mapboxToken}
            initialViewState={{
              longitude: 115,
              latitude: 30,
              zoom: 3.5,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/light-v11"
          >
            {photos.map((photo, idx) =>
              photo.lng !== undefined && photo.lat !== undefined ? (
                <Marker
                  key={idx}
                  longitude={photo.lng}
                  latitude={photo.lat}
                  anchor="center"
                >
                  <button
                    onClick={() => handleMarkerClick(idx)}
                    className="relative flex items-center justify-center"
                  >
                    <span
                      className={`block rounded-full border-2 border-white shadow-sm transition-all duration-200 ${
                        selectedId === idx
                          ? "w-4 h-4 scale-125"
                          : "w-2.5 h-2.5 hover:scale-125"
                      }`}
                      style={{
                        backgroundColor: markerColor(photo.category),
                      }}
                    />
                  </button>
                </Marker>
              ) : null
            )}
          </Map>

          {/* Bottom Panel */}
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-[380px] z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-100 overflow-hidden">
              {/* Panel Header */}
              <button
                onClick={() => setPanelOpen((v) => !v)}
                className="flex items-center justify-between w-full px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  {selectedPhoto
                    ? `${selectedPhoto.location} · ${selectedPhoto.title}`
                    : "全部照片"}
                </span>
                {panelOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-muted" />
                )}
              </button>

              {/* Panel Content */}
              {panelOpen && (
                <div className="px-4 pb-4">
                  {selectedPhoto && (
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-xs text-muted hover:text-foreground transition-colors mb-3"
                    >
                      ← 查看全部
                    </button>
                  )}
                  <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    {displayPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="flex-shrink-0 relative w-24 h-16 rounded-lg overflow-hidden bg-neutral-100 group"
                      >
                        <SafeImage
                          src={photo.src}
                          alt={photo.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="96px"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lightbox */}
          {currentPhoto && lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-5 right-5 p-2 text-white/60 hover:text-white transition-colors z-50"
                aria-label="关闭"
              >
                <X className="w-6 h-6" />
              </button>

              {displayPhotos.length > 1 && (
                <>
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
                </>
              )}

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
                    <span className="text-white/40">
                      {" "}
                      · {currentPhoto.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-wider">
                {lightboxIndex + 1} / {displayPhotos.length}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
