import { cache } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/site";
import { renderMarkdown } from "@/lib/markdown";
import { DEFAULT_ABOUT_PAGE, getSitePage } from "@/lib/site-pages";
import type { SitePage } from "@/lib/types/site-page";

export const revalidate = 3600;

// metadata 和页面正文共用同一次请求内的读取结果
const getAboutPage = cache(async (): Promise<SitePage> => {
    try {
        return (await getSitePage("about")) ?? DEFAULT_ABOUT_PAGE;
    } catch (error) {
        // 数据库迁移尚未执行或暂时不可用时保持旧内容上线
        console.error("Failed to load /me page content, using fallback:", error);
        return DEFAULT_ABOUT_PAGE;
    }
});

export async function generateMetadata(): Promise<Metadata> {
    const page = await getAboutPage();
    const title = page.title || DEFAULT_ABOUT_PAGE.title;
    const metaTitle = page.seoTitle || title;
    // 空描述表示管理员主动清空，不再回填默认文案
    const description = page.description || undefined;
    const ogTitle = `${metaTitle} - Hank Wong's Web`;
    const images = page.coverImage ? [page.coverImage] : [DEFAULT_OG_IMAGE];

    return {
        title: metaTitle,
        description,
        alternates: {
            canonical: `${SITE_URL}/me`,
            types: {
                "application/rss+xml": "/rss.xml",
            },
        },
        openGraph: {
            title: ogTitle,
            description,
            url: `${SITE_URL}/me`,
            type: "website",
            siteName: "Hank Wong",
            locale: "zh_CN",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description,
            creator: "@wilboerht",
            images: page.coverImage ? [page.coverImage] : [DEFAULT_OG_IMAGE.url],
        },
    };
}

export default async function AboutMe() {
    const page = await getAboutPage();

    return (
        <main className="min-h-dvh flex flex-col items-center px-content pt-[calc(3rem+env(safe-area-inset-top,0px))] pb-content">
            <div className="max-w-2xl w-full flex-1 flex flex-col gap-10">
                {/* 触控区 44px 会让箭头在盒内居中，-mt-3 抵消这部分视觉空白 */}
                <nav className="-mt-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回主页</span>
                    </Link>
                </nav>

                <section className="space-y-8">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        {page.title || DEFAULT_ABOUT_PAGE.title}
                    </h1>
                    <article className="article-body">
                        {renderMarkdown(page.content)}
                    </article>
                </section>

                <footer className="mt-auto text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
