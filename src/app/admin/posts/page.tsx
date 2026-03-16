import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Search, FileText, Globe, Eye, Calendar, ArrowUpRight, Edit3 } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminPostsPage() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-black/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Content Management</p>
                    <h1 className="text-4xl font-extrabold tracking-tight text-black">博客文章</h1>
                </div>
                <Link 
                    href="/admin/posts/new"
                    className="bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                    <Plus className="w-4 h-4" />
                    发布新文章
                </Link>
            </div>

            {/* Content Card */}
            <div className="bg-white border border-black/[0.03] rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Search / Filters Bar (Static Design for now) */}
                <div className="p-8 border-b border-black/[0.03] flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                        <input 
                            type="text" 
                            placeholder="搜索文章标题或关键词..." 
                            className="w-full bg-black/[0.01] border border-black/[0.03] rounded-2xl py-3 pl-12 pr-4 text-sm text-black placeholder:text-black/10 focus:outline-none focus:border-black/10 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black/[0.03]">
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">文章详情</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">状态</th>
                                <th className="px-8 py-5 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">数据指标</th>
                                <th className="px-8 py-5 text-right text-[10px] font-bold text-black/20 uppercase tracking-widest">操作项</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                            {posts?.map((post) => (
                                <tr key={post.id} className="group hover:bg-black/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-black/30 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-sm font-bold text-black truncate max-w-[240px] leading-tight">{post.title}</span>
                                                <span className="text-[10px] font-bold text-black/20 flex items-center gap-1.5 uppercase">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(post.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            {post.published ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <Globe className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">已发布</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.02] text-black/30 border border-black/5">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">草稿箱</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                                                    <Eye className="w-3 h-3 text-purple-600" />
                                                    {post.views || 0}
                                                </span>
                                                <span className="text-[10px] font-bold text-black/20 uppercase tracking-tight">浏览量</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-2.5 rounded-lg bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all"
                                                title="预览"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/posts/edit/${post.id}`}
                                                className="p-2.5 rounded-lg bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all"
                                                title="编辑"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <DeleteButton id={post.id} slug={post.slug} type="posts" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!posts || posts.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-black/20 uppercase tracking-widest">暂无博文内容</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
