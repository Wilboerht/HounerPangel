"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditBlogPost() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [authChecking, setAuthChecking] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        title: "",
        excerpt: "",
        content: "",
        date: "",
        tags: "",
    });

    useEffect(() => {
        fetch("/api/admin/check")
            .then((res) => res.json())
            .then((data) => {
                if (!data.authenticated) {
                    router.push("/blog");
                    return;
                }
                setIsAuth(true);
                setAuthChecking(false);
            })
            .catch(() => {
                router.push("/blog");
            });
    }, [router]);

    useEffect(() => {
        if (!isAuth) return;
        fetch(`/api/blog/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    alert("文章不存在");
                    router.push("/admin/blog");
                    return;
                }
                setForm({
                    title: data.title,
                    excerpt: data.excerpt,
                    content: data.content,
                    date: data.date,
                    tags: data.tags.join(", "),
                });
                setLoading(false);
            })
            .catch(() => {
                alert("加载失败");
                router.push("/admin/blog");
            });
    }, [slug, router, isAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/blog/${slug}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                router.push("/admin/blog");
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

    if (authChecking) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-muted">检查权限中...</p>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-muted">加载中...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-3xl w-full flex flex-col gap-12">
                <nav>
                    <Link
                        href="/admin/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回管理</span>
                    </Link>
                </nav>

                <section className="space-y-10">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            编辑文章
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">Slug</label>
                            <input
                                type="text"
                                disabled
                                value={slug}
                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-muted cursor-not-allowed"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">标题</label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="文章标题"
                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">摘要</label>
                            <input
                                type="text"
                                required
                                value={form.excerpt}
                                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                placeholder="简短描述"
                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">日期</label>
                            <input
                                type="date"
                                required
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">标签（用逗号分隔）</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="随笔, 技术, 生活"
                                className="px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">正文（Markdown）</label>
                            <textarea
                                required
                                rows={20}
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="## 开头\n\n写点什么..."
                                className="px-4 py-3 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors resize-y font-mono text-sm leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "保存中..." : "保存"}
                            </button>
                            <Link
                                href="/admin/blog"
                                className="text-sm text-muted hover:text-foreground transition-colors"
                            >
                                取消
                            </Link>
                        </div>
                    </form>
                </section>
            </div>
        </main>
    );
}
