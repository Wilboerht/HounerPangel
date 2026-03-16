import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, BookOpen, Globe, Eye, Calendar, ArrowUpRight, Trash2, Edit3, Tag } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminResearchPage() {
    const { data: researchItems, error } = await supabase
        .from('research')
        .select('*')
        .order('date', { ascending: false });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">研究项目管理</h1>
                    <p className="text-white/40 text-sm">管理你的技术研究、论文和深度探索内容。</p>
                </div>
                <Link 
                    href="/admin/research/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)]"
                >
                    <Plus className="w-4 h-4" />
                    新建研究
                </Link>
            </div>

            {/* List Table */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/20">
                                <th className="px-8 py-6 font-medium">项目名称</th>
                                <th className="px-6 py-6 font-medium">标签</th>
                                <th className="px-6 py-6 font-medium">状态</th>
                                <th className="px-6 py-6 font-medium">发布日期</th>
                                <th className="px-6 py-6 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {researchItems?.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight line-clamp-1">{item.title}</span>
                                            <span className="text-[10px] font-mono text-white/20 italic">/research/{item.slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-wrap gap-1">
                                            {item.tags?.slice(0, 2).map((tag: string, i: number) => (
                                                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40">
                                                    {tag}
                                                </span>
                                            ))}
                                            {(item.tags?.length || 0) > 2 && (
                                                <span className="text-[9px] px-1.5 py-0.5 text-white/20">+{item.tags.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {item.published ? (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase">
                                                <Globe className="w-3 h-3" /> 公开
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/20 uppercase">
                                                <BookOpen className="w-3 h-3" /> 存档
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-6 text-xs text-white/40 font-mono">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/research/${item.slug}`} 
                                                target="_blank"
                                                className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/research/edit/${item.id}`}
                                                className="p-2.5 rounded-lg bg-white/5 text-white/40 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <DeleteButton id={item.id} slug={item.slug} type="research" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
