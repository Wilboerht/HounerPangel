import { ContentTopbar } from "@/components/content-topbar";
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
        types: {
            "application/rss+xml": "/rss.xml",
        },
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
        if (process.env.NEXT_PHASE !== "phase-production-build") throw error;
        // 仅构建期 DB 不可达时降级为空列表，运行期保留错误以维持已有 ISR 缓存
        console.error("获取博客文章列表失败，构建期降级为空列表：", error);
        posts = [];
    }

    return (
        <main className="min-h-dvh flex flex-col">
            <ContentTopbar backHref="/" backLabel="返回主页" />

            <div className="flex flex-1 flex-col px-content pb-content pt-10">
                <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-10">
                    <BlogClient posts={posts} />
                </div>
            </div>
        </main>
    );
}
