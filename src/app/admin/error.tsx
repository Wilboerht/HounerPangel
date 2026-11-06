"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/admin/button";
import { BackLink } from "@/components/admin/back-link";

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
      <div className="rounded-full bg-red-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">页面出错了</h1>
        <p className="text-sm text-muted">加载时发生了意外错误，请重试。</p>
        {error.digest && (
          <p className="text-xs text-muted">错误 ID：{error.digest}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="lg" onClick={reset}>
          重试
        </Button>
        <BackLink href="/admin" label="返回仪表盘" />
      </div>
    </div>
  );
}
