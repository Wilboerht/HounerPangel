import { supabase } from "@/lib/supabase";
import { 
    Eye, 
    FileText, 
    MessageCircle, 
    TrendingUp,
    Clock,
    User
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default async function AdminDashboard() {
    // Fetch stats from Supabase
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: researchCount } = await supabase.from('research').select('*', { count: 'exact', head: true });
    const { count: commentsCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    
    // Calculate total views
    const { data: viewsData } = await supabase.from('posts').select('views');
    const { data: researchViewsData } = await supabase.from('research').select('views');
    const totalViews = [...(viewsData || []), ...(researchViewsData || [])].reduce((acc, curr) => acc + (curr.views || 0), 0);

    // Latest comments
    const { data: latestComments } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    const stats = [
        { name: "文章总数", value: (postsCount || 0) + (researchCount || 0), icon: FileText, color: "text-blue-400" },
        { name: "总阅读量", value: totalViews, icon: Eye, color: "text-purple-400" },
        { name: "互动评论", value: commentsCount || 0, icon: MessageCircle, color: "text-emerald-400" },
        { name: "平均留存", value: "85%", icon: TrendingUp, color: "text-amber-400" },
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] mb-2">Workspace Overview</p>
                <h1 className="text-4xl font-bold tracking-tight">欢迎回来, 管理员</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div 
                        key={i}
                        className="p-6 rounded-[24px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">{stat.name}</p>
                            <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Interactions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <Clock className="w-5 h-5 text-emerald-400" />
                            最新动态
                        </h2>
                        <Link href="/admin/interactions" className="text-xs text-white/40 hover:text-white transition-colors">查看全部</Link>
                    </div>

                    <div className="space-y-4">
                        {latestComments?.map((comment) => (
                            <div 
                                key={comment.id}
                                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 hover:bg-white/[0.04] transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold truncate">{comment.author}</span>
                                        <span className="text-[10px] text-white/20">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed italic">
                                        "{comment.text}"
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!latestComments || latestComments.length === 0) && (
                            <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                                <p className="text-sm text-white/20">暂无互动记录</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Info Card */}
                <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-bold mb-4">准备好发布新内容了吗？</h3>
                        <p className="text-white/60 leading-relaxed mb-8">
                            通过全新的管理后台，你可以更直观地管理你的文章、资源和互动。所有的媒体文件都将与你的文章路径深度绑定，保持项目异常整洁。
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Link 
                            href="/admin/posts/new"
                            className="bg-white text-black px-6 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
                        >
                            撰写新文章
                        </Link>
                        <Link 
                            href="/admin/research/new"
                            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 active:scale-95 transition-all"
                        >
                            开启新研究
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
