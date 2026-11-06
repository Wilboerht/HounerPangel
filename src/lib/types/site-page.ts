export interface SitePageContent {
    title: string;
    description: string;
    content: string;
}

export interface SitePage extends SitePageContent {
    slug: string;
    updatedAt: string;
}

export interface SitePageRevisionSummary {
    id: string;
    pageSlug: string;
    title: string;
    updatedAt: string;
    createdAt: string;
}

export interface SitePageRevision extends SitePageContent {
    id: string;
    pageSlug: string;
    updatedAt: string;
    createdAt: string;
}
