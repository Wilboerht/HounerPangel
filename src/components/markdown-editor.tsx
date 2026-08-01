"use client";

import { useState } from "react";
import { Eye, Edit3 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function MarkdownEditor({ value, onChange, rows = 12 }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2 bg-foreground/5 border-b border-border/50">
        <button
          onClick={() => setTab("edit")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "edit" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          编辑
        </button>
        <button
          onClick={() => setTab("preview")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            tab === "preview" ? "bg-background text-foreground shadow-sm" : "text-muted hover:text-foreground"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          预览
        </button>
      </div>
      {tab === "edit" ? (
        <textarea
          required
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"## 开头\n\n写点什么..."}
          className="w-full px-4 py-3 bg-foreground/5 text-foreground placeholder:text-muted/50 focus:outline-none resize-y font-mono text-base leading-relaxed min-h-[300px]"
        />
      ) : (
        <div className="px-4 py-3 bg-foreground/[0.02] min-h-[300px] text-sm text-muted leading-relaxed whitespace-pre-wrap font-mono">
          {value || <span className="text-muted/50">预览区域 — 开始输入 Markdown 内容</span>}
        </div>
      )}
    </div>
  );
}
