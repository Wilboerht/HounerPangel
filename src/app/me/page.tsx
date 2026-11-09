import { cache } from "react";
import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
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
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10">
                <nav className="-mt-3">
                    <BackButton label="返回主页" fallbackHref="/" />
                </nav>

                <section className="space-y-10">
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-[-0.01em] text-foreground">
                        {page.title || DEFAULT_ABOUT_PAGE.title}
                    </h1>
                    <article className="article-body">
                        {renderMarkdown(page.content)}
                    </article>
                </section>

                <footer className="mt-auto border-t border-border pt-6 text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
