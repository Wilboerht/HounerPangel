import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, CalendarDays } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getSingleResearch } from "@/lib/notion";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const research = await getSingleResearch(slug);

    const title = research?.title || decodeURIComponent(slug)
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    return {
        title,
        description: research?.abstract || "Read this research on wilboerht.",
        openGraph: { title, description: research?.abstract || "", type: "article" },
        twitter: { card: "summary_large_image", title, description: research?.abstract || "" },
    };
}

export default async function ResearchDetail({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const research = await getSingleResearch(slug);

    if (!research) {
        notFound();
    }

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
                    {research.abstract && (
                        <div className="p-6 md:p-8 rounded-2xl bg-foreground/5 border border-border/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3">Abstract</h3>
                            <p className="text-muted leading-relaxed">
                                {research.abstract}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-border/50 pb-8">
                        <div className="flex items-center gap-4 text-sm text-muted">
                            {research.date && (
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="w-4 h-4" />
                                    {research.date}
                                </span>
                            )}
                            <div className="flex gap-2">
                                {research.tags?.map((tag: string, idx: number) => (
                                    <span key={idx} className="text-xs px-2 py-1 rounded-md border border-border/50 text-muted">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <ShareButton title={research.title} text={`Read this research on ${research.title}`} />
                    </div>
                </header>

                {/* Content Body */}
                {research.content && (
                    <article className="-mt-4 prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ node, ...props }) => <h2 className="text-2xl mt-12 mb-6 pb-2 border-b border-white/10 text-foreground font-semibold" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl mt-8 mb-4 text-foreground font-semibold" {...props} />,
                                p: ({ node, ...props }) => <div className="my-5 text-muted leading-relaxed" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 space-y-4 my-6 text-muted" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 space-y-4 my-6 text-muted" {...props} />,
                                li: ({ node, ...props }) => <li className="leading-relaxed text-muted" {...props} />,
                                pre: ({ node, ...props }) => {
                                    const { ref, ...rest } = props as any;
                                    return <div {...rest} />;
                                },
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-foreground/30 pl-6 py-2 my-8 text-foreground/80 italic font-medium bg-foreground/5 rounded-r-lg" {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                em: ({ node, ...props }) => <em className="italic text-foreground/90" {...props} />,
                                del: ({ node, ...props }) => <del className="line-through opacity-70" {...props} />,
                                a: ({ node, ...props }) => <a className="text-foreground underline underline-offset-4 decoration-border hover:decoration-foreground transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                img: ({ node, ...props }) => <img className="rounded-xl my-8 border border-border/50 max-w-full shadow-sm" loading="lazy" {...props} />,
                                hr: ({ node, ...props }) => <hr className="my-10 border-border/50" {...props} />,
                                table: ({ node, ...props }) => <div className="overflow-x-auto my-6"><table className="w-full text-left border-collapse" {...props} /></div>,
                                th: ({ node, ...props }) => <th className="border-b border-border/50 py-3 px-4 font-semibold text-foreground bg-foreground/5 first:rounded-tl-lg last:rounded-tr-lg" {...props} />,
                                td: ({ node, ...props }) => <td className="border-b border-border/10 py-3 px-4 text-muted" {...props} />,
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
                )}

                {/* Footer */}
                <footer className="pt-12 pb-6 text-sm text-center text-muted border-t border-border/10 mt-8">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
