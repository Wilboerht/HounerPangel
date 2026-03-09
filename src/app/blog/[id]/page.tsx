import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";

// For demonstration, we'll mock the data fetching based on the ID.
// In a real app, you would fetch this from a database or markdown files.
function getMockPost(id: string) {
    return {
        id,
        title: `Blog Post Title ${id}: A Deep Dive into Modern Web Development`,
        date: `March ${30 - (Number(id) % 30)}, 2026`,
        readTime: "5 min read",
        content: `
This is a demonstration of a blog post detail page. In a real application, this content would likely be rendered from Markdown (MDX) or a headless CMS.

## The Evolution of the Web
The landscape of web development is constantly shifting. We have moved from simple static HTML pages to complex, interactive web applications that rival native desktop software in both capability and performance.

### Key Turning Points
1. **The rise of JavaScript frameworks**: Tools like React, Vue, and Angular revolutionized how we build user interfaces.
2. **Server-Side Rendering (SSR) making a comeback**: Frameworks like Next.js brought the benefits of SSR back to the modern component-based era, perfectly blending SEO benefits with rich client-side interactivity.
3. **The edge computing revolution**: Deploying code closer to the user to reduce latency and improve perceived performance.

## Design Systems and Component Libraries
Creating a consistent user experience requires discipline. This is where design systems come into play. By standardizing our design tokens (colors, typography, spacing) and our component interfaces, we build UIs that are not only beautiful but maintainable.

> "A design system is not a project. It is a product serving products." - Nathan Curtis

With tools like Tailwind CSS, building and iterating on these systems has never been faster. We can rapidly prototype while ensuring our CSS payload remains minimal.

## Looking Forward
As we look to the future, AI-assisted development, WebAssembly, and native-like web capabilities will continue to blur the lines between what's possible in the browser versus native applications. The imperative for developers is to keep learning, adapting, and building with empathy for the end-user.
        `
    };
}

export default async function BlogPost({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const post = getMockPost(resolvedParams.id);

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

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted pt-2">
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

                    <div className="w-full h-px bg-border/50 my-8"></div>
                </header>

                {/* Article Content */}
                <article className="prose prose-invert prose-p:text-muted prose-p:leading-relaxed prose-headings:text-foreground prose-headings:font-semibold prose-a:text-foreground hover:prose-a:text-muted prose-blockquote:border-l-foreground/30 prose-blockquote:text-muted/80 w-full max-w-none">
                    {/* We are manually rendering the mock content for demo. 
                        In reality, use next-mdx-remote or react-markdown */}
                    {post.content.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.trim().startsWith('## ')) {
                            return <h2 key={idx} className="text-2xl mt-8 mb-4">{paragraph.replace('## ', '')}</h2>
                        }
                        if (paragraph.trim().startsWith('### ')) {
                            return <h3 key={idx} className="text-xl mt-6 mb-3">{paragraph.replace('### ', '')}</h3>
                        }
                        if (paragraph.trim().startsWith('> ')) {
                            return (
                                <blockquote key={idx} className="border-l-4 border-foreground/30 pl-4 py-1 my-6 text-foreground/80 italic font-medium">
                                    {paragraph.replace('> ', '')}
                                </blockquote>
                            );
                        }
                        if (paragraph.includes('1. **')) {
                            const items = paragraph.split('\n').filter(Boolean);
                            return (
                                <ol key={idx} className="list-decimal pl-5 space-y-2 my-4 text-muted">
                                    {items.map((item, i) => {
                                        const text = item.replace(/^\d+\.\s+\*\*(.*?)\*\*(.*)/, '<strong>$1</strong>$2');
                                        return <li key={i} dangerouslySetInnerHTML={{ __html: text }} />
                                    })}
                                </ol>
                            )
                        }
                        if (paragraph.trim() === '') return null;
                        return <p key={idx} className="my-4">{paragraph}</p>
                    })}
                </article>

                {/* Article Footer & Share */}
                <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center">
                            {/* Author avatar placeholder */}
                            <span className="text-sm font-medium">HW</span>
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
