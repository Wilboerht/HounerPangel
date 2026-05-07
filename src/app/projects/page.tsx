"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";
import { ProjectModal } from "@/components/ProjectModal";

const MOCK_PROJECTS = [
    {
        id: "1",
        title: "MySkin.Today",
        description: "智能面部护肤顾问平台官方网站与服务体验入口",
        url: "https://myskin.today",
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
        title: "Vanto",
        description: "Vanto 项目系列，全新体验敬请期待。",
        url: "#",
        tags: ["Coming Soon"]
    },
    {
        id: "4",
        title: "上海临港景鸿安全防范科技发展有限公司",
        description: "上海临港景鸿安全防范科技发展有限公司官方网站，展示企业信息与服务的综合数字平台。",
        url: "https://www.lingangjh.com/",
        tags: ["Enterprise", "Web System"]
    }
];

const MYSKIN_SUB_PROJECTS = [
    {
        id: "m1",
        title: "MySkin.Today 官网",
        description: "品牌官方网站，展示护肤理念、产品服务与会员体系。",
        url: "https://myskin.today",
        tags: ["品牌官网"]
    },
    {
        id: "m2",
        title: "服务体验",
        description: "智能面部护肤顾问体验，MySkin.Today 提供技术支持，可以访达 NIHPLOD SkinAdvisor 体验使用。",
        url: "https://advisor.nihplod.cn",
        tags: ["AI 护肤顾问"]
    },
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
];

const VANTO_SUB_PROJECTS = [
    {
        id: "v1",
        title: "敬请期待",
        description: "Vanto 项目系列正在筹备中，更多精彩即将呈现。",
        url: "#",
        tags: ["Coming Soon"]
    },
];

const ITEMS_PER_PAGE = 4;

export default function Projects() {
    const [modalOpen, setModalOpen] = useState(false);
    const [mySkinModalOpen, setMySkinModalOpen] = useState(false);
    const [vantoModalOpen, setVantoModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const validPage = page < 1 ? 1 : page;

    const totalItems = MOCK_PROJECTS.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentItems = MOCK_PROJECTS.slice(startIndex, endIndex);
    const pageNumbers = Array.from({ length: totalPages }).map((_, i) => i + 1);

    useEffect(() => {
        if (modalOpen || mySkinModalOpen || vantoModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [modalOpen, mySkinModalOpen, vantoModalOpen]);

    const nihplodProject = MOCK_PROJECTS.find((p) => p.title === "NIHPLOD");
    const mySkinProject = MOCK_PROJECTS.find((p) => p.title === "MySkin.Today");
    const vantoProject = MOCK_PROJECTS.find((p) => p.title === "Vanto");

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
                            if (project.title === "MySkin.Today") {
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setMySkinModalOpen(true)}
                                        className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200 text-left min-w-0"
                                    >
                                        <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                {project.title}
                                            </span>
                                            <FolderOpen className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 flex-shrink-0" />
                                        </h3>
                                        <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex gap-2 mt-2 items-center flex-wrap">
                                            {project.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            }
                            if (project.title === "NIHPLOD") {
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setModalOpen(true)}
                                        className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200 text-left min-w-0"
                                    >
                                        <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                {project.title}
                                            </span>
                                            <FolderOpen className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 flex-shrink-0" />
                                        </h3>
                                        <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex gap-2 mt-2 items-center flex-wrap">
                                            {project.tags.map((tag, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 rounded-md bg-foreground/5 text-muted">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </button>
                                );
                            }
                            if (project.title === "Vanto") {
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setVantoModalOpen(true)}
                                        className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200 text-left min-w-0"
                                    >
                                        <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center justify-between gap-2">
                                            <span className="truncate">
                                                {project.title}
                                            </span>
                                            <FolderOpen className="w-4 h-4 text-muted group-hover:text-foreground transition-colors duration-200 flex-shrink-0" />
                                        </h3>
                                        <p className="text-sm text-muted leading-relaxed flex-1 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="flex gap-2 mt-2 items-center flex-wrap">
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
                                    className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 group cursor-pointer hover:border-foreground/50 transition-colors duration-200 min-w-0"
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
            <ProjectModal
                isOpen={modalOpen && !!nihplodProject}
                onClose={() => setModalOpen(false)}
                logoSrc="/images/NIHPLOD-logo.svg"
                logoAlt="NIHPLOD"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    {NIHPLOD_SUB_PROJECTS.map((sub) => (
                        <a
                            key={sub.id}
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 group hover:border-[#C6A87C]/40 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                                    {sub.title}
                                </h3>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-[#C6A87C] transition-colors" />
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                                {sub.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                                {sub.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#C6A87C]/10 text-[#8B7355] font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </ProjectModal>

            {/* MySkin.Today Modal */}
            <ProjectModal
                isOpen={mySkinModalOpen && !!mySkinProject}
                onClose={() => setMySkinModalOpen(false)}
                logoSrc="/images/logo-myskin-today.svg"
                logoAlt="MySkin.Today"
                logoHeight={70}
                logoMb={4}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    {MYSKIN_SUB_PROJECTS.map((sub) => (
                        <a
                            key={sub.id}
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 group hover:border-[#556B2F]/40 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                                    {sub.title}
                                </h3>
                                <ExternalLink size={14} className="text-slate-300 group-hover:text-[#556B2F] transition-colors" />
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                                {sub.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                                {sub.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-[#556B2F]/10 text-[#556B2F] font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </a>
                    ))}
                </div>
            </ProjectModal>

            {/* Vanto Modal */}
            <ProjectModal
                isOpen={vantoModalOpen && !!vantoProject}
                onClose={() => setVantoModalOpen(false)}
                logoSrc="/images/Vanto-name.svg"
                logoAlt="Vanto"
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    {VANTO_SUB_PROJECTS.map((sub) => (
                        <div
                            key={sub.id}
                            className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 group hover:border-slate-300 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                                    {sub.title}
                                </h3>
                            </div>
                            <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2">
                                {sub.description}
                            </p>
                            <div className="flex gap-2 mt-1">
                                {sub.tags.map((tag, idx) => (
                                    <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-200/50 text-slate-500 font-medium">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ProjectModal>
        </main>
    );
}
