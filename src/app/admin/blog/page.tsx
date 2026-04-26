"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, FileText, LogOut } from "lucide-react";
import type { BlogPost } from "@/lib/types/blog";

export default function AdminBlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blog")
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm("确定要删除这篇文章吗？")) return;
        try {
            const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.slug !== slug));
            } else {
                alert("删除失败");
            }
        } catch {
            alert("删除失败");
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl w-full flex flex-col gap-12">
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回主页</span>
                    </Link>
                </nav>

                <section className="space-y-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                                博客管理
                            </h1>
                            <p className="text-lg text-muted leading-relaxed mt-2">
                                管理你的博客文章
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    await fetch("/api/admin/logout", { method: "POST" });
                                    window.location.href = "/admin/login";
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                退出
                            </button>
                            <Link
                                href="/admin/blog/new"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                新建文章
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <p className="text-muted text-center py-20">加载中...</p>
                    ) : posts.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {posts.map((post) => (
                                <div
                                    key={post.slug}
                                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-foreground/[0.02] transition-colors"
                                >
                                    <div className="flex flex-col gap-1">
                                        <h3 className="font-semibold text-foreground">{post.title}</h3>
                                        <p className="text-sm text-muted">
                                            {new Date(post.date).toLocaleDateString("zh-CN")}
                                            {post.tags.length > 0 && (
                                                <span className="ml-2">
                                                    {post.tags.join(", ")}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/admin/blog/edit/${post.slug}`}
                                            className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                                            title="编辑"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(post.slug)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-foreground/[0.01] rounded-3xl border border-dashed border-border/50">
                            <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-foreground/80">暂无文章</p>
                                <p className="text-sm text-muted">点击右上角新建文章</p>
                            </div>
                        </div>
                    )}
                </section>

                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>
        </main>
    );
}
