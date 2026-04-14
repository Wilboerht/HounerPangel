import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "博客 - Hank Wong's Web",
    description: "博客页面施工中...",
};

export default function Blog() {
    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center space-y-4">
                <h1 className="text-6xl font-bold text-foreground">
                    🔨
                </h1>
                <h2 className="text-2xl font-semibold text-foreground">
                    施工中
                </h2>
                <p className="text-muted">
                    博客功能正在开发中，敬请期待...
                </p>
                <Link
                    href="/"
                    className="inline-block mt-6 text-sm text-muted hover:text-foreground transition-colors duration-200"
                >
                    返回主页
                </Link>
            </div>
        </main>
    );
}
