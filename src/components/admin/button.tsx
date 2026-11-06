import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerGhost";
type ButtonSize = "md" | "lg";

const variantCls: Record<ButtonVariant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90",
  secondary:
    "border border-foreground/20 bg-background text-muted hover:bg-foreground/5 hover:text-foreground",
  ghost: "text-muted hover:bg-foreground/5 hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dangerGhost: "text-red-700 hover:bg-red-500/10 hover:text-red-800",
};

const sizeCls: Record<ButtonSize, string> = {
  md: "min-h-[36px] px-3 text-sm max-sm:min-h-[44px]",
  lg: "min-h-[44px] px-4 text-sm",
};

interface ButtonClassNameOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

// 供 <Link> 等非 button 元素复用同一套按钮外观
export function buttonClassName({
  variant = "secondary",
  size = "md",
  className,
}: ButtonClassNameOptions = {}) {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantCls[variant]} ${sizeCls[size]} ${className ?? ""}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
