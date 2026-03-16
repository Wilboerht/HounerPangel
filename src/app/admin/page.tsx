import { supabase } from "@/lib/supabase";
import { 
    Eye, 
    FileText, 
    MessageCircle, 
    TrendingUp,
    Clock,
    User
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    // Fetch stats from Supabase
    // Parallelize all data fetching
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
        supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(3)
    ]);

    const totalViews = [...(viewsData || []), ...(researchViewsData || [])].reduce((acc, curr) => acc + (curr.views || 0), 0);

    const stats = [
        { name: "文章总数", value: (postsCount || 0) + (researchCount || 0), icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "总阅读量", value: totalViews, icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
        { name: "互动评论", value: commentsCount || 0, icon: MessageCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "平均留存", value: "85%", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-black">欢迎回来</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div 
                        key={i}
                        className="p-8 rounded-[32px] bg-white border border-black/[0.03] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-black/30 text-[10px] font-bold uppercase tracking-wider">{stat.name}</p>
                            <p className="text-3xl font-bold text-black">{stat.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Interactions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-bold flex items-center gap-3 text-black">
                            <Clock className="w-5 h-5 text-emerald-600" />
                            最新动态
                        </h2>
                        <Link href="/admin/interactions" className="text-xs font-bold text-black/30 hover:text-black transition-colors uppercase tracking-widest">查看全部</Link>
                    </div>

                    <div className="space-y-4">
                        {latestComments?.map((comment) => (
                            <div 
                                key={comment.id}
                                className="p-6 rounded-[28px] bg-white border border-black/[0.03] flex gap-4 hover:border-black/10 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.01)]"
                            >
                                <div className="w-12 h-12 rounded-full bg-black/[0.02] border border-black/[0.05] flex items-center justify-center shrink-0">
                                    <User className="w-6 h-6 text-black/20" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold text-black">{comment.author}</span>
                                        <span className="text-[10px] font-bold text-black/20">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-black/50 line-clamp-2 leading-relaxed italic">
                                        "{comment.text}"
                                    </p>
                                </div>
                            </div>
                        ))}
                        {(!latestComments || latestComments.length === 0) && (
                            <div className="py-16 text-center border border-dashed border-black/10 rounded-[32px] bg-white">
                                <p className="text-sm font-bold text-black/20 uppercase tracking-widest">暂无互动记录</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Info Card */}
                <div className="p-10 rounded-[40px] bg-black text-white flex flex-col justify-between shadow-2xl shadow-black/20 relative overflow-hidden">
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4">准备好发布新内容了吗？</h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-sm">
                            所有的媒体文件都将与你的文章路径深度绑定。点击下方按钮，开始记录你的灵感。
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 relative z-10">
                        <Link 
                            href="/admin/posts/new"
                            className="bg-white text-black px-8 py-3.5 rounded-2xl text-sm font-bold active:scale-95 transition-all shadow-xl shadow-white/5"
                        >
                            撰写新文章
                        </Link>
                        <Link 
                            href="/admin/research/new"
                            className="bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-white/20 active:scale-95 transition-all"
                        >
                            开启新研究
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
