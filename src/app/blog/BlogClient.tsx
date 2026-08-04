"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, KeyRound, UserCheck } from "lucide-react";
import { useToast } from "@/components/toast";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import type { BlogPost } from "@/lib/types/blog";

interface Props {
    posts: BlogPost[];
}

export default function BlogClient({ posts }: Props) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const toast = useToast();
    const reduce = useSafeMotion();
    const loginTrapRef = useFocusTrap(showModal, () => setShowModal(false));

    useEffect(() => {
        fetch("/api/admin/check")
            .then((res) => res.json())
            .then((data) => setIsLoggedIn(data.authenticated))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
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
                toast.error(data.error || "密码错误");
            }
        } catch {
            toast.error("登录失败");
        } finally {
            setLoading(false);
        }
    };

    const groupedPosts = useMemo(() => {
        const groups: Record<string, BlogPost[]> = {};
        posts.forEach((post) => {
            const year = new Date(post.date).getFullYear().toString();
            if (!groups[year]) groups[year] = [];
            groups[year].push(post);
        });
        Object.values(groups).forEach((group) => {
            group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        });
        return groups;
    }, [posts]);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("zh-CN", {
            month: "long",
            day: "numeric",
        });

    return (
        <>
            <section className="space-y-10">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    博客
                </h1>

                {/* Blog List */}
                <div className="space-y-10">
                    {posts.length > 0 ? (
                        Object.entries(groupedPosts)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([year, yearPosts]) => (
                                <div key={year} className="space-y-4">
                                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                                        {year}
                                    </h2>
                                    <div className="space-y-3">
                                        {yearPosts.map((post) => (
                                            <Link
                                                key={post.slug}
                                                href={`/blog/${post.slug}`}
                                                className="group flex items-baseline gap-4 sm:gap-6"
                                            >
                                                <time
                                                    dateTime={post.date}
                                                    className="text-sm text-muted shrink-0 w-20 sm:w-24"
                                                >
                                                    {formatDate(post.date)}
                                                </time>
                                                <span className="text-base text-foreground group-hover:text-accent transition-colors duration-200">
                                                    {post.title}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-sm text-muted/50 tracking-wide">内容正在整理中</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="flex items-center justify-between text-sm text-muted border-t border-border/50">
                <p>&copy; {new Date().getFullYear()} wilboerht</p>
                <button
                    onClick={() => {
                        if (isLoggedIn) {
                            router.push("/admin/blog");
                        } else {
                            setShowModal(true);
                        }
                    }}
                    className="inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors min-h-[44px]"
                    title={isLoggedIn ? "进入后台" : "管理"}
                >
                    {isLoggedIn ? (
                        <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                        <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>管理后台</span>
                </button>
            </footer>

            {/* Login Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={safeAnimate(reduce, { opacity: 0 })}
                            animate={{ opacity: 1 }}
                            exit={safeAnimate(reduce, { opacity: 0 })}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={safeAnimate(reduce, { opacity: 0, scale: 0.96, y: 10 })}
                            transition={springModal}
                            className="fixed inset-0 flex items-center justify-center z-[101] p-6"
                        >
                            <div
                                ref={loginTrapRef}
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="login-title"
                                className="relative w-full max-w-[360px] bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={() => setShowModal(false)}
                                    aria-label="关闭登录窗口"
                                    className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors"
                                >
                                    <X size={18} strokeWidth={2} />
                                </button>

                                {/* Modal Header */}
                                <div className="pt-8 pb-6 px-6">
                                    <h2 id="login-title" className="text-base font-medium text-foreground">管理后台</h2>
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 pb-8">
                                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                                        <label htmlFor="login-password" className="sr-only">密码</label>
                                        <input
                                            id="login-password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="密码"
                                            autoFocus
                                            className="px-4 py-2.5 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                        />

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                                        >
                                            {loading ? "登录中..." : "登录"}
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
