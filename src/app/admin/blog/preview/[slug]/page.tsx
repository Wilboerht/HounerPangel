import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/blog-db";
import { isAdminSession } from "@/lib/auth";
import { BlogPostArticle } from "@/components/blog-post-article";
import { Badge } from "@/components/admin/badge";

interface Props {
    params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
    title: "预览文章",
};

// 页面必须在取数前独立鉴权：layout 隐藏 children 不会阻止其进入 RSC Payload。
// 公开详情页 /blog/[slug] 走 ISR 只含已发布文章，草稿不会泄漏到公开缓存。
export default async function BlogPreviewPage({ params }: Props) {
    if (!(await isAdminSession())) return null;

    const { slug } = await params;
    const post = await getBlogPostBySlug(slug, true);

    if (!post) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 text-sm text-muted">
                <Eye className="w-4 h-4" />
                <span>预览模式</span>
                {!post.published && <Badge variant="warning">草稿</Badge>}
            </div>
            <BlogPostArticle post={post} />
        </div>
    );
}
