import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "warning" | "outline";

const variantCls: Record<BadgeVariant, string> = {
  neutral: "bg-foreground/10 text-foreground",
  warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  outline: "border border-border/50 text-muted",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${variantCls[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
