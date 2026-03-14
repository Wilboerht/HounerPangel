import Link from "next/link";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "项目 - Hank Wong's Web",
    description: "查看 Hank Wong (wilboerht) 开发的有趣项目，涵盖 Web 应用、AI 工具及数字化解决方案。",
};

// Mock data extending current projects to demonstrate pagination
const MOCK_PROJECTS = [
    {
        id: "1",
        title: "AI Face Scan",
        description: "智能面部护肤顾问。利用 AI 技术进行面部分析，为用户提供个性化护肤建议。",
        url: "https://advisor.nihplod.cn",
        tags: ["AI", "Next.js"]
    },
    {
        id: "2",
        title: "NIHPLOD China",
        description: "NIHPLOD 大中华区官方网站，展示品牌形象和最新动态的数字门面。",
        url: "https://nihplod.cn",
        tags: ["Next.js", "React"]
    },
    {
        id: "3",
        title: "LGJH Co., Ltd.",
        description: "上海临港景鸿安全防范科技发展有限公司官方网站，展示企业信息与服务的综合数字平台。",
        url: "https://www.lingangjh.com/",
        tags: ["Enterprise", "Web System"]
    }
];

const ITEMS_PER_PAGE = 4;

export default async function Projects({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
    const validPage = isNaN(page) || page < 1 ? 1 : page;

    const totalItems = MOCK_PROJECTS.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = MOCK_PROJECTS.slice(startIndex, endIndex);
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full flex flex-col gap-12">
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

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            项目
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Creating something interesting.
                        </p>
                    </div>

                    {/* Projects list */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {currentItems.map((project) => (
                            <a
                                key={project.id}
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200"
                            >
                                <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between">
                                    {project.title}
                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200" />
                                </h3>
                                <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                    {project.description}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {project.tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </a>
                        ))}
                    </div>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-8">
                            <Link
                                href={validPage > 1 ? `?page=${validPage - 1}` : "#"}
                                className={`p-2 rounded-lg transition-colors duration-200 ${validPage > 1
                                    ? "text-muted hover:text-foreground hover:bg-foreground/5"
                                    : "text-muted/30 pointer-events-none"
                                    }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Link>

                            <div className="flex items-center gap-1">
                                {pageNumbers.map((num) => (
                                    <Link
                                        key={num}
                                        href={`?page=${num}`}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors duration-200 ${validPage === num
                                            ? "bg-foreground text-background font-medium"
                                            : "text-muted hover:text-foreground hover:bg-foreground/5"
                                            }`}
                                    >
                                        {num}
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href={validPage < totalPages ? `?page=${validPage + 1}` : "#"}
                                className={`p-2 rounded-lg transition-colors duration-200 ${validPage < totalPages
                                    ? "text-muted hover:text-foreground hover:bg-foreground/5"
                                    : "text-muted/30 pointer-events-none"
                                    }`}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
