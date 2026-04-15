"use client";

import { useState, useEffect } from 'react';
import { submitFeedbackAction } from '@/app/actions/supabase';
import { MessageSquarePlus, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FeedbackButton({ articleTitle }: { articleTitle: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!message.trim()) return;
        setStatus('submitting');
        const success = await submitFeedbackAction(articleTitle, message);
        if (success) {
            setStatus('success');
            setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => {
                    setStatus('idle');
                    setMessage('');
                }, 300);
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
                className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-all duration-300 group"
            >
                <div className="p-2 rounded-full bg-foreground/[0.03] group-hover:bg-foreground/10 group-hover:scale-110 transition-all duration-300">
                    <MessageSquarePlus className="w-4 h-4" />
                </div>
                <span className="font-medium">发送反馈 / 建议修改</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Overlay */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-background/60 backdrop-blur-md"
                        />
                        
                        {/* Modal Card */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative"
                        >
                            <div className="p-8">
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-6 right-6 p-1 text-muted hover:text-foreground hover:bg-foreground/5 rounded-full transition-all duration-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <div className="space-y-2 mb-8">
                                    <h3 className="text-2xl font-bold text-foreground tracking-tight">发送反馈</h3>
                                    <p className="text-sm text-muted leading-relaxed">
                                        在 <span className="text-foreground/80 font-medium italic">&ldquo;{articleTitle}&rdquo;</span> 中发现了错别字？或者有建议？请直接告诉我。
                                    </p>
                                </div>
                                
                                <div className="relative">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="例如：第三段有错别字..."
                                        disabled={status === 'success' || status === 'submitting'}
                                        className="w-full bg-foreground/[0.02] border border-white/5 rounded-2xl p-4 text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-white/20 focus:bg-foreground/[0.04] transition-all duration-300 min-h-[160px] resize-none"
                                    />
                                    
                                    <AnimatePresence>
                                        {status === 'success' && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl"
                                            >
                                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                                                <span className="font-bold text-foreground">反馈已收到！</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <div className="mt-8 flex items-center justify-between">
                                    <div>
                                        {status === 'error' && (
                                            <div className="flex items-center gap-1.5 text-red-400 text-xs">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>发送失败，请重试。</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={status !== 'idle' || !message.trim()}
                                        className="relative group overflow-hidden bg-foreground text-background px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 transition-all active:scale-95"
                                    >
                                        <span className="relative z-10">
                                            {status === 'submitting' ? '正在发送...' : '发送反馈'}
                                        </span>
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
