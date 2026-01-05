'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CommentForm } from './CommentForm';

interface Author {
    id: string;
    name: string | null;
    image: string | null;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: Author;
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    postSlug: string;
    onDelete: (id: string) => void;
    depth?: number;
}

export function CommentItem({ comment, postSlug, onDelete, depth = 0 }: CommentItemProps) {
    const { data: session } = useSession();
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const isAuthor = session?.user?.id === comment.author.id;
    const isAdmin = session?.user?.role === 'admin';
    const canDelete = isAuthor || isAdmin;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onDelete(comment.id);
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-6'}`}
        >
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                    {comment.author.image ? (
                        <Image
                            src={comment.author.image}
                            alt={comment.author.name || 'User'}
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-xs font-medium">
                                {comment.author.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author.name || 'Anonymous'}</span>
                        <span className="text-xs text-muted">{formatDate(comment.createdAt)}</span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">
                        {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs text-muted">
                        {session && depth < 3 && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="hover:text-foreground transition-colors"
                            >
                                Reply
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                className="hover:text-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="hover:text-foreground transition-colors"
                            >
                                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-3">
                            <CommentForm
                                postSlug={postSlug}
                                parentId={comment.id}
                                onSuccess={() => setIsReplying(false)}
                                onCancel={() => setIsReplying(false)}
                                placeholder="Write a reply..."
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {showReplies && comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postSlug={postSlug}
                                    onDelete={onDelete}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
