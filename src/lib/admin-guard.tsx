import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { verifySessionToken } from "./session";
import { LoginForm } from "@/components/admin/login-form";

// 服务端校验会话，未登录时原地渲染登录表单（不做 redirect，避免 /admin 循环，见 src/proxy.ts）
export async function AdminGuard({ children }: { children: ReactNode }) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin-session")?.value;
    const authed = token ? await verifySessionToken(token) : false;
    if (!authed) return <LoginForm />;
    return <>{children}</>;
}
