"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { City } from "@/data/cities";

function computeBounds(cities: City[]): [number, number, number, number] | undefined {
    if (cities.length === 0) return undefined;
    const lngs = cities.map((c) => c.coordinates[0]);
    const lats = cities.map((c) => c.coordinates[1]);
    return [
        Math.min(...lngs),
        Math.min(...lats),
        Math.max(...lngs),
        Math.max(...lats),
    ];
}

export function FootprintMap({ cities }: { cities: City[] }) {
    const [selected, setSelected] = useState<City | null>(null);
    const [mapError, setMapError] = useState(false);
    const bounds = useMemo(() => computeBounds(cities), [cities]);

    if (mapError) {
        return (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                地图加载失败，请检查网络后刷新
            </div>
        );
    }

    return (
        <Map
            initialViewState={
                bounds
                    ? { bounds, fitBoundsOptions: { padding: 60, maxZoom: 6 } }
                    : { longitude: 104.0, latitude: 35.5, zoom: 3 }
            }
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            onError={() => setMapError(true)}
        >
            <NavigationControl position="top-right" />
            {cities.map((city) => (
                <Marker
                    key={`${city.name}-${city.coordinates.join(",")}`}
                    longitude={city.coordinates[0]}
                    latitude={city.coordinates[1]}
                    anchor="bottom"
                    onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelected(city);
                    }}
                >
                    <button
                        type="button"
                        aria-label={city.name}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") setSelected(null);
                        }}
                        className={`block cursor-pointer p-0 transition-colors duration-200 ${
                            city.status === "planned"
                                ? selected?.name === city.name
                                    ? "text-accent"
                                    : "text-accent/60 hover:text-accent"
                                : selected?.name === city.name
                                  ? "text-foreground"
                                  : "text-foreground/50 hover:text-foreground"
                        }`}
                    >
                        <svg viewBox="0 0 24 24" className="block h-5 w-5" fill="currentColor" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 8.5c0 5.25 7 13 7 13s7-7.75 7-13C19 5.13 15.87 2 12 2zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                    </button>
                </Marker>
            ))}
            {selected && (
                <Popup
                    longitude={selected.coordinates[0]}
                    latitude={selected.coordinates[1]}
                    anchor="bottom"
                    offset={22}
                    onClose={() => setSelected(null)}
                    closeOnClick={true}
                    closeButton={false}
                    className="footprint-popup"
                >
                    <div className="space-y-0.5">
                        <p className="text-sm font-semibold tracking-wide text-foreground">{selected.name}</p>
                        {selected.status === "planned" && (
                            <p className="text-xs text-accent">计划前往</p>
                        )}
                        {(selected.visitDate || selected.note) && (
                            <p className="text-xs text-muted">
                                {[selected.visitDate, selected.note].filter(Boolean).join(" · ")}
                            </p>
                        )}
                    </div>
                </Popup>
            )}
        </Map>
    );
}
