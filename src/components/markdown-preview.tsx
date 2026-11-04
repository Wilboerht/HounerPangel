"use client";

import { useDeferredValue, useMemo } from "react";
import { renderMarkdown } from "@/lib/markdown";

// 预览面板单独打包：编辑器通过 next/dynamic 懒加载本组件，
// 避免把 renderMarkdown 和 highlight.js 打进管理页首屏 bundle
export default function MarkdownPreview({ value }: { value: string }) {
  const deferredValue = useDeferredValue(value);
  const rendered = useMemo(() => renderMarkdown(deferredValue), [deferredValue]);
  const updating = value !== deferredValue;

  if (!value) {
    return <span className="text-muted/50">预览区域 — 开始输入 Markdown 内容</span>;
  }
  // 与前台文章页共用 .article-body，保证预览所见即所得
  return (
    <div className="article-body" aria-busy={updating}>
      {updating && <p role="status" className="text-xs text-muted">正在更新预览…</p>}
      {rendered}
    </div>
  );
}
