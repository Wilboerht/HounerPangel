import { supabase } from "@/lib/supabase";
import { MessageSquare, Heart, Trash2, Mail, ExternalLink, MessageCircle } from "lucide-react";

export default async function AdminInteractionsPage() {
    const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

    const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-16">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">互动与反馈</h1>
                <p className="text-white/40 text-sm">管理读者评论和收到的修改建议。</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Comments Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">最新评论</h2>
                        <span className="text-xs font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{comments?.length || 0}</span>
                    </div>

                    <div className="space-y-4">
                        {comments?.map((comment) => (
                            <div key={comment.id} className="p-6 rounded-[24px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs">
                                            {comment.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{comment.author}</p>
                                            <p className="text-[10px] text-white/20 font-mono italic">{comment.email || "No Email Provided"}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed mb-4 pl-1 border-l-2 border-white/5">
                                    {comment.text}
                                </p>
                                <div className="flex items-center justify-between text-[10px] text-white/20">
                                    <span className="flex items-center gap-1.5 font-mono">
                                        <ExternalLink className="w-3 h-3" /> on /{comment.page_id}
                                    </span>
                                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-1">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">收到的反馈</h2>
                        <span className="text-xs font-bold text-white/20 bg-white/5 px-2 py-0.5 rounded-full">{feedbacks?.length || 0}</span>
                    </div>

                    <div className="space-y-4">
                        {feedbacks?.map((fb) => (
                            <div key={fb.id} className="p-6 rounded-[24px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <Mail className="w-3.5 h-3.5 text-blue-400/60" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{fb.article_title}</span>
                                </div>
                                <p className="text-sm text-white/80 leading-relaxed mb-4 italic">
                                    "{fb.message}"
                                </p>
                                <div className="text-[10px] text-white/20 text-right">
                                    {new Date(fb.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {(!feedbacks || feedbacks.length === 0) && (
                            <div className="py-20 text-center border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                                <p className="text-sm text-white/20">尚无反馈建议</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
