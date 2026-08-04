import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-6 pt-safe pb-safe">
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-6xl font-bold text-foreground/20">404</p>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">页面不存在</h1>
          <p className="text-sm text-muted">你要找的页面或许已经搬家了</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 min-h-[44px] rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
        >
          返回主页
        </Link>
      </div>
    </main>
  );
}
