import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Library } from "lucide-react";
import { CollectionsDrawer } from "@/components/CollectionsDrawer";

// Generate some mock blog posts for demonstration
const MOCK_POSTS = Array.from({ length: 25 }).map((_, i) => {
    const categories = ["A Deep Dive", "Design Exploration", "Engineering Thoughts", "Life Updates"];
    const title = `Blog Post Title ${i + 1}: ${categories[i % 4]}`;
    // Generate a URL-friendly slug from the title
    const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/-+/g, "-") // Remove multiple -
        .trim();

    // Add some series data for the first few posts
    const series = i < 5 ? {
        name: "Next.js 15 Deep Dive",
        current: i + 1,
        total: 5
    } : i >= 10 && i < 13 ? {
        name: "Minimalist Design Theory",
        current: i - 9,
        total: 3
    } : null;

    return {
        id: i + 1,
        title,
        slug,
        series,
        excerpt: "This is a brief excerpt from the blog post. It provides a little preview of what the article is about before the reader clicks through and explores the full content.",
        date: `March ${30 - (i % 30)}, 2026`,
    };
});

const SERIES_LIST = [
    { name: "Next.js 15 Deep Dive", count: 5, slug: "blog-post-title-1-a-deep-dive" },
    { name: "Minimalist Design Theory", count: 3, slug: "blog-post-title-11-design-exploration" }
];

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

    // Pagination logic
    const totalPages = Math.ceil(MOCK_POSTS.length / ITEMS_PER_PAGE);
    const validPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentPosts = MOCK_POSTS.slice(startIndex, endIndex);

    // Generate pagination array [1, 2, 3...]
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20">
            {/* Desktop Sidebars Wrapper - Added items-start to prevent stretching which causes jitter */}
            <div className="max-w-6xl w-full flex flex-col lg:flex-row lg:items-start gap-16 relative">

                {/* Left Side Navigation - Added sticky to container directly */}
                <div className="hidden lg:block lg:w-48 xl:w-64 lg:sticky lg:top-20">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                {/* Main Content (Center) */}
                <div className="flex-1 max-w-2xl flex flex-col gap-12 overflow-visible">
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
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                Blog
                            </h1>
                            <p className="text-lg text-muted leading-relaxed">
                                Thoughts on software engineering, design, and life.
                            </p>
                        </div>

                        {/* Mobile Series Grid - With Drawer for full search */}
                        <div className="lg:hidden space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <CollectionsDrawer seriesList={SERIES_LIST} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {SERIES_LIST.slice(0, 4).map((series, i) => (
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
                        </div>

                        {/* Blog posts list */}
                        <div className="flex flex-col gap-8">
                            {currentPosts.map((post, idx) => (
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
                                            <span className="inline-flex items-center gap-1 group-hover:text-foreground transition-colors duration-200">
                                                Read Post <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                            </span>
                                        </div>
                                    </Link>

                                    {idx < currentPosts.length - 1 && (
                                        <div className="w-full h-px bg-border/50"></div>
                                    )}
                                </div>
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
                                {SERIES_LIST.map((series, i) => (
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
                                ))}
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
