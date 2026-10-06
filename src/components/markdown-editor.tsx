"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Eye, Edit3, Bold, Italic, Heading2, Heading3,
  Link, Code, Code2, List, Image as ImageIcon, Video, Paperclip,
} from "lucide-react";
import { useToast } from "@/components/toast";

// 预览渲染器（含 highlight.js）体积较大，懒加载：只有切到预览 tab 时才下载
const MarkdownPreview = dynamic(() => import("./markdown-preview"), {
  ssr: false,
  loading: () => <span className="text-muted/50">加载预览...</span>,
});

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  id?: string;
}

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  pdf: "application/pdf",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

function getMimeType(file: File): string {
  // 扩展名映射优先，与服务端 EXT_TO_MIME 保持一致；浏览器上报的 MIME 可能是非标值
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext && MIME_MAP[ext]) return MIME_MAP[ext];
  return file.type || "";
}

// 本地读取图片原始尺寸，用于在 markdown 里记录宽高（=WxH），前台据此预留宽高比避免 CLS
function getImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

// 与服务端 /api/admin/upload-url 的白名单和大小限制保持一致，上传前先本地拦截
const ALLOWED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov", "avi", "mkv"]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(["pdf", "txt", "md", "csv", "zip", "doc", "docx", "xls", "xlsx", "ppt", "pptx"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024;

type UploadKind = "image" | "video" | "attachment";

const KIND_LABEL: Record<UploadKind, string> = { image: "图片", video: "视频", attachment: "附件" };
const KIND_ALLOWED: Record<UploadKind, Set<string>> = {
  image: ALLOWED_IMAGE_EXTENSIONS,
  video: ALLOWED_VIDEO_EXTENSIONS,
  attachment: ALLOWED_ATTACHMENT_EXTENSIONS,
};
const KIND_MAX_SIZE: Record<UploadKind, number> = {
  image: MAX_IMAGE_SIZE,
  video: MAX_VIDEO_SIZE,
  attachment: MAX_ATTACHMENT_SIZE,
};
const KIND_MAX_LABEL: Record<UploadKind, string> = { image: "10MB", video: "100MB", attachment: "50MB" };

// 文件名里去掉会破坏 markdown 链接语法的字符
function sanitizeLinkText(name: string): string {
  return name.replace(/[[\]()]/g, "").trim() || "附件";
}

export function MarkdownEditor({ value, onChange, rows = 12, required = false, id }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Sync external value changes (initial load, form reset, toolbar actions from parent)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (ta.value !== value) {
      ta.value = value;
    }
  }, [value]);

  const updateValue = (newValue: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.value = newValue;
    onChange(newValue);
  };

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const current = ta.value;
    const selected = current.slice(start, end);
    const text = selected || placeholder;
    const newValue = current.slice(0, start) + before + text + after + current.slice(end);
    updateValue(newValue);
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
    const current = ta.value;
    const before = current.slice(0, start);
    const prefix = before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : before.length === 0 ? "" : "\n\n";
    const text = syntax + placeholder;
    const suffix = "\n";
    const newValue = before + prefix + text + suffix + current.slice(start);
    updateValue(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length + syntax.length;
      ta.setSelectionRange(pos, pos + placeholder.length);
    });
  };

  const uploadToStorage = async (file: File): Promise<string> => {
    const contentType = getMimeType(file);
    const res = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType,
        size: file.size,
      }),
    });

    if (!res.ok) {
      let message = "上传失败";
      try { const d = await res.json(); if (d.error) message = d.error; } catch {}
      throw new Error(message);
    }

    const { signedUrl, publicUrl } = await res.json();

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(`${pct}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("上传失败"));
        }
      };

      xhr.onerror = () => reject(new Error("上传失败"));
      xhr.send(file);
    });

    return publicUrl as string;
  };

  const handleFileUpload = async (file: File, getMarkdown: (url: string) => string, kind: UploadKind) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!KIND_ALLOWED[kind].has(ext)) {
      toast.error(`不支持的${KIND_LABEL[kind]}格式: .${ext || "未知"}`);
      return;
    }
    if (file.size > KIND_MAX_SIZE[kind]) {
      toast.error(`文件过大，${KIND_LABEL[kind]}最大 ${KIND_MAX_LABEL[kind]}`);
      return;
    }
    setUploading(true);
    setUploadProgress("");
    try {
      const url = await uploadToStorage(file);
      let markdown = getMarkdown(url);
      // 记录图片原始尺寸（=WxH），前台据此预留宽高比，避免加载时页面跳动
      if (kind === "image") {
        const dims = await getImageDimensions(file);
        if (dims) markdown = getMarkdown(`${url} =${dims.width}x${dims.height}`);
      }
      // 用 insertBlock 保证媒体/附件语法独占一行，否则前台解析器不会把它渲染成对应卡片
      insertBlock(markdown);
      toast.success(`${KIND_LABEL[kind]}已插入`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, (url) => `![](${url})`, "image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFileUpload(file, (url) => `![](${url})`, "video");
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 附件用链接语法插入，前台渲染成下载卡片
    handleFileUpload(file, (url) => `[${sanitizeLinkText(file.name)}](${url})`, "attachment");
    if (attachmentInputRef.current) attachmentInputRef.current.value = "";
  };

  // 粘贴/拖拽进来的文件按 MIME 或扩展名自动判断走图片/视频/附件分支
  const detectFileKind = (file: File): UploadKind | null => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (ALLOWED_IMAGE_EXTENSIONS.has(ext) || file.type.startsWith("image/")) return "image";
    if (ALLOWED_VIDEO_EXTENSIONS.has(ext) || file.type.startsWith("video/")) return "video";
    if (ALLOWED_ATTACHMENT_EXTENSIONS.has(ext)) return "attachment";
    return null;
  };

  const handleDroppedFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    let hasMedia = false;
    for (const file of list) {
      const kind = detectFileKind(file);
      if (!kind) continue;
      hasMedia = true;
      const getMarkdown = kind === "attachment"
        ? (url: string) => `[${sanitizeLinkText(file.name)}](${url})`
        : (url: string) => `![](${url})`;
      await handleFileUpload(file, getMarkdown, kind);
    }
    if (!hasMedia) {
      toast.error("仅支持粘贴或拖拽图片/视频/附件文件");
    }
  };

  const insertCodeBlock = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const current = ta.value;
    const before = current.slice(0, start);
    const prefix = before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : before.length === 0 ? "" : "\n\n";
    const text = "```\ncode\n```\n";
    const newValue = before + prefix + text + current.slice(start);
    updateValue(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + prefix.length + 4;
      ta.setSelectionRange(pos, pos + 4);
    });
  };

  const tools = [
    { icon: Bold, label: "加粗 (Ctrl+B)", action: () => insertText("**", "**", "粗体") },
    { icon: Italic, label: "斜体 (Ctrl+I)", action: () => insertText("*", "*", "斜体") },
    { icon: Heading2, label: "二级标题", action: () => insertBlock("## ", "标题") },
    { icon: Heading3, label: "三级标题", action: () => insertBlock("### ", "标题") },
    { icon: Link, label: "链接", action: () => insertText("[", "](url)", "链接文字") },
    { icon: Code, label: "行内代码", action: () => insertText("`", "`", "code") },
    { icon: Code2, label: "代码块", action: insertCodeBlock },
    { icon: List, label: "无序列表", action: () => insertBlock("- ", "列表项") },
  ];

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 bg-foreground/5 border-b border-border/50">
        <div className="flex items-center gap-1" role="tablist" aria-label="编辑器视图切换">
          <button
            type="button"
            id="tab-edit"
            onClick={() => setTab("edit")}
            role="tab"
            aria-selected={tab === "edit"}
            aria-controls="md-editor-panel"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
              tab === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            编辑
          </button>
          <button
            type="button"
            id="tab-preview"
            onClick={() => setTab("preview")}
            role="tab"
            aria-selected={tab === "preview"}
            aria-controls="md-preview-panel"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors min-h-[36px] ${
              tab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            预览
          </button>
        </div>
        {tab === "edit" && (
          <div className="flex items-center gap-0.5 flex-wrap -mx-1 px-1">
            {uploading && (
              <span className="text-xs text-muted flex-shrink-0 mr-1">
                {uploadProgress || "上传中..."}
              </span>
            )}
            {tools.map((tool) => (
              <button
                key={tool.label}
                type="button"
                onClick={tool.action}
                title={tool.label}
                aria-label={tool.label}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors flex-shrink-0"
              >
                <tool.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-5 bg-border/50 mx-1 flex-shrink-0" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="上传图片"
              aria-label="上传图片"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
              title="上传视频"
              aria-label="上传视频"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              disabled={uploading}
              title="上传附件（PDF、文档、压缩包等）"
              aria-label="上传附件"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-muted hover:text-foreground hover:bg-foreground/10 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.webp"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.webm,.mov,.avi,.mkv"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <input
              ref={attachmentInputRef}
              type="file"
              accept=".pdf,.txt,.md,.csv,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleAttachmentUpload}
              className="hidden"
            />
          </div>
        )}
      </div>
      {/* textarea 常驻挂载：切预览不丢光标/撤销历史，上传完成时插入目标也不会被卸载 */}
      <textarea
        ref={textareaRef}
        id={id || "md-editor-panel"}
        role="tabpanel"
        aria-labelledby="tab-edit"
        required={required}
        rows={rows}
        defaultValue={value}
        onInput={(e) => onChange(e.currentTarget.value)}
        onPaste={(e) => {
          // 剪贴板里有文件（截图等）时上传并插入，否则走默认文本粘贴
          if (e.clipboardData.files.length > 0) {
            e.preventDefault();
            handleDroppedFiles(e.clipboardData.files);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          if (e.dataTransfer.files.length > 0) {
            e.preventDefault();
            handleDroppedFiles(e.dataTransfer.files);
          }
        }}
        onKeyDown={(e) => {
          if (!(e.ctrlKey || e.metaKey)) return;
          const key = e.key.toLowerCase();
          if (key === "b") {
            e.preventDefault();
            insertText("**", "**", "粗体");
          } else if (key === "i") {
            e.preventDefault();
            insertText("*", "*", "斜体");
          }
        }}
        placeholder={"## 开头\n\n写点什么..."}
        className={`w-full px-4 py-3 bg-foreground/5 text-foreground placeholder:text-muted/50 focus:outline-none resize-y font-mono text-base leading-relaxed min-h-[300px] ${tab === "edit" ? "" : "hidden"}`}
      />
      {tab === "preview" && (
        <div id="md-preview-panel" role="tabpanel" aria-labelledby="tab-preview" className="px-4 py-3 bg-foreground/[0.02] min-h-[300px] text-sm leading-relaxed">
          <MarkdownPreview value={value} />
        </div>
      )}
    </div>
  );
}
