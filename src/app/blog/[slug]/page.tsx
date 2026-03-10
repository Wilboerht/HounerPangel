import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import ReactMarkdown from "react-markdown";

// For demonstration, we'll mock the data fetching based on the slug.
// In a real app, you would fetch this from a database or markdown files.
function getMockPost(slug: string) {
    // Convert-slug-back-to-Title for demonstration
    const displayTitle = slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        slug,
        title: displayTitle,
        date: `March 20, 2026`,
        readTime: "5 min read",
        content: `
This is a demonstration of a blog post detail page using a **semantic slug** in the URL. 

## Why Slugs Matter
Using a slug like \`${slug}\` instead of a numeric ID is a web development best practice because:

1. **SEO Optimization**: Search engines like Google crawl the URL. Having keywords in the URL helps your page rank better for those terms.
2. **User Experience**: Users can tell what the page is about before clicking the link.
3. **Persistance**: Even if your database IDs change, the slug can remain the same, keeping your links "evergreen".

### How it's implemented
In this Next.js application, we use a dynamic route folder. The framework automatically passes the URL segment to the page component as a parameter.

\`\`\`tsx
// File: src/app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Now you can fetch data using the slug
  const post = await getPostBySlug(slug);
  
  return <article>{/* ... */}</article>;
}
\`\`\`
        `
    };
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const post = getMockPost(resolvedParams.slug);

    return (
        <main className="min-h-screen flex flex-col items-center px-6 py-12 lg:py-20">
            <div className="max-w-2xl w-full flex flex-col gap-10">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>Back to Blog</span>
                    </Link>
                </nav>

                {/* Article Header */}
                <header className="space-y-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted pt-2 border-b border-border/50 pb-8">
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            {post.date}
                        </span>
                        <span>&middot;</span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {post.readTime}
                        </span>
                    </div>
                </header>

                {/* Article Content */}
                <article className="-mt-4 prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => <h2 className="text-2xl mt-8 mb-4 text-foreground font-semibold" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl mt-6 mb-3 text-foreground font-semibold" {...props} />,
                            // Change p to div to avoid "div cannot be a descendant of p" hydration error
                            p: ({ node, ...props }) => <div className="my-4 text-muted leading-relaxed" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 space-y-2 my-4 text-muted" {...props} />,
                            li: ({ node, ...props }) => <li className="text-muted" {...props} />,
                            // Override pre to avoid pre > div nesting issues by using a fragment or div
                            pre: ({ node, ...props }) => {
                                // Extract ref and other non-div props if any to avoid TS errors
                                const { ref, ...rest } = props as any;
                                return <div {...rest} />;
                            },
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-foreground/30 pl-4 py-1 my-6 text-foreground/80 italic font-medium" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                            code: ({ node, inline, className, children, ...props }: any) => {
                                return inline ? (
                                    <code className="bg-foreground/10 text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <div className="my-6 rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
                                            <span className="text-xs text-muted font-mono">Example Code</span>
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
                        {post.content}
                    </ReactMarkdown>
                </article>

                {/* Article Footer & Share */}
                <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-foreground/10">
                            {/* Author avatar */}
                            <Image
                                src="/avatar.jpg"
                                alt="Hank Wong"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Hank Wong</span>
                            <span className="text-xs text-muted">Author</span>
                        </div>
                    </div>

                    <ShareButton title={post.title} text={`Check out this article: ${post.title}`} />
                </div>

                {/* Footer */}
                <footer className="pt-12 pb-6 text-sm text-center text-muted border-t border-border/10 mt-8">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
