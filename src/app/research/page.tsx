import Link from "next/link";
import { ArrowLeft, ExternalLink, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

// Generate some mock research items for demonstration
const MOCK_RESEARCH = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Research Topic ${i + 1}: ${["AI Architecture", "User Behavior Analysis", "Modern Interfaces", "Design Systems"][i % 4]}`,
    abstract: "A brief abstract or summary of the research topic. This explains the core problem, the methodology, and the key findings or takeaways from the study. It should be concise enough to fit in a card.",
    date: `March 2026`,
    tags: ["UX Design", "AI", "Frontend"].sort(() => 0.5 - Math.random()).slice(0, 2)
}));

const ITEMS_PER_PAGE = 4;

// Next.js 15+ Async Page Props
export default async function Research({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Resolve search parameters
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams.page) || 1;

    // Pagination logic
    const totalPages = Math.ceil(MOCK_RESEARCH.length / ITEMS_PER_PAGE);
    const validPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = MOCK_RESEARCH.slice(startIndex, endIndex);

    // Generate pagination array [1, 2, 3...]
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
                            Research
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Exploring ideas, writing papers, and diving deep into selected technical and design topics.
                        </p>
                    </div>

                    {/* Research items list */}
                    <div className="flex flex-col gap-6">
                        {currentItems.map((item) => (
                            <Link href={`/research/${item.id}`} key={item.id} className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-3 group cursor-pointer hover:border-foreground/50 transition-colors duration-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-muted" />
                                        {item.title}
                                    </h3>
                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 opacity-0 group-hover:opacity-100" />
                                </div>
                                <p className="text-sm text-muted leading-relaxed">
                                    {item.abstract}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-xs text-muted">Published: {item.date}</span>
                                    <div className="flex gap-2">
                                        {item.tags.map((tag, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
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

                            <div className="flex items-center gap-1 sm:gap-2">
                                {pageNumbers.map(page => (
                                    <Link
                                        key={page}
                                        href={`?page=${page}`}
                                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors duration-200 ${page === validPage
                                            ? "bg-foreground text-background"
                                            : "text-muted hover:text-foreground hover:bg-foreground/5"
                                            }`}
                                    >
                                        {page}
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
