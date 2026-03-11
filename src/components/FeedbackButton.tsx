"use client";

import { useState } from 'react';
import { submitFeedbackAction } from '@/app/actions/notion';
import { MessageSquarePlus, X } from 'lucide-react';

export function FeedbackButton({ articleTitle }: { articleTitle: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setStatus('submitting');
        const success = await submitFeedbackAction(articleTitle, message);
        if (success) {
            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setStatus('idle');
                setMessage('');
            }, 2000);
        } else {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
            >
                <div className="p-2 rounded-full bg-foreground/[0.03] group-hover:bg-foreground/10 transition-colors">
                    <MessageSquarePlus className="w-4 h-4" />
                </div>
                <span>Send Feedback / Suggest Edit</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-border/50 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-muted hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-bold text-foreground mb-2">Send Feedback</h3>
                        <p className="text-sm text-muted mb-4">Found a typo in "{articleTitle}"? Or have a suggestion? Let me know directly.</p>
                        
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="E.g. Typo in the 3rd paragraph..."
                            className="w-full bg-background border border-border/50 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-foreground/30 min-h-[120px] mb-4"
                        />
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={handleSubmit}
                                disabled={status !== 'idle' || !message.trim()}
                                className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-opacity"
                            >
                                {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Sent!' : 'Send Feedback'}
                            </button>
                        </div>
                        {status === 'error' && <p className="text-red-500 text-xs mt-2">Failed to send. Please check .env settings or try again.</p>}
                    </div>
                </div>
            )}
        </>
    );
}
