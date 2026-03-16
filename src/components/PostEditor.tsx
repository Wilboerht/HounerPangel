"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Image as ImageIcon, 
    Eye, 
    X, 
    Loader2, 
    ArrowLeft,
    CheckCircle,
    Layout
} from "lucide-react";
import { savePostAction, uploadMediaAction } from "@/app/actions/editor";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostEditorProps {
    initialData?: any;
}

export default function PostEditor({ initialData }: PostEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
    const [published, setPublished] = useState(initialData?.published || false);
    const [seriesName, setSeriesName] = useState(initialData?.series_name || "");
    
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!title || !slug) return alert("Title and Slug are required!");
        setIsSaving(true);
        
        const res = await savePostAction({
            id: initialData?.id,
            title,
            slug,
            content,
            excerpt,
            published,
            series_name: seriesName,
            date: initialData?.date || new Date().toISOString().split('T')[0]
        });

        if (res.success) {
            router.push("/admin/posts");
        } else {
            alert("Error: " + res.error);
        }
        setIsSaving(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !slug) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);
        formData.append("type", "articles");

        const res = await uploadMediaAction(formData);
        if (res.url) {
            const imageMarkdown = `\n![Image](${res.url})\n`;
            setContent((prev: string) => prev + imageMarkdown);
        } else {
            alert("Upload failed: " + res.error);
        }
        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col">
            {/* Minimal Header */}
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/40" />
                    </button>
                    <span className="text-sm font-bold tracking-tight">{initialData ? "编辑文章" : "创作新篇"}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isPreview ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        {isPreview ? "返回编辑" : "实时预览"}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存并同步
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isPreview ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
                    <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                        {/* Title & Slug */}
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="在这里输入引人入胜的标题..."
                                className="w-full bg-transparent text-4xl lg:text-5xl font-bold outline-none placeholder:text-white/5"
                            />
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 group focus-within:border-white/20 transition-all">
                                    <span className="text-xs font-mono text-white/20">slug:</span>
                                    <input 
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="url-friendly-slug"
                                        className="bg-transparent text-xs font-mono outline-none text-white/60 w-48"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <span className="text-xs font-mono text-white/20">合辑:</span>
                                    <input 
                                        value={seriesName}
                                        onChange={(e) => setSeriesName(e.target.value)}
                                        placeholder="可选系列名称"
                                        className="bg-transparent text-xs font-mono outline-none text-white/60 w-32"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={published}
                                        onChange={(e) => setPublished(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${published ? "bg-emerald-500" : "bg-white/10"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${published ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">公开访问</span>
                                </label>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="max-w-4xl mx-auto">
                            <textarea 
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="摘要：简单介绍一下这篇文章的内容..."
                                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-sm text-white/60 outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all resize-none min-h-[100px]"
                            />
                        </div>

                        {/* Markdown Editor */}
                        <div className="max-w-4xl mx-auto flex-1 flex flex-col">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="开始你的创作之旅..."
                                className="w-full flex-1 bg-transparent text-white/80 leading-relaxed outline-none min-h-[500px] font-mono text-sm border-t border-white/5 pt-8"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Layer */}
                <AnimatePresence>
                    {isPreview && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex-1 bg-[#050505] p-8 lg:p-20 overflow-y-auto"
                        >
                            <div className="max-w-2xl mx-auto">
                                <header className="mb-12">
                                    <h1 className="text-4xl lg:text-5xl font-bold mb-6">{title || "未命名标题"}</h1>
                                    <div className="text-sm text-white/40 flex items-center gap-4 border-b border-white/5 pb-8 font-mono">
                                        <span>{new Date().toISOString().split('T')[0]}</span>
                                        <span>&middot;</span>
                                        <span>9 min read</span>
                                    </div>
                                </header>
                                <article className="prose prose-invert prose-white prose-p:text-white/60 prose-p:leading-relaxed prose-headings:text-white max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*暂无内容*"}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toolbar Sidebar */}
                <aside className="w-16 border-l border-white/5 bg-[#0a0a0a] flex flex-col items-center py-6 gap-6">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all group relative"
                        title="插入资产"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">上传图片</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    <button className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all group relative" title="布局组件">
                        <Layout className="w-5 h-5" />
                        <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">组件库</span>
                    </button>

                    <div className="mt-auto">
                        <div className={`w-3 h-3 rounded-full ${published ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : "bg-white/20"}`} />
                    </div>
                </aside>
            </main>
        </div>
    );
}
