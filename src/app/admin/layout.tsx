"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    FileText, 
    BookOpen, 
    MessageSquare, 
    LogOut,
    Home,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const navGroups = [
        {
            group: "概览",
            items: [
                { name: "控制台", href: "/admin", icon: LayoutDashboard },
            ]
        },
        {
            group: "主页管理",
            items: [
                { name: "博客文章", href: "/admin/posts", icon: FileText },
                { name: "研究项目", href: "/admin/research", icon: BookOpen },
                { name: "评论与反馈", href: "/admin/interactions", icon: MessageSquare },
            ]
        }
    ];

    return (
        <div className="h-screen bg-[#fafafa] text-black flex p-4 lg:p-6 gap-4 lg:gap-6 font-sans overflow-hidden">
            {/* Floating Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isCollapsed ? 84 : 280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden lg:flex bg-white rounded-[32px] border border-black/[0.04] shadow-sm flex-col shrink-0 overflow-hidden relative"
            >
                {/* 1. Header Section - Fixed Height & Absolute Centering for Toggle */}
                <div className="h-24 flex items-center relative shrink-0">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div 
                                key="brand"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                className="flex items-center gap-3 pl-8"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center shadow-sm shrink-0">
                                    <Home className="w-4.5 h-4.5 text-zinc-900" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[14px] tracking-tight text-zinc-900">控制中心</span>
                                    <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest whitespace-nowrap">Admin Center</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle Button - Correct Positioning */}
                    <div className={`absolute top-0 right-0 h-full flex items-center pr-6 transition-all duration-300 ${isCollapsed ? "w-full justify-center !pr-0" : ""}`}>
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-colors z-20"
                            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isCollapsed ? "collapsed" : "expanded"}
                                    initial={{ opacity: 0, rotate: isCollapsed ? -90 : 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: isCollapsed ? 90 : -90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* 2. Navigation Section - Better Centering Logic */}
                <nav className="flex-1 overflow-y-auto no-scrollbar">
                    {navGroups.map((group, groupIdx) => (
                        <div key={group.group} className={groupIdx > 0 ? "mt-8" : ""}>
                            <div className="h-6 flex items-center mb-2 overflow-hidden px-8">
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.h2 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                            className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-300 whitespace-nowrap"
                                        >
                                            {group.group}
                                        </motion.h2>
                                    )}
                                </AnimatePresence>
                            </div>
                            
                            <div className="space-y-1 font-medium px-3">
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            title={isCollapsed ? item.name : ""}
                                            className={`relative flex items-center h-12 rounded-xl transition-all duration-300 group overflow-hidden ${
                                                isActive ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-800"
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="active-pill"
                                                    className="absolute inset-0 bg-zinc-100/70 rounded-xl z-0"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}

                                            {/* Icon Center Point - Based on 84px sidebar width */}
                                            <div className="w-[78px] h-full flex items-center justify-center shrink-0 z-10 relative left-[-12px]">
                                                <item.icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 flex items-center justify-between pr-4 z-10 relative">
                                                <AnimatePresence mode="wait">
                                                    {!isCollapsed && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                                            className="flex-1 flex items-center justify-between"
                                                        >
                                                            <span className="text-[13.5px] tracking-tight whitespace-nowrap">
                                                                {item.name}
                                                            </span>
                                                            
                                                            <div className="ml-2 shrink-0">
                                                                {!isActive && (
                                                                    <ChevronRight className="w-3.5 h-3.5 text-zinc-200 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* 3. Footer Section - Unified Centering */}
                <div className="p-3 shrink-0">
                    <form action={logoutAction}>
                        <button className="relative w-full h-12 flex items-center rounded-xl transition-all duration-300 font-medium border border-transparent hover:border-red-100/30 text-zinc-400 hover:text-red-500 hover:bg-red-50/50 overflow-hidden">
                            <div className="w-[78px] h-full flex items-center justify-center shrink-0 relative left-[-12px] z-10">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                                        className="text-[13.5px] tracking-tight whitespace-nowrap z-10"
                                    >
                                        退出系统
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </form>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide bg-transparent">
                <div className="max-w-6xl mx-auto p-4 lg:p-12 xl:p-16">
                    {children}
                </div>
            </main>
        </div>
    );
}
