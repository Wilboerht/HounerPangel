"use client";

import { renderMarkdown } from "@/lib/markdown";

// 预览面板单独打包：编辑器通过 next/dynamic 懒加载本组件，
// 避免把 renderMarkdown 和 highlight.js 打进管理页首屏 bundle
export default function MarkdownPreview({ value }: { value: string }) {
  if (!value) {
    return <span className="text-muted/50">预览区域 — 开始 Markdown 内容</span>;
  }
  return (
    <div className="prose prose-sm max-w-none space-y-4 text-foreground">
      {renderMarkdown(value)}
    </div>
  );
}
