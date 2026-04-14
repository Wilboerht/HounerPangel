import { exampleResearch } from "./example-research";
import type { Research } from "@/types/content";

export const allResearch: Research[] = [
  exampleResearch,
  // 在这里添加更多研究文章
];

export const getResearchBySlug = (slug: string): Research | undefined => {
  return allResearch.find((item) => item.slug === slug);
};

export const getPublishedResearch = async (): Promise<Research[]> => {
  return allResearch.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const searchResearch = (query: string): Research[] => {
  const lowercaseQuery = query.toLowerCase();
  return allResearch.filter(
    (item) =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.abstract.toLowerCase().includes(lowercaseQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
      item.content?.toLowerCase().includes(lowercaseQuery)
  );
};
