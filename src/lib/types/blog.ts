export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    updatedAt: string;
    tags: string[];
    content: string;
    published: boolean;
    deletedAt: string | null;
}

export type BlogPostSummary = Omit<BlogPost, "content">;

export type BlogRevisionAction =
    | "baseline"
    | "created"
    | "updated"
    | "published"
    | "unpublished"
    | "deleted"
    | "restored";

export interface BlogRevisionSummary {
    id: string;
    title: string;
    date: string;
    published: boolean;
    action: BlogRevisionAction;
    sourceUpdatedAt: string;
    createdAt: string;
}

export interface BlogRevision extends BlogRevisionSummary {
    slug: string;
    tags: string[];
    content: string;
    deletedAt: string | null;
}
