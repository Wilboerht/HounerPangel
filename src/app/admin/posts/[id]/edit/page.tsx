'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const router = useRouter();
    const [id, setId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        content: '',
        excerpt: '',
        tags: '',
        published: true,
    });

    useEffect(() => {
        params.then((p) => {
            setId(p.id);
            fetchPost(p.id);
        });
    }, [params]);

    const fetchPost = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts/${postId}`);
            const post = await response.json();

            setFormData({
                slug: post.slug,
                title: post.title,
                content: post.content,
                excerpt: post.excerpt,
                tags: JSON.parse(post.tags || '[]').join(', '),
                published: post.published,
            });
        } catch (error) {
            console.error('Failed to fetch post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
                }),
            });

            if (response.ok) {
                router.push('/admin/posts');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update post');
            }
        } catch (error) {
            console.error('Failed to update post:', error);
            alert('Failed to update post');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-8 animate-pulse" />
                <div className="bg-background border border-border rounded-xl p-6 space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-background border border-border rounded-xl p-6 space-y-6"
            >
                {/* Same form fields as NewPostPage */}
                <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Excerpt</label>
                    <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                        rows={2}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Content (MDX) *</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono text-sm"
                        rows={20}
                        required
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="published" className="text-sm">
                        Published
                    </label>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </motion.form>
        </div>
    );
}
