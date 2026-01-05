'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    postSlug: string;
    author: {
        name: string | null;
        image: string | null;
    };
}

export default function AdminCommentsPage() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            // Fetch all comments (we'll need to update the API to support this)
            const response = await fetch('/api/comments?postSlug=all');
            if (response.ok) {
                const data = await response.json();
                setComments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setComments(comments.filter((c) => c.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Comments</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-background border border-border rounded-xl p-6"
                        >
                            <div className="flex items-start gap-4">
                                {comment.author.image ? (
                                    <Image
                                        src={comment.author.image}
                                        alt={comment.author.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-sm font-medium">
                                            {comment.author.name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-medium">{comment.author.name || 'Anonymous'}</span>
                                        <span className="text-xs text-muted">
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-muted">on /{comment.postSlug}</span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                                </div>

                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-background border border-border rounded-xl">
                    <p className="text-muted">No comments yet</p>
                </div>
            )}
        </div>
    );
}
