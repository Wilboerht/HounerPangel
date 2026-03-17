"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    Plus, 
    Search, 
    FileText, 
    Globe, 
    Eye, 
    Calendar, 
    ArrowUpRight, 
    Edit3,
    Clock
} from "lucide-react";
import { cleanupOrphanedMedia } from "@/app/actions/maintenance";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { motion, AnimatePresence } from "framer-motion";
import PostEditor from "@/components/PostEditor";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PostsManagerProps {
    initialPosts: any[];
}

export default function PostsManager({ initialPosts }: PostsManagerProps) {
    const router = useRouter();
    
    // Auto-trigger cleanup in background on mount
    useEffect(() => {
        cleanupOrphanedMedia().catch(console.error);
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any>(null);

    const filteredPosts = initialPosts?.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const handleCreateNew = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post: any) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        router.refresh();
    };

    return (
        <div className="space-y-6">
            {/* Search & Action Bar */}            <div className="flex flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="搜索文章标题..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all font-medium shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                    />
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="h-11 bg-zinc-800 text-white px-6 rounded-xl text-[13px] font-bold flex items-center gap-2.5 hover:bg-zinc-700 active:scale-[0.98] transition-all group shadow-sm shadow-zinc-200"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden sm:inline">发布新文章</span>
                    <span className="sm:hidden">发布</span>
                </button>
            </div>

            {/* Table Layout */}
            <div className="bg-white border border-zinc-100 rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-50 bg-zinc-50/20">
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">文章标题</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">日期</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">发布状态</th>
                                <th className="px-6 py-4 text-left text-[13px] font-bold text-zinc-400">热度指标</th>
                                <th className="px-6 py-4 text-right text-[13px] font-bold text-zinc-400">管理操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-zinc-50 transition-colors border-b border-zinc-50/50 last:border-0">
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-900 truncate max-w-[280px] transition-colors">{post.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center h-full">
                                            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wide">
                                                <Calendar className="w-3.5 h-3.5 opacity-40" />
                                                {new Date(post.created_at).toLocaleDateString('zh-CN')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle text-sm">
                                        <div className="flex items-center h-full">
                                            {post.published ? (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                                                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                    已发布
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-zinc-400 font-bold text-xs">
                                                    <Clock className="w-3 h-3" />
                                                    草稿
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle">
                                        <div className="flex items-center h-full gap-1.5 text-zinc-600 font-bold text-sm">
                                            <Eye className="w-3.5 h-3.5 text-zinc-300" />
                                            {post.views || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 align-middle text-right">
                                        <div className="flex items-center justify-end h-full gap-1 transition-opacity">
                                            <Link 
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                onClick={() => handleEdit(post)}
                                                className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <DeleteButton id={post.id} slug={post.slug} type="posts" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPosts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <FileText className="w-8 h-8 mb-2" />
                                            <p className="text-xs font-bold uppercase tracking-widest">暂无记录</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Notion-like Peek Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                        />
                        
                        {/* Modal Container */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-full bg-white rounded-3xl shadow-2xl overflow-hidden shadow-zinc-900/20 flex flex-col"
                        >
                            <PostEditor 
                                initialData={editingPost} 
                                onSuccess={handleSuccess}
                                onCancel={handleCloseModal}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
