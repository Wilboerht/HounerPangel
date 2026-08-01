export type { Photo } from "@/lib/types/photo";

export async function getPhotos(): Promise<import("@/lib/types/photo").Photo[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/photos`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
}
