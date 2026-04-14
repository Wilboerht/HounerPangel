export interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    readTime?: string;
    content?: string;
}

export interface Research {
    id: string;
    title: string;
    slug: string;
    date: string;
    abstract: string;
    tags: string[];
    readTime?: string;
    content?: string;
}
