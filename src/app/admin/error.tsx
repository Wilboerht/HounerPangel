"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

// 管理端错误边界：由 AdminShell 包裹，页面出错时保留侧边栏/导航
export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div className="p-4 rounded-full bg-red-500/10">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">页面出错了</h1>
        <p className="text-sm text-muted">加载时发生了意外错误，请重试。</p>
        {error.digest && (
          <p className="text-xs text-muted/60">错误 ID：{error.digest}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          重试
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
