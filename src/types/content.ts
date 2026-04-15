export interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    readTime?: string;
    content?: string;
    views?: number;
    series?: Series | null;
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
    views?: number;
}

export interface SeriesItem {
    slug: string;
    title: string;
    index: number;
}

export interface Series {
    name: string;
    current: number;
    total: number;
    items: SeriesItem[];
}

export interface Comment {
    id: string;
    text: string;
    created_time: string;
    author: string;
    email?: string | null;
}
