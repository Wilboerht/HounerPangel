import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Library, Search, BookOpen } from "lucide-react";
import { CollectionsDrawer } from "@/components/CollectionsDrawer";
import { BlogSearch } from "@/components/BlogSearch";
import { getPublishedPosts } from "@/lib/notion";

const ITEMS_PER_PAGE = 5;

// Next.js 15+ Async Page Props
export default async function Blog({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Resolve search parameters
    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams.page) || 1;
    const query = typeof resolvedParams.q === "string" ? resolvedParams.q.toLowerCase() : "";

    // Fetch from Notion
    const allPosts = await getPublishedPosts();

    // Dynamically generate collection lists from posts
    const collectionsMap = new Map();
    allPosts.forEach((post: any) => {
        if (post.series) {
            if (!collectionsMap.has(post.series.name)) {
                collectionsMap.set(post.series.name, {
                    name: post.series.name,
                    count: 0,
                    slug: post.series.items[0]?.slug || post.slug
                });
            }
            collectionsMap.get(post.series.name).count += 1;
        }
    });
    const collectionsList = Array.from(collectionsMap.values());

    // Filter posts based on search query
    const filteredPosts = query
        ? allPosts.filter((post: any) =>
            post.title?.toLowerCase().includes(query) ||
            post.excerpt?.toLowerCase().includes(query) ||
            (post.series?.name.toLowerCase().includes(query))
        )
        : allPosts;

    // Pagination logic
    const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
    const validPage = Math.max(1, Math.min(currentPage, totalPages || 1));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    // Generate pagination array [1, 2, 3...]
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20">
            {/* Desktop Sidebars Wrapper - Align top to prevent jitter */}
            <div className="max-w-[1312px] w-full flex flex-col lg:flex-row lg:items-start gap-16 relative">

                {/* Left Side Navigation */}
                <div className="hidden lg:block lg:w-48 xl:w-64 lg:sticky lg:top-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Main Content (Center) - Ensure fixed width and stable height */}
                <div className="flex-1 max-w-2xl flex flex-col gap-12 min-h-[80vh]">
                    {/* Mobile Navigation */}
                    <nav className="lg:hidden">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span>Back to Home</span>
                        </Link>
                    </nav>

                    <section className="space-y-10">
                        {validPage === 1 && (
                            <>
                                <div className="space-y-4">
                                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                        Blog
                                    </h1>
                                    <p className="text-lg text-muted leading-relaxed">
                                        Resonating with the inner self.
                                    </p>
                                </div>

                                {/* Mobile Series Grid - With Drawer for full search */}
                                <div className="lg:hidden space-y-4 border-b border-border/30 pb-10">
                                    <div className="flex items-center justify-between px-1">
                                        <CollectionsDrawer seriesList={collectionsList} />
                                    </div>

                                    {collectionsList.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {collectionsList.slice(0, 4).map((series, i) => (
                                                <Link
                                                    key={i}
                                                    href={`/blog/${series.slug}`}
                                                    className="group p-4 rounded-xl border border-border/50 bg-foreground/[0.02] active:bg-foreground/[0.05] transition-all duration-200 flex flex-col gap-2"
                                                >
                                                    <span className="text-[11px] font-bold text-foreground/80 line-clamp-2 leading-snug h-8">
                                                        {series.name}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 opacity-60">
                                                        <span className="text-[9px] font-medium text-muted uppercase tracking-tighter">
                                                            {series.count} Posts
                                                        </span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-6 px-4 rounded-xl border border-dashed border-border/30 text-center bg-foreground/[0.01]">
                                            <p className="text-sm font-semibold text-foreground/80">No collections yet</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Search and Filters Section */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
                            <BlogSearch />
                            {query && (
                                <div className="text-xs text-muted font-medium bg-foreground/5 px-3 py-1.5 rounded-full border border-border/50">
                                    Found <span className="text-foreground font-bold">{filteredPosts.length}</span> {filteredPosts.length === 1 ? 'result' : 'results'} for "{query}"
                                </div>
                            )}
                        </div>

                        {/* Blog posts list */}
                        <div className="flex flex-col gap-8 min-h-[400px]">
                            {currentPosts.length > 0 ? (
                                currentPosts.map((post: any, idx: number) => (
                                    <div key={post.id} className="flex flex-col gap-8">
                                        <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
                                            {post.series && (
                                                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-foreground/40 bg-foreground/5 w-fit px-2 py-0.5 rounded-full border border-foreground/10 group-hover:border-foreground/20 group-hover:text-foreground/60 transition-all duration-300">
                                                    <span className="w-1 h-1 rounded-full bg-foreground/40 animate-pulse"></span>
                                                    Series: {post.series.name} ({post.series.current}/{post.series.total})
                                                </div>
                                            )}
                                            <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:underline underline-offset-4 decoration-muted group-hover:decoration-foreground transition-all duration-200">
                                                {post.title}
                                            </h3>
                                            <p className="text-muted leading-relaxed line-clamp-2 text-sm">
                                                {post.excerpt}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarDays className="w-4 h-4" />
                                                    {post.date}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <BookOpen className="w-4 h-4" />
                                                    5 min read
                                                </span>
                                            </div>
                                        </Link>
                                        <div className="h-px bg-border/30 w-full" />
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-foreground/[0.01] rounded-3xl border border-dashed border-border/50">
                                    <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-semibold text-foreground/80">
                                            {query ? "No articles found" : "Coming soon"}
                                        </p>
                                        <p className="text-sm text-muted">
                                            {query
                                                ? "Try adjusting your search terms or filters"
                                                : "We are currently preparing content. Stay tuned."}
                                        </p>
                                    </div>
                                    {query && (
                                        <Link
                                            href="/blog"
                                            className="mt-2 text-xs font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-colors"
                                        >
                                            Clear Search
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Section - Keep space even if empty to prevent jitter */}
                        <div className="h-20 flex items-center justify-center">
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    <Link
                                        href={validPage > 1 ? `?page=${validPage - 1}${query ? `&q=${query}` : ''}` : "#"}
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
                                                href={`?page=${page}${query ? `&q=${query}` : ''}`}
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
                                        href={validPage < totalPages ? `?page=${validPage + 1}${query ? `&q=${query}` : ''}` : "#"}
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
                </div>

                {/* Right Side: Floating Sidebar for Collections */}
                <aside className="hidden lg:block lg:w-48 xl:w-64 lg:sticky lg:top-20">
                    <div className="flex flex-col gap-8">
                        {/* Series Sidebar Component */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-foreground/30 px-1">
                                <Library className="w-3.5 h-3.5" /> Collections
                            </div>
                            <div className="flex flex-col gap-2 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar pr-2 pb-2">
                                {collectionsList.length > 0 ? (
                                    collectionsList.map((series, i) => (
                                        <Link
                                            key={i}
                                            href={`/blog/${series.slug}`}
                                            className="group p-4 rounded-xl border border-border/50 bg-card/20 hover:bg-card/40 hover:border-foreground/20 transition-all duration-300 flex flex-col gap-2"
                                        >
                                            <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground transition-colors duration-200 line-clamp-2 leading-snug">
                                                {series.name}
                                            </span>
                                            <span className="text-[10px] text-muted font-medium bg-foreground/5 w-fit px-1.5 py-0.5 rounded border border-border/20 uppercase tracking-tighter">
                                                {series.count} Articles
                                            </span>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="py-10 px-4 rounded-2xl border border-dashed border-border/30 text-center bg-foreground/[0.01]">
                                        <p className="text-sm font-semibold text-foreground/80">No collections</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Global Footer */}
            <footer className="max-w-2xl w-full pt-16 pb-8 text-sm text-center text-muted border-t border-white/5 mt-12">
                <p>&copy; {new Date().getFullYear()} wilboerht</p>
            </footer>
        </main>
    );
}
