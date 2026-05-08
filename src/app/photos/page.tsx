import type { Metadata } from "next";
import { env } from "@/lib/env";
import PhotosContainer from "./PhotosContainer";
import { PHOTOS } from "./data";

export const metadata: Metadata = {
  title: "摄影集 - Hank Wong's Web",
  description: "Hank Wong 的摄影作品集，记录旅途中的风景与瞬间。",
};

export default function PhotosPage() {
  const token = env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return <PhotosContainer photos={PHOTOS} mapboxToken={token} />;
}
