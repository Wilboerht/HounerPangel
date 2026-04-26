import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getAllBlogPosts } from "@/data/blog";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
    title: "Blog - Hank Wong's Web",
    description: "Hank Wong 的思考、笔记与创作。",
};

export const dynamic = "force-dynamic";

export default async function Blog() {
    const posts = await getAllBlogPosts();

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-6xl w-full flex flex-col gap-12">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
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
