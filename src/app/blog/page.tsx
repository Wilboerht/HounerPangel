import BackButton from "@/components/BackButton";
import type { Metadata } from "next";
import { getAllBlogPostSummaries } from "@/lib/blog-db";
import BlogClient from "./BlogClient";
import type { BlogPostSummary } from "@/lib/types/blog";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
    title: "博客",
    description: "Hank Wong 的思考、笔记与创作。",
    alternates: {
        canonical: `${SITE_URL}/blog`,
    },
    openGraph: {
        title: "博客 - Hank Wong's Web",
        description: "Hank Wong 的思考、笔记与创作。",
        url: `${SITE_URL}/blog`,
        type: "website",
        siteName: "Hank Wong",
        locale: "zh_CN",
        images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
        card: "summary_large_image",
        title: "博客 - Hank Wong's Web",
        description: "Hank Wong 的思考、笔记与创作。",
        creator: "@wilboerht",
        images: [DEFAULT_OG_IMAGE.url],
    },
};

// ISR：60s 内复用缓存；管理端增删改文章后通过 revalidatePath 立即刷新
export const revalidate = 60;

export default async function Blog() {
    let posts: BlogPostSummary[];
    try {
        posts = await getAllBlogPostSummaries();
    } catch (error) {
        console.error("获取博客文章列表失败：", error);
        posts = [];
    }

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center px-6 pt-content pb-content">
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <BackButton label="返回主页" fallbackHref="/" />
                </nav>

                <BlogClient posts={posts} />
            </div>
        </main>
    );
}
