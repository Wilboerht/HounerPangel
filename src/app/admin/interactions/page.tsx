import { supabase } from "@/lib/supabase";
import { MessageSquare, Heart, Clock, User, Trash2, Mail, Hash, AtSign } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function AdminInteractionsPage() {
    const [{ data: comments }, { data: feedbacks }] = await Promise.all([
        supabase.from('comments').select('*').order('created_at', { ascending: false }),
        supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
    ]);

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="border-b border-zinc-100 pb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">互动反馈</h1>
                <div className="flex items-center gap-2.5">
                    <div className="w-[3px] h-3.5 bg-zinc-900 rounded-full" />
                    <p className="text-zinc-500 text-sm font-medium">查看并管理读者的评论与对内容的改进建议</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Comments Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                                <MessageSquare className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">最新评论</h2>
                        </div>
                        <span className="h-6 px-2.5 flex items-center rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-400 tabular-nums">{comments?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-5">
                        {comments?.map((comment) => (
                            <div key={comment.id} className="p-6 rounded-[24px] bg-white border border-zinc-100 shadow-sm group relative overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <button className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{comment.author}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase">
                                                <Clock className="w-3 h-3 opacity-60" />
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-zinc-200" />
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase truncate max-w-[120px]">
                                                {comment.page_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-600 leading-relaxed font-medium bg-zinc-50/50 p-4 rounded-2xl border border-dashed border-zinc-200/50">
                                    {comment.text}
                                </div>
                            </div>
                        ))}
                        {(!comments || comments.length === 0) && (
                            <div className="py-16 text-center border-b border-zinc-50">
                                <p className="text-sm font-medium text-zinc-900">暂无记录</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                                <Heart className="w-4 h-4" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">内容反馈</h2>
                        </div>
                        <span className="h-6 px-2.5 flex items-center rounded-full bg-zinc-50 border border-zinc-100 text-[10px] font-bold text-zinc-400 tabular-nums">{feedbacks?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-5">
                        {feedbacks?.map((feedback) => (
                            <div key={feedback.id} className="p-6 rounded-[24px] bg-white border border-zinc-100 shadow-sm group relative overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <button className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-zinc-900 truncate">{feedback.article_title || "全站反馈"}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1 uppercase mt-0.5">
                                            <Clock className="w-3 h-3 opacity-60" />
                                            {new Date(feedback.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-100 leading-relaxed font-bold bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                                    {feedback.message}
                                </div>
                            </div>
                        ))}
                        {(!feedbacks || feedbacks.length === 0) && (
                            <div className="py-16 text-center border-b border-zinc-50">
                                <p className="text-sm font-medium text-zinc-900">暂无记录</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
