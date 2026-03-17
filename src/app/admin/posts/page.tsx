import { supabase } from "@/lib/supabase";
import { 
    LayoutGrid,
    CheckCircle2,
    Trophy
} from "lucide-react";
import PostsManager from "@/components/admin/PostsManager";

export default async function AdminPostsPage() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    // Calculate quick stats
    const totalPosts = posts?.length || 0;
    const publishedPosts = posts?.filter(p => p.published).length || 0;
    const totalViews = posts?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-zinc-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">博客文章管理</h1>
                    <div className="flex items-center gap-2.5">
                        <div className="w-[3px] h-3.5 bg-indigo-500 rounded-full" />
                        <p className="text-zinc-500 text-sm font-medium">管理与监控您的所有发布内容</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">文章总数</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{totalPosts}</p>
                        </div>
                    </div>
                    <div className="w-px h-7 bg-zinc-100 hidden md:block" />
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">已发布</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{publishedPosts}</p>
                        </div>
                    </div>
                    <div className="w-px h-7 bg-zinc-100 hidden md:block" />
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">总阅读量</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <PostsManager initialPosts={posts || []} />
        </div>
    );
}

