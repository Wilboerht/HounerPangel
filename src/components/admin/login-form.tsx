"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/toast";

// admin 页面在服务端校验会话，未登录时原地渲染此表单（不做 redirect，避免循环）
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setPassword("");
        // cookie 已写入，刷新让服务端重新渲染出管理界面
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "密码错误");
      }
    } catch {
      toast.error("登录失败");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 pt-content pb-content">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-10">
        <nav>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors duration-200 group min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回主页</span>
          </Link>
        </nav>

        <section className="space-y-8 max-w-sm">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">管理后台</h1>
            <p className="text-lg text-muted leading-relaxed">请输入密码以继续</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-password" className="text-sm font-medium text-foreground">密码</label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                autoFocus
                className="w-full px-4 py-2.5 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {loginLoading ? "登录中..." : "登录"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
