import BackButton from "@/components/BackButton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllBlogPostSummaries } from "@/lib/blog-db";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";
import { firstImageUrl, plainTextExcerpt } from "@/lib/markdown";
import { BlogPostArticle } from "@/components/blog-post-article";

interface Props {
    params: Promise<{ slug: string }>;
}

// ISR：60s 内复用缓存；管理端增删改文章后通过 revalidatePath 立即刷新。
// 本页只展示已发布文章；管理端的草稿预览走 /admin/blog/preview/[slug]（独立动态路由），
// 因此这里不需要读 cookies，公开流量可以命中缓存。
export const revalidate = 60;

// 构建期预渲染全部已发布文章；构建时 DB 不可达则退化为按需 ISR
export async function generateStaticParams() {
    try {
        const posts = await getAllBlogPostSummaries();
        return posts.map((post) => ({ slug: post.slug }));
    } catch (error) {
        console.error("生成文章静态参数失败，退回按需渲染：", error);
        return [];
    }
}

// 未发布/不存在的 slug 返回 null；其他 DB 错误直接抛出，
// 交给 error.tsx 返回 500（不能把服务故障吞成 404，会误导搜索引擎）
async function fetchPost(slug: string) {
    return getBlogPostBySlug(slug, false);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        return { title: "Not Found" };
    }

    const description = plainTextExcerpt(post.content);
    const ogImage = firstImageUrl(post.content);
    const url = `${SITE_URL}/blog/${post.slug}`;
    const images = ogImage
        ? [{ url: ogImage, alt: post.title }]
        : [DEFAULT_OG_IMAGE];

    return {
        title: post.title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: post.title,
            description,
            type: "article",
            url,
            publishedTime: post.date,
            siteName: "Hank Wong",
            locale: "zh_CN",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description,
            creator: "@wilboerht",
            images: images.map((image) => image.url),
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await fetchPost(slug);

    if (!post) {
        notFound();
    }

    const siteUrl = SITE_URL;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: plainTextExcerpt(post.content),
        datePublished: post.date,
        dateModified: post.updatedAt || post.date,
        ...(firstImageUrl(post.content) ? { image: [firstImageUrl(post.content)] } : {}),
        author: {
            "@type": "Person",
            name: "Hank Wong",
            url: siteUrl,
        },
        publisher: {
            "@type": "Person",
            name: "Hank Wong",
        },
        keywords: post.tags.join(", "),
        url: `${siteUrl}/blog/${post.slug}`,
    };

    return (
        <main className="min-h-dvh flex flex-col items-center px-content pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-content">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
            />
            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-10">
                {/* 触控区 44px 会让箭头在盒内居中，-mt-3 抵消这部分视觉空白 */}
                <nav className="-mt-3">
                    <BackButton label="返回博客" fallbackHref="/blog" />
                </nav>

                <BlogPostArticle post={post} />

                <footer className="mt-auto text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
