import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
    Plus, 
    Search,
    BookOpen, 
    Globe, 
    Eye, 
    Calendar, 
    ArrowUpRight, 
    Edit3, 
    Tag,
    Beaker,
    CheckCircle2,
    Clock,
    LayoutGrid
} from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import * as motion from "framer-motion/client";

export default async function AdminResearchPage() {
    const { data: researchItems, error } = await supabase
        .from('research')
        .select('*')
        .order('date', { ascending: false });

    // Calculate quick stats
    const totalItems = researchItems?.length || 0;
    const activeItems = researchItems?.filter(item => item.published).length || 0;
    const totalViews = researchItems?.reduce((acc, item) => acc + (item.views || 0), 0) || 0;

    return (
        <div className="space-y-10 pb-20">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 border-b border-zinc-100 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">研究项目管理</h1>
                    <div className="flex items-center gap-2.5">
                        <div className="w-[3px] h-3.5 bg-zinc-900 rounded-full" />
                        <p className="text-zinc-500 text-sm font-medium">管理与监控您的所有研究项目</p>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <Beaker className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">项目总数</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{totalItems}</p>
                        </div>
                    </div>
                    <div className="w-px h-7 bg-zinc-100 hidden md:block" />
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">已发布</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{activeItems}</p>
                        </div>
                    </div>
                    <div className="w-px h-7 bg-zinc-100 hidden md:block" />
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                            <Eye className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-0.5">总浏览量</p>
                            <p className="text-xl font-black text-zinc-900 leading-none tabular-nums">{totalViews.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="space-y-6 mt-6">
                {/* Search Bar & Add Button */}
                <div className="flex flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="搜索项目名称..." 
                            className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                        />
                    </div>
                    <Link 
                        href="/admin/research/new"
                        className="h-11 bg-zinc-800 text-white px-6 rounded-xl text-[13px] font-bold flex items-center gap-2.5 hover:bg-zinc-700 active:scale-[0.98] transition-all group shadow-sm shadow-zinc-200"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="hidden sm:inline">发布新项目</span>
                        <span className="sm:hidden">发布</span>
                    </Link>
                </div>
            </div>

            {/* Content List Card */}
            <div className="bg-white border border-zinc-100 rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-50 bg-zinc-50/20">
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">项目名称</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">日期</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">研究方向</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">状态</th>
                                <th className="px-6 py-4 text-right text-[13px] font-bold text-zinc-400">管理操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {researchItems?.map((item) => (
                                <tr key={item.id} className="group hover:bg-zinc-50 transition-colors">
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-900 truncate max-w-[280px]">{item.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center">
                                            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wide">
                                                <Calendar className="w-3.5 h-3.5 opacity-40" />
                                                {item.date}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex flex-wrap gap-1.5 max-w-[200px] items-center">
                                            {item.tags?.slice(0, 2).map((tag: string) => (
                                                <span 
                                                    key={tag} 
                                                    className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-tight"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle text-sm">
                                        {item.published ? (
                                            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                已发布
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
                                                <Clock className="w-3 h-3" />
                                                进行中
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 align-middle text-right">
                                        <div className="flex items-center justify-end h-full gap-1">
                                            <Link 
                                                href={`/research/${item.slug}`}
                                                target="_blank"
                                                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                                title="查看全文"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <Link 
                                                href={`/admin/research/edit/${item.id}`}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                                title="编辑项目"
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
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <p className="text-sm font-medium text-zinc-900">暂无记录</p>
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
