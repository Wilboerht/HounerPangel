"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Application error:", error);
    }, [error]);

    return (
        <main className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full flex flex-col items-center gap-6 text-center">
                <div className="p-4 rounded-full bg-red-500/10">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">出错了</h1>
                    <p className="text-sm text-muted">
                        {error.message || "页面加载时发生了意外错误。"}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={reset}
                        className="px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                        重试
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        返回首页
                    </Link>
                </div>
            </div>
        </main>
    );
}
