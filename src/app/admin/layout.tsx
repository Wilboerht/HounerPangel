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
    ChevronRight
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { motion } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't show layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const navItems = [
        { name: "概览", href: "/admin", icon: LayoutDashboard },
        { name: "博客文章", href: "/admin/posts", icon: FileText },
        { name: "研究项目", href: "/admin/research", icon: BookOpen },
        { name: "评论与反馈", href: "/admin/interactions", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 xl:w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col shrink-0">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <Home className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold tracking-tight group-hover:text-white/60 transition-colors">站点主页</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? "bg-white/10 text-white" 
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div layoutId="activeNav" className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                                {!isActive && (
                                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <form action={logoutAction}>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">退出登录</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}
