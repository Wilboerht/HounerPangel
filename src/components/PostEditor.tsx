"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    Save, 
    Image as ImageIcon, 
    Eye, 
    Loader2, 
    ArrowLeft,
    Layout,
    Link as LinkIcon,
    Globe,
    Video,
    Plus,
    Type
} from "lucide-react";
import { savePostAction, uploadMediaAction } from "@/app/actions/editor";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkWikiLink from "remark-wiki-link";
import remarkFrontmatter from "remark-frontmatter";
import remarkEmoji from "remark-emoji";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const insertAtCursor = (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            setContent((prev: string) => prev + text);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        
        setContent((prev: string) => {
            const nextContent = prev.substring(0, start) + text + prev.substring(end);
            return nextContent;
        });

        // Reset cursor position and focus back
        setTimeout(() => {
            textarea.focus();
            const newPos = start + text.length;
            textarea.setSelectionRange(newPos, newPos);
        }, 0);
    };

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
        if (!file) return;
        
        if (!slug) {
            alert("请先填写文章 Slug，以便为图片创建存储路径。");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);
        formData.append("type", "articles");

        const res = await uploadMediaAction(formData);
        if (res.url) {
            insertAtCursor(`\n![图片描述](${res.url})\n`);
        } else {
            alert("上传失败: " + res.error);
        }
        setIsUploading(false);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleInsertLink = () => {
        const url = prompt("输入链接地址 (URL):", "https://");
        const text = prompt("显示文本:", "链接文字");
        if (url && text) {
            insertAtCursor(`[${text}](${url})`);
        }
    };

    const handleInsertVideo = () => {
        const url = prompt("输入视频地址 (支持 YouTube/BiliBili 或直接链接):", "https://");
        if (url) {
            // Check if it's a common video platform to embed, otherwise use video tag
            if (url.includes("youtube.com") || url.includes("youtu.be")) {
                const id = url.includes("v=") ? url.split("v=")[1].split("&")[0] : url.split("/").pop();
                insertAtCursor(`\n<iframe width="100%" height="400" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>\n`);
            } else if (url.includes("bilibili.com")) {
                insertAtCursor(`\n<iframe width="100%" height="400" src="${url}" frameborder="0" allowfullscreen></iframe>\n`);
            } else {
                insertAtCursor(`\n<video controls width="100%" className="rounded-xl shadow-lg">\n  <source src="${url}" type="video/mp4" />\n  Your browser does not support the video tag.\n</video>\n`);
            }
        }
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
                                    <article className="prose prose-zinc max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:mb-4 prose-headings:mt-6">
                                        <ReactMarkdown 
                                            remarkPlugins={[
                                                remarkGfm, 
                                                remarkBreaks, 
                                                remarkMath, 
                                                remarkFrontmatter, 
                                                remarkEmoji,
                                                [remarkWikiLink, { aliasDivider: "|" }]
                                            ]}
                                            rehypePlugins={[
                                                rehypeRaw, 
                                                rehypeKatex, 
                                                rehypeHighlight
                                            ]}
                                            components={{
                                                blockquote: ({ children }) => {
                                                    const childrenArray = React.Children.toArray(children);
                                                    const firstChild = childrenArray[0] as any;
                                                    const textContent = firstChild?.props?.children?.[0];
                                                    
                                                    if (typeof textContent === 'string' && textContent.startsWith('[!')) {
                                                        const match = textContent.match(/^\[!(\w+)\]/);
                                                        if (match) {
                                                            const type = match[1].toLowerCase();
                                                            const body = textContent.replace(/^\[!\w+\]\s*/, '');
                                                            
                                                            const colors: Record<string, string> = {
                                                                info: "border-blue-500 bg-blue-50/50 text-blue-900",
                                                                note: "border-blue-500 bg-blue-50/50 text-blue-900",
                                                                tip: "border-emerald-500 bg-emerald-50/50 text-emerald-900",
                                                                success: "border-emerald-500 bg-emerald-50/50 text-emerald-900",
                                                                warning: "border-amber-500 bg-amber-50/50 text-amber-900",
                                                                caution: "border-orange-500 bg-orange-50/50 text-orange-900",
                                                                danger: "border-red-500 bg-red-50/50 text-red-900",
                                                                error: "border-red-500 bg-red-50/50 text-red-900",
                                                                abstract: "border-cyan-500 bg-cyan-50/50 text-cyan-900",
                                                                todo: "border-blue-500 bg-blue-50/50 text-blue-900",
                                                                quote: "border-zinc-500 bg-zinc-50/50 text-zinc-900"
                                                            };

                                                            const style = colors[type] || "border-zinc-300 bg-zinc-50/50 text-zinc-900";

                                                            return (
                                                                <div key={Math.random()} className={`my-4 border-l-4 rounded-r-lg p-4 font-medium text-sm ${style}`}>
                                                                    <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-tight text-[11px] opacity-70">
                                                                        <span>{type}</span>
                                                                    </div>
                                                                    <div>{body}</div>
                                                                    {childrenArray.slice(1)} 
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                    return <blockquote className="border-l-4 border-zinc-200 pl-4 py-1 italic text-zinc-500 my-4">{children}</blockquote>;
                                                },
                                                code: ({ className, children, ...props }) => {
                                                    return (
                                                        <code className={`${className} bg-zinc-100 px-1.5 py-0.5 rounded text-xs font-mono`} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {content?.replace(/==([^=]+)==/g, '<mark className="bg-yellow-100 text-yellow-900 px-1 rounded">$1</mark>') || "*暂无内容*"}
                                        </ReactMarkdown>
                                    </article>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="editor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col relative group/editor"
                                >


                                    <textarea 
                                        ref={textareaRef}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="输入 '/' 唤起指令或直接开始创作..."
                                        className="w-full flex-1 bg-transparent text-zinc-800 leading-relaxed outline-none resize-none font-sans text-[16px] min-h-[600px]"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Floating Quick Actions */}
            <div className="absolute bottom-10 right-10 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {isUploading && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-[11px] font-bold shadow-2xl flex items-center gap-2 mb-2"
                        >
                            <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                            正在上传并插入文件...
                        </motion.div>
                    )}
                    {!isPreview && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="flex flex-col gap-3"
                        >
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:scale-110 active:scale-95 transition-all group relative"
                                title="插入图片"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                <span className="absolute right-14 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">插入图片</span>
                            </button>
                            <button 
                                onClick={handleInsertLink}
                                className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:scale-110 active:scale-95 transition-all group relative"
                                title="插入链接"
                            >
                                <LinkIcon className="w-5 h-5" />
                                <span className="absolute right-14 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">插入链接</span>
                            </button>
                            <button 
                                onClick={handleInsertVideo}
                                className="w-12 h-12 rounded-full bg-white border border-zinc-200 shadow-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:scale-110 active:scale-95 transition-all group relative"
                                title="插入视频"
                            >
                                <Video className="w-5 h-5" />
                                <span className="absolute right-14 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">插入视频</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
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
