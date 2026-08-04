import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
        <main className="min-h-dvh flex flex-col justify-start px-6 py-12 pt-safe pb-safe">
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-12">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回主页</span>
                    </Link>
                </nav>

                <BlogClient posts={posts} />
            </div>
        </main>
    );
}
