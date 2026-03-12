"use client";

import { useState, useEffect } from 'react';
import { fetchCommentsAction, addCommentAction } from '@/app/actions/notion';
import { MessageSquare, User, Mail, Send } from 'lucide-react';

export function CommentsSection({ pageId }: { pageId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from localStorage
    useEffect(() => {
        const savedNickname = localStorage.getItem('comment_nickname');
        const savedEmail = localStorage.getItem('comment_email');
        if (savedNickname) setNickname(savedNickname);
        if (savedEmail) setEmail(savedEmail);
        loadComments();
    }, [pageId]);

    const loadComments = async () => {
        setIsLoading(true);
        const data = await fetchCommentsAction(pageId);
        setComments(data);
        setIsLoading(false);
    };

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        
        // Save to localStorage
        if (nickname.trim()) localStorage.setItem('comment_nickname', nickname.trim());
        if (email.trim()) localStorage.setItem('comment_email', email.trim());

        const success = await addCommentAction(pageId, newComment, nickname, email);
        if (success) {
            setNewComment('');
            await loadComments();
        }
        setIsSubmitting(false);
    };

    return (
        <div className="mt-8 w-full max-w-2xl mx-auto border-t border-border/50 pt-6">
            <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-5 h-5 text-muted" />
                <h3 className="text-xl font-bold text-foreground">评论</h3>
                <span className="text-xs font-bold text-muted bg-foreground/10 px-2 py-0.5 rounded-full">{comments.length}</span>
            </div>
            
            {/* Comment Form */}
            <div className="mb-10 bg-foreground/[0.02] border border-border/50 rounded-2xl overflow-hidden focus-within:border-foreground/30 focus-within:bg-foreground/[0.04] transition-all duration-300">
                {/* User Info Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-border/30">
                    <div className="flex items-center gap-2 px-4 py-3 border-r-0 sm:border-r border-border/30">
                        <User className="w-4 h-4 text-muted/50" />
                        <input 
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="昵称（选填）"
                            className="bg-transparent border-none focus:outline-none text-sm text-foreground w-full placeholder:text-muted/40"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                        <Mail className="w-4 h-4 text-muted/50" />
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="邮箱（选填）"
                            className="bg-transparent border-none focus:outline-none text-sm text-foreground w-full placeholder:text-muted/40"
                        />
                    </div>
                </div>

                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的想法... 邮箱仅用于通知，不会公开。"
                    className="w-full bg-transparent border-none focus:outline-none text-sm text-foreground resize-none min-h-[100px] p-4 placeholder:text-muted/40"
                />
                
                <div className="flex justify-end p-3 bg-foreground/[0.01] border-t border-border/10">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex items-center gap-2 bg-foreground text-background px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/10"
                    >
                        {isSubmitting ? (
                            <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isSubmitting ? '正在发布...' : '发布评论'}</span>
                    </button>
                </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-32 bg-foreground/[0.03] rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : comments.length > 0 && (
                <div className="space-y-6">
                    {comments.map((comment, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 border border-border/50 flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-xs font-bold text-foreground">{comment.author.charAt(0)}</span>
                            </div>
                            <div className="flex-1 bg-foreground/[0.01] p-5 rounded-3xl border border-border/30 group-hover:bg-foreground/[0.02] transition-colors duration-300">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm text-foreground">{comment.author}</span>
                                        {comment.email && (
                                            <span className="text-[10px] text-muted/40 font-mono">已验证</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-medium text-muted/60 uppercase tracking-tight">
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
            )}
        </div>
    );
}
