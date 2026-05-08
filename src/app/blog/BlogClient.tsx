"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Tag, FileText, X, KeyRound, UserCheck } from "lucide-react";
import type { BlogPost } from "@/lib/types/blog";

interface Props {
    posts: BlogPost[];
}

export default function BlogClient({ posts }: Props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch("/api/admin/check")
            .then((res) => res.json())
            .then((data) => setIsLoggedIn(data.authenticated))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/admin/blog");
            } else {
                const data = await res.json();
                setError(data.error || "密码错误");
                setLoading(false);
            }
        } catch {
            setError("登录失败");
            setLoading(false);
        }
    };

    return (
        <>
            <section className="space-y-10">
                <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                        博客
                    </h1>
                    <p className="text-lg text-muted leading-relaxed">
                        Thoughts, notes, and creations along the way.
                    </p>
                </div>

                {/* Blog List */}
                <div className="flex flex-col gap-6">
                    {posts.length > 0 ? (
                        posts.map((post) => (
                            <article
                                key={post.slug}
                                className="group flex flex-col gap-3 p-4 -mx-4 rounded-xl hover:bg-foreground/[0.02] transition-colors duration-200"
                            >
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                                    <div className="inline-flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <time dateTime={post.date}>
                                            {new Date(post.date).toLocaleDateString("zh-CN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </time>
                                    </div>
                                    {post.tags.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5" />
                                            <div className="flex gap-2">
                                                {post.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Link href={`/blog/${post.slug}`} className="block space-y-2">
                                    <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors duration-200">
                                        {post.title}
                                    </h2>
                                    <p className="text-muted leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                </Link>
                            </article>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-foreground/[0.01] rounded-3xl border border-dashed border-border/50">
                            <div className="p-4 rounded-full bg-foreground/5 text-muted/30">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-foreground/80">暂无文章</p>
                                <p className="text-sm text-muted">Nothing here yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-8 text-sm text-muted border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                    <Link href="/travel/plan" className="text-muted hover:text-foreground transition-colors">
                        旅行计划
                    </Link>
                    <span>|</span>
                    <Link href="/photos" className="text-muted hover:text-foreground transition-colors">
                        摄影集
                    </Link>
                </div>
                <div className="flex items-center gap-2">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                    <span>·</span>
                    <button
                        onClick={() => {
                            if (isLoggedIn) {
                                router.push("/admin/blog");
                            } else {
                                setShowModal(true);
                            }
                        }}
                        className="text-muted hover:text-foreground transition-colors"
                        title={isLoggedIn ? "进入后台" : "管理"}
                    >
                        {isLoggedIn ? (
                            <UserCheck className="w-3.5 h-3.5" />
                        ) : (
                            <KeyRound className="w-3.5 h-3.5" />
                        )}
                    </button>
                </div>
            </footer>

            {/* Login Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 flex items-center justify-center z-[101] p-6"
                        >
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="login-title"
                                className="relative w-full max-w-[420px] bg-white rounded-[28px] shadow-[0_45px_80px_-16px_rgba(0,0,0,0.15)] overflow-hidden"
                            >
                                {/* Close Button */}
                                <div className="absolute top-6 right-6 z-10">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        aria-label="关闭登录窗口"
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Modal Header */}
                                <div className="flex flex-col items-center pt-14 pb-6 px-10">
                                    <Image src="/images/Vanto.svg" alt="Vanto" width={112} height={28} className="h-[28px] w-auto mb-5" />
                                    <h2 id="login-title" className="text-xl font-bold text-slate-900 tracking-[0.14em]">
                                        后台登录
                                    </h2>
                                </div>

                                {/* Modal Body */}
                                <div className="px-10 pb-10">
                                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="login-password" className="sr-only">密码</label>
                                            <input
                                                id="login-password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="请输入密码"
                                                autoFocus
                                                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                                            />
                                        </div>

                                        {error && (
                                            <p className="text-sm text-red-500">{error}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-4 py-3 rounded-2xl text-sm font-semibold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 relative group disabled:opacity-50 transition-colors duration-200"
                                        >
                                            <span className="relative">
                                                {loading ? "登录中..." : "登录"}
                                                <span className="absolute left-0 -bottom-1 w-0 h-px bg-slate-900 group-hover:w-full transition-all duration-200" />
                                            </span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
