"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, X, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_PROJECTS = [
    {
        id: "1",
        title: "MySkin.Today",
        description: "智能面部护肤顾问。利用 AI 技术进行面部分析，为用户提供个性化护肤建议。",
        url: "https://advisor.nihplod.cn",
        tags: ["AI", "Next.js"]
    },
    {
        id: "2",
        title: "NIHPLOD",
        description: "NIHPLOD 中国官方网站及其他配套服务系统",
        url: "https://nihplod.cn",
        tags: ["Next.js", "React"]
    },
    {
        id: "3",
        title: "上海临港景鸿安全防范科技发展有限公司",
        description: "上海临港景鸿安全防范科技发展有限公司官方网站，展示企业信息与服务的综合数字平台。",
        url: "https://www.lingangjh.com/",
        tags: ["Enterprise", "Web System"]
    }
];

const NIHPLOD_SUB_PROJECTS = [
    {
        id: "n1",
        title: "NIHPLOD 中国官网",
        description: "品牌官方网站，展示品牌故事、产品系列与会员服务体系。",
        url: "https://nihplod.cn",
        tags: ["品牌官网"]
    },
    {
        id: "n2",
        title: "授权核验平台",
        description: "官方授权店铺与经销商在线核验系统，确保消费者权益。",
        url: "https://ba.nihplod.cn",
        tags: ["授权核验"]
    },
    {
        id: "n3",
        title: "Skin Advisor",
        description: "智能面部护肤顾问。利用 AI 技术进行面部分析，为用户提供个性化护肤建议。",
        url: "https://advisor.nihplod.cn",
        tags: ["AI 护肤顾问"]
    },
    {
        id: "n4",
        title: "积分商城系统",
        description: "会员积分兑换与线上商城系统，支持多种支付方式与物流追踪。",
        url: "https://shop.nihplod.cn",
        tags: ["电商系统"]
    }
];

const ITEMS_PER_PAGE = 4;

export default function Projects() {
    const [modalOpen, setModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const validPage = page < 1 ? 1 : page;

    const totalItems = MOCK_PROJECTS.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = MOCK_PROJECTS.slice(startIndex, endIndex);
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    useEffect(() => {
        if (modalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [modalOpen]);

    const nihplodProject = MOCK_PROJECTS.find((p) => p.title === "NIHPLOD");

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="max-w-6xl w-full flex flex-col gap-12">
                {/* Navigation */}
                <nav>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                        <span>返回主页</span>
                    </Link>
                </nav>

                {/* Content */}
                <section className="space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                            项目
                        </h1>
                        <p className="text-lg text-muted leading-relaxed">
                            Creating something interesting.
                        </p>
                    </div>

                    {/* Projects list */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {currentItems.map((project) => {
                            if (project.title === "NIHPLOD") {
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setModalOpen(true)}
                                        className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200 text-left"
                                    >
                                        <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                {project.title}
                                            </span>
                                            <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 flex-shrink-0" />
                                        </h3>
                                        <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex gap-2 mt-2 items-center flex-wrap">
                                            <FolderOpen className="w-3.5 h-3.5 text-muted" />
                                            {project.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            }
                            return (
                                <a
                                    key={project.id}
                                    href={project.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200"
                                >
                                    <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between gap-2">
                                        <span className="truncate">
                                            {project.title}
                                        </span>
                                        <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 flex-shrink-0" />
                                    </h3>
                                    <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                        {project.description}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {project.tags.map((tag, idx) => (
                                            <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </a>
                            );
                        })}
                    </div>

                    {/* Pagination UI */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-8">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={validPage <= 1}
                                className={`p-2 rounded-lg transition-colors duration-200 ${validPage > 1
                                    ? "text-muted hover:text-foreground hover:bg-foreground/5"
                                    : "text-muted/30 pointer-events-none"
                                    }`}
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {pageNumbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors duration-200 ${validPage === num
                                            ? "bg-foreground text-background font-medium"
                                            : "text-muted hover:text-foreground hover:bg-foreground/5"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={validPage >= totalPages}
                                className={`p-2 rounded-lg transition-colors duration-200 ${validPage < totalPages
                                    ? "text-muted hover:text-foreground hover:bg-foreground/5"
                                    : "text-muted/30 pointer-events-none"
                                    }`}
                                aria-label="Next page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="pt-8 text-sm text-muted border-t border-white/10">
                    <p>&copy; {new Date().getFullYear()} wilboerht</p>
                </footer>
            </div>

            {/* NIHPLOD Modal */}
            <AnimatePresence>
                {modalOpen && nihplodProject && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setModalOpen(false)}
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-0 flex items-center justify-center z-[101] p-4"
                        >
                            <div className="w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
                                {/* Modal Header */}
                                <div className="relative flex items-center justify-center p-6 flex-shrink-0">
                                    <img
                                        src="/images/NIHPLOD-logo.svg"
                                        alt="NIHPLOD"
                                        className="h-8 w-auto dark:invert"
                                    />
                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="absolute right-6 p-2 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors flex-shrink-0"
                                    >
                                        <X className="w-5 h-5 text-muted" />
                                    </button>
                                </div>

                                {/* Modal Body - Sub Projects Grid */}
                                <div className="p-6 overflow-y-auto">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {NIHPLOD_SUB_PROJECTS.map((sub) => (
                                            <a
                                                key={sub.id}
                                                href={sub.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-5 rounded-xl border border-border bg-foreground/[0.02] flex flex-col gap-3 group hover:border-foreground/30 hover:bg-foreground/[0.04] transition-all duration-200"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="text-base font-semibold text-foreground truncate">
                                                        {sub.title}
                                                    </h3>
                                                    <ExternalLink className="w-4 h-4 text-muted group-hover:text-foreground transition-colors flex-shrink-0" />
                                                </div>
                                                <p className="text-sm text-muted leading-relaxed line-clamp-2 flex-1">
                                                    {sub.description}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {sub.tags.map((tag, idx) => (
                                                        <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-foreground/5 text-muted">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}
