"use client";

import { useState, useRef } from "react";
import {
  Eye, Edit3, Bold, Italic, Heading2, Heading3,
  Link, Code, Code2, List, Image as ImageIcon, Video,
} from "lucide-react";
import { renderMarkdown } from "@/lib/markdown";
import { useToast } from "@/components/toast";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  id?: string;
}

export function MarkdownEditor({ value, onChange, rows = 12, required = false, id }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || placeholder;
    const newValue = value.slice(0, start) + before + text + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      if (selected) {
        ta.setSelectionRange(start + before.length, start + before.length + selected.length);
      } else {
        ta.setSelectionRange(start + before.length, start + before.length + text.length);
      }
    });
  };

  const insertBlock = (syntax: string, placeholder: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const before = value.slice(0, start);
    const prefix = before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : before.length === 0 ? "" : "\n\n";
    const text = syntax + placeholder;
    const suffix = "\n";
    onChange(before + prefix + text + suffix + value.slice(start));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length + syntax.length;
      ta.setSelectionRange(pos, pos + placeholder.length);
    });
  };

  const handleFileUpload = async (file: File, prefix: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        insertText(`${prefix}(${url})\n`);
      } else {
        toast.error("上传失败");
      }
    } catch {
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, `![${file.name.replace(/\.[^.]+$/, "")}]`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, `![${file.name.replace(/\.[^.]+$/, "")}]`);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const tools = [
    { icon: Bold, label: "加粗 (Ctrl+B)", action: () => insertText("**", "**", "粗体") },
    { icon: Italic, label: "斜体 (Ctrl+I)", action: () => insertText("*", "*", "斜体") },
    { icon: Heading2, label: "二级标题", action: () => insertBlock("## ", "标题") },
    { icon: Heading3, label: "三级标题", action: () => insertBlock("### ", "标题") },
    { icon: Link, label: "链接", action: () => insertText("[", "](url)", "链接文字") },
    { icon: Code, label: "行内代码", action: () => insertText("`", "`", "code") },
    { icon: Code2, label: "代码块", action: () => insertBlock("```\n", "code") },
    { icon: List, label: "无序列表", action: () => insertBlock("- ", "列表项") },
  ];

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-foreground/5 border-b border-border/50">
        <div className="flex items-center gap-1" role="tablist">
          <button
            onClick={() => setTab("edit")}
            role="tab"
            aria-selected={tab === "edit"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            编辑
          </button>
          <button
            onClick={() => setTab("preview")}
            role="tab"
            aria-selected={tab === "preview"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            预览
          </button>
        </div>
        {tab === "edit" && (
          <div className="flex items-center gap-0.5">
            {tools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={tool.action}
                title={tool.label}
                aria-label={tool.label}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="上传图片"
              aria-label="上传图片"
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              title="上传视频"
              aria-label="上传视频"
              className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        )}
      </div>
      {tab === "edit" ? (
        <textarea
          ref={textareaRef}
          id={id || undefined}
          required={required}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"## 开头\n\n写点什么..."}
          className="w-full px-4 py-3 bg-foreground/5 text-foreground placeholder:text-muted/50 focus:outline-none resize-y font-mono text-base leading-relaxed min-h-[300px]"
        />
      ) : (
        <div className="px-4 py-3 bg-foreground/[0.02] min-h-[300px] text-sm text-muted leading-relaxed">
          {value ? (
            <div className="prose prose-sm max-w-none space-y-4">
              {renderMarkdown(value)}
            </div>
          ) : (
            <span className="text-muted/50">预览区域 — 开始输入 Markdown 内容</span>
          )}
        </div>
      )}
    </div>
  );
}
