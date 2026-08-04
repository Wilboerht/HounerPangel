"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Tag, X, KeyRound, UserCheck, ArrowRight } from "lucide-react";
import { useToast } from "@/components/toast";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import type { BlogPost } from "@/lib/types/blog";

interface Props {
    posts: BlogPost[];
}

export default function BlogClient({ posts }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string | null>(searchParams.get("tag"));

    const toast = useToast();
    const reduce = useSafeMotion();
    const loginTrapRef = useFocusTrap(showModal, () => setShowModal(false));

    useEffect(() => {
        fetch("/api/admin/check")
            .then((res) => res.json())
            .then((data) => setIsLoggedIn(data.authenticated))
            .catch(() => setIsLoggedIn(false));
    }, []);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        posts.forEach((post) => post.tags.forEach((tag) => tags.add(tag)));
        return Array.from(tags).sort((a, b) => a.localeCompare(b, "zh-CN"));
    }, [posts]);

    const filteredPosts = useMemo(() => {
        if (!selectedTag) return posts;
        return posts.filter((post) => post.tags.includes(selectedTag));
    }, [posts, selectedTag]);

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

    const selectTag = (tag: string | null) => {
        setSelectedTag(tag);
        const params = new URLSearchParams(searchParams.toString());
        if (tag) {
            params.set("tag", tag);
        } else {
            params.delete("tag");
        }
        router.replace(`/blog?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            <section className="space-y-10">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                    博客
                </h1>

                {/* Tags */}
                {allTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => selectTag(null)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                selectedTag === null
                                    ? "bg-foreground text-background"
                                    : "bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10"
                            }`}
                        >
                            全部
                        </button>
                        {allTags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => selectTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                    selectedTag === tag
                                        ? "bg-foreground text-background"
                                        : "bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10"
                                }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                )}

                {/* Blog List */}
                <div className="flex flex-col gap-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <article
                                key={post.slug}
                                className="group flex flex-col gap-4 p-5 rounded-2xl border border-border/50 bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200"
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
                                            <div className="flex flex-wrap gap-2">
                                                {post.tags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => selectTag(tag)}
                                                        className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-muted hover:text-foreground hover:bg-foreground/10 transition-colors"
                                                    >
                                                        {tag}
                                                    </button>
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

                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors group/link"
                                >
                                    <span>阅读全文</span>
                                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                                </Link>
                            </article>
                        ))
                    ) : (
                        <div className="py-16 text-center">
                            <p className="text-sm text-muted/50 tracking-wide">内容正在整理中</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="pt-6 flex items-center justify-between text-sm text-muted border-t border-border/50">
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
                                className="relative w-full max-w-[420px] bg-background rounded-2xl border border-border/50 shadow-xl overflow-hidden"
                            >
                                {/* Close Button */}
                                <div className="absolute top-6 right-6 z-10">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        aria-label="关闭登录窗口"
                                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-foreground/5 text-muted hover:text-foreground transition-colors"
                                    >
                                        <X size={16} strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Modal Header */}
                                <div className="flex flex-col items-center pt-14 pb-6 px-6 sm:px-10">
                                    <h2 id="login-title" className="sr-only">管理员登录</h2>
                                    <Image src="/images/Vanto.svg" alt="Vanto" width={112} height={28} className="h-[28px] w-auto mb-5" />
                                </div>

                                {/* Modal Body */}
                                <div className="px-6 sm:px-10 pb-6 sm:pb-10">
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
                                                className="px-4 py-2.5 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
                                        >
                                            <span className="relative">
                                                {loading ? "登录中..." : "登录"}
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
