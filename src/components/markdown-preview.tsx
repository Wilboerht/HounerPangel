"use client";

import { renderMarkdown } from "@/lib/markdown";

// 预览面板单独打包：编辑器通过 next/dynamic 懒加载本组件，
// 避免把 renderMarkdown 和 highlight.js 打进管理页首屏 bundle
export default function MarkdownPreview({ value }: { value: string }) {
  if (!value) {
    return <span className="text-muted/50">预览区域 — 开始 Markdown 内容</span>;
  }
  // 与前台文章页共用 .article-body，保证预览所见即所得
  return (
    <div className="article-body">
      {renderMarkdown(value)}
    </div>
  );
}
