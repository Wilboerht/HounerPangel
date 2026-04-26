"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowLeft, FileText, LogOut, Lock, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPost } from "@/lib/types/blog";

export default function AdminBlogList() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);

    // New post modal
    const [showNewModal, setShowNewModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newForm, setNewForm] = useState({
        slug: "",
        title: "",
        excerpt: "",
        content: "",
        date: new Date().toISOString().split("T")[0],
        tags: "",
    });

    const loadPosts = () => {
        fetch("/api/blog")
            .then((res) => {
                if (res.status === 401) {
                    setAuthError(true);
                    setLoading(false);
                    return null;
                }
                return res.json();
            })
            .then((data) => {
                if (data) {
                    setPosts(data);
                    setLoading(false);
                }
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleDelete = async (slug: string) => {
        if (!confirm("确定要删除这篇文章吗？")) return;
        try {
            const res = await fetch(`/api/blog/${slug}`, { method: "DELETE" });
            if (res.status === 401) {
                alert("登录已过期，请重新登录");
                window.location.href = "/blog";
                return;
            }
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.slug !== slug));
            } else {
                alert("删除失败");
            }
        } catch {
            alert("删除失败");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newForm,
                    tags: newForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                setShowNewModal(false);
                setNewForm({
                    slug: "",
                    title: "",
                    excerpt: "",
                    content: "",
                    date: new Date().toISOString().split("T")[0],
                    tags: "",
                });
                loadPosts();
            } else {
                const data = await res.json();
                alert(data.error || "保存失败");
                setSaving(false);
            }
        } catch {
            alert("保存失败");
            setSaving(false);
        }
    };

    if (authError) {
        return (
            <main className="min-h-screen flex items-center justify-center px-6">
                <div className="max-w-sm w-full flex flex-col items-center gap-6 text-center">
                    <div className="p-4 rounded-full bg-foreground/5">
                        <Lock className="w-8 h-8 text-muted" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-semibold text-foreground">需要登录</h1>
                        <p className="text-sm text-muted">请先返回博客页面登录</p>
                    </div>
                    <Link
                        href="/blog"
                        className="px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                    >
                        返回博客
                    </Link>
                </div>
            </main>
        );
    }

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
                                    window.location.href = "/blog";
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                退出
                            </button>
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                新建文章
                            </button>
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

            {/* New Post Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNewModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 flex items-center justify-center z-[101] p-6"
                        >
                            <div className="relative w-full max-w-2xl bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden max-h-[85vh] flex flex-col">
                                {/* Close Button */}
                                <div className="absolute top-4 right-4 z-10">
                                    <button
                                        onClick={() => setShowNewModal(false)}
                                        className="p-2 rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Modal Header */}
                                <div className="px-8 pt-8 pb-4">
                                    <h2 className="text-xl font-bold text-foreground">
                                        新建文章
                                    </h2>
                                </div>

                                {/* Modal Body */}
                                <div className="px-8 pb-8 overflow-y-auto">
                                    <form onSubmit={handleCreate} className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">Slug（URL 标识）</label>
                                            <input
                                                type="text"
                                                required
                                                value={newForm.slug}
                                                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                                                placeholder="hello-world"
                                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">标题</label>
                                            <input
                                                type="text"
                                                required
                                                value={newForm.title}
                                                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                                                placeholder="文章标题"
                                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">摘要</label>
                                            <input
                                                type="text"
                                                required
                                                value={newForm.excerpt}
                                                onChange={(e) => setNewForm({ ...newForm, excerpt: e.target.value })}
                                                placeholder="简短描述"
                                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">日期</label>
                                            <input
                                                type="date"
                                                required
                                                value={newForm.date}
                                                onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                                                className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">标签（用逗号分隔）</label>
                                            <input
                                                type="text"
                                                value={newForm.tags}
                                                onChange={(e) => setNewForm({ ...newForm, tags: e.target.value })}
                                                placeholder="随笔, 技术, 生活"
                                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-foreground">正文（Markdown）</label>
                                            <textarea
                                                required
                                                rows={12}
                                                value={newForm.content}
                                                onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
                                                placeholder="## 开头\n\n写点什么..."
                                                className="px-4 py-3 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-y font-mono text-sm leading-relaxed"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                                            >
                                                <Save className="w-4 h-4" />
                                                {saving ? "保存中..." : "保存"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewModal(false)}
                                                className="text-sm text-muted hover:text-foreground transition-colors"
                                            >
                                                取消
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}
