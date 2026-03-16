import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Plus, BookOpen, Globe, Eye, Calendar, ArrowUpRight, Edit3, Tag } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminResearchPage() {
    const { data: researchItems, error } = await supabase
        .from('research')
        .select('*')
        .order('date', { ascending: false });

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="text-black/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Academic Hub</p>
                    <h1 className="text-4xl font-extrabold tracking-tight text-black">研究项目</h1>
                </div>
                <Link 
                    href="/admin/research/new"
                    className="bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                    <Plus className="w-4 h-4" />
                    开启新项目
                </Link>
            </div>

            {/* Content Table Card */}
            <div className="bg-white border border-black/[0.03] rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-black/[0.03]">
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">项目课题</th>
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">标签</th>
                                <th className="px-8 py-6 text-left text-[10px] font-bold text-black/20 uppercase tracking-widest">状态</th>
                                <th className="px-8 py-6 text-right text-[10px] font-bold text-black/20 uppercase tracking-widest">操作项</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.03]">
                            {researchItems?.map((item) => (
                                <tr key={item.id} className="group hover:bg-black/[0.01] transition-colors">
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-[20px] bg-black/[0.02] border border-black/[0.05] flex items-center justify-center text-black/30 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col gap-1.5 min-w-0">
                                                <span className="text-sm font-bold text-black truncate max-w-[280px] leading-snug">{item.title}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-bold text-black/20 flex items-center gap-1.5 uppercase">
                                                        <Calendar className="w-3 h-3" />
                                                        {item.date}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-black/20 flex items-center gap-1.5 uppercase">
                                                        <Eye className="w-3 h-3 text-purple-600" />
                                                        {item.views || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                            {item.tags?.map((tag: string) => (
                                                <span 
                                                    key={tag} 
                                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-black/[0.02] text-black/40 border border-black/5 text-[9px] font-bold uppercase tracking-tight"
                                                >
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        {item.published ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                <Globe className="w-3 h-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">已在线</span>
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.02] text-black/20 border border-black/5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider">进行中</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link 
                                                href={`/research/${item.slug}`}
                                                target="_blank"
                                                className="p-2.5 rounded-xl bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/research/edit/${item.id}`}
                                                className="p-2.5 rounded-xl bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </Link>
                                            <DeleteButton id={item.id} slug={item.slug} type="research" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {(!researchItems || researchItems.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-black/20 uppercase tracking-widest">暂无课题计划</p>
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
