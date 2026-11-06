export interface SitePageContent {
    title: string;
    description: string;
    content: string;
}

export interface SitePage extends SitePageContent {
    slug: string;
    updatedAt: string;
}
