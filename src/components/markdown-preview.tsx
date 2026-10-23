"use client";

import { useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";

// 预览面板单独打包：编辑器通过 next/dynamic 懒加载本组件，
// 避免把 renderMarkdown 和 highlight.js 打进管理页首屏 bundle
export default function MarkdownPreview({ value }: { value: string }) {
  // renderMarkdown 含 hljs 高亮，长文单次渲染可达数十 ms；value 不变时不重算
  const rendered = useMemo(() => renderMarkdown(value), [value]);

  if (!value) {
    return <span className="text-muted/50">预览区域 — 开始输入 Markdown 内容</span>;
  }
  // 与前台文章页共用 .article-body，保证预览所见即所得
  return (
    <div className="article-body">
      {rendered}
    </div>
  );
}
