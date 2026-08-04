import BackButton from "@/components/BackButton";
import { ToastProvider } from "@/components/toast";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog-db";
import { seedBlogPosts } from "@/lib/blog-seed";
import BlogClient from "./BlogClient";
import type { BlogPost } from "@/lib/types/blog";

export const metadata: Metadata = {
    title: "博客 - Hank Wong's Web",
    description: "Hank Wong 的思考、笔记与创作。",
};

export const dynamic = "force-dynamic";

export default async function Blog() {
    let posts: BlogPost[];
    try {
        posts = await getAllBlogPosts();
    } catch {
        posts = [];
    }

    // 临时种子数据：数据库为空时用于预览样式
    if (posts.length === 0) {
        posts = seedBlogPosts;
    }

    return (
        <main className="min-h-dvh flex flex-col items-center justify-center px-6 pt-content pb-content">
            <div className="max-w-2xl mx-auto w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <BackButton label="返回主页" fallbackHref="/" />
                </nav>

                <ToastProvider>
                    <BlogClient posts={posts} />
                </ToastProvider>
            </div>
        </main>
    );
}
