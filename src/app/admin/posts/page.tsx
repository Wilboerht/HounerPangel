'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Post {
    id: string;
    slug: string;
    title: string;
    published: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function AdminPostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts?includeUnpublished=true');
            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPosts(posts.filter((p) => p.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Posts</h1>
                <Link
                    href="/admin/posts/new"
                    className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                >
                    New Post
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : posts.length > 0 ? (
                <div className="bg-background border border-border rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-border">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                                    Updated
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {posts.map((post) => (
                                <motion.tr
                                    key={post.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{post.title}</div>
                                        <div className="text-sm text-muted">/{post.slug}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs rounded-full ${post.published
                                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                                                }`}
                                        >
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted">
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm space-x-2">
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="text-muted hover:text-foreground"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/admin/posts/${post.id}/edit`}
                                            className="text-muted hover:text-foreground"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 bg-background border border-border rounded-xl">
                    <p className="text-muted mb-4">No posts yet</p>
                    <Link
                        href="/admin/posts/new"
                        className="inline-block px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Create Your First Post
                    </Link>
                </div>
            )}
        </div>
    );
}
