export interface Photo {
  src: string;
  title: string;
  location: string;
  date: string;
  lat: number;
  lng: number;
  aspectRatio?: string;
  category?: string;
}

export const PHOTOS: Photo[] = [];
