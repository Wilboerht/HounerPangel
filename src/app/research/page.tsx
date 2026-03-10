import Link from "next/link";
import { ResearchSearch } from "@/components/ResearchSearch";
import { ArrowLeft, ExternalLink, BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";

// Generate some mock research items for demonstration
const MOCK_RESEARCH = Array.from({ length: 12 }).map((_, i) => {
    const title = `Research Topic ${i + 1}: ${["AI Architecture", "User Behavior Analysis", "Modern Interfaces", "Design Systems"][i % 4]}`;
    // Generate a URL-friendly slug from the title
    const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/-+/g, "-") // Remove multiple -
        .trim();

    return {
        id: i + 1,
        title,
        slug,
        abstract: "A brief abstract or summary of the research topic. This explains the core problem, the methodology, and the key findings or takeaways from the study. It should be concise enough to fit in a card.",
        date: `March 2026`,
        tags: ["UX Design", "AI", "Frontend"].slice(0, (i % 2) + 1)
    };
});

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
    const query = typeof resolvedParams.rq === "string" ? resolvedParams.rq.toLowerCase() : "";

    // Filter research items based on search query
    const filteredItems = query
        ? MOCK_RESEARCH.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.abstract.toLowerCase().includes(query) ||
            item.tags.some(tag => tag.toLowerCase().includes(query))
        )
        : MOCK_RESEARCH;

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = filteredItems.slice(startIndex, endIndex);

    // Generate pagination array [1, 2, 3...]
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className={`max-w-2xl w-full flex flex-col gap-12 min-h-[80vh] ${!query ? "" : ""}`}>
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
                    {validPage === 1 && (
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Research
                            </h1>
                            <p className="text-lg text-muted leading-relaxed">
                                Exploring ideas, writing papers, and diving deep into selected technical and design topics.
                            </p>
                        </div>
                    )}

                    {/* Search Section */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
                        <ResearchSearch />
                        {query && (
                            <div className="text-xs text-muted font-medium bg-foreground/5 px-3 py-1.5 rounded-full border border-border/50 backdrop-blur-sm">
                                Found <span className="text-foreground font-bold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'topic' : 'topics'} for "{query}"
                            </div>
                        )}
                    </div>

                    {/* Research items list */}
                    <div className="flex flex-col gap-6 min-h-[400px]">
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <Link href={`/research/${item.slug}`} key={item.id} className="p-6 rounded-2xl border border-border/50 bg-foreground/[0.02] flex flex-col gap-3 group cursor-pointer hover:border-foreground/40 hover:bg-foreground/[0.04] transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-muted/60" />
                                            {item.title}
                                        </h3>
                                        <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-all duration-300 opacity-0 group-hover:opacity-100" />
                                    </div>
                                    <p className="text-sm text-muted leading-relaxed line-clamp-2">
                                        {item.abstract}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-muted/60">Published: {item.date}</span>
                                        <div className="flex gap-2">
                                            {item.tags.map((tag, idx) => (
                                                <span key={idx} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-foreground/5 text-muted/80">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-foreground/[0.01] rounded-3xl border border-dashed border-border/50">
                                <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                                    <Search className="w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-foreground/80">No topics found</p>
                                    <p className="text-sm text-muted">Try adjusting your search terms or filters</p>
                                </div>
                                <Link
                                    href="/research"
                                    className="mt-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                                >
                                    Clear Search
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Pagination Section - Stabilized */}
                    <div className="h-20 flex items-center justify-center">
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2">
                                <Link
                                    href={validPage > 1 ? `?page=${validPage - 1}${query ? `&rq=${query}` : ''}` : "#"}
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
                                            href={`?page=${page}${query ? `&rq=${query}` : ''}`}
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
                                    href={validPage < totalPages ? `?page=${validPage + 1}${query ? `&rq=${query}` : ''}` : "#"}
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
                    </div>
                </section>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
