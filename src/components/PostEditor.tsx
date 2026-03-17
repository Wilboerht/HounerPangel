"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Image as ImageIcon, 
    Eye, 
    Loader2, 
    ArrowLeft,
    Layout,
    Link as LinkIcon,
    Globe
} from "lucide-react";
import { savePostAction, uploadMediaAction } from "@/app/actions/editor";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface PostEditorProps {
    initialData?: any;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PostEditor({ initialData, onSuccess, onCancel }: PostEditorProps) {
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
            if (onSuccess) {
                onSuccess();
            } else {
                router.push("/admin/posts");
                router.refresh();
            }
        } else {
            alert("保存失败: " + res.error);
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.back();
        }
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
        <div className="flex-1 bg-white text-zinc-900 flex flex-col h-full relative">
            {/* Top Toolbar - Subtle and clean */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-50 shrink-0">
                <div className="flex items-center gap-2">
                    <button onClick={handleCancel} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900" title="关闭">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-zinc-100 mx-1" />
                    <span className="text-[13px] font-medium text-zinc-500">
                        {initialData ? "编辑文章" : "新建页面"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsPreview(!isPreview)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isPreview ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        预览
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 active:scale-95 shadow-sm hover:bg-zinc-800"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        发布
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                <main className="max-w-3xl mx-auto w-full px-8 py-10 flex-1 flex flex-col">
                    {/* Header: Title */}
                    <div className="mb-8">
                        <textarea 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="无标题"
                            rows={1}
                            className="w-full bg-transparent text-4xl font-extrabold outline-none placeholder:text-zinc-200 text-zinc-900 resize-none overflow-hidden"
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = 'auto';
                                target.style.height = target.scrollHeight + 'px';
                            }}
                        />
                    </div>

                    {/* Properties Grid - Notion Style */}
                    <div className="grid grid-cols-1 gap-y-2 mb-10 text-[13px]">
                        <div className="flex items-center group">
                            <div className="w-32 flex items-center gap-2 text-zinc-400 group-hover:text-zinc-500 transition-colors">
                                <LinkIcon className="w-4 h-4" />
                                <span>Slug</span>
                            </div>
                            <input 
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="url-friendly-slug"
                                className="flex-1 bg-transparent hover:bg-zinc-50 px-2 py-1 rounded-md outline-none text-zinc-600 font-medium transition-colors"
                            />
                        </div>
                        <div className="flex items-center group">
                            <div className="w-32 flex items-center gap-2 text-zinc-400 group-hover:text-zinc-500 transition-colors">
                                <Layout className="w-4 h-4" />
                                <span>系列合辑</span>
                            </div>
                            <input 
                                value={seriesName}
                                onChange={(e) => setSeriesName(e.target.value)}
                                placeholder="添加系列..."
                                className="flex-1 bg-transparent hover:bg-zinc-50 px-2 py-1 rounded-md outline-none text-zinc-600 font-medium transition-colors"
                            />
                        </div>
                        <div className="flex items-center group">
                            <div className="w-32 flex items-center gap-2 text-zinc-400 group-hover:text-zinc-500 transition-colors">
                                <Globe className="w-4 h-4" />
                                <span>发布状态</span>
                            </div>
                            <div className="flex-1 flex items-center gap-3 px-2 py-1">
                                <button 
                                    onClick={() => setPublished(!published)}
                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold transition-all ${
                                        published ? "bg-emerald-50 text-emerald-600" : "bg-zinc-50 text-zinc-400"
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${published ? "bg-emerald-500 block" : "bg-zinc-300 block"}`} />
                                    {published ? "已公开" : "私密/草稿"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-zinc-100 w-full mb-8" />

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {isPreview ? (
                                <motion.div 
                                    key="preview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="prose prose-zinc max-w-none"
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {content || "*暂无内容*"}
                                    </ReactMarkdown>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="editor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <textarea 
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="输入 '/' 唤起指令或直接开始创作..."
                                        className="w-full flex-1 bg-transparent text-zinc-800 leading-relaxed outline-none resize-none font-sans text-[16px]"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Floating Image Upload Action */}
            <div className="absolute bottom-10 right-10">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:scale-110 active:scale-95 transition-all"
                    title="上传图片"
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                />
            </div>
        </div>
    );
}
