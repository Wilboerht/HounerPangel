import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { LoginForm } from "@/components/admin/login-form";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
    title: "管理后台",
    robots: {
        index: false,
        follow: false,
    },
};

// 服务端校验会话，未登录时原地渲染登录表单（不做 redirect，避免 /admin 循环，见 src/proxy.ts）
export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;
    const authed = token ? await verifySessionToken(token) : false;
    if (!authed) return <LoginForm />;
    return <AdminShell>{children}</AdminShell>;
}
