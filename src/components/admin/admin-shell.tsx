"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useSafeMotion, safeAnimate, springModal } from "@/lib/animation";
import { useFocusTrap } from "@/lib/focus-trap";
import { useToast } from "@/components/toast";
import { IconButton } from "@/components/admin/icon-button";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // exact: 仅完全匹配时高亮；否则子路径也算激活（如 /admin/blog/edit/... 高亮"博客"）
  exact?: boolean;
}

// 数据驱动的导航项：新增板块时在此数组追加即可
const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: "博客", icon: FileText },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// 移动端顶栏标题：优先匹配导航项，编辑页单独命名
function pageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/blog/edit/")) return "编辑文章";
  return NAV_ITEMS.find((item) => isActive(item, pathname))?.label ?? "管理面板";
}

interface SidebarContentProps {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  logoutLoading: boolean;
  onClose?: () => void;
}

function SidebarContent({ pathname, onNavigate, onLogout, logoutLoading, onClose }: SidebarContentProps) {
  const itemCls =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
  const activeCls = `${itemCls} bg-foreground/5 text-foreground font-medium`;
  const inactiveCls = `${itemCls} text-muted hover:text-foreground hover:bg-foreground/[0.03]`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-base font-semibold tracking-tight text-foreground"
        >
          管理面板
        </Link>
        {onClose && (
          <IconButton label="关闭导航菜单" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={active ? activeCls : inactiveCls}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border/50 px-3 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Link href="/" onClick={onNavigate} className={inactiveCls}>
          <Globe className="w-4 h-4 flex-shrink-0" />
          查看站点
        </Link>
        <button
          onClick={onLogout}
          disabled={logoutLoading}
          className={`${inactiveCls} w-full text-left disabled:opacity-50`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {logoutLoading ? "退出中..." : "退出登录"}
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const reduce = useSafeMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const drawerTrapRef = useFocusTrap(drawerOpen, () => setDrawerOpen(false));

  // 路由变化时收起抽屉
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/blog");
    } catch {
      toast.error("退出失败，请重试");
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-dvh lg:pl-60">
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border/50 bg-background">
        <SidebarContent
          pathname={pathname}
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
        />
      </aside>

      {/* 移动端顶栏 */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top,0px)] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))]">
        <IconButton label="打开导航菜单" onClick={() => setDrawerOpen(true)} className="-ml-2">
          <Menu className="w-5 h-5" />
        </IconButton>
        <span className="text-sm font-semibold text-foreground">{pageTitle(pathname)}</span>
      </header>

      {/* 移动端抽屉 */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={safeAnimate(reduce, { opacity: 0 })}
              animate={{ opacity: 1 }}
              exit={safeAnimate(reduce, { opacity: 0 })}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={safeAnimate(reduce, { x: "-100%" })}
              animate={{ x: 0 }}
              exit={safeAnimate(reduce, { x: "-100%" })}
              transition={springModal}
              className="fixed inset-y-0 left-0 z-[95] w-64 border-r border-border/50 bg-background lg:hidden"
            >
              <div ref={drawerTrapRef} role="dialog" aria-modal="true" aria-label="导航菜单" className="h-full">
                <SidebarContent
                  pathname={pathname}
                  onNavigate={() => setDrawerOpen(false)}
                  onLogout={handleLogout}
                  logoutLoading={logoutLoading}
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="py-6 lg:py-8 pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] sm:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] sm:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))]">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
