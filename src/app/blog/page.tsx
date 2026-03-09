import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

// Generate some mock blog posts for demonstration
const MOCK_POSTS = Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    title: `Blog Post Title ${i + 1}: ${["A Deep Dive", "Design Exploration", "Engineering Thoughts", "Life Updates"][i % 4]}`,
    excerpt: "This is a brief excerpt from the blog post. It provides a little preview of what the article is about before the reader clicks through and explores the full content.",
    date: `March ${30 - (i % 30)}, 2026`,
}));

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
                            Blog
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Thoughts on software engineering, design, and life.
                        </p>
                    </div>

                    {/* Blog posts list */}
                    <div className="flex flex-col gap-8">
                        {currentPosts.map((post, idx) => (
                            <div key={post.id} className="flex flex-col gap-8">
                                <Link href={`/blog/${post.id}`} className="group flex flex-col gap-3">
                                    <h3 className="text-xl font-semibold tracking-tight text-foreground group-hover:underline underline-offset-4 decoration-muted group-hover:decoration-foreground transition-all duration-200">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted leading-relaxed line-clamp-2">
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

                                {/* Divider between posts, except the last one */}
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

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10 mt-4">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
