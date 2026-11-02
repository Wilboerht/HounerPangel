export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wilboerht.com";

export const PERSON_ID = "https://wilboerht.com/#person";

export const SITE_NAME = "Hank Wong's Web";

export const DEFAULT_OG_IMAGE = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: SITE_NAME,
} as const;
