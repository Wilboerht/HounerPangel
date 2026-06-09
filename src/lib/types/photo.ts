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
    created_at?: string;
    updated_at?: string;
}
