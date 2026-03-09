import Link from "next/link";
import { ArrowLeft, ExternalLink, Sparkles, Smile, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// Mock data extending current design items to demonstrate pagination
const MOCK_DESIGNS = [
    {
        id: "1",
        title: "WeChat Stickers",
        description: "My personal WeChat sticker pack design. Fun, expressive, and widely used characters.",
        url: "https://weixin.qq.com/qremoticonstore?productid=aL2PCfwK/89qO7sF6/+I+UDhfwEjhec2ZNvdnLLJRd/NQ8y6uTqmMKp4kEOtVxLHQjd1wD/oukTEAZSt+BWpZfgTX21d3mGccVpqAg3nC1mw=",
        image: "/wechat-stickers.png",
        icon: "smile", // using to determine placeholder rendering vs real image
        linkText: "Open in WeChat"
    },
    {
        id: "2",
        title: "Brand Identity Concept",
        description: "Typography and color system exploration.",
        url: "#",
        image: null,
        icon: "sparkles",
        linkText: null
    },
    ...Array.from({ length: 10 }).map((_, i) => ({
        id: `${i + 3}`,
        title: `Design Exploration ${i + 1}`,
        description: "A placeholder for future design projects, ui concepts, or case studies.",
        url: "#",
        image: null,
        icon: "sparkles",
        linkText: null
    }))
];

const ITEMS_PER_PAGE = 4;

export default async function Design({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page) : 1;
    const validPage = isNaN(page) || page < 1 ? 1 : page;

    const totalItems = MOCK_DESIGNS.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = MOCK_DESIGNS.slice(startIndex, endIndex);
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
                        <span>Back to Home</span>
                    </Link>
                </nav>

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                            Design
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            A collection of my design explorations, UI concepts, and visual experiments.
                        </p>
                    </div>

                    {/* Design Portfolio grid */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {currentItems.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                target={item.url !== "#" ? "_blank" : undefined}
                                rel={item.url !== "#" ? "noopener noreferrer" : undefined}
                                className={`flex flex-col gap-3 group ${item.url !== "#" ? "cursor-pointer" : "cursor-default"}`}
                            >
                                {/* Image Container with Aspect Ratio */}
                                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-foreground/5 group-hover:border-foreground/30 transition-colors duration-300">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-muted group-hover:scale-105 transition-transform duration-500">
                                            {item.icon === "smile" ? <Smile className="w-8 h-8 opacity-50" /> : <Sparkles className="w-8 h-8 opacity-50" />}
                                        </div>
                                    )}
                                </div>

                                <div className="px-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                                            {item.title}
                                        </h3>
                                        {item.url !== "#" && (
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {item.linkText && <span className="text-[10px] text-muted-foreground bg-foreground/5 px-1.5 py-0.5 rounded uppercase tracking-wider">{item.linkText}</span>}
                                                <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted mt-1 leading-relaxed">
                                        {item.description}
                                    </p>
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
