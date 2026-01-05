'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Stats {
    totalPosts: number;
    publishedPosts: number;
    totalComments: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({ totalPosts: 0, publishedPosts: 0, totalComments: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [postsRes, commentsRes] = await Promise.all([
                    fetch('/api/posts?includeUnpublished=true'),
                    fetch('/api/comments?postSlug=all'), // We'll need to update this endpoint
                ]);

                const posts = await postsRes.json();
                const comments = await commentsRes.json();

                setStats({
                    totalPosts: posts.length,
                    publishedPosts: posts.filter((p: any) => p.published).length,
                    totalComments: Array.isArray(comments) ? comments.length : 0,
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Posts', value: stats.totalPosts, icon: '📝' },
        { label: 'Published', value: stats.publishedPosts, icon: '✅' },
        { label: 'Comments', value: stats.totalComments, icon: '💬' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((card, index) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-background border border-border rounded-xl p-6"
                        >
                            <div className="text-3xl mb-2">{card.icon}</div>
                            <div className="text-3xl font-bold mb-1">{card.value}</div>
                            <div className="text-sm text-muted">{card.label}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="mt-8 bg-background border border-border rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-2">
                    <a
                        href="/admin/posts/new"
                        className="block px-4 py-3 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity text-center"
                    >
                        Create New Post
                    </a>
                    <a
                        href="/admin/posts"
                        className="block px-4 py-3 border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-center"
                    >
                        Manage Posts
                    </a>
                </div>
            </div>
        </div>
    );
}
