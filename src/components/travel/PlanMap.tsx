"use client";

import { useCallback, useMemo } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import type { Attraction } from "@/types/travel";

interface Props {
  attractions: Attraction[];
}

export default function PlanMap({ attractions }: Props) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""

  const points = useMemo(
    () =>
      attractions.filter(
        (a): a is Attraction & { lat: number; lng: number } =>
          typeof a.lat === "number" && typeof a.lng === "number"
      ),
    [attractions]
  );

  const bounds = useMemo(() => {
    if (points.length === 0) return null;
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    return {
      longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 11,
    };
  }, [points]);

  const markerColor = useCallback(() => "#171717", []);

  if (!mapboxToken) {
    return (
      <div className="w-full h-80 md:h-96 rounded-lg bg-muted/30 flex flex-col items-center justify-center text-sm text-muted gap-2">
        <p>地图功能需要 Mapbox Access Token</p>
        <p className="text-xs opacity-70">
          请在 .env.local 中配置 NEXT_PUBLIC_MAPBOX_TOKEN
        </p>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="w-full h-64 rounded-lg bg-muted/30 flex items-center justify-center text-sm text-muted">
        暂无地图坐标
      </div>
    );
  }

  return (
    <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden border border-border">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={bounds ?? { longitude: 118.78, latitude: 32.06, zoom: 11 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {points.map((point, idx) => (
          <Marker
            key={idx}
            longitude={point.lng}
            latitude={point.lat}
            anchor="center"
          >
            <div className="relative flex items-center justify-center group cursor-pointer">
              <span
                className="block rounded-full border-2 border-white shadow-sm w-3 h-3 transition-transform duration-200 group-hover:scale-125"
                style={{ backgroundColor: markerColor() }}
              />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-white rounded shadow-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {point.name}
              </div>
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
