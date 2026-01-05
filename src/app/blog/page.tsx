import { getAllPosts } from '@/lib/mdx';
import { BlogCard } from '@/components/BlogCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog',
    description: 'Thoughts on software development, design, and more.',
};

export default function BlogPage() {
    const posts = getAllPosts();

    return (
        <div className="max-w-4xl mx-auto px-6 py-20">
            <header className="mb-12">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Blog</h1>
                <p className="text-muted">
                    Thoughts on software development, design, and more.
                </p>
            </header>

            {posts.length > 0 ? (
                <div className="divide-y divide-border">
                    {posts.map((post) => (
                        <BlogCard
                            key={post.slug}
                            title={post.title}
                            excerpt={post.excerpt}
                            date={post.date}
                            readingTime={post.readingTime}
                            slug={post.slug}
                            tags={post.tags}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-muted mb-4">No posts yet.</p>
                    <p className="text-sm text-muted">
                        Add MDX files to <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">content/blog/</code> to get started.
                    </p>
                </div>
            )}
        </div>
    );
}
