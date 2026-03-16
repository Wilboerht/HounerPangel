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
import { saveResearchAction, uploadMediaAction } from "@/app/actions/editor"; // Need to add saveResearchAction
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
    
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        if (!title || !slug) return alert("Title and Slug are required!");
        setIsSaving(true);
        
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
        formData.append("type", "research");

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
            <header className="h-16 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/40" />
                    </button>
                    <span className="text-sm font-bold tracking-tight">编辑研究项目</span>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setIsPreview(!isPreview)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isPreview ? "bg-white text-black" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                        <Eye className="w-4 h-4" />
                        预览模式
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 active:scale-95">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        保存并同步
                    </button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isPreview ? "opacity-0 invisible w-0" : "opacity-100 visible"}`}>
                    <div className="flex-1 p-8 lg:p-12 space-y-8 overflow-y-auto custom-scrollbar">
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="研究主题：探索技术的最前沿..."
                                className="w-full bg-transparent text-4xl lg:text-5xl font-bold outline-none placeholder:text-white/5"
                            />
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <span className="text-xs font-mono text-white/20">slug:</span>
                                    <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="research-slug" className="bg-transparent text-xs font-mono outline-none text-white/60 w-48" />
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                    <Tag className="w-3 h-3 text-white/20" />
                                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签 (用逗号分隔)" className="bg-transparent text-xs font-mono outline-none text-white/60 w-48" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="sr-only" />
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${published ? "bg-amber-500" : "bg-white/10"}`}>
                                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${published ? "translate-x-4" : "translate-x-0"}`} />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">公开访问</span>
                                </label>
                            </div>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <textarea 
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                placeholder="论文摘要 (Abstract)：简明扼要地概括核心研究内容..."
                                className="w-full bg-amber-500/[0.03] border border-amber-500/10 rounded-2xl p-6 text-sm text-white/60 outline-none focus:border-amber-500/20 focus:bg-amber-500/[0.05] transition-all resize-none min-h-[140px] italic"
                            />
                        </div>

                        <div className="max-w-4xl mx-auto flex-1 flex flex-col">
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="在这里展开你的深度探索..."
                                className="w-full flex-1 bg-transparent text-white/80 leading-relaxed outline-none min-h-[500px] font-mono text-sm border-t border-white/5 pt-8"
                            />
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isPreview && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 bg-[#050505] p-8 lg:p-20 overflow-y-auto">
                            <div className="max-w-2xl mx-auto">
                                <header className="mb-12">
                                    <div className="flex items-center gap-2 text-amber-500 mb-4">
                                        <BookOpen className="w-5 h-5" />
                                        <span className="text-xs font-bold uppercase tracking-widest">RESEARCH PAPER</span>
                                    </div>
                                    <h1 className="text-4xl lg:text-5xl font-bold mb-8">{title || "研究主题"}</h1>
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 italic text-white/60 text-sm leading-relaxed mb-8">
                                        {abstract || "（尚未填写摘要）"}
                                    </div>
                                </header>
                                <article className="prose prose-invert prose-amber prose-p:text-white/60 prose-p:leading-relaxed prose-headings:text-white max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*内容加载中...*"}
                                    </ReactMarkdown>
                                </article>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <aside className="w-16 border-l border-white/5 bg-[#0a0a0a] flex flex-col items-center py-6 gap-6">
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </aside>
            </main>
        </div>
    );
}
