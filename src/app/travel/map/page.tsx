import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import MapView from "./MapView";
import { getAllPhotos } from "@/lib/supabase";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "旅行地图 - Hank Wong's Web",
  description: "探索去过的和想去的地方",
};

export const dynamic = "force-dynamic";

export default async function TravelMapPage() {
  const mapboxToken = env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const photos = await getAllPhotos();

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-6 left-6 z-20">
        <BackButton />
      </div>
      <MapView photos={photos} mapboxToken={mapboxToken} />
    </div>
  );
}
