import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, CalendarDays } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";

// For demonstration, mock the data fetching based on slug.
function getMockResearch(slug: string) {
    // Convert-slug-back-to-Title for demonstration
    const displayTitle = slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        slug,
        title: displayTitle,
        abstract: "A comprehensive investigation into the paradigms that define our interaction with digital products. We look at foundational theories, empirical studies, and practical applications that bridge the gap between design intent and user perception.",
        date: `March 2026`,
        tags: ["UX Design", "AI", "Frontend"].sort(() => 0.5 - Math.random()).slice(0, 2),
        content: `
This page serves as a detailed breakdown of a specific research topic or whitepaper, now using a **semantic slug** (\`${slug}\`) in the URL for better SEO and clarity.

## 1. Introduction
The digital landscape demands more than just functional code; it requires interfaces that anticipate user needs. Our research focuses on identifying the friction points in traditional UI patterns and exploring how predictive intelligence can smooth the user journey. 

### Why we moved to Slugs
Previously, this path would have ended with a number like \`/research/1\`. By switching to slugs:
- **Search Engines** index this page with relevant keywords.
- **Users** can easily see the content topic from the link alone.
- **Developers** have a more maintainable and readable routing system.

## 2. Methodology
We conducted a series of A/B tests across diverse user demographics. By tracking micro-interactions (hover states, click latency, scrolling depth), we gathered quantitative data to complement our qualitative user interviews.

## 3. Key Findings
Our analysis revealed significant insights into how anticipatory design affects cognitive load and user satisfaction.

> "Good design is actually a lot harder to notice than poor design, in part because good design fits our needs so well that the design is invisible." - Don Norman
        `
    };
}

export default async function ResearchDetail({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const research = getMockResearch(slug);

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20">
            <div className="max-w-2xl w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/research"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back to Research</span>
                    </Link>
                </nav>

                {/* Header Section */}
                <header className="space-y-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-muted">
                            <BookOpen className="w-5 h-5" />
                            <span className="font-medium tracking-wide uppercase text-xs">Research Paper</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                            {research.title}
                        </h1>
                    </div>

                    {/* Abstract Card */}
                    <div className="p-6 md:p-8 rounded-2xl bg-foreground/5 border border-border/50">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Abstract</h3>
                        <p className="text-muted leading-relaxed">
                            {research.abstract}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-border/50 pb-8">
                        <div className="flex items-center gap-4 text-sm text-muted">
                            <span className="flex items-center gap-1.5">
                                <CalendarDays className="w-4 h-4" />
                                {research.date}
                            </span>
                            <div className="flex gap-2">
                                {research.tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs px-2 py-1 rounded-md border border-border/50 text-muted">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <a
                            href="#"
                            download="Research_Paper_Mock.pdf"
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted transition-colors duration-200"
                            title="Download placeholder PDF"
                        >
                            Download PDF <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </header>

                {/* Content Body */}
                <article className="-mt-4 prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => <h2 className="text-2xl mt-12 mb-6 pb-2 border-b border-white/10 text-foreground font-semibold" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl mt-8 mb-4 text-foreground font-semibold" {...props} />,
                            // Avoid hydration issues by using div for paragraphs
                            p: ({ node, ...props }) => <div className="my-5 text-muted leading-relaxed" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-4 my-6 text-muted" {...props} />,
                            li: ({ node, ...props }) => <li className="leading-relaxed text-muted" {...props} />,
                            // Avoid pre > div nesting
                            pre: ({ node, ...props }) => {
                                const { ref, ...rest } = props as any;
                                return <div {...rest} />;
                            },
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-foreground/30 pl-6 py-2 my-8 text-foreground/80 italic font-medium bg-foreground/5 rounded-r-lg" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                            code: ({ node, inline, className, children, ...props }: any) => {
                                return inline ? (
                                    <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <div className="my-6 rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                            <span className="text-xs text-muted font-mono">Research Data</span>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                            </div>
                                        </div>
                                        <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-zinc-300">
                                            <code {...props}>{children}</code>
                                        </pre>
                                    </div>
                                );
                            },
                        }}
                    >
                        {research.content}
                    </ReactMarkdown>
                </article>

                {/* Footer Actions */}
                <div className="mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-muted">Did you find this research helpful?</p>
                    <ShareButton title={research.title} text={`Read this research on ${research.title}`} />
                </div>

                {/* Footer */}
                <footer className="pt-12 pb-6 text-sm text-center text-muted border-t border-border/10 mt-8">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
