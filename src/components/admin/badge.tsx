import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "warning" | "danger" | "outline";

const variantCls: Record<BadgeVariant, string> = {
  neutral: "bg-foreground/10 text-foreground",
  warning: "bg-amber-500/15 text-amber-800 border border-amber-600/30",
  danger: "bg-red-500/10 text-red-700 border border-red-600/30",
  outline: "border border-foreground/20 text-muted",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[11px] font-medium ${variantCls[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
