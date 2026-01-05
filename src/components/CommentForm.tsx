'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface CommentFormProps {
    postSlug: string;
    parentId?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    placeholder?: string;
}

export function CommentForm({ postSlug, parentId, onSuccess, onCancel, placeholder }: CommentFormProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !session) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, postSlug, parentId }),
            });

            if (response.ok) {
                setContent('');
                onSuccess?.();
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) {
        return null;
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
        >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder || 'Write a comment...'}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none
                   text-sm min-h-[100px]"
                disabled={isSubmitting}
            />
            <div className="flex items-center gap-2">
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-opacity"
                >
                    {isSubmitting ? 'Posting...' : parentId ? 'Reply' : 'Comment'}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </motion.form>
    );
}
