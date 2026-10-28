import "server-only";
import { revalidatePath } from "next/cache";

export function revalidateBlogPaths(slug?: string): void {
  try {
    revalidatePath("/blog");
    if (slug) revalidatePath(`/blog/${slug}`);
    revalidatePath("/rss.xml");
    revalidatePath("/sitemap.xml");
  } catch (error) {
    console.error("Failed to revalidate blog caches:", error);
  }
}
