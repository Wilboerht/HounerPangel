"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Image as ImageIcon, 
    Eye, 
    Loader2, 
    ArrowLeft,
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
        if (!title || !slug) return alert("标题和 Slug 是必填项！");
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
            alert("保存失败: " + res.error);
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
            alert("上传失败: " + res.error);
        }
        setIsUploading(false);
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col">
            {/* Minimal Header */}
            <header className="h-16 border-b border-black/[0.05] bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-black/[0.03] rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-black/40" />
                    </button>
                    <span className="text-sm font-bold tracking-tight text-black/80">{initialData ? "编辑文章" : "创作新篇"}</span>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            isPreview ? "bg-black text-white" : "bg-black/[0.03] text-black/40 hover:bg-black/5"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        {isPreview ? "返回编辑" : "实时预览"}
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-black/10"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存并同步
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Editor Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isPreview ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
                    <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto custom-scrollbar bg-[#fafafa]">
                        {/* Title & Slug */}
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="在这里输入引人入胜的标题..."
                                className="w-full bg-transparent text-4xl lg:text-5xl font-extrabold outline-none placeholder:text-black/[0.05] text-black"
                            />
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-black/[0.03] shadow-sm focus-within:border-black/10 transition-all">
                                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">slug:</span>
                                    <input 
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="url-friendly-slug"
                                        className="bg-transparent text-xs font-bold outline-none text-black/60 w-48"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-black/[0.03] shadow-sm">
                                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">合辑:</span>
                                    <input 
                                        value={seriesName}
                                        onChange={(e) => setSeriesName(e.target.value)}
                                        placeholder="可选系列名称"
                                        className="bg-transparent text-xs font-bold outline-none text-black/60 w-32"
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={published}
                                        onChange={(e) => setPublished(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${published ? "bg-emerald-500" : "bg-black/10"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${published ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">公开访问</span>
                                </label>
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div className="max-w-4xl mx-auto">
                            <textarea 
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                placeholder="摘要：简单介绍一下这篇文章的内容..."
                                className="w-full bg-white border border-black/[0.03] rounded-3xl p-6 text-sm text-black/60 outline-none focus:border-black/10 transition-all shadow-sm resize-none min-h-[100px]"
                            />
                        </div>

                        {/* Markdown Editor */}
                        <div className="max-w-4xl mx-auto flex-1 flex flex-col">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="开始你的创作之旅..."
                                className="w-full flex-1 bg-transparent text-black/80 leading-relaxed outline-none min-h-[500px] font-mono text-sm border-t border-black/[0.03] pt-8"
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
                            className="flex-1 bg-white p-8 lg:p-20 overflow-y-auto"
                        >
                            <div className="max-w-2xl mx-auto">
                                <header className="mb-12">
                                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 text-black">{title || "未命名标题"}</h1>
                                    <div className="text-[10px] text-black/30 flex items-center gap-4 border-b border-black/[0.03] pb-8 font-bold uppercase tracking-widest">
                                        <span>{new Date().toISOString().split('T')[0]}</span>
                                        <span>&middot;</span>
                                        <span>ESTIMATED {Math.ceil(content.length / 500)} MIN READ</span>
                                    </div>
                                </header>
                                <article className="prose prose-slate prose-p:text-black/60 prose-p:leading-relaxed prose-headings:text-black prose-headings:font-bold max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*暂无内容*"}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Toolbar Sidebar */}
                <aside className="w-16 border-l border-black/[0.05] bg-white flex flex-col items-center py-6 gap-6">
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-3 rounded-xl bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all group relative"
                        title="插入资产"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">上传图片</span>
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    <button className="p-3 rounded-xl bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all group relative" title="布局组件">
                        <Layout className="w-5 h-5" />
                        <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">组件库</span>
                    </button>

                    <div className="mt-auto">
                        <div className={`w-2.5 h-2.5 rounded-full ${published ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "bg-black/10"}`} />
                    </div>
                </aside>
            </main>
        </div>
    );
}
