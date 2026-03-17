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
    ChevronLeft,
    ChevronRight,
    Menu,
    ExternalLink,
    Compass,
    Zap,
    MousePointer2,
    Activity
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isPortalOpen, setIsPortalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [latency, setLatency] = useState<number | null>(null);
    const [systemStatus, setSystemStatus] = useState<"Stable" | "Slow" | "Offline">("Stable");
    const portalRef = useRef<HTMLDivElement>(null);

    // Update time every second - initialize ONLY on client to avoid hydration mismatch
    useEffect(() => {
        setCurrentTime(new Date()); // set initial value after mount
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // REAL-TIME SYSTEM MONITORING LOGIC
    useEffect(() => {
        const checkHealth = async () => {
            const start = performance.now();
            try {
                // Use a lightweight HEAD request to check connection
                const response = await fetch("/api/health-check", { 
                    method: "HEAD", 
                    cache: "no-store" 
                }).catch(() => {
                     // Fallback if the specific route doesn't exist yet, just hit the root
                     return fetch("/", { method: "HEAD", cache: "no-store" });
                });

                const end = performance.now();
                const diff = Math.round(end - start);
                setLatency(diff);

                if (diff > 200) {
                    setSystemStatus("Slow");
                } else {
                    setSystemStatus("Stable");
                }
            } catch (error) {
                setSystemStatus("Offline");
                setLatency(null);
            }
        };

        checkHealth();
        const timer = setInterval(checkHealth, 10000); // Check every 10 seconds
        return () => clearInterval(timer);
    }, []);

    // Close portal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (portalRef.current && !portalRef.current.contains(event.target as Node)) {
                setIsPortalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const portalLinks = [
        { name: "网站主页", href: "/", icon: Home },
        { name: "博客频道", href: "/blog", icon: FileText },
        { name: "项目展示", href: "/projects", icon: Zap },
        { name: "研究中心", href: "/research", icon: BookOpen },
    ];

    return (
        <div className="h-screen bg-[#fafafa] text-black flex pl-4 lg:pl-6 pr-0 lg:pr-0 font-sans overflow-hidden">
            <motion.aside 
                initial={false}
                animate={{ width: isCollapsed ? 84 : 280 }}
                transition={{ type: "spring", stiffness: 220, damping: 28, mass: 1.2 }}
                className="hidden lg:flex my-4 lg:my-6 bg-[#eceef2] rounded-[32px] border border-zinc-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex-col shrink-0 overflow-hidden relative"
            >
                {/* Header Section */}
                <div className="h-24 flex items-center relative shrink-0">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div 
                                key="brand"
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
                                className="flex items-center gap-3 pl-8"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white border border-black/[0.05] flex items-center justify-center shadow-sm shrink-0">
                                    <Home className="w-4.5 h-4.5 text-zinc-900" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-[14px] tracking-tight text-zinc-900">控制中心</span>
                                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest whitespace-nowrap">Admin Center</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`absolute top-0 right-0 h-full flex items-center pr-6 transition-all duration-300 ${isCollapsed ? "w-full justify-center !pr-0" : ""}`}>
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 text-zinc-400 hover:text-zinc-900 transition-all z-20 hover:scale-110 active:scale-95"
                            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={isCollapsed ? "collapsed" : "expanded"}
                                    initial={{ opacity: 0, scale: 0.9, rotate: isCollapsed ? -45 : 45 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, rotate: isCollapsed ? 45 : -45 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                    {isCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
                    {navGroups.map((group, groupIdx) => (
                        <div key={group.group} className={groupIdx > 0 ? "mt-8" : ""}>
                            <div className={`h-6 flex items-center mb-2 overflow-hidden transition-all duration-300 ${isCollapsed ? "px-4 justify-center" : "px-8"}`}>
                                <AnimatePresence mode="wait">
                                    {!isCollapsed && (
                                        <motion.h2 
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
                                            className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 whitespace-nowrap"
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
                                        <div key={item.href} className="relative">
                                            <Link
                                                href={item.href}
                                                title={isCollapsed ? item.name : ""}
                                                className={`relative flex items-center h-12 rounded-xl group transition-all duration-500 ${
                                                    isActive ? "text-black" : "text-zinc-500 hover:text-zinc-900"
                                                }`}
                                            >
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="active-pill"
                                                        className="absolute inset-0 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] border border-black/[0.03] rounded-xl z-0"
                                                        transition={{ 
                                                            type: "spring", 
                                                            stiffness: 260, 
                                                            damping: 32,
                                                            mass: 1.2
                                                        }}
                                                    />
                                                )}

                                                <div className="w-[78px] h-full flex items-center justify-center shrink-0 z-10 relative left-[-12px]">
                                                    <motion.div
                                                        animate={{ color: isActive ? "#000000" : "#94a3b8" }}
                                                        transition={{ duration: 0.4 }}
                                                    >
                                                        <item.icon className="w-5 h-5" />
                                                    </motion.div>
                                                </div>

                                                <div className="flex-1 flex items-center justify-between pr-4 z-10 relative">
                                                    <AnimatePresence mode="wait">
                                                        {!isCollapsed && (
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
                                                                className="flex-1 flex items-center justify-between"
                                                            >
                                                                <span className="text-[13.5px] tracking-tight whitespace-nowrap">
                                                                    {item.name}
                                                                </span>
                                                                
                                                                {!isActive && (
                                                                    <div className="ml-2 shrink-0">
                                                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 duration-300" />
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Section */}
                <div className="p-3 pt-6 mt-4 border-t border-zinc-200/60 shrink-0">
                    <form action={logoutAction}>
                        <button className="relative w-full h-12 flex items-center rounded-xl transition-all duration-300 font-medium group overflow-hidden">
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white transition-colors duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-[0_4px_12px_rgba(244,63,94,0.08),0_1px_4px_rgba(0,0,0,0.02)] border border-rose-500/5 rounded-xl transition-opacity duration-300" />
                            
                            <div className="w-[78px] h-full flex items-center justify-center shrink-0 relative left-[-12px] z-10 transition-colors duration-300 text-zinc-400 group-hover:text-rose-500">
                                <LogOut className="w-5 h-5" />
                            </div>
                            
                            <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                    <motion.span 
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8, transition: { duration: 0.15 } }}
                                        className="text-[13.5px] tracking-tight whitespace-nowrap z-10 text-zinc-500 group-hover:text-rose-600 transition-colors duration-300"
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
            <main className="flex-1 overflow-y-auto bg-transparent flex flex-col ml-4 lg:ml-6">
                {/* Clean Top Toolbar (System Monitoring) */}
                <header className="w-full max-w-6xl mx-auto px-4 lg:px-8 xl:px-10 pt-10 pb-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-6 relative">
                        {/* Status Indicator */}
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                                    systemStatus === "Stable" ? "bg-emerald-500" :
                                    systemStatus === "Slow" ? "bg-amber-500" : "bg-red-500"
                                }`} />
                                {systemStatus !== "Offline" && (
                                    <div className={`absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40 ${
                                        systemStatus === "Stable" ? "bg-emerald-500" : "bg-amber-500"
                                    }`} />
                                )}
                            </div>
                            <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                                {systemStatus === "Offline" ? "系统离线" : "系统在线"}
                            </span>
                        </div>

                        <div className="h-3 w-px bg-zinc-200" />

                        {/* Performance Metrics */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-zinc-400" title="网络往返延时 (RTT)">
                                <Zap className="w-3.5 h-3.5" />
                                <span className="text-[12px] font-medium tabular-nums">
                                    {latency !== null ? `${latency}ms` : "--"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400" title="系统健康运行状态">
                                <Activity className="w-3.5 h-3.5" />
                                <span className={`text-[12px] font-medium uppercase tracking-tighter ${
                                    systemStatus === "Stable" ? "text-emerald-600/70" :
                                    systemStatus === "Slow" ? "text-amber-600/70" : "text-red-600/70"
                                }`}>
                                    {systemStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Time & Search/Settings */}
                    <div className="flex items-center gap-4">
                        <div className="h-8 flex items-center px-3.5 rounded-full bg-zinc-100/50 border border-black/[0.02] text-zinc-500">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded-md leading-none">CN</span>
                                <span className="text-[11px] font-bold tabular-nums tracking-wider uppercase">
                                    {currentTime ? (
                                        <>
                                            {currentTime.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })}
                                            <span className="mx-2 opacity-30">|</span>
                                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                        </>
                                    ) : (
                                        <span className="opacity-0">--/-- | --:--:--</span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 xl:p-10 pt-0 lg:pt-0 xl:pt-0">
                    {children}
                </div>

                {/* Simple Footer */}
                <footer className="w-full max-w-6xl mx-auto px-4 lg:px-8 xl:px-10 pt-16 mb-4 lg:mb-6 shrink-0 mt-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-black/[0.04]">
                        <div className="flex items-center">
                            <span className="text-[12.5px] text-zinc-300 font-medium tabular-nums">
                                © {currentTime?.getFullYear() ?? new Date().getFullYear()} Wilboerht. All rights reserved.
                            </span>
                        </div>

                        <div className="flex items-center gap-6 relative" ref={portalRef}>
                            {/* Project Teleport Menu */}
                            <AnimatePresence>
                                {isPortalOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 28
                                        }}
                                        className="absolute bottom-full left-0 mb-4 w-[150px] bg-white/95 backdrop-blur-md rounded-2xl border border-black/[0.04] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1),0_20px_40px_-12px_rgba(0,0,0,0.05)] p-1.5 z-50 overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            {portalLinks.map((link) => (
                                                <Link 
                                                    key={link.href}
                                                    href={link.href}
                                                    target="_blank"
                                                    className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-zinc-50/80 text-[12.5px] text-zinc-500 hover:text-zinc-950 transition-all duration-200 group"
                                                >
                                                    <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                                        <link.icon className="w-full h-full text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                                                    </div>
                                                    <span className="font-medium tracking-tight whitespace-nowrap">{link.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                onClick={() => setIsPortalOpen(!isPortalOpen)}
                                className={`text-[12.5px] font-medium transition-all flex items-center gap-1.5 group px-1 py-1.5 relative ${
                                    isPortalOpen ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-950"
                                }`}
                            >
                                <Compass className={`w-3.5 h-3.5 transition-transform duration-500 ${isPortalOpen ? "rotate-180" : ""}`} />
                                <span>访问站点</span>

                                {/* Animated Underline Indicator */}
                                {isPortalOpen && (
                                    <motion.div 
                                        layoutId="portal-underline"
                                        className="absolute bottom-0 left-0 right-0 h-px bg-zinc-950 rounded-full"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        exit={{ scaleX: 0 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}
                            </button>

                            <div className="h-4 w-px bg-zinc-200" />
                            <span className="text-[12.5px] font-medium text-zinc-300">
                                v1.2.4
                            </span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
