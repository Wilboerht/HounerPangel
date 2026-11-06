import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/admin/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border border-dashed border-foreground/15 px-4 py-14 text-center ${className ?? ""}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
        <Icon className="h-5 w-5 text-muted" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({
  title = "加载失败",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center gap-3 py-16 text-center ${className ?? ""}`}
      role="alert"
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm text-muted">{description}</p>}
      <Button variant="primary" size="md" onClick={onRetry}>
        重试
      </Button>
    </div>
  );
}

interface LoadingRowsProps {
  count?: number;
  className?: string;
}

export function LoadingRows({ count = 4, className = "h-16" }: LoadingRowsProps) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="加载中">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className={`${className} rounded-lg border border-border/50 bg-foreground/[0.03] motion-safe:animate-pulse`}
        />
      ))}
    </div>
  );
}
