'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function NewPostPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        content: '',
        excerpt: '',
        tags: '',
        published: true,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
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
                alert(error.error || 'Failed to create post');
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            alert('Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">New Post</h1>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="bg-background border border-border rounded-xl p-6 space-y-6"
            >
                {/* Slug */}
                <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="my-first-post"
                        required
                    />
                    <p className="text-xs text-muted mt-1">URL-friendly identifier (e.g., my-first-post)</p>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="My First Post"
                        required
                    />
                </div>

                {/* Excerpt */}
                <div>
                    <label className="block text-sm font-medium mb-2">Excerpt</label>
                    <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                        rows={2}
                        placeholder="A brief description of your post"
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
                        placeholder="React, Next.js, TypeScript"
                    />
                    <p className="text-xs text-muted mt-1">Comma-separated list</p>
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium mb-2">Content (MDX) *</label>
                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none font-mono text-sm"
                        rows={20}
                        placeholder="# Your content here..."
                        required
                    />
                </div>

                {/* Published */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                        className="w-4 h-4"
                    />
                    <label htmlFor="published" className="text-sm">
                        Publish immediately
                    </label>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Post'}
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
