"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
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
import { useScrollLock } from "@/lib/use-scroll-lock";
import { isAdminDirty, subscribeAdminDirty } from "@/lib/dirty-state";
import { useToast } from "@/components/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconButton } from "@/components/admin/icon-button";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // exact: 仅完全匹配时高亮；否则子路径也算激活（如 /admin/blog/edit/... 高亮"博客"）
  exact?: boolean;
}

interface NavSection {
  // 分类标题；缺省表示不分组（直接置顶显示）
  label?: string;
  items: NavItem[];
}

// 数据驱动的导航：新增板块时往对应分类的 items 追加即可；新分类追加一个 section
const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: "/admin", label: "仪表盘", icon: LayoutDashboard, exact: true },
      { href: "/admin/blog", label: "博客", icon: FileText },
    ],
  },
];

function isActive(item: NavItem, pathname: string): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

// 移动端顶栏标题：优先匹配导航项，编辑页单独命名
function pageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/blog/edit/")) return "编辑文章";
  for (const section of NAV_SECTIONS) {
    const hit = section.items.find((item) => isActive(item, pathname));
    if (hit) return hit.label;
  }
  return "管理面板";
}

interface SidebarContentProps {
  pathname: string;
  // 所有导航链接的点击都经过这里：AdminShell 在表单有未保存内容时拦截跳转
  onNavigateLink: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  onLogout: () => void;
  logoutLoading: boolean;
  onClose?: () => void;
}

// 分类收起状态存 localStorage，用 useSyncExternalStore 读取：
// 服务端快照恒为空（全展开），避免水合不一致；桌面侧栏和移动抽屉两个实例通过 listeners 保持同步
const COLLAPSED_STORAGE_KEY = "admin-nav-collapsed";
const EMPTY_SECTIONS: Record<string, boolean> = {};
let collapsedCache: Record<string, boolean> | null = null;
const collapsedListeners = new Set<() => void>();

function getCollapsedSnapshot(): Record<string, boolean> {
  if (collapsedCache === null) {
    let parsed: unknown = {};
    try {
      const raw = window.localStorage.getItem(COLLAPSED_STORAGE_KEY);
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = {};
    }
    collapsedCache =
      typeof parsed === "object" && parsed !== null ? (parsed as Record<string, boolean>) : {};
  }
  return collapsedCache ?? EMPTY_SECTIONS;
}

function subscribeCollapsed(listener: () => void): () => void {
  collapsedListeners.add(listener);
  return () => collapsedListeners.delete(listener);
}

function toggleSectionCollapsed(label: string) {
  const next = { ...getCollapsedSnapshot(), [label]: !getCollapsedSnapshot()[label] };
  collapsedCache = next;
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage 不可用时收起状态只在本次会话生效
  }
  collapsedListeners.forEach((listener) => listener());
}

function SidebarContent({ pathname, onNavigateLink, onLogout, logoutLoading, onClose }: SidebarContentProps) {
  const itemCls =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors";
  const activeCls = `${itemCls} bg-foreground/5 text-foreground font-medium`;
  const inactiveCls = `${itemCls} text-muted hover:text-foreground hover:bg-foreground/[0.03]`;

  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsedSnapshot,
    () => EMPTY_SECTIONS
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center justify-between px-5 pb-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))]">
        <Link
          href="/admin"
          onClick={(e) => onNavigateLink(e, "/admin")}
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

      <nav className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 px-3 py-2">
        {NAV_SECTIONS.map((section, i) => {
          const isCollapsed = section.label ? !!collapsed[section.label] : false;
          return (
            <div key={section.label ?? i} className="flex flex-col gap-0.5">
              {section.label && (
                <button
                  type="button"
                  onClick={() => toggleSectionCollapsed(section.label!)}
                  aria-expanded={!isCollapsed}
                  className="flex w-full items-center justify-between rounded-lg px-3 pb-1 pt-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
                >
                  {section.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                  />
                </button>
              )}
              {!isCollapsed &&
                section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item, pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => onNavigateLink(e, item.href)}
                      aria-current={active ? "page" : undefined}
                      className={active ? activeCls : inactiveCls}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-shrink-0 flex-col gap-0.5 border-t border-border/50 px-3 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <Link href="/" onClick={(e) => onNavigateLink(e, "/")} className={inactiveCls}>
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
  useScrollLock(drawerOpen);

  // 表单未保存时拦截侧边栏 <Link> 导航（useDirtyGuard 的 popstate 守卫拦不住 SPA 跳转）。
  // 未保存内容已被 useLocalDraft 自动存为本地草稿，确认文案里如实告知用户
  const formDirty = useSyncExternalStore(subscribeAdminDirty, isAdminDirty, () => false);
  const [pendingNavHref, setPendingNavHref] = useState<string | null>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (formDirty && href !== pathname) {
      e.preventDefault();
      setPendingNavHref(href);
    }
    setDrawerOpen(false);
  };

  // 路由变化时收起抽屉：渲染期比较并调整状态（React 官方推荐的 derived-state 模式），
  // 避免在 effect 里同步 setState 造成级联渲染
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // 原地刷新让服务端重新校验会话并渲染登录表单，比重定向到公开页更符合"已退出"心智
      toast.success("已退出登录");
      router.refresh();
    } catch {
      toast.error("退出失败，请重试");
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-dvh lg:pl-60">
      {/* 桌面端侧边栏 */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-60 flex-col border-r border-border/50 bg-background print:hidden">
        <SidebarContent
          pathname={pathname}
          onNavigateLink={handleNavClick}
          onLogout={handleLogout}
          logoutLoading={logoutLoading}
        />
      </aside>

      {/* 移动端顶栏 */}
      <header className="lg:hidden sticky top-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-top,0px))] items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur pt-[env(safe-area-inset-top,0px)] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] print:hidden">
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
                  onNavigateLink={handleNavClick}
                  onLogout={handleLogout}
                  logoutLoading={logoutLoading}
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] lg:pb-8 lg:pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] sm:pl-[calc(1.5rem+env(safe-area-inset-left,0px))] sm:pr-[calc(1.5rem+env(safe-area-inset-right,0px))] lg:pl-[calc(2rem+env(safe-area-inset-left,0px))] lg:pr-[calc(2rem+env(safe-area-inset-right,0px))] print:p-0!">
        <div className="mx-auto max-w-5xl print:mx-0 print:max-w-none">{children}</div>
      </main>

      <ConfirmDialog
        isOpen={pendingNavHref !== null}
        onClose={() => setPendingNavHref(null)}
        onConfirm={() => {
          const href = pendingNavHref;
          setPendingNavHref(null);
          if (href) router.push(href);
        }}
        title="离开当前页面"
        message="有未保存的内容，确定离开吗？内容已自动存为本地草稿，下次打开时可恢复。"
        confirmLabel="确定离开"
        danger={false}
      />
    </div>
  );
}
