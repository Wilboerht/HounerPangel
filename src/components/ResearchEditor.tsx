"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Image as ImageIcon, 
    Eye, 
    Loader2, 
    ArrowLeft,
    Tag,
    BookOpen
} from "lucide-react";
import { saveResearchAction, uploadMediaAction } from "@/app/actions/editor";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResearchEditorProps {
    initialData?: any;
}

export default function ResearchEditor({ initialData }: ResearchEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [content, setContent] = useState(initialData?.content || "");
    const [abstract, setAbstract] = useState(initialData?.abstract || "");
    const [published, setPublished] = useState(initialData?.published || false);
    const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
    
    const [isSaving, setIsLoading] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!title || !slug) return alert("标题和 Slug 是必填项！");
        setIsLoading(true);
        
        const res = await saveResearchAction({
            id: initialData?.id,
            title,
            slug,
            content,
            abstract,
            published,
            tags: tags.split(",").map((t: string) => t.trim()).filter((t: string) => t),
            date: initialData?.date || new Date().toISOString().split('T')[0]
        });

        if (res.success) {
            router.push("/admin/research");
        } else {
            alert("保存失败: " + res.error);
        }
        setIsLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !slug) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);
        formData.append("type", "research");

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
            <header className="h-16 border-b border-black/[0.05] bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-black/[0.03] rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-black/40" />
                    </button>
                    <span className="text-sm font-bold tracking-tight text-black/80">{initialData ? "编辑研究项目" : "开启新课题"}</span>
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
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isPreview ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
                    <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto custom-scrollbar bg-[#fafafa]">
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="研究主题：探索技术的最前沿..."
                                className="w-full bg-transparent text-4xl lg:text-5xl font-extrabold outline-none placeholder:text-black/[0.05] text-black"
                            />
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-black/[0.03] shadow-sm">
                                    <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">slug:</span>
                                    <input 
                                        value={slug} 
                                        onChange={(e) => setSlug(e.target.value)} 
                                        placeholder="research-slug" 
                                        className="bg-transparent text-xs font-bold outline-none text-black/60 w-48" 
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-black/[0.03] shadow-sm font-bold">
                                    <Tag className="w-3 h-3 text-black/20" />
                                    <input 
                                        value={tags} 
                                        onChange={(e) => setTags(e.target.value)} 
                                        placeholder="标签 (用逗号分隔)" 
                                        className="bg-transparent text-xs outline-none text-black/60 w-48" 
                                    />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input 
                                        type="checkbox" 
                                        checked={published} 
                                        onChange={(e) => setPublished(e.target.checked)} 
                                        className="sr-only" 
                                    />
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${published ? "bg-black" : "bg-black/10"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${published ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">公开访问</span>
                                </label>
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <textarea 
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                placeholder="论文摘要 (Abstract)：简明扼要地概括核心研究内容..."
                                className="w-full bg-white border border-black/[0.03] rounded-3xl p-6 text-sm text-black/60 outline-none focus:border-black/10 transition-all shadow-sm resize-none min-h-[140px] italic"
                            />
                        </div>

                        <div className="max-w-4xl mx-auto flex-1 flex flex-col">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="在这里展开你的深度探索..."
                                className="w-full flex-1 bg-transparent text-black/80 leading-relaxed outline-none min-h-[500px] font-mono text-sm border-t border-black/[0.03] pt-8"
                            />
                        </div>
                    </div>
                </div>

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
                                    <div className="flex items-center gap-2 text-black/40 mb-4">
                                        <BookOpen className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">RESEARCH PAPER</span>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-8 text-black">{title || "研究主题"}</h1>
                                    <div className="p-8 rounded-3xl bg-[#fafafa] border border-black/[0.03] italic text-black/60 text-sm leading-relaxed mb-8">
                                        {abstract || "（尚未填写摘要）"}
                                    </div>
                                </header>
                                <article className="prose prose-slate prose-p:text-black/60 prose-p:leading-relaxed prose-headings:text-black prose-headings:font-bold max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*内容加载中...*"}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <aside className="w-16 border-l border-black/[0.05] bg-white flex flex-col items-center py-6 gap-6">
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isUploading} 
                        className="p-3 rounded-xl bg-black/[0.02] text-black/20 hover:text-black hover:bg-black/5 transition-all group relative"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        <span className="absolute left-[-80px] top-1/2 -translate-y-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">上传图片</span>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    
                    <div className="mt-auto">
                        <div className={`w-2.5 h-2.5 rounded-full ${published ? "bg-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : "bg-black/10"}`} />
                    </div>
                </aside>
            </main>
        </div>
    );
}
