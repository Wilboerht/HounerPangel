import photosData from "@/data/photos.json";

export interface Photo {
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
}

export const PHOTOS: Photo[] = photosData as Photo[];
