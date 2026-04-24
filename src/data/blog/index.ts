import { BlogPost } from "@/lib/types/blog";

export const BLOG_POSTS: BlogPost[] = [
    // Add your blog posts here
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getAllBlogSlugs(): string[] {
    return BLOG_POSTS.map((post) => post.slug);
}
