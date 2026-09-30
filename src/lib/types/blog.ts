export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    tags: string[];
    content: string;
    published: boolean;
}

export type BlogPostSummary = Omit<BlogPost, "content">;
