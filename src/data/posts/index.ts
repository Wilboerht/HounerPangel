import { exampleFirstPost } from "./example-first-post";
import type { Post } from "@/types/content";

export const allPosts: Post[] = [
  exampleFirstPost,
  // 在这里添加更多博客文章
];

export const getPostBySlug = (slug: string): Post | undefined => {
  return allPosts.find((post) => post.slug === slug);
};

export const getPublishedPosts = async (): Promise<Post[]> => {
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const searchPosts = (query: string): Post[] => {
  const lowercaseQuery = query.toLowerCase();
  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowercaseQuery) ||
      post.excerpt.toLowerCase().includes(lowercaseQuery) ||
      post.content?.toLowerCase().includes(lowercaseQuery)
  );
};
