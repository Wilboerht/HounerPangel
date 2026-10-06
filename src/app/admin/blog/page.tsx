import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/session";
import { LoginForm } from "@/components/admin/login-form";
import { BlogAdminClient } from "@/components/admin/blog-admin-client";

// 服务端校验会话，未登录时原地渲染登录表单（不做 redirect，避免 /admin 循环，见 src/proxy.ts）
export default async function AdminBlogPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-session")?.value;
  const authed = token ? await verifySessionToken(token) : false;
  if (!authed) return <LoginForm />;
  return <BlogAdminClient />;
}
