import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import MapView from "./MapView";
import { PHOTOS } from "@/app/photos/data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "旅行地图 - Hank Wong's Web",
  description: "探索去过的和想去的地方",
};

export default function TravelMapPage() {
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-6 left-6 z-20">
        <BackButton />
      </div>
      <MapView photos={PHOTOS} mapboxToken={mapboxToken} />
    </div>
  );
}
