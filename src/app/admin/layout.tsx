import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { LoginForm } from "@/components/admin/login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
    title: "管理后台",
    robots: {
        index: false,
        follow: false,
    },
};

// 服务端校验会话，未登录时原地渲染登录表单（不做 redirect，避免 /admin 循环，见 src/proxy.ts）。
// ToastProvider 只挂在管理端（登录表单也用 toast），公开页面不再加载 toast/framer-motion。
export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;
    const authed = token ? await verifySessionToken(token) : false;
    return (
        <ToastProvider>
            {/* 管理端工具界面用 Geist Sans；公开站的衬线字体仅保留给文章正文 */}
            <div className="admin-ui">
                {authed ? <AdminShell>{children}</AdminShell> : <LoginForm />}
            </div>
        </ToastProvider>
    );
}
