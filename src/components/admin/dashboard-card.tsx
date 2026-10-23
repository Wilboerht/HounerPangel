import type { ReactNode } from "react";

// 通用面板卡片容器：标题区 + 内容区 + 可选操作区，后续其他项目的数据卡片直接复用。
// title 缺省时不渲染标题行（适用于纯数据展示的小卡片，如统计卡）
interface DashboardCardProps {
  title?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function DashboardCard({ title, action, className, children }: DashboardCardProps) {
  return (
    <section className={`rounded-xl border border-border/50 p-4 sm:p-5 ${className ?? ""}`}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
