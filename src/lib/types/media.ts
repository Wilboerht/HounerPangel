export type MediaKind = "image" | "video" | "attachment";

export interface MediaAsset {
    id: string;
    path: string;
    fileName: string;
    kind: MediaKind;
    mimeType: string;
    size: number;
    width: number | null;
    height: number | null;
    alt: string;
    caption: string;
    url: string;
    createdAt: string;
    references: number;
}
