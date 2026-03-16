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

export interface Post {
    id: string;
    title: string;
    slug: string;
    date: string;
    excerpt: string;
    series: Series | null;
    readTime?: string;
    views?: number;
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
    views?: number;
    content?: string;
}

export interface Comment {
    id: string;
    text: string;
    created_time: string;
    author: string;
    email?: string | null;
}
