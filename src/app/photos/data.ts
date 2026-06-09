export interface Photo {
  id?: string;
  src: string;
  title: string;
  location: string;
  description?: string;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutter?: string;
    iso?: string;
  };
  lat?: number;
  lng?: number;
  date?: string;
  category?: string;
  aspectRatio?: string;
}

export async function getPhotos(): Promise<Photo[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/photos`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch photos");
  return res.json();
}
