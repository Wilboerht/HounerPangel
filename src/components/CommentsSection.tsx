"use client";

import { useState, useEffect } from 'react';
import { fetchCommentsAction, addCommentAction } from '@/app/actions/notion';
import { MessageSquare } from 'lucide-react';

export function CommentsSection({ pageId }: { pageId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadComments = async () => {
        setIsLoading(true);
        const data = await fetchCommentsAction(pageId);
        setComments(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadComments();
    }, [pageId]);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        const success = await addCommentAction(pageId, newComment);
        if (success) {
            setNewComment('');
            await loadComments();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-16 w-full max-w-2xl mx-auto border-t border-border/50 pt-10">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-muted" />
                <h3 className="text-xl font-bold text-foreground">Comments</h3>
                <span className="text-xs font-bold text-muted bg-foreground/10 px-2 py-0.5 rounded-full">{comments.length}</span>
            </div>
            
            {/* Comment Input */}
            <div className="mb-10 bg-foreground/[0.02] border border-border/50 rounded-2xl p-4 transition-colors focus-within:border-foreground/30 focus-within:bg-foreground/[0.04]">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment... (Posts anonymously via Notion API)"
                    className="w-full bg-transparent border-none focus:outline-none text-sm text-foreground resize-none min-h-[80px]"
                />
                <div className="flex justify-end mt-2 pt-2 border-t border-border/30">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-foreground/10 hover:bg-foreground/20 text-foreground px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="text-center text-muted text-sm py-8 animate-pulse">Loading comments from Notion...</div>
            ) : comments.length > 0 ? (
                <div className="space-y-6">
                    {comments.map((comment, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-foreground/10 border border-border/50 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-foreground">{comment.author.charAt(0)}</span>
                            </div>
                            <div className="flex-1 bg-foreground/[0.01] p-4 rounded-2xl border border-border/30">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-semibold text-sm text-foreground">{comment.author}</span>
                                    <span className="text-xs text-muted/60">
                                        {new Date(comment.created_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <div className="text-sm text-muted/90 whitespace-pre-wrap leading-relaxed">
                                    {comment.text}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted py-10 border border-dashed border-border/30 rounded-2xl bg-foreground/[0.01]">
                    <p className="font-semibold text-foreground/80 mb-1">No comments yet.</p>
                    <p className="text-xs">Be the first to start the conversation! Your comment will be synced to Notion.</p>
                </div>
            )}
        </div>
    );
}
