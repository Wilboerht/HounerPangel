"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { useToast } from "@/components/toast";

// admin 页面在服务端校验会话，未登录时原地渲染此表单（不做 redirect，避免循环）
export function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
        // 失败后清空并重新聚焦，方便直接重输
        setPassword("");
        inputRef.current?.focus();
      }
    } catch {
      toast.error("登录失败");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center px-4 pt-[calc(1.5rem+env(safe-area-inset-top,0px))] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-foreground/5 border border-border/50">
            <Lock className="w-5 h-5 text-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">管理面板</h1>
            <p className="text-sm text-muted">输入密码以继续</p>
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 rounded-2xl border border-border/50 p-6"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="admin-password" className="text-sm font-medium text-foreground">密码</label>
            <input
              ref={inputRef}
              id="admin-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoFocus
              className="w-full px-4 py-2 rounded-lg bg-foreground/5 border border-border/50 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="w-full px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {loginLoading ? "登录中..." : "登录"}
          </button>
        </form>

        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>返回主页</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
