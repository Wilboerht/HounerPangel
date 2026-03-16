import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, FileText, Globe, Eye, Calendar, ArrowUpRight, Trash2, Edit3 } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminPostsPage() {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('date', { ascending: false });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">博客文章管理</h1>
                    <p className="text-white/40 text-sm">管理你的博文、草稿和系列内容。</p>
                </div>
                <Link 
                    href="/admin/posts/new"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                >
                    <Plus className="w-4 h-4" />
                    新建文章
                </Link>
            </div>

            {/* List Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                <th className="px-8 py-6 font-medium">文章信息</th>
                                <th className="px-6 py-6 font-medium">状态</th>
                                <th className="px-6 py-6 font-medium">阅读量</th>
                                <th className="px-6 py-6 font-medium">发布日期</th>
                                <th className="px-6 py-6 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {posts?.map((post) => (
                                <tr key={post.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-1">{post.title}</span>
                                            <span className="text-[10px] font-mono text-white/20 italic">/{post.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {post.published ? (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 uppercase">
                                                <Globe className="w-3 h-3" /> 已发布
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/20 uppercase">
                                                <FileText className="w-3 h-3" /> 草稿
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 font-mono text-xs text-white/40">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-3 h-3" /> {post.views || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-xs text-white/40">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 opacity-40" />
                                            {post.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/blog/${post.slug}`} 
                                                target="_blank"
                                                className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                                title="预览"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/posts/edit/${post.id}`}
                                                className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                                title="编辑"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <DeleteButton id={post.id} slug={post.slug} type="posts" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(!posts || posts.length === 0) && (
                    <div className="py-24 text-center">
                        <p className="text-white/20 text-sm italic font-medium">还没有任何文章，开始你的创作吧。</p>
                    </div>
                )}
            </div>
        </div>
    );
}
