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
            <div>
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">互动反馈</h1>
                <div className="flex items-center gap-2.5">
                    <div className="w-[3px] h-3.5 bg-indigo-500 rounded-full" />
                    <p className="text-zinc-500 text-sm font-medium">查看并管理读者的评论与对内容的改进建议</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Comments Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800">最新评论</h2>
                        </div>
                        <span className="h-6 px-2.5 flex items-center rounded-full bg-zinc-100 text-[11px] font-black text-zinc-400 tabular-nums">{comments?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-5">
                        {comments?.map((comment) => (
                            <div key={comment.id} className="p-8 rounded-[40px] bg-white border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2.5 rounded-xl bg-red-50 text-red-100 hover:text-red-500 hover:bg-red-100/50 transition-all active:scale-95">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500">
                                        <User className="w-6 h-6 text-zinc-300 group-hover:text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-zinc-900 truncate mb-1">{comment.author}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                                <Clock className="w-3 h-3" />
                                                {new Date(comment.created_at).toLocaleString()}
                                            </p>
                                            {comment.email && (
                                                <p className="text-[10px] font-bold text-indigo-400/60 flex items-center gap-1 uppercase tracking-tighter">
                                                    <AtSign className="w-3 h-3" />
                                                    Email Attached
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-1 text-sm text-zinc-600 leading-relaxed font-medium bg-zinc-50/50 p-5 rounded-3xl border border-dashed border-zinc-200/50">
                                    {comment.text}
                                </div>
                                <div className="mt-6 flex items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 border border-zinc-200 max-w-full">
                                        <Hash className="w-3 h-3 text-zinc-400" />
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter truncate">
                                            {comment.page_id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!comments || comments.length === 0) && (
                            <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/10">
                                <p className="text-zinc-300 text-xs font-black uppercase tracking-[0.2em]">暂无互动评论</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                                <Heart className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-800">内容反馈</h2>
                        </div>
                        <span className="h-6 px-2.5 flex items-center rounded-full bg-zinc-100 text-[11px] font-black text-zinc-400 tabular-nums">{feedbacks?.length || 0}</span>
                    </div>

                    <div className="flex flex-col gap-5">
                        {feedbacks?.map((feedback) => (
                            <div key={feedback.id} className="p-8 rounded-[40px] bg-white border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2.5 rounded-xl bg-red-50 text-red-100 hover:text-red-500 hover:bg-red-100/50 transition-all active:scale-95">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-500">
                                        <Mail className="w-6 h-6 text-emerald-400 group-hover:text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-zinc-900 truncate mb-1">{feedback.article_title || "全站反馈"}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                            <Clock className="w-3 h-3" />
                                            {new Date(feedback.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="pl-1 text-sm text-zinc-600 leading-relaxed font-bold bg-zinc-900 text-zinc-100 p-6 rounded-3xl border border-zinc-800">
                                    {feedback.message}
                                </p>
                            </div>
                        ))}
                        {(!feedbacks || feedbacks.length === 0) && (
                            <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/10">
                                <p className="text-zinc-300 text-xs font-black uppercase tracking-[0.2em]">暂无改进建议</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
