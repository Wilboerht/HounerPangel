import { supabase } from "@/lib/supabase";
import { MessageSquare, Heart, Clock, User, Trash2, Mail } from "lucide-react";

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
        <div className="space-y-12">
            <div>
                <p className="text-black/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Audience Response</p>
                <h1 className="text-4xl font-extrabold tracking-tight text-black">评论与反馈</h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Comments Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-black">最新评论</h2>
                        <span className="px-2 py-0.5 rounded-lg bg-black/[0.03] text-[10px] font-bold text-black/40">{comments?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {comments?.map((comment) => (
                            <div key={comment.id} className="p-8 rounded-[40px] bg-white border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-black/[0.02] border border-black/[0.05] flex items-center justify-center">
                                            <User className="w-6 h-6 text-black/20" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black">{comment.author}</p>
                                            <p className="text-[10px] font-bold text-black/20 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {new Date(comment.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg text-black/20 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="pl-1 text-sm text-black/60 leading-relaxed italic">
                                    "{comment.text}"
                                </div>
                                <div className="mt-6 pt-6 border-t border-black/[0.03] flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">来自文章 id:</span>
                                    <code className="text-[10px] font-mono bg-black/[0.02] px-2 py-0.5 rounded text-black/40">{comment.post_id}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <Heart className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-black">内容建议</h2>
                        <span className="px-2 py-0.5 rounded-lg bg-black/[0.03] text-[10px] font-bold text-black/40">{feedbacks?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {feedbacks?.map((feedback) => (
                            <div key={feedback.id} className="p-8 rounded-[40px] bg-white border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <Mail className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black">{feedback.article_title}</p>
                                            <p className="text-[10px] font-bold text-black/20 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {new Date(feedback.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-lg text-black/20 hover:text-red-500 hover:bg-red-50 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="pl-1 text-sm text-black/60 leading-relaxed bg-black/[0.01] p-4 rounded-2xl border border-black/[0.02]">
                                    {feedback.content}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
