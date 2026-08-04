import BackButton from "@/components/BackButton";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog-db";
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

    return (
        <main className="min-h-dvh flex flex-col items-center px-6 pt-safe pb-safe">
            <div className="grow shrink-0 basis-12" />
            <div className="max-w-3xl mx-auto w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <BackButton label="返回主页" fallbackHref="/" />
                </nav>

                <BlogClient posts={posts} />
            </div>
            <div className="grow shrink-0 basis-12" />
        </main>
    );
}
