import { supabase } from "@/lib/supabase";
import { 
    Eye, 
    MessageCircle, 
    TrendingUp,
    Clock,
    User,
    ArrowUpRight,
    PenLine,
    SearchCode,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";

export default async function AdminDashboard() {
    // Fetch stats from Supabase
    const [
        { count: postsCount },
        { count: researchCount },
        { count: commentsCount },
        { data: viewsData },
        { data: researchViewsData },
        { data: latestComments }
    ] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('research').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('views'),
        supabase.from('research').select('views'),
        supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(4)
    ]);

    const totalViews = [...(viewsData || []), ...(researchViewsData || [])].reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalContent = (postsCount || 0) + (researchCount || 0);

    // Dynamic greeting
    const hour = new Date().getHours();
    const greeting = hour < 6 ? "凌晨好" : hour < 11 ? "早上好" : hour < 13 ? "中午好" : hour < 18 ? "下午好" : "晚上好";

    return (
        <div className="space-y-10">
            {/* Header with Title & Summary */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                        {greeting}, <span className="text-zinc-400 font-medium">管理员</span>
                    </h1>
                    <div className="flex items-center gap-2.5">
                        <div className="w-[3px] h-3.5 bg-zinc-900/10 rounded-full" />
                        <p className="text-zinc-500 text-sm font-medium">这里是项目集群的监控数据</p>
                    </div>
                </div>
            </motion.div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-none md:grid-rows-2 gap-5">
                
                {/* Primary Stat Card - Total Content (Span 2x2) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 md:row-span-2 p-8 rounded-[38px] bg-white border border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex flex-col justify-between group overflow-hidden relative"
                >
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-700">
                        <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
                            <path d="M0,200 Q50,150 100,220 T200,180 T300,250 T400,120" fill="none" stroke="currentColor" strokeWidth="20" className="text-zinc-900" />
                        </svg>
                    </div>
                    <div className="absolute top-0 right-0 p-10 text-zinc-50 group-hover:text-zinc-100 transition-colors duration-500">
                        <TrendingUp className="w-24 h-24 stroke-[1.2]" />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white mb-6 shadow-lg shadow-zinc-200">
                            <PenLine className="w-5 h-5" />
                        </div>
                        <h3 className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2 px-1">发布内容总计</h3>
                        <p className="text-6xl font-black text-zinc-900 tabular-nums leading-none mb-5 track-tighter">{totalContent}</p>
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs bg-emerald-50 w-max px-3 py-1.5 rounded-xl border border-emerald-100/50">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>增长 12.4%</span>
                        </div>
                    </div>
                    <Link href="/admin/posts" className="relative z-10 mt-auto text-zinc-400 hover:text-zinc-900 font-bold text-[13px] flex items-center gap-2 group/link transition-all pt-8">
                        管理全部文章
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </Link>
                </motion.div>

                {/* Secondary Stat - Views (Span 2x1) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="md:col-span-2 p-7 rounded-[32px] bg-white border border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)] flex items-center justify-between group overflow-hidden relative"
                >
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-700">
                        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                            <path d="M0,80 C50,80 80,20 120,20 C160,20 190,70 240,70 C290,70 320,40 400,40" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-900" />
                        </svg>
                    </div>
                    <div className="flex flex-col relative z-10">
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 px-1">全站总阅读量</span>
                        <div className="flex items-baseline gap-2.5">
                            <span className="text-4xl font-black text-zinc-900 tabular-nums leading-none tracking-tight">{totalViews.toLocaleString()}</span>
                            <span className="text-zinc-300 text-[11px] font-black tracking-widest uppercase">Visit</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100/50 flex items-center justify-center group-hover:bg-zinc-100 group-hover:scale-105 transition-all duration-500 relative z-10">
                        <Eye className="w-6 h-6 text-zinc-900" />
                    </div>
                </motion.div>

                {/* Secondary Stat - Interactions (Span 2x1) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-2 p-7 rounded-[32px] bg-white border border-zinc-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group"
                >
                    <div className="flex flex-col">
                        <span className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.2em] mb-2 px-1">互动评论数</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-zinc-900 tabular-nums leading-none">{commentsCount || 0}</span>
                            <span className="text-zinc-400 text-xs font-bold">MSG</span>
                        </div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-100 transition-colors">
                        <MessageCircle className="w-6 h-6 text-zinc-900" />
                    </div>
                </motion.div>

                {/* Quick Actions Card (Span 4x1) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="md:col-span-4 p-8 rounded-[38px] bg-zinc-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group shadow-2xl shadow-zinc-200"
                >
                    <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none group-hover:bg-white/[0.05] transition-colors" />
                    <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">立即开始</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 tracking-tight">准备好发布新内容了吗？</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                            所有的媒体文件都将与您的创作深度绑定。点击下方按钮，开始记录您的创作灵感。
                        </p>
                    </div>

                    <div className="flex gap-3 relative z-10 w-full md:w-auto">
                        <Link 
                            href="/admin/posts/new"
                            className="flex-1 md:flex-none h-12 flex items-center justify-center px-6 bg-white text-zinc-900 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-xl shadow-white/5 active:bg-zinc-100"
                        >
                            发布文章
                        </Link>
                        <Link 
                            href="/admin/research/new"
                            className="flex-1 md:flex-none h-12 flex items-center justify-center px-6 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-xl text-sm font-bold hover:bg-zinc-700 active:scale-95 transition-all"
                        >
                            开启项目
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row - Activity & Recent Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Activity List */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-7 space-y-6"
                >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50">
                                <Clock className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">最新动态</h2>
                        </div>
                        <Link href="/admin/interactions" className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] bg-zinc-100 px-3 py-1.5 rounded-lg border border-black/[0.02]">
                            管理全部
                        </Link>
                    </div>

                    <div className="grid gap-3">
                        {latestComments?.map((comment, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + i * 0.1 }}
                                key={comment.id}
                                className="p-5 rounded-[28px] bg-white border border-zinc-100 flex items-start gap-4 hover:border-zinc-300 transition-all group cursor-default shadow-sm hover:shadow-md"
                            >
                                <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:border-zinc-300 transition-colors">
                                    <User className="w-5 h-5 text-zinc-400 group-hover:text-zinc-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1.5 pt-0.5">
                                        <span className="text-sm font-bold text-zinc-900 tracking-tight group-hover:text-black transition-colors">{comment.author}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-[13px] text-zinc-500 line-clamp-2 leading-relaxed italic pr-4">
                                        "{comment.text}"
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Secondary Content - Research Focus */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-5"
                >
                    <div className="bg-gradient-to-br from-[#f8f9fb] to-[#eceef2] rounded-[40px] border border-zinc-200 p-8 h-full flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                            <SearchCode className="w-48 h-48" />
                        </div>
                        
                        <div className="relative z-10">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 px-1">研究项目概况</h4>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-4xl font-black text-zinc-900 tracking-tighter tabular-nums">{researchCount || 0}</span>
                                    <span className="text-zinc-500 text-xs font-bold">当前有效研究课题</span>
                                </div>
                                <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                                    科研产出是站点的核心智库。建议定期审视研究项目的进度，并同步最新的学术发现。
                                </p>
                            </div>
                        </div>

                        <div className="relative z-10 pt-10">
                            <Link href="/admin/research" className="w-full h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl text-[13px] font-bold text-zinc-900 hover:bg-zinc-50 active:scale-95 transition-all shadow-sm">
                                进入研究控制台
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
